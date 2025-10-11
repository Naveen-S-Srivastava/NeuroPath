const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Report = require('../models/Report');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Configure cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Provide a signed payload for Cloudinary direct upload (kept for compatibility)
router.post('/sign', authenticateToken, (req, res) => {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!apiKey || !apiSecret || !cloudName) {
    return res.status(500).json({ message: 'Cloudinary not configured on server' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = { timestamp };
  if (uploadPreset) paramsToSign.upload_preset = uploadPreset;

  const keys = Object.keys(paramsToSign).sort();
  const toSign = keys.map((k) => `${k}=${paramsToSign[k]}`).join('&');
  const signature = crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');

  res.json({ signature, timestamp, api_key: apiKey, cloud_name: cloudName, upload_preset: uploadPreset });
});

// Server-side upload: accept file and stream to Cloudinary, then save metadata
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const missing = [];
    if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
    if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
    if (missing.length > 0) {
      console.error('Cloudinary config missing:', missing.join(', '));
      return res.status(500).json({ message: `Cloudinary not configured on server. Missing: ${missing.join(', ')}` });
    }

    const folder = process.env.CLOUDINARY_FOLDER || 'neuropath_reports';

    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'auto' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(buffer);
      });
    };

    const result = await streamUpload(req.file.buffer);

    const title = req.body.title || result.original_filename || 'Medical Report';
    const report = new Report({
      patientId: req.user.id,
      neurologistId: req.user.id,
      title,
      description: 'Uploaded by patient',
      findings: '',
      recommendations: '',
      status: 'completed',
      publicId: result.public_id,
      url: result.secure_url,
      fileType: result.format,
      bytes: result.bytes,
    });

    await report.save();

    res.json({ report });
  } catch (error) {
    console.error('Server upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Delete a report (remove from Cloudinary + DB)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Only owner or admin can delete
    if (report.patientId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Determine resource type
    const resourceType = (report.fileType && report.fileType.toLowerCase() === 'pdf') ? 'raw' : 'image';
    try {
      await cloudinary.uploader.destroy(report.publicId, { resource_type: resourceType });
    } catch (err) {
      console.warn('Cloudinary delete warning:', err.message);
    }

    await Report.findByIdAndDelete(id);
    res.json({ message: 'Report deleted' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Failed to delete report' });
  }
});

// Provide a signed access URL for a report (useful for PDFs/raw)
router.get('/:id/access', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Only owner or admin can access
    if (report.patientId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // For PDFs/raw assets, generate a signed download URL
    if (report.fileType && report.fileType.toLowerCase() === 'pdf') {
      try {
        const signed = cloudinary.utils.private_download_url(report.publicId, { resource_type: 'raw' });
        return res.json({ url: signed });
      } catch (err) {
        console.warn('Signed URL generation failed, falling back to secure_url', err.message);
      }
    }

    // Default: return the stored URL
    return res.json({ url: report.url });
  } catch (error) {
    console.error('Get report access error:', error);
    res.status(500).json({ message: 'Failed to obtain access URL' });
  }
});

// Save report metadata after upload (legacy)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { public_id, secure_url, original_filename, resource_type, format, bytes, title } = req.body;

    if (!public_id || !secure_url) {
      return res.status(400).json({ message: 'Missing upload metadata' });
    }

    const report = new Report({
      patientId: req.user.id,
      neurologistId: req.user.id, // default: patient uploaded; neurologist can be assigned later
      title: title || original_filename || 'Medical Report',
      description: 'Uploaded by patient',
      findings: '',
      recommendations: '',
      status: 'completed',
      publicId: public_id,
      url: secure_url,
      fileType: format,
      bytes,
    });

    await report.save();

    res.json({ report });
  } catch (error) {
    console.error('Save report error:', error);
    res.status(500).json({ message: 'Failed to save report' });
  }
});

// List reports for current patient (include previewUrl for PDFs)
router.get('/patient', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.find({ patientId: req.user.id }).sort({ createdAt: -1 });

    const enhanced = reports.map((r) => {
      const obj = r.toObject();
      try {
        // If PDF/raw, generate an image preview (first page)
        if (obj.fileType && obj.fileType.toLowerCase() === 'pdf') {
          obj.previewUrl = cloudinary.url(obj.publicId, {
            resource_type: 'image',
            format: 'jpg',
            page: 1,
            transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }]
          });
        } else {
          obj.previewUrl = obj.url;
        }
      } catch (err) {
        obj.previewUrl = obj.url;
      }
      return obj;
    });

    res.json({ reports: enhanced });
  } catch (error) {
    console.error('Get patient reports error:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// List reports for a specific patient (neurologist access)
router.get('/patient/:patientId', authenticateToken, authorizeRoles('neurologist'), async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify the patient exists and is a patient
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if this neurologist has any appointments with this patient
    const hasAppointment = await Appointment.findOne({
      neurologistId: req.user.id,
      patientId: patientId
    });

    if (!hasAppointment) {
      return res.status(403).json({ message: 'Access denied: No appointment history with this patient' });
    }

    const reports = await Report.find({ patientId }).sort({ createdAt: -1 });

    const enhanced = reports.map((r) => {
      const obj = r.toObject();
      try {
        // If PDF/raw, generate an image preview (first page)
        if (obj.fileType && obj.fileType.toLowerCase() === 'pdf') {
          obj.previewUrl = cloudinary.url(obj.publicId, {
            resource_type: 'image',
            format: 'jpg',
            page: 1,
            transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }]
          });
        } else {
          obj.previewUrl = obj.url;
        }
      } catch (err) {
        obj.previewUrl = obj.url;
      }
      return obj;
    });

    res.json({ reports: enhanced });
  } catch (error) {
    console.error('Get patient reports error:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

module.exports = router;

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const MedicineOrder = require('../models/MedicineOrder');
const Supplier = require('../models/Supplier');
const { authenticateToken, authorizeRoles, authorizeSupplier } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = (io) => {
  const router = express.Router();

  // Email transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'neuropath@gmail.com',
      pass: process.env.EMAIL_PASS // App password for Gmail
    }
  });

  // Patient: upload prescription image/pdf for order
  router.post('/upload', authenticateToken, authorizeRoles('patient'), upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'File is required' });

      const missing = [];
      if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
      if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
      if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
      if (missing.length) {
        return res.status(500).json({ message: `Cloudinary not configured on server. Missing: ${missing.join(', ')}` });
      }

      const folder = process.env.CLOUDINARY_FOLDER_PRESCRIPTIONS || 'neuropath_prescriptions';

      const streamUpload = () => new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'auto' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      const result = await streamUpload();

      const order = new MedicineOrder({
        patientId: req.user.id,
        fileName: result.original_filename,
        fileType: result.format,
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        bytes: result.bytes,
        deliveryAddress: req.body.deliveryAddress || '',
        status: 'uploaded',
        timeline: [{ status: 'uploaded', note: 'Prescription uploaded by patient' }]
      });

      await order.save();
      return res.status(201).json({ message: 'Prescription uploaded', order });
    } catch (err) {
      console.error('Upload order error:', err);
      return res.status(500).json({ message: 'Failed to upload prescription' });
    }
  });

  // Patient: list my orders
  router.get('/my', authenticateToken, authorizeRoles('patient'), async (req, res) => {
    try {
      const orders = await MedicineOrder.find({ patientId: req.user.id })
        .populate('neurologistId', 'name')
        .populate('supplierId', 'name supplierId')
        .sort({ createdAt: -1 });
      return res.json({ orders });
    } catch (err) {
      console.error('List my orders error:', err);
      return res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  // Neurologist: list pending orders awaiting approval
  router.get('/pending', authenticateToken, authorizeRoles('neurologist'), async (req, res) => {
    try {
      const orders = await MedicineOrder.find({ status: 'uploaded' })
        .populate('patientId', 'name email')
        .sort({ createdAt: -1 });
      return res.json({ orders });
    } catch (err) {
      console.error('List pending orders error:', err);
      return res.status(500).json({ message: 'Failed to fetch pending orders' });
    }
  });

  // Neurologist: list approved/forwarded orders
  router.get('/approved', authenticateToken, authorizeRoles('neurologist'), async (req, res) => {
    try {
      const orders = await MedicineOrder.find({
        status: { $in: ['doctor_approved', 'forwarded_to_supplier', 'processing', 'shipped', 'delivered'] }
      })
        .populate('patientId', 'name email')
        .populate('supplierId', 'name supplierId')
        .sort({ updatedAt: -1 });
      return res.json({ orders });
    } catch (err) {
      console.error('List approved orders error:', err);
      return res.status(500).json({ message: 'Failed to fetch approved orders' });
    }
  });

  // Neurologist: approve and optionally forward to supplier
  router.post('/:id/approve', authenticateToken, authorizeRoles('neurologist'), async (req, res) => {
    try {
      const { id } = req.params;
      const { approve, supplierId, note } = req.body;
      const order = await MedicineOrder.findById(id);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      order.neurologistId = req.user.id;

      if (approve === false) {
        order.status = 'rejected';
        order.timeline.push({ status: 'rejected', note: note || 'Rejected by neurologist' });
        order.updatedAt = new Date();
        await order.save();
        
        // Send rejection email to patient
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER || 'neuropath@gmail.com',
            to: order.patientId.email,
            subject: 'NeuroPath - Prescription Order Update',
            html: `
              <h2>Prescription Order Update</h2>
              <p>Dear ${order.patientId.name},</p>
              <p>We regret to inform you that your prescription order has been <strong>rejected</strong> by our neurologist.</p>
              <h3>Order Details:</h3>
              <ul>
                <li><strong>Order ID:</strong> ${order._id}</li>
                <li><strong>Status:</strong> Rejected</li>
                <li><strong>Reason:</strong> ${note || 'Rejected by neurologist'}</li>
                <li><strong>Updated:</strong> ${new Date().toLocaleString()}</li>
              </ul>
              <p>Please contact our support team if you have any questions or need to submit a new prescription.</p>
              <p>Best regards,<br>NeuroPath Medical Team</p>
            `
          };
          await transporter.sendMail(mailOptions);
          console.log('Rejection email sent to patient:', order.patientId.email);
        } catch (emailError) {
          console.error('Failed to send rejection email:', emailError);
        }
        
        io.to(`user_${order.patientId}`).emit('order:updated', { order });
        return res.json({ message: 'Order rejected', order });
      }

      // approve
      order.status = 'doctor_approved';
      order.timeline.push({ status: 'doctor_approved', note: note || 'Approved by neurologist' });

      if (supplierId) {
        const supplier = await Supplier.findOne({ _id: supplierId, active: true });
        if (!supplier) return res.status(400).json({ message: 'Invalid supplier' });
        order.supplierId = supplier._id;
        order.status = 'forwarded_to_supplier';
        order.timeline.push({ status: 'forwarded_to_supplier', note: `Forwarded to supplier ${supplier.name}` });
      }

      order.updatedAt = new Date();
      await order.save();

      // Send approval email to patient
      try {
        const statusMessage = supplierId ? 'approved and forwarded to supplier' : 'approved';
        const supplierInfo = supplierId ? `<li><strong>Assigned Supplier:</strong> ${supplier.name}</li>` : '';
        
        const mailOptions = {
          from: process.env.EMAIL_USER || 'neuropath@gmail.com',
          to: order.patientId.email,
          subject: 'NeuroPath - Prescription Order Update',
          html: `
            <h2>Prescription Order Update</h2>
            <p>Dear ${order.patientId.name},</p>
            <p>Great news! Your prescription order has been <strong>${statusMessage}</strong>.</p>
            <h3>Order Details:</h3>
            <ul>
              <li><strong>Order ID:</strong> ${order._id}</li>
              <li><strong>Status:</strong> ${order.status.replace(/_/g, ' ')}</li>
              ${supplierInfo}
              <li><strong>Updated:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            ${supplierId ? '<p>Your order is now being processed by our trusted supplier. You will receive updates as the order progresses.</p>' : '<p>A neurologist will review your order and assign it to an appropriate supplier soon.</p>'}
            <p>Best regards,<br>NeuroPath Medical Team</p>
          `
        };
        await transporter.sendMail(mailOptions);
        console.log('Approval email sent to patient:', order.patientId.email);
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      io.to(`user_${order.patientId}`).emit('order:updated', { order });
      return res.json({ message: 'Order updated', order });
    } catch (err) {
      console.error('Approve order error:', err);
      return res.status(500).json({ message: 'Failed to update order' });
    }
  });

  // Supplier: list assigned orders
  router.get('/supplier/assigned', authenticateToken, authorizeSupplier, async (req, res) => {
    try {
      const orders = await MedicineOrder.find({ supplierId: req.user.supplierId || req.user.id })
        .populate('patientId', 'name email')
        .sort({ createdAt: -1 });
      return res.json({ orders });
    } catch (err) {
      console.error('Supplier orders error:', err);
      return res.status(500).json({ message: 'Failed to fetch supplier orders' });
    }
  });

  // Supplier: update status
  router.patch('/:id/status', authenticateToken, authorizeSupplier, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      
      // Allow any status for custom updates, but validate basic ones
      const allowed = ['processing', 'shipped', 'delivered'];
      const isCustomStatus = !allowed.includes(status);
      
      if (!status || typeof status !== 'string' || status.trim().length === 0) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const order = await MedicineOrder.findById(id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      if (String(order.supplierId) !== String(req.user.id) && String(order.supplierId) !== String(req.user.supplierId)) {
        return res.status(403).json({ message: 'Not authorized for this order' });
      }

      order.status = status;
      order.timeline.push({ 
        status, 
        note: note || (isCustomStatus ? 'Custom status update' : ''), 
        at: new Date() 
      });
      order.updatedAt = new Date();
      await order.save();

      io.to(`user_${order.patientId}`).emit('order:updated', { order });
      return res.json({ message: 'Order status updated', order });
    } catch (err) {
      console.error('Supplier status error:', err);
      return res.status(500).json({ message: 'Failed to update order status' });
    }
  });

  return router;
};

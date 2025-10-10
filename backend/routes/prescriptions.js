const express = require('express');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create a prescription (neurologist only)
router.post('/', authenticateToken, authorizeRoles('neurologist'), async (req, res) => {
  try {
    const { patientId, appointmentId, medication, duration, instructions } = req.body;

    // Validate required fields
    if (!patientId || !medication || !duration) {
      return res.status(400).json({ message: 'Patient ID, medication, and duration are required' });
    }

    // Verify the patient exists and belongs to this neurologist
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if there's an appointment relationship (optional)
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || String(appointment.neurologistId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Invalid appointment or not authorized' });
      }
    }

    // Create the prescription
    const prescription = new Prescription({
      patientId,
      neurologistId: req.user.id,
      appointmentId,
      medication,
      duration,
      instructions: instructions || ''
    });

    await prescription.save();

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: 'Failed to create prescription' });
  }
});

// Get prescriptions for a specific patient (neurologist only)
router.get('/patient/:patientId', authenticateToken, authorizeRoles('neurologist'), async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify the patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get prescriptions for this patient created by this neurologist
    const prescriptions = await Prescription.find({
      patientId,
      neurologistId: req.user.id
    })
    .populate('patientId', 'name email')
    .populate('neurologistId', 'name')
    .populate('appointmentId', 'date time type')
    .sort({ createdAt: -1 });

    res.json({ prescriptions });
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({ message: 'Failed to fetch prescriptions' });
  }
});

// Get current user's prescriptions (patient only)
router.get('/my-prescriptions', authenticateToken, authorizeRoles('patient'), async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patientId: req.user.id
    })
    .populate('neurologistId', 'name')
    .populate('appointmentId', 'date time type')
    .sort({ createdAt: -1 });

    res.json({ prescriptions });
  } catch (error) {
    console.error('Get my prescriptions error:', error);
    res.status(500).json({ message: 'Failed to fetch prescriptions' });
  }
});

// Update prescription status (neurologist only)
router.patch('/:id/status', authenticateToken, authorizeRoles('neurologist'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Verify ownership
    if (String(prescription.neurologistId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this prescription' });
    }

    prescription.status = status;
    prescription.updatedAt = new Date();
    await prescription.save();

    res.json({
      message: 'Prescription updated successfully',
      prescription
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ message: 'Failed to update prescription' });
  }
});

module.exports = router;
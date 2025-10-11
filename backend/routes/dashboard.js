const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Report = require('../models/Report');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Patient dashboard
router.get('/patient', authenticateToken, authorizeRoles('patient'), async (req, res) => {
  try {
    const userAppointments = await Appointment.find({ patientId: req.user.id });
    const userReports = await Report.find({ patientId: req.user.id });

    // Get prescriptions for this patient
    const Prescription = require('../models/Prescription');
    const userPrescriptions = await Prescription.find({ patientId: req.user.id })
      .populate('neurologistId', 'name avatar specialty')
      .populate('appointmentId', 'date time type')
      .sort({ createdAt: -1 });

    res.json({
      appointments: userAppointments,
      reports: userReports,
      prescriptions: userPrescriptions,
      stats: {
        totalAppointments: userAppointments.length,
        completedReports: userReports.filter(r => r.status === 'completed').length,
        upcomingAppointments: userAppointments.filter(a => a.status === 'confirmed').length
      }
    });
  } catch (error) {
    console.error('Patient dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Neurologist dashboard
router.get('/neurologist', authenticateToken, authorizeRoles('neurologist'), async (req, res) => {
  try {
    // Get all appointments for this neurologist
    const neurologistAppointments = await Appointment
      .find({ neurologistId: req.user.id })
      .populate('patientId', 'name avatar email phone age gender condition medicalHistory currentMedications')
      .sort({ createdAt: -1 });

    // Get unique patients who have appointments with this neurologist
    const patientIds = [...new Set(neurologistAppointments.map(a => a.patientId?._id).filter(Boolean))];
    const patients = await User.find({ _id: { $in: patientIds }, role: 'patient' });

    // Get reports for these patients
    const Report = require('../models/Report');
    const patientReports = await Report.find({ patientId: { $in: patientIds } }).sort({ createdAt: -1 });

    // Get prescriptions for these patients
    const Prescription = require('../models/Prescription');
    const patientPrescriptions = await Prescription.find({ patientId: { $in: patientIds } }).sort({ createdAt: -1 });

    // Build lightweight appointment objects enriched with patient info
    const enrichedAppointments = neurologistAppointments.map((a) => ({
      _id: a._id,
      patientUserId: a.patientId && a.patientId._id ? String(a.patientId._id) : undefined,
      patient: a.patientId && a.patientId.name ? a.patientId.name : 'Patient',
      avatar: a.patientId && a.patientId.avatar ? a.patientId.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(a.patientId && a.patientId.name ? a.patientId.name : 'patient')}`,
      date: a.date,
      time: a.time,
      type: a.type,
      status: a.status,
      reason: a.reason || 'Consultation',
      age: a.patientId?.age,
      email: a.patientId?.email,
      phone: a.patientId?.phone,
      gender: a.patientId?.gender,
      condition: a.patientId?.condition,
      medicalHistory: a.patientId?.medicalHistory || [],
      currentMedications: a.patientId?.currentMedications || []
    }));

    // Group reports by patient
    const reportsByPatient = patientReports.reduce((acc, report) => {
      const patientId = String(report.patientId);
      if (!acc[patientId]) acc[patientId] = [];
      acc[patientId].push(report);
      return acc;
    }, {});

    // Group prescriptions by patient
    const prescriptionsByPatient = patientPrescriptions.reduce((acc, prescription) => {
      const patientId = String(prescription.patientId);
      if (!acc[patientId]) acc[patientId] = [];
      acc[patientId].push(prescription);
      return acc;
    }, {});

    // Group appointments by patient
    const appointmentsByPatient = neurologistAppointments.reduce((acc, appointment) => {
      const patientId = String(appointment.patientId?._id);
      if (!acc[patientId]) acc[patientId] = [];
      acc[patientId].push({
        _id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        type: appointment.type,
        status: appointment.status,
        reason: appointment.reason
      });
      return acc;
    }, {});

    // Enrich patients with their reports and appointment history
    const enrichedPatients = patients.map(patient => {
      const patientId = String(patient._id);
      return {
        ...patient.toObject(),
        reports: reportsByPatient[patientId] || [],
        appointmentHistory: appointmentsByPatient[patientId] || [],
        prescriptions: prescriptionsByPatient[patientId] || []
      };
    });

    // Appointment date is stored as string (YYYY-MM-DD). Compute "today" robustly
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    res.json({
      appointments: enrichedAppointments,
      patients: enrichedPatients.map(({ password, ...patient }) => patient),
      stats: {
        totalPatients: enrichedPatients.length,
        todayAppointments: neurologistAppointments.filter(a => String(a.date) === todayStr).length,
        totalAppointments: neurologistAppointments.length
      }
    });
  } catch (error) {
    console.error('Neurologist dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin dashboard
router.get('/admin', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const allUsers = await User.find({});
    const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);

    // Get suppliers
    const Supplier = require('../models/Supplier');
    const suppliers = await Supplier.find({}).select('-password');

    // Get detailed patient information
    const patients = allUsers.filter(u => u.role === 'patient');
    const patientDetails = await Promise.all(patients.map(async (patient) => {
      // Get appointments for this patient
      const patientAppointments = await Appointment.find({ patientId: patient._id });

      // Calculate patient stats
      const totalAppointments = patientAppointments.length;
      const lastVisit = patientAppointments.length > 0
        ? patientAppointments
          .filter(a => a.status === 'completed')
          .sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time))[0]
        : null;

      // Calculate age (assuming we don't have DOB, using account creation as proxy)
      const age = Math.floor((new Date() - new Date(patient.createdAt)) / (365.25 * 24 * 60 * 60 * 1000));

      // Get assigned neurologist info if exists
      let assignedNeurologist = null;
      if (patient.assignedNeurologistId) {
        const neurologist = allUsers.find(u => u._id.toString() === patient.assignedNeurologistId.toString() && u.role === 'neurologist');
        if (neurologist) {
          assignedNeurologist = {
            _id: neurologist._id,
            name: neurologist.name,
            email: neurologist.email
          };
        }
      }

      return {
        ...patient.toObject(),
        password: undefined, // Remove password
        age: age || 'N/A',
        joinDate: patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A',
        lastVisit: lastVisit ? new Date(lastVisit.date + ' ' + lastVisit.time).toLocaleDateString() : 'Never',
        appointments: totalAppointments,
        assignedNeurologist: assignedNeurologist
      };
    }));

    // Get detailed neurologist information
    const neurologists = allUsers.filter(u => u.role === 'neurologist');
    const neurologistDetails = await Promise.all(neurologists.map(async (neurologist) => {
      // Get appointments for this neurologist
      const neurologistAppointments = await Appointment.find({ neurologistId: neurologist._id });

      // Calculate neurologist stats
      const totalAppointments = neurologistAppointments.length;
      const confirmedAppointments = neurologistAppointments.filter(a => a.status === 'confirmed').length;
      const completedAppointments = neurologistAppointments.filter(a => a.status === 'completed').length;

      // Calculate experience (using account creation as proxy)
      const experience = Math.floor((new Date() - new Date(neurologist.createdAt)) / (365.25 * 24 * 60 * 60 * 1000));

      // Get promo codes for this neurologist (from their User record)
      const promoCodes = neurologist.promoCode ? [{
        code: neurologist.promoCode,
        isActive: true,
        usageCount: 0,
        maxUsage: null,
        createdAt: neurologist.createdAt,
        expiresAt: null
      }] : [];

      return {
        ...neurologist.toObject(),
        password: undefined, // Remove password
        experience: experience || 'N/A',
        joinDate: neurologist.createdAt ? new Date(neurologist.createdAt).toLocaleDateString() : 'N/A',
        totalAppointments,
        confirmedAppointments,
        completedAppointments,
        promoCodes: promoCodes
      };
    }));

    
    res.json({
      users: usersWithoutPasswords,
      patients: patientDetails,
      neurologists: neurologistDetails,
      suppliers: suppliers,
      stats: {
        totalUsers: allUsers.length,
        totalPatients: patients.length,
        totalNeurologists: allUsers.filter(u => u.role === 'neurologist').length,
        totalAdmins: allUsers.filter(u => u.role === 'admin').length
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

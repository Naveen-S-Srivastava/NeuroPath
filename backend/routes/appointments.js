const express = require('express');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Message = require('../models/Message');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

module.exports = (io) => {
  const router = express.Router();

  // List neurologists with simple availability info
  router.get('/neurologists', authenticateToken, async (req, res) => {
    try {
      // Get current user to check for promo code assignment
      const currentUser = await User.findById(req.user.id);
      
      let neurologistQuery = { role: 'neurologist' };
      
      // If user has an assigned neurologist from promo code, only show that one
      if (currentUser && currentUser.assignedNeurologistId) {
        neurologistQuery._id = currentUser.assignedNeurologistId;
      }

      const neurologists = await User.find(neurologistQuery);

      // Compute today's date string in YYYY-MM-DD (appointments stored as strings)
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const todayStr = `${y}-${m}-${d}`;

      const results = await Promise.all(neurologists.map(async (n) => {
        const countToday = await Appointment.countDocuments({ neurologistId: n._id, date: todayStr, status: 'confirmed' });
        // Simple heuristic: available if less than 8 appointments today
        const available = countToday < 8;
        return {
          _id: n._id,
          name: n.name,
          avatar: n.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(n.name)}`,
          specialty: 'Neurologist',
          rating: 4.8,
          experience: '10+ years',
          location: 'Medical Center',
          fee: '$150',
          available,
          todayAppointments: countToday,
          isAssigned: currentUser && currentUser.assignedNeurologistId && String(currentUser.assignedNeurologistId) === String(n._id)
        };
      }));

      res.json({ 
        neurologists: results,
        hasPromoCode: currentUser && currentUser.promoCode ? true : false,
        promoCode: currentUser && currentUser.promoCode ? currentUser.promoCode : null
      });
    } catch (error) {
      console.error('Get neurologists error:', error);
      res.status(500).json({ message: 'Failed to fetch neurologists' });
    }
  });

  // Book an appointment request (patient only) -> creates pending request and notifies neurologist via socket
  router.post('/', authenticateToken, authorizeRoles('patient'), async (req, res) => {
    try {
      const { neurologistId, date, time, type } = req.body;
      if (!neurologistId || !date || !time || !type) return res.status(400).json({ message: 'Missing required fields' });

      const neurologist = await User.findById(neurologistId);
      if (!neurologist || neurologist.role !== 'neurologist') return res.status(404).json({ message: 'Neurologist not found' });

      // Create appointment with pending status
      const appointment = new Appointment({
        patientId: req.user.id,
        neurologistId,
        doctor: `Dr. ${neurologist.name}`,
        specialty: 'Neurology',
        date,
        time,
        type,
        status: 'pending'
      });

      await appointment.save();

      // Notify neurologist via socket if connected
      try {
        const room = `user_${neurologist._id}`;
        io.to(room).emit('appointment:request', { appointment });
      } catch (emitErr) {
        console.warn('Emit appointment request failed:', emitErr.message || emitErr);
      }

      res.json({ appointment, message: 'Appointment request sent to neurologist' });
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({ message: 'Failed to create appointment' });
    }
  });

  // Allow neurologist to accept/reject an appointment via API (alternative to sockets)
  router.post('/:id/respond', authenticateToken, authorizeRoles('neurologist'), async (req, res) => {
    try {
      const { id } = req.params;
      const { accept } = req.body;
      const appointment = await Appointment.findById(id);
      if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
      if (String(appointment.neurologistId) !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

      appointment.status = accept ? 'confirmed' : 'rejected';
      await appointment.save();

      // Notify patient via socket
      try {
        const room = `user_${appointment.patientId}`;
        io.to(room).emit('appointment:updated', { appointment });
      } catch (emitErr) {
        console.warn('Emit appointment update failed:', emitErr.message || emitErr);
      }

      res.json({ appointment, message: 'Response recorded' });
    } catch (error) {
      console.error('Respond appointment error:', error);
      res.status(500).json({ message: 'Failed to respond to appointment' });
    }
  });

  // Chat messages (store and forward)
  router.post('/:id/message', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params; // appointment id
      const { content } = req.body;
      if (!content) return res.status(400).json({ message: 'Empty message' });

      const appointment = await Appointment.findById(id);
      if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

      const msg = new Message({ appointmentId: id, senderId: req.user.id, content });
      await msg.save();

      // forward via socket to other participant
      const otherUser = String(req.user.id) === String(appointment.patientId) ? appointment.neurologistId : appointment.patientId;
      try {
        io.to(`user_${otherUser}`).emit('chat:message', { appointmentId: id, message: msg });
      } catch (emitErr) {
        console.warn('Emit chat message failed:', emitErr.message || emitErr);
      }

      res.json({ message: msg });
    } catch (error) {
      console.error('Post message error:', error);
      res.status(500).json({ message: 'Failed to post message' });
    }
  });

  // Get chat messages for an appointment
  router.get('/:id/messages', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params; // appointment id

      const appointment = await Appointment.findById(id);
      if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

      // Check if user is part of this appointment
      if (String(req.user.id) !== String(appointment.patientId) && String(req.user.id) !== String(appointment.neurologistId)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const messages = await Message.find({ appointmentId: id }).sort({ createdAt: 1 }).populate('senderId', 'name');
      res.json({ messages });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: 'Failed to get messages' });
    }
  });

  return router;
};

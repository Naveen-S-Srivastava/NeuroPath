const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Supplier = require('../models/Supplier');
const MedicineOrder = require('../models/MedicineOrder');
const { authenticateToken, authorizeRoles, authorizeSupplier } = require('../middleware/auth');

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

  // Admin: create supplier
  router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
      const { supplierId, name, email, phone, company, password } = req.body;
      if (!supplierId || !name || !password) return res.status(400).json({ message: 'supplierId, name and password are required' });
      const existing = await Supplier.findOne({ supplierId });
      if (existing) return res.status(409).json({ message: 'Supplier ID already exists' });

      const hash = await bcrypt.hash(password, 10);
      const supplier = new Supplier({ supplierId, name, email, phone, company, password: hash });
      await supplier.save();

      // Send email with supplier details
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER || 'neuropath@gmail.com',
          to: email,
          subject: 'Welcome to NeuroPath - Your Supplier Account Details',
          html: `
            <h2>Welcome to NeuroPath!</h2>
            <p>Your supplier account has been successfully created. Here are your login details:</p>
            <h3>Account Information:</h3>
            <ul>
              <li><strong>Supplier ID:</strong> ${supplierId}</li>
              <li><strong>Name:</strong> ${name}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Password:</strong> ${password}</li>
              ${company ? `<li><strong>Company:</strong> ${company}</li>` : ''}
              ${phone ? `<li><strong>Phone:</strong> ${phone}</li>` : ''}
            </ul>
            <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
            <p>You can log in to the NeuroPath supplier portal using your Supplier ID and password.</p>
            <p>Best regards,<br>NeuroPath Administration Team</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('Supplier account details email sent successfully to:', email);
      } catch (emailError) {
        console.error('Failed to send supplier email:', emailError);
        // Don't fail the creation if email fails
      }

      const { password: _, ...data } = supplier.toObject();
      return res.status(201).json({ supplier: data });
    } catch (err) {
      console.error('Create supplier error:', err);
      return res.status(500).json({ message: 'Failed to create supplier' });
    }
  });

  // Public: supplier login with supplierId + password
  router.post('/login', async (req, res) => {
    try {
      const { supplierId, password } = req.body;
      if (!supplierId || !password) return res.status(400).json({ message: 'Supplier ID and password are required' });
      const supplier = await Supplier.findOne({ supplierId, active: true });
      if (!supplier) return res.status(401).json({ message: 'Invalid credentials' });
      const ok = await bcrypt.compare(password, supplier.password);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign(
        { id: supplier._id, role: 'supplier', supplierId: supplier.supplierId },
        process.env.JWT_SECRET || 'neuropath_secret_key',
        { expiresIn: '24h' }
      );
      const { password: _, ...data } = supplier.toObject();
      return res.json({ supplier: data, token });
    } catch (err) {
      console.error('Supplier login error:', err);
      return res.status(500).json({ message: 'Failed to login' });
    }
  });

  // Supplier: forgot password - send password via email
  router.post('/forgot-password', async (req, res) => {
    try {
      const { supplierId } = req.body;
      if (!supplierId) return res.status(400).json({ message: 'Supplier ID is required' });

      const supplier = await Supplier.findOne({ supplierId, active: true });
      if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

      // Send email with password recovery instructions
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER || 'neuropath@gmail.com',
          to: supplier.email,
          subject: 'NeuroPath Supplier Password Recovery',
          html: `
            <h2>Password Recovery Request</h2>
            <p>We received a password recovery request for your supplier account.</p>
            <h3>Account Details:</h3>
            <ul>
              <li><strong>Supplier ID:</strong> ${supplier.supplierId}</li>
              <li><strong>Name:</strong> ${supplier.name}</li>
              <li><strong>Email:</strong> ${supplier.email}</li>
              ${supplier.company ? `<li><strong>Company:</strong> ${supplier.company}</li>` : ''}
            </ul>
            <p><strong>Security Notice:</strong> For security reasons, we cannot send your password via email. Please contact the NeuroPath administration team to reset your password.</p>
            <p><strong>Contact:</strong> admin@neuropath.com or call our support line.</p>
            <p>Best regards,<br>NeuroPath Support Team</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log('Supplier password recovery email sent to:', supplier.email);
        return res.json({ message: 'Recovery instructions sent to your registered email' });
      } catch (emailError) {
        console.error('Failed to send supplier password email:', emailError);
        return res.status(500).json({ message: 'Failed to send email' });
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      return res.status(500).json({ message: 'Failed to process request' });
    }
  });

  // Supplier: me
  router.get('/me', authenticateToken, authorizeSupplier, async (req, res) => {
    try {
      const supplier = await Supplier.findById(req.user.id);
      if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
      const { password: _, ...data } = supplier.toObject();
      return res.json({ supplier: data });
    } catch (err) {
      console.error('Supplier me error:', err);
      return res.status(500).json({ message: 'Failed to fetch supplier' });
    }
  });

  // Neurologist/Admin: list suppliers (lightweight)
  router.get('/', authenticateToken, authorizeRoles('neurologist', 'admin'), async (req, res) => {
    try {
      const suppliers = await Supplier.find({ active: true }).select('name supplierId');
      return res.json({ suppliers });
    } catch (err) {
      console.error('List suppliers error:', err);
      return res.status(500).json({ message: 'Failed to fetch suppliers' });
    }
  });

  // Supplier: assigned orders
  router.get('/orders', authenticateToken, authorizeSupplier, async (req, res) => {
    try {
      console.log('Fetching orders for supplier:', req.user.id);
      const orders = await MedicineOrder.find({ supplierId: req.user.id })
        .populate('patientId', 'name email')
        .sort({ createdAt: -1 });
      console.log('Found', orders.length, 'orders');
      
      // Ensure orders have valid data
      const safeOrders = orders.map(order => ({
        ...order.toObject(),
        patientId: order.patientId || { name: 'Unknown Patient', email: '' }
      }));
      
      return res.json({ orders: safeOrders });
    } catch (err) {
      console.error('Supplier orders error:', err);
      return res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  // Supplier: update status
  router.patch('/orders/:id/status', authenticateToken, authorizeSupplier, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, note, isMainStatus } = req.body;
      
      console.log('Update status request:', { id, status, note, isMainStatus, userId: req.user.id });
      
      if (!status || typeof status !== 'string' || status.trim().length === 0) {
        return res.status(400).json({ message: 'Status is required' });
      }
      
      const order = await MedicineOrder.findById(id);
      console.log('Found order:', order ? { id: order._id, supplierId: order.supplierId, status: order.status } : 'Order not found');
      
      if (!order) return res.status(404).json({ message: 'Order not found' });
      
      console.log('Checking authorization:', { 
        orderSupplierId: order.supplierId, 
        userId: req.user.id, 
        userSupplierId: req.user.supplierId,
        orderSupplierIdType: typeof order.supplierId,
        userIdType: typeof req.user.id
      });
      
      // Ensure supplier can only update orders assigned to them
      if (!order.supplierId || (String(order.supplierId) !== String(req.user.id))) {
        console.log('Authorization failed');
        return res.status(403).json({ message: 'Not authorized for this order' });
      }
      console.log('Authorization passed');

      // Only update order.status for main status changes (from buttons)
      if (isMainStatus) {
        // Define allowed main status transitions
        const mainStatuses = ['processing', 'shipped', 'delivered'];
        if (!mainStatuses.includes(status)) {
          return res.status(400).json({ message: `Invalid main status: ${status}` });
        }
        
        // Prevent going backwards in status (e.g., from delivered to shipped)
        const statusOrder = { 'processing': 1, 'shipped': 2, 'delivered': 3 };
        const currentOrder = statusOrder[order.status] || 0;
        const newOrder = statusOrder[status] || 0;
        
        if (newOrder < currentOrder) {
          return res.status(400).json({ message: `Cannot change status from ${order.status} to ${status}` });
        }
        
        order.status = status;
      }
      // For custom statuses/notes, don't change the main order status
      
      // Ensure timeline is an array
      if (!Array.isArray(order.timeline)) {
        order.timeline = [];
      }
      
      const timelineEntry = { 
        status: isMainStatus ? status : `note: ${status}`, // Prefix custom statuses with 'note:'
        note: note || (isMainStatus ? 'Status updated' : 'Note added'), 
        at: new Date() 
      };
      console.log('Adding timeline entry:', timelineEntry);
      
      order.timeline.push(timelineEntry);
      order.updatedAt = new Date();
      
      try {
        console.log('Attempting to save order with status:', order.status, 'timeline length:', order.timeline.length);
        await order.save();
        console.log('Order saved successfully');
      } catch (saveError) {
        console.error('Save error details:', saveError);
        return res.status(500).json({ message: 'Failed to save order', error: saveError.message });
      }
      
      io.to(`user_${order.patientId}`).emit('order:updated', { order: order.toObject() });
      return res.json({ 
        message: isMainStatus ? 'Order status updated' : 'Note added to order',
        order: {
          _id: order._id,
          status: order.status,
          timeline: order.timeline,
          updatedAt: order.updatedAt
        }
      });
    } catch (err) {
      console.error('Supplier update status error:', err);
      return res.status(500).json({ message: 'Failed to update status', error: err.message });
    }
  });

  return router;
};

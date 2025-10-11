const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Supplier = require('../models/Supplier');
const MedicineOrder = require('../models/MedicineOrder');
const { authenticateToken, authorizeRoles, authorizeSupplier } = require('../middleware/auth');

module.exports = (io) => {
  const router = express.Router();

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
      const { status, note } = req.body;
      
      console.log('Update status request:', { id, status, note, userId: req.user.id });
      
      // Allow any status for custom updates
      // const allowed = ['processing', 'shipped', 'delivered'];
      // const isCustomStatus = !allowed.includes(status);
      
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

      order.status = status;
      
      // Ensure timeline is an array
      if (!Array.isArray(order.timeline)) {
        order.timeline = [];
      }
      
      const timelineEntry = { 
        status, 
        note: note || 'Status updated', 
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
        message: 'Order status updated', 
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

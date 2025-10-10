const express = require('express');
const PromoCode = require('../models/PromoCode');
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Create a new promo code (neurologist only)
router.post('/', authenticateToken, authorizeRoles('neurologist'), async (req, res) => {
  try {
    const { code, description, maxUsage, expiresAt } = req.body;
    
    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Promo code is required' });
    }

    // Check if promo code already exists
    const existingPromo = await PromoCode.findOne({ code: code.trim().toUpperCase() });
    if (existingPromo) {
      return res.status(409).json({ message: 'Promo code already exists' });
    }

    // Create new promo code
    const newPromoCode = new PromoCode({
      code: code.trim().toUpperCase(),
      neurologistId: req.user.id,
      description: description || 'Doctor-assigned neurologist access',
      maxUsage: maxUsage || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await newPromoCode.save();

    res.status(201).json({
      promoCode: newPromoCode,
      message: 'Promo code created successfully'
    });
  } catch (error) {
    console.error('Create promo code error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all promo codes for a neurologist
router.get('/my', authenticateToken, authorizeRoles('neurologist'), async (req, res) => {
  try {
    const promoCodes = await PromoCode.find({ neurologistId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ promoCodes });
  } catch (error) {
    console.error('Get promo codes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get promo code details
router.get('/:id', authenticateToken, authorizeRoles('neurologist'), async (req, res) => {
  try {
    const promoCode = await PromoCode.findOne({ 
      _id: req.params.id, 
      neurologistId: req.user.id 
    });

    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    // Get users who used this promo code
    const users = await User.find({ promoCode: promoCode.code })
      .select('name email createdAt');

    res.json({ 
      promoCode,
      users: users
    });
  } catch (error) {
    console.error('Get promo code error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update promo code
router.put('/:id', authenticateToken, authorizeRoles('neurologist'), async (req, res) => {
  try {
    const { description, maxUsage, expiresAt, isActive } = req.body;
    
    const promoCode = await PromoCode.findOne({ 
      _id: req.params.id, 
      neurologistId: req.user.id 
    });

    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    // Update fields
    if (description !== undefined) promoCode.description = description;
    if (maxUsage !== undefined) promoCode.maxUsage = maxUsage;
    if (expiresAt !== undefined) promoCode.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) promoCode.isActive = isActive;

    await promoCode.save();

    res.json({
      promoCode,
      message: 'Promo code updated successfully'
    });
  } catch (error) {
    console.error('Update promo code error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete promo code
router.delete('/:id', authenticateToken, authorizeRoles('neurologist'), async (req, res) => {
  try {
    const promoCode = await PromoCode.findOne({ 
      _id: req.params.id, 
      neurologistId: req.user.id 
    });

    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    await PromoCode.findByIdAndDelete(req.params.id);

    res.json({ message: 'Promo code deleted successfully' });
  } catch (error) {
    console.error('Delete promo code error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

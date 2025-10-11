const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login route
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  body('role').isIn(['patient', 'neurologist', 'admin']),
  body('promoCode').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, promoCode } = req.body;

    // Find user
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Handle promo code for patients
    if (role === 'patient' && promoCode && promoCode.trim()) {
      const PromoCode = require('../models/PromoCode');
      const promo = await PromoCode.findOne({ 
        code: promoCode.trim().toUpperCase(), 
        isActive: true 
      });
      
      if (!promo) {
        return res.status(400).json({ message: 'Invalid promo code' });
      }
      
      // Check if promo code has expired
      if (promo.expiresAt && new Date() > promo.expiresAt) {
        return res.status(400).json({ message: 'Promo code has expired' });
      }
      
      // Check usage limit
      if (promo.maxUsage && promo.usageCount >= promo.maxUsage) {
        return res.status(400).json({ message: 'Promo code usage limit reached' });
      }
      
      // Update user with promo code assignment
      user.promoCode = promoCode.trim().toUpperCase();
      user.assignedNeurologistId = promo.neurologistId;
      await user.save();
      
      // Increment usage count
      await PromoCode.findByIdAndUpdate(promo._id, { 
        $inc: { usageCount: 1 } 
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this email and role
    const OTP = require('../models/OTP');
    await OTP.deleteMany({ email, role });

    // Create new OTP
    const otp = new OTP({
      email,
      otp: otpCode,
      role,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    await otp.save();

    // Send OTP via email
    const emailService = require('../services/emailService');
    const emailResult = await emailService.sendOTP(email, otpCode, role);
    
    if (!emailResult.success) {
      await OTP.findByIdAndDelete(otp._id); // Clean up if email fails
      return res.status(500).json({ 
        message: 'Failed to send OTP email',
        error: emailResult.error 
      });
    }

    // Return success with OTP sent confirmation (no token yet)
    res.json({
      message: 'Credentials verified. OTP sent to your email.',
      requiresOTP: true,
      expiresIn: 600 // 10 minutes in seconds
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Signup route
router.post('/signup', [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['patient', 'neurologist', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'neuropath_secret_key',
      { expiresIn: '24h' }
    );

    // Return user data (without password)
    const { password: _, ...userData } = newUser.toObject();
    res.status(201).json({
      user: userData,
      token,
      message: 'Account created successfully'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user route
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userData } = user.toObject();
    res.json({ user: userData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
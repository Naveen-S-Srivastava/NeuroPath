const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const OTP = require('../models/OTP');
const emailService = require('../services/emailService');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Generate OTP for email verification
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail(),
  body('role').isIn(['patient', 'neurologist', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role } = req.body;

    // Check if user exists
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this email and role
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
    const emailResult = await emailService.sendOTP(email, otpCode, role);
    
    if (!emailResult.success) {
      await OTP.findByIdAndDelete(otp._id); // Clean up if email fails
      return res.status(500).json({ 
        message: 'Failed to send OTP email',
        error: emailResult.error 
      });
    }

    res.json({
      message: 'OTP sent successfully',
      expiresIn: 600 // 10 minutes in seconds
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify OTP and login
router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('role').isIn(['patient', 'neurologist', 'admin']),
  body('promoCode').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, role, promoCode } = req.body;

    // Find the OTP record
    const otpRecord = await OTP.findOne({ 
      email, 
      role, 
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        message: 'Invalid or expired OTP' 
      });
    }

    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(429).json({ 
        message: 'Too many failed attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      return res.status(400).json({ 
        message: 'Invalid OTP',
        attemptsLeft: 3 - otpRecord.attempts
      });
    }

    // OTP is valid, find user
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'neuropath_secret_key',
      { expiresIn: '24h' }
    );

    // Return user data (without password)
    const { password: _, ...userData } = user.toObject();
    res.json({
      user: userData,
      token,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Resend OTP
router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail(),
  body('role').isIn(['patient', 'neurologist', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role } = req.body;

    // Check if user exists
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if there's a recent OTP (within 1 minute)
    const recentOTP = await OTP.findOne({ 
      email, 
      role, 
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) } // 1 minute
    });

    if (recentOTP) {
      return res.status(429).json({ 
        message: 'Please wait before requesting another OTP',
        waitTime: 60
      });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this email and role
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
    const emailResult = await emailService.sendOTP(email, otpCode, role);
    
    if (!emailResult.success) {
      await OTP.findByIdAndDelete(otp._id); // Clean up if email fails
      return res.status(500).json({ 
        message: 'Failed to send OTP email',
        error: emailResult.error 
      });
    }

    res.json({
      message: 'OTP resent successfully',
      expiresIn: 600 // 10 minutes in seconds
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

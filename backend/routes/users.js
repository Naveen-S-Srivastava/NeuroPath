const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const allUsers = await User.find({});
    const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);
    res.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user (Admin only)
router.put('/:id', authenticateToken, authorizeRoles('admin'), [
  body('name').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['patient', 'neurologist', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If promoCode is being updated, handle differently for patients vs neurologists
    if (updates.promoCode !== undefined) {
      if (updates.promoCode && updates.promoCode.trim() !== '') {
        const promoCodeValue = updates.promoCode.toUpperCase().trim();
        
        if (user.role === 'patient') {
          // For patients: find the neurologist with this promo code
          const neurologist = await User.findOne({ 
            promoCode: promoCodeValue,
            role: 'neurologist'
          });
          
          if (!neurologist) {
            return res.status(400).json({ message: 'Invalid promo code - no neurologist found with this code' });
          }
          
          updates.promoCode = promoCodeValue;
          updates.assignedNeurologistId = neurologist._id;
        } else if (user.role === 'neurologist') {
          // For neurologists: check if promo code is already used by another neurologist
          const existingNeurologist = await User.findOne({ 
            promoCode: promoCodeValue,
            role: 'neurologist',
            _id: { $ne: user._id } // Exclude current user
          });
          
          if (existingNeurologist) {
            return res.status(400).json({ message: 'Promo code already in use by another neurologist' });
          }
          
          updates.promoCode = promoCodeValue;
        }
      } else {
        // If promoCode is empty/null, also clear the assigned neurologist (for patients)
        updates.promoCode = null;
        if (user.role === 'patient') {
          updates.assignedNeurologistId = null;
        }
      }
    }

    // Update user
    Object.assign(user, updates);
    await user.save();

    const { password: _, ...userData } = user.toObject();
    res.json({ user: userData, message: 'User updated successfully' });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
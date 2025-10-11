const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },
  otp: { 
    type: String, 
    required: true,
    length: 6
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['patient', 'neurologist', 'admin'] 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  attempts: { 
    type: Number, 
    default: 0,
    max: 3
  },
  isUsed: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for efficient queries
otpSchema.index({ email: 1, role: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

module.exports = mongoose.model('OTP', otpSchema);

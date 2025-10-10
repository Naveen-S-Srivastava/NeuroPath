const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true
  },
  neurologistId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  description: { 
    type: String, 
    default: 'Doctor-assigned neurologist access' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  usageCount: { 
    type: Number, 
    default: 0 
  },
  maxUsage: { 
    type: Number, 
    default: null // null means unlimited usage
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date, 
    default: null // null means never expires
  }
});

// Index for faster lookups
promoCodeSchema.index({ code: 1 });
promoCodeSchema.index({ neurologistId: 1 });

module.exports = mongoose.model('PromoCode', promoCodeSchema);

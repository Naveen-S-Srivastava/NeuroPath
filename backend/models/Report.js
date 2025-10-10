const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  neurologistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  findings: { type: String },
  recommendations: { type: String },
  status: { type: String, default: 'pending' },

  // Cloud storage metadata
  publicId: { type: String },
  url: { type: String },
  fileType: { type: String },
  bytes: { type: Number },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);

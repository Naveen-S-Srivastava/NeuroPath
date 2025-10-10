const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierId: { type: String, required: true, unique: true }, // human-friendly ID used for login
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  company: { type: String },
  password: { type: String, required: true }, // hashed
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Supplier', supplierSchema);

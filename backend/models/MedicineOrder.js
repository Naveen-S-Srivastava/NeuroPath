const mongoose = require('mongoose');

const statusEnum = [
  'uploaded',
  'doctor_approved',
  'forwarded_to_supplier',
  'processing',
  'shipped',
  'delivered',
  'rejected',
  'out_for_delivery',
  'ready_for_pickup',
  'cancelled',
  'returned',
  'refunded'
];

const updateSchema = new mongoose.Schema({
  status: { type: String, required: true }, // Removed enum to allow custom statuses
  at: { type: Date, default: Date.now },
  note: { type: String, default: '' }
}, { _id: false });

const medicineOrderSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  neurologistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },

  // Cloudinary asset fields
  fileName: { type: String },
  fileType: { type: String },
  url: { type: String },
  publicId: { type: String },
  resourceType: { type: String },
  bytes: { type: Number },

  deliveryAddress: { type: String },

  status: { type: String, default: 'uploaded' }, // Removed enum to allow custom statuses
  timeline: { type: [updateSchema], default: [] },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicineOrder', medicineOrderSchema);

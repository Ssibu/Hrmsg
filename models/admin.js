const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  created_at: { type: Date, default: Date.now },
}, {
  collection: 'admin',
  timestamps: false,
});

module.exports = mongoose.model('Admin', AdminSchema); 
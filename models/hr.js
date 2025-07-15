const mongoose = require('mongoose');

const HRSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  post: { type: String, required: true },
  password: { type: String }, // Initially null, set during password reset
}, {
  collection: 'hr',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = mongoose.model('HR', HRSchema); 
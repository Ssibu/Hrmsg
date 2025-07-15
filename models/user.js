const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'hr', 'admin'], required: true },
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: false },
}, {
  collection: 'users',
  timestamps: false,
});

module.exports = mongoose.model('User', UserSchema); 
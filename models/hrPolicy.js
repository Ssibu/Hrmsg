const mongoose = require('mongoose');

const HRPolicySchema = new mongoose.Schema({
  category: { type: String, required: true },
  experience: { type: String, required: true },
  increment: { type: String, required: true },
}, {
  collection: 'hr_policies',
  timestamps: false,
});

module.exports = mongoose.model('HRPolicy', HRPolicySchema);

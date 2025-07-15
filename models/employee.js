const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  date_of_joining: { type: Date, required: true },
  salary: { type: Number, required: true },
  password: { type: String }, // For employee authentication
}, {
  collection: 'employees',
  timestamps: false,
});

module.exports = mongoose.model('Employee', EmployeeSchema);

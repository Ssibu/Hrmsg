const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: false },
  title: { type: String, required: true },
  date_assigned: { type: Date, required: true, default: Date.now },
  estimated_time: { type: String },
  actual_time: { type: String },
  rating: { type: Number },
  status: { type: String, required: true, default: 'pending' },
  status_history: { type: Array, required: true, default: [] },
}, {
  collection: 'tasks',
  timestamps: false,
});

module.exports = mongoose.model('Task', TaskSchema); 
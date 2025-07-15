const Task = require('../models/task');

function timeToSeconds(timeStr) {
  // timeStr: 'HH:MM:SS'
  const [h, m, s] = timeStr.split(':').map(Number);
  return h * 3600 + m * 60 + (s || 0);
}

function calculateRating(estimated, actual) {
  const estSec = timeToSeconds(estimated);
  const actSec = timeToSeconds(actual);
  const percentUsed = actSec / estSec;
  if (percentUsed <= 0.2) return 5;
  if (percentUsed <= 0.4) return 4;
  if (percentUsed <= 0.6) return 3;
  if (percentUsed <= 0.8) return 2;
  return 1;
}

// Helper function to broadcast task updates
function broadcastTaskUpdate(type, task) {
  if (global.broadcastTaskUpdate) {
    const updateData = {
      type: type,
      task: task,
      timestamp: new Date().toISOString()
    };
    global.broadcastTaskUpdate(updateData);
  }
}

exports.createTask = async (req, res) => {
  try {
    let rating = null;
    if (req.body.actual_time && req.body.estimated_time) {
      rating = calculateRating(req.body.estimated_time, req.body.actual_time);
    }
    const initialStatus = req.body.status || 'pending';
    const status_history = [{ status: initialStatus, timestamp: new Date().toISOString() }];

    // Fix: Convert empty string employee_id to null
    let employee_id = req.body.employee_id;
    if (employee_id === '') employee_id = null;

    const task = await Task.create({
      title: req.body.title,
      employee_id, // use the fixed value
      estimated_time: req.body.estimated_time,
      actual_time: req.body.actual_time,
      rating,
      status: initialStatus,
      status_history,
    });
    
    // Broadcast new task to all clients
    broadcastTaskUpdate('task_created', task);
    
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    let rating = task.rating;
    if (req.body.actual_time && (req.body.estimated_time || task.estimated_time)) {
      const estimated = req.body.estimated_time || task.estimated_time;
      rating = calculateRating(estimated, req.body.actual_time);
    }
    // Append to status_history if status is changing
    let newStatusHistory = Array.isArray(task.status_history) ? [...task.status_history] : [];
    if (req.body.status && req.body.status !== task.status) {
      newStatusHistory.push({ status: req.body.status, timestamp: new Date().toISOString() });
    }
    
    await Task.findByIdAndUpdate(id, {
      ...req.body,
      rating,
      status: req.body.status || task.status,
      status_history: newStatusHistory,
    }, { new: true });
    
    // Broadcast task update to all clients
    broadcastTaskUpdate('task_updated', task);
    
    res.json(await Task.findById(id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Broadcast task deletion before deleting
    broadcastTaskUpdate('task_deleted', { id: task._id });
    
    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    let tasks;
    if (req.query.employee_id) {
      // Return both tasks assigned to this employee and all unassigned tasks
      tasks = await Task.find({
        $or: [
          { employee_id: req.query.employee_id },
          { employee_id: null }
        ]
      });
    } else {
      tasks = await Task.find();
    }
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Claim a task (assign to employee if unassigned)
exports.claimTask = async (req, res) => {
  try {
    const { id } = req.params;
    let { employee_id, estimated_time } = req.body;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.employee_id) return res.status(400).json({ error: 'Task already claimed' });
    // Convert HH:MM to HH:MM:00 if needed
    if (estimated_time && /^\d{2}:\d{2}$/.test(estimated_time)) {
      estimated_time = estimated_time + ':00';
    }
    await Task.findByIdAndUpdate(id, {
      employee_id,
      status: 'pending', // Let employee explicitly start the timer
      ...(estimated_time && { estimated_time })
    }, { new: true });
    broadcastTaskUpdate('task_updated', await Task.findById(id));
    res.json(await Task.findById(id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}; 
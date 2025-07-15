const User = require('../models/user');
const Employee = require('../models/employee');
const Admin = require('../models/admin');

exports.getAllUsers = async (req, res) => {
  try {
    const admins = await Admin.find({}, { password: 0 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admins', error: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['employee', 'hr', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ message: 'Role updated', user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update role', error: err.message });
  }
}; 
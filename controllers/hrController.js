const HR = require('../models/hr');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret'; // For production, use process.env.JWT_SECRET

// Get all HR users (for admin)
exports.getAllHR = async (req, res) => {
  try {
    const hrUsers = await HR.find({}, { password: 0 }); // Don't send passwords
    res.json(hrUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create HR user (admin only - no password)
exports.createHR = async (req, res) => {
  try {
    const { username, email, phone, post } = req.body;
    // Check if username or email already exists
    const existingUser = await HR.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    const hrUser = await HR.create({
      username,
      email,
      phone,
      post,
      password: null // Password will be set during reset
    });
    const { password, ...userWithoutPassword } = hrUser.toObject();
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update HR user (admin only - no password)
exports.updateHR = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, phone, post } = req.body;
    const hrUser = await HR.findById(id);
    if (!hrUser) {
      return res.status(404).json({ error: 'HR user not found' });
    }
    // Check if username or email already exists (excluding current user)
    const existingUser = await HR.findOne({
      $and: [
        { $or: [{ username }, { email }] },
        { _id: { $ne: id } }
      ]
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    await HR.findByIdAndUpdate(id, { username, email, phone, post });
    const updatedUser = await HR.findById(id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete HR user (admin only)
exports.deleteHR = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await HR.findByIdAndDelete(id);
    if (deleted) {
      res.json({ message: 'HR user deleted successfully' });
    } else {
      res.status(404).json({ error: 'HR user not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// HR Login
exports.loginHR = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hrUser = await HR.findOne({ username });
    if (!hrUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!hrUser.password) {
      return res.status(401).json({ error: 'Password not set. Please reset your password first.' });
    }
    const isValidPassword = await bcrypt.compare(password, hrUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const { password: _, ...userWithoutPassword } = hrUser.toObject();
    userWithoutPassword.role = 'hr';
    const token = jwt.sign({ id: hrUser._id, username: hrUser.username, role: 'hr' }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ user: userWithoutPassword, token, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset HR Password
exports.resetPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const hrUser = await HR.findOne({ username });
    if (!hrUser) {
      return res.status(404).json({ error: 'HR user not found' });
    }
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    hrUser.password = hashedPassword;
    await hrUser.save();
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get HR user by username (for password reset verification)
exports.getHRByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const hrUser = await HR.findOne({ username }, { password: 0 });
    if (!hrUser) {
      return res.status(404).json({ error: 'HR user not found' });
    }
    res.json(hrUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 
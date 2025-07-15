const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
// const User = require('../models/user');
// const Employee = require('../models/employee');

const JWT_SECRET = 'your_jwt_secret'; // For production, use process.env.JWT_SECRET

exports.register = async (req, res) => {
  try {
    const { username, password, phone, email, role } = req.body;
    if (role !== 'admin') {
      return res.status(400).json({ message: 'Only admin registration is supported here.' });
    }
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ username, password: hash, phone, email });
    res.status(201).json({ message: 'Admin registered successfully.', admin: { id: admin._id, username: admin.username } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: admin._id, username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: admin._id, username: admin.username, role: 'admin' } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { username, phone, email, newPassword } = req.body;
    if (!username || !newPassword || (!phone && !email)) {
      return res.status(400).json({ message: 'Username, new password, and phone or email are required.' });
    }
    let admin;
    if (phone) {
      admin = await Admin.findOne({ username, phone });
    } else if (email) {
      admin = await Admin.findOne({ username, email });
    }
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found or phone/email does not match.' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    admin.password = hash;
    await admin.save();
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Password reset failed.', error: err.message });
  }
};

exports.authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided.' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Invalid token.' });
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Access denied.' });
      }
      req.user = decoded;
      next();
    });
  };
}; 
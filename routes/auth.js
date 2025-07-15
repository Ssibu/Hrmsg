const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register
router.post('/register', authController.register);
// Login
router.post('/login', authController.login);
// Reset password
router.post('/reset-password', authController.resetPassword);

module.exports = router; 
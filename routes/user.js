const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../controllers/authController');

// Get all users (admin only)
router.get('/', authMiddleware(['admin']), userController.getAllUsers);
// Update user role (admin only)
router.put('/:id/role', authMiddleware(['admin']), userController.updateUserRole);

module.exports = router; 
const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');

// Admin routes for HR management
router.get('/', hrController.getAllHR);
router.post('/', hrController.createHR);
router.put('/:id', hrController.updateHR);
router.delete('/:id', hrController.deleteHR);

// HR authentication routes
router.post('/login', hrController.loginHR);
router.post('/reset-password', hrController.resetPassword);
router.get('/:username', hrController.getHRByUsername);

module.exports = router; 
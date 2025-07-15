const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.get('/', employeeController.getAllEmployees);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

// New route for incremented salary calculation
router.get('/incremented-salary', employeeController.getIncrementedSalaries);

// Employee authentication
router.post('/login', employeeController.loginEmployee);
router.post('/reset-password', employeeController.resetEmployeePassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const hrPolicyController = require('../controllers/hrPolicyController');

router.get('/', hrPolicyController.getAllPolicies);
router.post('/', hrPolicyController.createPolicy);
router.put('/:id', hrPolicyController.updatePolicy);
router.delete('/:id', hrPolicyController.deletePolicy);

module.exports = router;

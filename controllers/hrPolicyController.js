const HRPolicy = require('../models/hrPolicy');

exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await HRPolicy.find();
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    const policy = await HRPolicy.create(req.body);
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const updatedPolicy = await HRPolicy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedPolicy) {
      res.json(updatedPolicy);
    } else {
      res.status(404).json({ error: 'Policy not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const deleted = await HRPolicy.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.json({ message: 'Policy deleted' });
    } else {
      res.status(404).json({ error: 'Policy not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

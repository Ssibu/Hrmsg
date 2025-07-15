const HRPolicy = require('../models/hrPolicy');

exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await HRPolicy.findAll();
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
    const [updated] = await HRPolicy.update(req.body, { where: { id: req.params.id } });
    if (updated) {
      const updatedPolicy = await HRPolicy.findByPk(req.params.id);
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
    const deleted = await HRPolicy.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ message: 'Policy deleted' });
    } else {
      res.status(404).json({ error: 'Policy not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

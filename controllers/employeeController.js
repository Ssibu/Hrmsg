const Employee = require('../models/employee');
const Task = require('../models/task');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret'; // For production, use process.env.JWT_SECRET

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedEmployee) {
      res.json(updatedEmployee);
    } else {
      res.status(404).json({ error: 'Employee not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.json({ message: 'Employee deleted' });
    } else {
      res.status(404).json({ error: 'Employee not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// New: Get incremented salaries for all employees
exports.getIncrementedSalaries = async (req, res) => {
  try {
    const employees = await Employee.find();
    const now = new Date();
    // Fetch all tasks in one go
    const allTasks = await Task.find();
    const results = employees.map(emp => {
      const joinDate = new Date(emp.date_of_joining);
      let years = now.getFullYear() - joinDate.getFullYear();
      const m = now.getMonth() - joinDate.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < joinDate.getDate())) {
        years--;
      }
      let incrementedSalary = parseFloat(emp.salary);
      let eligibleIncrement = 0;
      let eligibleIncrementAmount = 0;
      if (years >= 10) {
        eligibleIncrement = 15; // 10-year milestone: 15%
        eligibleIncrementAmount = emp.salary * 0.15;
      } else if (years >= 5) {
        eligibleIncrement = 10; // 5-year milestone: 10%
        eligibleIncrementAmount = emp.salary * 0.10;
      } else if (years >= 1) {
        eligibleIncrement = 1; // Annual performance: 1%
        eligibleIncrementAmount = emp.salary * 0.01;
      }
      // Calculate average rating for this employee
      const empTasks = allTasks.filter(t => String(t.employee_id) === String(emp._id) && t.rating !== null && !isNaN(t.rating));
      let avgRating = null;
      if (empTasks.length > 0) {
        avgRating = empTasks.reduce((sum, t) => sum + t.rating, 0) / empTasks.length;
        avgRating = Math.round(avgRating * 100) / 100;
      }
      // Calculate increment percentage based on avgRating
      let ratingBasedIncrement = null;
      let ratingBasedIncrementAmount = 0;
      if (typeof avgRating === 'number') {
        if (avgRating >= 4.75) ratingBasedIncrement = 10; // Outstanding (5)
        else if (avgRating >= 3.75) ratingBasedIncrement = 5; // Exceeds Expectations (4)
        else if (avgRating >= 2.75) ratingBasedIncrement = 3; // Meets Expectations (3)
        else if (avgRating >= 1.75) ratingBasedIncrement = 2; // Average (2)
        else if (avgRating >= 1) ratingBasedIncrement = 1; // General (1)
        if (ratingBasedIncrement) {
          ratingBasedIncrementAmount = emp.salary * (ratingBasedIncrement / 100);
        }
      }
      incrementedSalary = parseFloat(emp.salary) + eligibleIncrementAmount + ratingBasedIncrementAmount;
      return {
        id: emp._id,
        name: emp.name,
        date_of_joining: emp.date_of_joining,
        years,
        baseSalary: emp.salary,
        eligibleIncrement,
        avgRating,
        ratingBasedIncrement,
        incrementedSalary: Math.round(incrementedSalary * 100) / 100,
      };
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Employee Login
exports.loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!employee.password) {
      return res.status(401).json({ error: 'Password not set. Please reset your password first.' });
    }
    const isValidPassword = await bcrypt.compare(password, employee.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const { password: _, ...userWithoutPassword } = employee.toObject();
    userWithoutPassword.role = 'employee';
    const token = jwt.sign({ id: employee._id, email: employee.email, role: 'employee' }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ user: userWithoutPassword, token, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Employee Reset Password
exports.resetEmployeePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    employee.password = hashedPassword;
    await employee.save();
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

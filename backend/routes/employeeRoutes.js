const express = require('express');
const router = express.Router();
const Employee = require('../models/employee');
const Department = require('../models/department');
const { auth, admin } = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper function to generate employee ID
const generateEmployeeId = async () => {
  const count = await Employee.countDocuments();
  return `EMP${String(count + 1).padStart(4, '0')}`;
};

// Create a new employee (Admin/HR only)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const employeeData = req.body;
    
    // Generate employee ID
    employeeData.employeeId = await generateEmployeeId();
    
    // Check if department exists
    const department = await Department.findById(employeeData.department);
    if (!department) {
      return res.status(400).json({ message: 'Department not found' });
    }

    const employee = new Employee(employeeData);
    await employee.save();
    
    // Populate department and manager data in response
    await employee.populate('department', 'name');
    if (employee.manager) {
      await employee.populate('manager', 'firstName lastName');
    }
    
    res.status(201).json(employee);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get all employees with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const { department, status, role, page = 1, limit = 10, search } = req.query;
    const query = {};
    
    // Build query based on filters
    if (department) query.department = department;
    if (status) query.status = status;
    if (role) query.role = role;
    
    // Search in name, email, or employeeId
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { firstName: 1 },
      populate: [
        { path: 'department', select: 'name' },
        { path: 'manager', select: 'firstName lastName' }
      ]
    };

    const employees = await Employee.paginate(query, options);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single employee
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name')
      .populate('manager', 'firstName lastName');
      
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid employee ID' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update employee (Admin/HR or self for basic info)
router.put('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'firstName', 'lastName', 'email', 'phone', 'position', 'department',
    'dateOfBirth', 'address', 'emergencyContact', 'skills', 'documents', 'notes'
  ];
  
  // Admin/HR can update more fields
  if (req.user.role === 'admin' || req.user.role === 'hr') {
    allowedUpdates.push('role', 'status', 'manager', 'dateOfJoining');
  }

  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates!' });
  }

  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Non-admin/HR can only update their own profile
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && 
        employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this employee' });
    }

    // If department is being updated, update counts
    if (updates.includes('department')) {
      const oldDepartmentId = employee.department;
      const newDepartmentId = req.body.department;
      
      if (oldDepartmentId.toString() !== newDepartmentId) {
        // Update counts for both departments
        await Promise.all([
          Department.findByIdAndUpdate(oldDepartmentId, { $inc: { employeeCount: -1 } }),
          Department.findByIdAndUpdate(newDepartmentId, { $inc: { employeeCount: 1 } })
        ]);
      }
    }

    // Apply updates
    updates.forEach(update => employee[update] = req.body[update]);
    await employee.save();
    
    // Populate updated data
    await employee.populate('department', 'name');
    if (employee.manager) {
      await employee.populate('manager', 'firstName lastName');
    }
    
    res.json(employee);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(400).json({ message: error.message });
  }
});

// Delete employee (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Note: The employee count is automatically updated via the post-remove hook
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get direct reports (for managers)
router.get('/:id/reports', auth, async (req, res) => {
  try {
    const employees = await Employee.find({ manager: req.params.id })
      .select('firstName lastName position email phone')
      .populate('department', 'name');
      
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search employees
router.get('/search/:query', auth, async (req, res) => {
  try {
    const query = req.params.query;
    const employees = await Employee.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { employeeId: { $regex: query, $options: 'i' } }
      ]
    }).select('firstName lastName email employeeId department position')
      .limit(10);
      
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

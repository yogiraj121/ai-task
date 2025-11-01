const express = require('express');
const router = express.Router();
const Department = require('../models/department');
const { auth, admin } = require('../middleware/auth');

// Create a new department (Admin only)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { name, description, company } = req.body;
    
    const department = new Department({
      name,
      description,
      company: req.user.company, // Assuming user's company is attached to the request
      head: null,
      employeeCount: 0
    });

    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all departments for a company
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find({ company: req.user.company })
      .populate('head', 'name email')
      .sort('name');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single department
router.get('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.id,
      company: req.user.company
    }).populate('head', 'name email');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update department (Admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'head', 'status'];
    const isValidOperation = updates.every(update => 
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates!' });
    }

    const department = await Department.findOne({
      _id: req.params.id,
      company: req.user.company
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    updates.forEach(update => department[update] = req.body[update]);
    await department.save();
    
    res.json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete department (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const department = await Department.findOneAndDelete({
      _id: req.params.id,
      company: req.user.company
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Leave = require('../models/leave');
const Employee = require('../models/employee');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// Middleware to check if user is manager or admin
const isManagerOrAdmin = (req, res, next) => {
  if (['admin', 'hr', 'manager'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Manager or Admin access required.' });
  }
};

// Apply for leave
router.post('/', auth, async (req, res) => {
  try {
    const leaveData = {
      ...req.body,
      employee: req.user._id,
      createdBy: req.user._id
    };

    const leave = new Leave(leaveData);
    
    // Validate leave dates
    await leave.isValidLeaveDates();
    
    await leave.save();
    
    // Populate employee details
    await leave.populate('employeeDetails');
    
    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get my leave applications
router.get('/my-leaves', auth, async (req, res) => {
  try {
    const { status, year } = req.query;
    const query = { employee: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (year) {
      query.startDate = {
        $gte: new Date(year, 0, 1),
        $lt: new Date(parseInt(year) + 1, 0, 1)
      };
    }
    
    const leaves = await Leave.find(query)
      .sort({ startDate: -1 })
      .populate('employeeDetails', 'firstName lastName employeeId')
      .populate('approverDetails', 'firstName lastName employeeId');
      
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leave balance
router.get('/balance', auth, async (req, res) => {
  try {
    // This is a simplified example - you'll need to implement your own leave balance logic
    const employee = await Employee.findById(req.user._id);
    
    // Example leave balance - customize based on your requirements
    const leaveBalance = {
      vacation: {
        total: 15, // days per year
        taken: 5,  // days taken this year
        remaining: 10,
        expires: new Date(new Date().getFullYear(), 11, 31) // End of year
      },
      sick: {
        total: 10,
        taken: 2,
        remaining: 8,
        expires: new Date(new Date().getFullYear(), 11, 31)
      },
      personal: {
        total: 5,
        taken: 1,
        remaining: 4,
        expires: new Date(new Date().getFullYear(), 11, 31)
      }
    };
    
    res.json(leaveBalance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leave requests (for managers/admins)
router.get('/requests', [auth, isManagerOrAdmin], async (req, res) => {
  try {
    const { status, department, startDate, endDate } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    } else {
      query.status = 'pending'; // Default to pending requests
    }
    
    // If not admin/HR, only show requests from their department
    if (req.user.role === 'manager') {
      const manager = await Employee.findById(req.user._id);
      const departmentEmployees = await Employee.find({ 
        department: manager.department 
      }).select('_id');
      
      query.employee = { $in: departmentEmployees.map(e => e._id) };
    }
    
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const leaves = await Leave.find(query)
      .populate('employeeDetails', 'firstName lastName employeeId position department')
      .populate({
        path: 'employeeDetails',
        populate: {
          path: 'department',
          model: 'Department',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
      
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject leave request
router.patch('/:id/status', [auth, isManagerOrAdmin], async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected"' });
    }
    
    const leave = await Leave.findById(req.params.id)
      .populate('employeeDetails', 'firstName lastName employeeId');
      
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Check if user has permission to approve this leave
    if (req.user.role === 'manager') {
      const manager = await Employee.findOne({ user: req.user._id });
      const employee = await Employee.findById(leave.employee);
      
      if (!employee.department.equals(manager.department)) {
        return res.status(403).json({ message: 'Not authorized to approve this leave request' });
      }
    }
    
    // Update leave status
    leave.status = status;
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    
    if (status === 'rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }
    
    await leave.save();
    
    // TODO: Send notification to employee about leave status update
    
    res.json({
      message: `Leave request ${status} successfully`,
      leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel own leave request
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const leave = await Leave.findOne({
      _id: req.params.id,
      employee: req.user._id,
      status: 'pending'
    });
    
    if (!leave) {
      return res.status(404).json({ 
        message: 'Leave request not found or cannot be cancelled' 
      });
    }
    
    leave.status = 'cancelled';
    await leave.save();
    
    res.json({ message: 'Leave request cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get team leave calendar
router.get('/team-calendar', [auth, isManagerOrAdmin], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    
    // Default to current month if no date range provided
    if (!startDate || !endDate) {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      query.startDate = { $lte: lastDay };
      query.endDate = { $gte: firstDay };
    } else {
      query.startDate = { $lte: new Date(endDate) };
      query.endDate = { $gte: new Date(startDate) };
    }
    
    // For managers, only show their team's leaves
    if (req.user.role === 'manager') {
      const manager = await Employee.findOne({ user: req.user._id });
      const teamMembers = await Employee.find({ 
        department: manager.department,
        _id: { $ne: manager._id } // Exclude self
      }).select('_id');
      
      query.employee = { $in: teamMembers.map(e => e._id) };
    }
    
    // Only show approved leaves in calendar
    query.status = 'approved';
    
    const leaves = await Leave.find(query)
      .populate('employeeDetails', 'firstName lastName employeeId')
      .select('startDate endDate leaveType status employeeDetails');
      
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leave statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);
    
    // For employees, only show their stats
    const match = { 
      startDate: { $gte: startOfYear, $lte: endOfYear },
      employee: req.user.role === 'employee' ? req.user._id : { $exists: true }
    };
    
    // For managers, only show their team's stats
    if (req.user.role === 'manager') {
      const manager = await Employee.findOne({ user: req.user._id });
      const teamMembers = await Employee.find({ 
        department: manager.department 
      }).select('_id');
      
      match.employee = { $in: teamMembers.map(e => e._id) };
    }
    
    const stats = await Leave.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$days' }
        }
      },
      {
        $group: {
          _id: null,
          byStatus: {
            $push: {
              status: '$_id',
              count: '$count',
              totalDays: '$totalDays'
            }
          },
          total: { $sum: '$count' },
          totalDays: { $sum: '$totalDays' }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeDetails'
        }
      },
      { $unwind: '$employeeDetails' },
      {
        $group: {
          _id: '$employeeDetails.department',
          byDepartment: {
            $push: {
              department: '$employeeDetails.department',
              count: 1
            }
          }
        }
      }
    ]);
    
    res.json(stats[0] || { byStatus: [], total: 0, totalDays: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

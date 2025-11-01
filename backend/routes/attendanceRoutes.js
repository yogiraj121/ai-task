const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Attendance = require('../models/attendance');
const Employee = require('../models/employee');
const mongoose = require('mongoose');

// Middleware to check if user is employee or admin
const isEmployeeOrAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'hr' || req.user.role === 'employee') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
};

// Check-in
router.post('/check-in', [auth, isEmployeeOrAdmin], async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if already checked in today
    const existingCheckIn = await Attendance.findOne({
      employee: req.user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    if (existingCheckIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const checkInTime = new Date();
    const isLate = checkInTime.getHours() > 10; // Assuming 10 AM is late

    const attendance = new Attendance({
      employee: req.user._id,
      date: new Date(),
      checkIn: checkInTime,
      status: isLate ? 'half-day' : 'present',
      isLate,
      deviceInfo: {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        platform: req.useragent?.platform
      },
      createdBy: req.user._id
    });

    await attendance.save();
    
    // Populate employee details
    await attendance.populate('employeeDetails');
    
    res.status(201).json({
      message: 'Checked in successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check-out
router.post('/check-out', [auth, isEmployeeOrAdmin], async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's check-in
    const attendance = await Attendance.findOne({
      employee: req.user._id,
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      checkOut: { $exists: false }
    });

    if (!attendance) {
      return res.status(400).json({ message: 'No check-in found for today or already checked out' });
    }

    attendance.checkOut = new Date();
    attendance.updatedBy = req.user._id;
    
    // Calculate working hours
    const diffMs = attendance.checkOut - attendance.checkIn;
    attendance.workingHours = (diffMs / (1000 * 60 * 60)).toFixed(2);
    
    // Update status if it was half-day
    if (attendance.status === 'half-day' && attendance.workingHours >= 4) {
      attendance.status = 'present';
    }
    
    await attendance.save();
    
    // Populate employee details
    await attendance.populate('employeeDetails');
    
    res.json({
      message: 'Checked out successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my attendance (for employees)
router.get('/my-attendance', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year || new Date().getFullYear(), month ? month - 1 : new Date().getMonth(), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const attendance = await Attendance.find({
      employee: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance for employee (admin/hr)
router.get('/employee/:employeeId', [auth], async (req, res) => {
  try {
    // Check if requester is admin/hr or the employee themselves
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && 
        req.user._id.toString() !== req.params.employeeId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { month, year, startDate, endDate } = req.query;
    let query = { employee: req.params.employeeId };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      query.date = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else {
      // Default to current month if no date range provided
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      query.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('employee', 'firstName lastName employeeId');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance summary for employee
router.get('/summary/:employeeId', [auth], async (req, res) => {
  try {
    // Check if requester is admin/hr or the employee themselves
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && 
        req.user._id.toString() !== req.params.employeeId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { month, year } = req.query;
    const startDate = new Date(year || new Date().getFullYear(), month ? month - 1 : new Date().getMonth(), 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const summary = await Attendance.aggregate([
      {
        $match: {
          employee: mongoose.Types.ObjectId(req.params.employeeId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPresent: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0] 
            } 
          },
          totalAbsent: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] 
            } 
          },
          totalHalfDay: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'half-day'] }, 1, 0] 
            } 
          },
          totalLeaves: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'on-leave'] }, 1, 0] 
            } 
          },
          totalLate: { $sum: { $cond: ['$isLate', 1, 0] } },
          totalEarlyDeparture: { $sum: { $cond: ['$isEarlyDeparture', 1, 0] } },
          totalWorkingHours: { $sum: { $toDouble: '$workingHours' } },
          totalOvertime: { $sum: { $toDouble: '$overtime' } }
        }
      }
    ]);

    res.json(summary[0] || {
      totalPresent: 0,
      totalAbsent: 0,
      totalHalfDay: 0,
      totalLeaves: 0,
      totalLate: 0,
      totalEarlyDeparture: 0,
      totalWorkingHours: 0,
      totalOvertime: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Mark attendance
router.post('/mark', [auth], async (req, res) => {
  try {
    // Only admin/HR can mark attendance for others
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;
    
    // Validate date is not in future
    const attendanceDate = new Date(date);
    if (attendanceDate > new Date()) {
      return res.status(400).json({ message: 'Cannot mark attendance for future dates' });
    }

    // Set time to start of day for date comparison
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);

    // Check if attendance already exists
    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: { $gte: startOfDay, $lt: endOfDay }
    });

    if (attendance) {
      // Update existing attendance
      if (status) attendance.status = status;
      if (checkIn) attendance.checkIn = checkIn;
      if (checkOut) attendance.checkOut = checkOut;
      if (notes) attendance.notes = notes;
      attendance.updatedBy = req.user._id;
    } else {
      // Create new attendance
      attendance = new Attendance({
        employee: employeeId,
        date: attendanceDate,
        status: status || 'present',
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        notes: notes || '',
        createdBy: req.user._id
      });
    }

    await attendance.save();
    
    // Populate employee details
    await attendance.populate('employee', 'firstName lastName employeeId');
    
    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get department attendance
router.get('/department/:departmentId', [auth], async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { date } = req.query;
    const attendanceDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);

    // Get all employees in the department
    const employees = await Employee.find({ 
      department: req.params.departmentId,
      status: 'active'
    }).select('_id firstName lastName employeeId');

    // Get attendance for these employees on the specified date
    const attendance = await Attendance.find({
      employee: { $in: employees.map(e => e._id) },
      date: { $gte: startOfDay, $lt: endOfDay }
    });

    // Create a map of employeeId to attendance
    const attendanceMap = new Map();
    attendance.forEach(a => {
      attendanceMap.set(a.employee.toString(), a);
    });

    // Combine employee and attendance data
    const result = employees.map(emp => ({
      employee: {
        _id: emp._id,
        name: `${emp.firstName} ${emp.lastName}`,
        employeeId: emp.employeeId
      },
      attendance: attendanceMap.get(emp._id.toString()) || {
        status: 'absent',
        checkIn: null,
        checkOut: null
      }
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

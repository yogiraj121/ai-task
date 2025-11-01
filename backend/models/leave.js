const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: String,
    required: true,
    enum: ['sick', 'vacation', 'personal', 'maternity', 'paternity', 'bereavement', 'other']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: {
    type: Number,
    required: true,
    min: 0.5,
    max: 90
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayType: {
    type: String,
    enum: ['first-half', 'second-half'],
    required: function() { return this.isHalfDay; }
  },
  contactInfo: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
leaveSchema.index({ employee: 1, startDate: -1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

// Virtual for employee details
leaveSchema.virtual('employeeDetails', {
  ref: 'Employee',
  localField: 'employee',
  foreignField: '_id',
  justOne: true,
  options: { select: 'firstName lastName email employeeId position' }
});

// Virtual for approver details
leaveSchema.virtual('approverDetails', {
  ref: 'Employee',
  localField: 'approvedBy',
  foreignField: '_id',
  justOne: true,
  options: { select: 'firstName lastName email employeeId position' }
});

// Pre-save hook to calculate number of days
leaveSchema.pre('save', function(next) {
  if (this.isModified('startDate') || this.isModified('endDate')) {
    const diffTime = Math.abs(new Date(this.endDate) - new Date(this.startDate));
    this.days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    
    // If it's a half day, set days to 0.5
    if (this.isHalfDay) {
      this.days = 0.5;
    }
  }
  next();
});

// Method to check if leave dates are valid
leaveSchema.methods.isValidLeaveDates = async function() {
  // Check if end date is after start date
  if (this.endDate < this.startDate) {
    throw new Error('End date must be after start date');
  }
  
  // Check if leave already exists for this period
  const existingLeave = await this.constructor.findOne({
    employee: this.employee,
    $or: [
      // Existing leave starts or ends within new leave period
      { 
        $and: [
          { startDate: { $lte: this.endDate } },
          { endDate: { $gte: this.startDate } }
        ]
      },
      // New leave starts or ends within existing leave period
      { 
        $and: [
          { startDate: { $lte: this.endDate, $gte: this.startDate } }
        ]
      },
      { 
        $and: [
          { endDate: { $gte: this.startDate, $lte: this.endDate } }
        ]
      }
    ],
    _id: { $ne: this._id }, // Exclude current leave when updating
    status: { $in: ['pending', 'approved'] } // Only check for pending or approved leaves
  });

  if (existingLeave) {
    throw new Error('Leave already exists for this period');
  }
  
  return true;
};

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;

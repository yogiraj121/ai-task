const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'on-leave', 'holiday'],
    default: 'present'
  },
  workingHours: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false
    },
    address: String
  },
  deviceInfo: {
    ip: String,
    userAgent: String,
    platform: String
  },
  isLate: {
    type: Boolean,
    default: false
  },
  isEarlyDeparture: {
    type: Boolean,
    default: false
  },
  overtime: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

// Calculate working hours before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    const diffMs = this.checkOut - this.checkIn;
    this.workingHours = (diffMs / (1000 * 60 * 60)).toFixed(2); // Convert ms to hours
    
    // Check if employee checked out before schedule
    if (this.checkOut.getHours() < 17) { // Assuming 5 PM is standard checkout
      this.isEarlyDeparture = true;
    }
    
    // Calculate overtime (if any)
    const standardHours = 8; // 8 hours standard work day
    if (this.workingHours > standardHours) {
      this.overtime = (this.workingHours - standardHours).toFixed(2);
    }
  }
  next();
});

// Add virtual for employee details
attendanceSchema.virtual('employeeDetails', {
  ref: 'Employee',
  localField: 'employee',
  foreignField: '_id',
  justOne: true,
  options: { select: 'firstName lastName email employeeId position' }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;

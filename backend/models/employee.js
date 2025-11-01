const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  firstName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  lastName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['employee', 'manager', 'hr', 'admin'],
    default: 'employee' 
  },
  dateOfJoining: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'terminated'],
    default: 'active'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    }
  }],
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Update department's employee count when employee is saved
employeeSchema.post('save', async function(doc) {
  if (doc.isNew) {
    const Department = mongoose.model('Department');
    await Department.findByIdAndUpdate(doc.department, {
      $inc: { employeeCount: 1 }
    });
  }
});

// Update department's employee count when employee is removed
employeeSchema.post('remove', async function(doc) {
  const Department = mongoose.model('Department');
  await Department.findByIdAndUpdate(doc.department, {
    $inc: { employeeCount: -1 }
  });
});

// Indexes for faster queries
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });

// Add pagination plugin
employeeSchema.plugin(mongoosePaginate);

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
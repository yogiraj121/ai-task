const mongoose = require('mongoose');

const SuperAdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'super_admin'
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: [{
    type: String,
    enum: ['manage_tenants', 'manage_subscriptions', 'view_reports', 'system_settings']
  }]
}, {
  timestamps: true
});

// Add indexes
SuperAdminSchema.index({ email: 1 }, { unique: true });

// Add methods for password hashing, etc. here

module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);

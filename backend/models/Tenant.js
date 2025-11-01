const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  subdomain: {
    type: String,
    unique: true,
    sparse: true
  },
  contactEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  contactPhone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'expired', 'suspended', 'canceled'],
      default: 'trial'
    },
    trialEnds: Date,
    billingCycle: {
      type: String,
      enum: ['monthly', 'annually'],
      default: 'monthly'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    locale: {
      type: String,
      default: 'en-US'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      default: '12h' // 12h or 24h
    },
    weekStart: {
      type: Number, // 0 = Sunday, 1 = Monday, etc.
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  maxUsers: {
    type: Number,
    default: 10
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
TenantSchema.index({ domain: 1 }, { unique: true });
TenantSchema.index({ subdomain: 1 }, { unique: true, sparse: true });
TenantSchema.index({ 'subscription.status': 1 });
TenantSchema.index({ isActive: 1 });

// Add methods for subscription management, etc.

module.exports = mongoose.model('Tenant', TenantSchema);

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  requestId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  userAgent: String,
  ip: String,
  method: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  params: mongoose.Schema.Types.Mixed,
  query: mongoose.Schema.Types.Mixed,
  statusCode: {
    type: Number,
    required: true
  },
  responseTime: {
    type: Number,
    required: true
  },
  responseStatus: {
    type: Number,
    required: true
  },
  responseBody: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ method: 1, url: 1 });

// Add TTL index for automatic log rotation (retain logs for 90 days)
auditLogSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 } // 90 days in seconds
);

// Static method to log an action
auditLogSchema.statics.logAction = async function(action, userId, request, details = {}) {
  const logEntry = new this({
    action,
    requestId: request.id || 'N/A',
    userId,
    userAgent: request.get('user-agent'),
    ip: request.ip || request.connection.remoteAddress,
    method: request.method,
    url: request.originalUrl,
    params: request.params,
    query: request.query,
    ...details
  });
  
  return logEntry.save();
};

module.exports = mongoose.model('AuditLog', auditLogSchema);

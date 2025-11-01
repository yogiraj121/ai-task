const AuditLog = require('../models/auditLog');
const { v4: uuidv4 } = require('uuid');

const auditLogger = (action, details = {}) => {
  return async (req, res, next) => {
    const start = Date.now();
    const requestId = uuidv4();
    
    // Store the original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Create a buffer to capture the response
    let responseBody;
    
    // Override response methods to capture the response body
    res.send = function (body) {
      responseBody = body;
      return originalSend.call(this, body);
    };
    
    res.json = function (body) {
      responseBody = body;
      return originalJson.call(this, body);
    };
    
    // Log after the response is sent
    res.on('finish', async () => {
      try {
        const logEntry = new AuditLog({
          action,
          requestId,
          userId: req.user?._id || null,
          userAgent: req.headers['user-agent'],
          ip: req.ip || req.connection.remoteAddress,
          method: req.method,
          url: req.originalUrl,
          params: req.params,
          query: req.query,
          statusCode: res.statusCode,
          responseTime: Date.now() - start,
          responseStatus: res.statusCode,
          responseBody: responseBody ? JSON.stringify(responseBody).substring(0, 1000) : null,
          ...details
        });
        
        await logEntry.save();
      } catch (error) {
        console.error('Failed to save audit log:', error);
      }
    });
    
    next();
  };
};

module.exports = auditLogger;

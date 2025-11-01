require('dotenv').config();
const path = require('path');

const config = {
  // Server Configuration
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  
  // MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms',
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    expiresIn: process.env.JWT_EXPIRE || '30d',
    cookieExpire: process.env.JWT_COOKIE_EXPIRE || 30, // days
  },
  
  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'HRMS System <noreply@hrms.com>',
  },
  
  // File Uploads
  uploads: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../uploads'),
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // requests per window
  },
  
  // API Versioning
  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: '/api',
  },
  
  // Logging
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
  },
};

// Ensure upload directory exists
const fs = require('fs');
if (!fs.existsSync(config.uploads.uploadDir)) {
  fs.mkdirSync(config.uploads.uploadDir, { recursive: true });
}

// Ensure log directory exists
if (!fs.existsSync(config.logger.dir)) {
  fs.mkdirSync(config.logger.dir, { recursive: true });
}

module.exports = config;

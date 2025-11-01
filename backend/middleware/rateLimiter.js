const rateLimit = require('express-rate-limit');
const { RateLimiterMongo } = require('rate-limiter-flexible');
const mongoose = require('mongoose');

// Basic rate limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Database-based rate limiter for more complex scenarios
const createRateLimiter = (opts = {}) => {
  const { keyPrefix = 'rl', points = 10, duration = 1, blockDuration = 60 } = opts;
  
  return new RateLimiterMongo({
    storeClient: mongoose.connection,
    keyPrefix,
    points, // Number of points
    duration, // Per second(s)
    blockDuration: blockDuration, // Block for 1 minute if exceeded
    dbName: process.env.MONGO_DB_NAME || 'hrms',
    collectionName: 'rateLimits',
  });
};

// Rate limiters for different endpoints
const authLimiter = createRateLimiter({
  keyPrefix: 'auth',
  points: 5, // 5 requests
  duration: 60 * 15, // Per 15 minutes
  blockDuration: 60 * 60, // Block for 1 hour if exceeded
});

const apiRateLimiter = createRateLimiter({
  keyPrefix: 'api',
  points: 100, // 100 requests
  duration: 60, // Per minute
  blockDuration: 60 * 5, // Block for 5 minutes if exceeded
});

// Middleware to handle rate limiting
const rateLimiterMiddleware = (limiter) => {
  return async (req, res, next) => {
    try {
      const key = req.user?._id || req.ip;
      await limiter.consume(key, 1); // consume 1 point per request
      next();
    } catch (rlRejected) {
      if (rlRejected instanceof Error) {
        return next(rlRejected);
      }
      
      const retryAfter = Math.ceil(rlRejected.msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(retryAfter));
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Too many requests, please try again in ${retryAfter} seconds`,
        retryAfter,
      });
    }
  };
};

module.exports = {
  apiLimiter,
  authLimiter: rateLimiterMiddleware(authLimiter),
  apiRateLimiter: rateLimiterMiddleware(apiRateLimiter),
};

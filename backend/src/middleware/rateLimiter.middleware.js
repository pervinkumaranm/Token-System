// src/middleware/rateLimiter.middleware.js
const { rateLimit } = require('express-rate-limit');

// Strict limiter for student registration
const registerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please wait a minute and try again.' },
  validate: { default: false, xForwardedForHeader: false },
});

// Limiter for admin login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
  validate: { default: false, xForwardedForHeader: false },
});

// General API limiter
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests.' },
  validate: { default: false, xForwardedForHeader: false },
});

module.exports = { registerLimiter, loginLimiter, generalLimiter };

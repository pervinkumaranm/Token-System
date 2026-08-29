// src/routes/student.routes.js
const express = require('express');
const router = express.Router();
const { registerLimiter } = require('../middleware/rateLimiter.middleware');
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  registerStudentHandler,
  getTokenHandler,
  getWhatsAppStatusHandler,
  downloadTokenPDFHandler,
  verifyTokenHandler,
  markTokenUsedHandler,
} = require('../controllers/student.controller');

// Student registration (rate limited)
router.post('/register', registerLimiter, registerStudentHandler);

// Token retrieval (public)
router.get('/token/:tokenId', getTokenHandler);
router.get('/tokens/:tokenId', getTokenHandler);
router.get('/tokens/:tokenId/whatsapp-status', getWhatsAppStatusHandler);
router.get('/token/:tokenId/pdf', downloadTokenPDFHandler);

// QR Verification (public read, protected write)
router.get('/verify/:tokenId', verifyTokenHandler);
router.patch('/verify/:tokenId/use', authMiddleware, markTokenUsedHandler);

module.exports = router;

// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { loginLimiter, generalLimiter } = require('../middleware/rateLimiter.middleware');
const { authMiddleware } = require('../middleware/auth.middleware');
const {
  loginHandler,
  logoutHandler,
  getDashboardStatsHandler,
  listStudentsHandler,
  getStudentTokenHandler,
  updateTokenStatusHandler,
  updateStudentDetailsHandler,
  downloadAdminTokenPDFHandler,
  exportExcelHandler,
  getAuditLogsHandler,
  seedAdminHandler,
} = require('../controllers/admin.controller');

// ── Public admin routes ──────────────────────────────────
router.post('/login', loginLimiter, loginHandler);

// ── One-time seed (call once then protect/remove) ────────
router.post('/seed', seedAdminHandler);

// ── Protected routes (JWT required) ─────────────────────
router.use(authMiddleware);

router.post('/logout', logoutHandler);
router.get('/dashboard', getDashboardStatsHandler);
router.get('/students', generalLimiter, listStudentsHandler);
router.get('/token/:tokenId', getStudentTokenHandler);
router.patch('/token/:tokenId', updateStudentDetailsHandler);
router.patch('/token/:tokenId/status', updateTokenStatusHandler);
router.get('/token/:tokenId/pdf', downloadAdminTokenPDFHandler);
router.get('/export', exportExcelHandler);
router.get('/audit-logs', getAuditLogsHandler);

module.exports = router;

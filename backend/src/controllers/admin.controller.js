// src/controllers/admin.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const {
  getAdminByUsername,
  createAdmin,
  updateAdminLastLogin,
  getAllTokens,
  getTokenByTokenId,
  updateToken,
  searchTokens,
  getAllAuditLogs,
} = require('../services/sheets.service');
const { generateTokenPDF } = require('../services/pdf.service');
const { generateExcelExport } = require('../utils/excel.utils');
const { logAction } = require('../services/audit.service');
const { validateLogin, validateStatusUpdate } = require('../validators/admin.validator');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_do_not_use_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// ── AUTHENTICATION ──────────────────────────────────────────

async function seedAdminHandler(req, res) {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

    const existing = await getAdminByUsername(adminUsername);
    if (existing) {
      return res.json({ success: true, message: 'Admin account already exists.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    await createAdmin({
      id: uuidv4(),
      username: adminUsername,
      passwordHash,
      role: 'SUPER_ADMIN',
    });

    console.log(`[Seed] Created initial admin account: ${adminUsername}`);
    return res.status(201).json({ success: true, message: `Admin account "${adminUsername}" created.` });
  } catch (err) {
    console.error('[Seed]', err);
    return res.status(500).json({ success: false, message: 'Failed to seed admin.' });
  }
}

async function loginHandler(req, res) {
  try {
    console.log('[ADMIN LOGIN] Attempting login for username:', req.body?.username);
    const { valid, errors, data } = validateLogin(req.body);
    if (!valid) {
      console.warn('[ADMIN LOGIN] Validation failed:', errors);
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    const found = await getAdminByUsername(data.username);
    if (!found) {
      console.warn('[ADMIN LOGIN] Username not found:', data.username);
      await logAction({ adminUsername: data.username, action: 'LOGIN_FAILED', ipAddress: req.ip });
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const { admin, rowIndex } = found;
    const isMatch = await bcrypt.compare(data.password, admin.passwordHash);
    if (!isMatch) {
      console.warn('[ADMIN LOGIN] Password mismatch for username:', data.username);
      await logAction({ adminUsername: data.username, action: 'LOGIN_FAILED', ipAddress: req.ip });
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    await updateAdminLastLogin(rowIndex, admin);

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    await logAction({ adminUsername: admin.username, action: 'LOGIN_SUCCESS', ipAddress: req.ip });
    console.log('[ADMIN LOGIN] Login SUCCESS for:', admin.username);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: { id: admin.id, username: admin.username, role: admin.role },
    });
  } catch (err) {
    console.error('[ADMIN LOGIN] Unexpected error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

async function logoutHandler(req, res) {
  try {
    res.clearCookie('adminToken');
    if (req.admin?.username) {
      await logAction({ adminUsername: req.admin.username, action: 'LOGOUT', ipAddress: req.ip });
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// ── DASHBOARD ───────────────────────────────────────────────

async function getDashboardStatsHandler(req, res) {
  try {
    const tokens = await getAllTokens();
    const stats = {
      total: tokens.length,
      active: tokens.filter(t => t.status === 'ACTIVE').length,
      used: tokens.filter(t => t.status === 'USED').length,
      cancelled: tokens.filter(t => t.status === 'CANCELLED').length,
      expired: tokens.filter(t => t.status === 'EXPIRED').length,
      hostelCount: tokens.filter(t => (t.studentType || t.hostelOrDayScholar) === 'Hostel').length,
      dayScholarCount: tokens.filter(t => (t.studentType || t.hostelOrDayScholar) === 'Day Scholar').length,
      recent: tokens.slice(-10).reverse(),
    };
    return res.json({ success: true, stats });
  } catch (err) {
    console.error('[Dashboard]', err);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
  }
}

// ── STUDENT / TOKEN MANAGEMENT ───────────────────────────

async function listStudentsHandler(req, res) {
  try {
    const {
      query,
      studentType,
      hostelOrDayScholar,
      status,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
    } = req.query;
    let tokens;

    if (query || studentType || hostelOrDayScholar || status || dateFrom || dateTo) {
      tokens = await searchTokens({
        query,
        studentType,
        hostelOrDayScholar,
        status,
        dateFrom,
        dateTo,
      });
    } else {
      tokens = await getAllTokens();
    }

    const total = tokens.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginated = tokens.reverse().slice(offset, offset + parseInt(limit));

    return res.json({
      success: true,
      tokens: paginated,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error('[ListStudents]', err);
    return res.status(500).json({ success: false, message: 'Failed to load students.' });
  }
}

async function getStudentTokenHandler(req, res) {
  try {
    const found = await getTokenByTokenId(req.params.tokenId);
    if (!found) return res.status(404).json({ success: false, message: 'Token not found.' });
    return res.json({ success: true, token: found.token });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

async function updateTokenStatusHandler(req, res) {
  try {
    const { valid, errors, data } = validateStatusUpdate(req.body);
    if (!valid) return res.status(400).json({ success: false, message: 'Validation failed', errors });

    const found = await getTokenByTokenId(req.params.tokenId);
    if (!found) return res.status(404).json({ success: false, message: 'Token not found.' });

    const { token, rowIndex } = found;
    const updated = await updateToken(rowIndex, { status: data.status }, token);

    await logAction({
      adminUsername: req.admin.username,
      action: `STATUS_CHANGE_${data.status}`,
      targetTokenId: token.tokenId,
      oldValue: { status: token.status },
      newValue: { status: data.status, reason: data.reason },
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: `Token status updated to ${data.status}.`, token: updated });
  } catch (err) {
    console.error('[UpdateStatus]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

async function downloadAdminTokenPDFHandler(req, res) {
  try {
    const found = await getTokenByTokenId(req.params.tokenId);
    if (!found) return res.status(404).json({ success: false, message: 'Token not found.' });

    const pdfBuffer = await generateTokenPDF(found.token);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${found.token.tokenId}_token.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate PDF.' });
  }
}

// ── EXCEL EXPORT ─────────────────────────────────────────

async function exportExcelHandler(req, res) {
  try {
    const {
      query,
      studentType,
      hostelOrDayScholar,
      status,
      dateFrom,
      dateTo,
    } = req.query;
    let tokens;

    if (query || studentType || hostelOrDayScholar || status || dateFrom || dateTo) {
      tokens = await searchTokens({
        query,
        studentType,
        hostelOrDayScholar,
        status,
        dateFrom,
        dateTo,
      });
    } else {
      tokens = await getAllTokens();
    }

    const workbook = await generateExcelExport(tokens);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="SSEC_Tokens_${Date.now()}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();

    await logAction({
      adminUsername: req.admin.username,
      action: 'EXCEL_EXPORT',
      newValue: { count: tokens.length, filters: { query, studentType, status } },
      ipAddress: req.ip,
    });
  } catch (err) {
    console.error('[Excel Export]', err);
    return res.status(500).json({ success: false, message: 'Failed to export Excel.' });
  }
}

// ── AUDIT LOGS ─────────────────────────────────────────────

async function getAuditLogsHandler(req, res) {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const logs = await getAllAuditLogs({ limit: parseInt(limit), offset: parseInt(offset) });
    return res.json({ success: true, logs });
  } catch (err) {
    console.error('[AuditLogs]', err);
    return res.status(500).json({ success: false, message: 'Failed to load audit logs.' });
  }
}

module.exports = {
  seedAdminHandler,
  loginHandler,
  logoutHandler,
  getDashboardStatsHandler,
  listStudentsHandler,
  getStudentTokenHandler,
  updateTokenStatusHandler,
  downloadAdminTokenPDFHandler,
  exportExcelHandler,
  getAuditLogsHandler,
};

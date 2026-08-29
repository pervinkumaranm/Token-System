// src/services/audit.service.js
// Centralized audit logging service

const { v4: uuidv4 } = require('uuid');
const { appendAuditLog } = require('./sheets.service');

/**
 * Log an admin action to the AuditLogs sheet
 */
async function logAction({ adminUsername, action, targetTokenId, oldValue, newValue, ipAddress }) {
  try {
    await appendAuditLog({
      id: uuidv4(),
      adminUsername: adminUsername || 'system',
      action,
      targetTokenId: targetTokenId || '',
      oldValue: oldValue || null,
      newValue: newValue || null,
      ipAddress: ipAddress || '',
    });
  } catch (err) {
    // Audit log failure should never break the main operation
    console.error('[Audit] Failed to write audit log:', err.message);
  }
}

module.exports = { logAction };

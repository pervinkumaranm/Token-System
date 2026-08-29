// src/config/constants.js
module.exports = {
  TOKEN_PREFIX: process.env.TOKEN_PREFIX || 'SSEC',
  TOKEN_YEAR: process.env.TOKEN_YEAR || '2026',
  COLLEGE_NAME: process.env.COLLEGE_NAME || 'Sree Sakthi Engineering College',
  COLLEGE_SHORT: process.env.COLLEGE_SHORT || 'SSEC',

  // Google Sheets tab names
  SHEET_TOKENS: 'Tokens',
  SHEET_ADMINS: 'Admins',
  SHEET_AUDIT: 'AuditLogs',
  SHEET_SETTINGS: 'Settings',

  // Token statuses
  STATUS_ACTIVE: 'ACTIVE',
  STATUS_USED: 'USED',
  STATUS_CANCELLED: 'CANCELLED',
  STATUS_EXPIRED: 'EXPIRED',

  // Student Types
  STUDENT_TYPES: [
    'Hostel',
    'Day Scholar',
  ],
};


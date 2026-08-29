// src/services/sheets.service.js
// All Google Sheets CRUD operations
// Column layout (A–L, 12 columns):
//   A(0): S.No       B(1): Token ID     C(2): Student Name
//   D(3): Hostel/DS  E(4): Section      F(5): Parent Number
//   G(6): Student Mobile  H(7): Gen Date  I(8): Gen Time
//   J(9): Status     K(10): Created At  L(11): Updated At

const { getSheetsClient } = require('../config/google.config');
const {
  SHEET_TOKENS,
  SHEET_ADMINS,
  SHEET_AUDIT,
  SHEET_SETTINGS,
} = require('../config/constants');

// ─── SPREADSHEET ID ────────────────────────────────────────

function getSpreadsheetId() {
  const raw = process.env.GOOGLE_SHEET_ID || '';
  const match = raw.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : raw.trim();
}

const SPREADSHEET_ID = getSpreadsheetId();

// ─── LOW-LEVEL HELPERS ─────────────────────────────────────

async function readRange(range) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });
  return res.data.values || [];
}

async function appendRow(sheet, values) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheet}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  });
}

async function updateRow(sheet, rowIndex, values) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheet}!A${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });
}

// ─── TOKEN SCHEMA ──────────────────────────────────────────

const TOKEN_HEADERS = [
  'S.No',                 // A
  'Token ID',             // B
  'Student Name',         // C
  'Hostel / Day Scholar', // D
  'Section',              // E
  'Parent Number',        // F
  'Student Mobile Number',// G
  'Generated Date',       // H
  'Generated Time',       // I
  'Status',               // J
  'Created At',           // K
  'Updated At',           // L
];

// ─── ROW ↔ OBJECT MAPPERS ──────────────────────────────────

function rowToToken(row, sno) {
  if (!row || row.length < 2) return null;
  return {
    sno:                String(sno || row[0] || ''),
    tokenId:            row[1]  || '',
    studentName:        row[2]  || '',
    studentType:        row[3]  || '',
    hostelOrDayScholar: row[3]  || '',
    section:            row[4]  || '',
    parentNumber:       row[5]  || '',
    studentMobile:      row[6]  || '',
    generatedDate:      row[7]  || '',
    generatedTime:      row[8]  || '',
    status:             row[9]  || 'ACTIVE',
    createdAt:          row[10] || '',
    updatedAt:          row[11] || '',
  };
}

function tokenToRow(token) {
  return [
    String(token.sno || ''),
    token.tokenId            || '',
    token.studentName        || '',
    token.studentType        || token.hostelOrDayScholar || '',
    token.section            || '',
    token.parentNumber       || '',
    token.studentMobile      || '',
    token.generatedDate      || '',
    token.generatedTime      || '',
    token.status             || 'ACTIVE',
    token.createdAt          || '',
    token.updatedAt          || '',
  ];
}

// ─── TOKEN CRUD ────────────────────────────────────────────

async function getAllTokens() {
  const rows = await readRange(`${SHEET_TOKENS}!A2:L`);
  return rows
    .map((row, i) => rowToToken(row, i + 1))
    .filter(Boolean)
    .filter(t => t.tokenId);
}

async function getTokenByTokenId(tokenId) {
  const rows = await readRange(`${SHEET_TOKENS}!A2:L`);
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][1] === tokenId) {
      return { token: rowToToken(rows[i], i + 1), rowIndex: i + 2 };
    }
  }
  return null;
}

async function getTokenById(id) {
  const rows = await readRange(`${SHEET_TOKENS}!A2:L`);
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === String(id)) {
      return { token: rowToToken(rows[i], i + 1), rowIndex: i + 2 };
    }
  }
  return null;
}

async function createToken(tokenData) {
  const now = new Date().toISOString();
  const existingRows = await readRange(`${SHEET_TOKENS}!B2:B`);
  const sno = existingRows.filter(r => r[0] && r[0].trim() !== '').length + 1;

  const row = tokenToRow({
    ...tokenData,
    sno,
    createdAt: now,
    updatedAt: now,
  });
  await appendRow(SHEET_TOKENS, row);
  return { ...tokenData, sno, createdAt: now, updatedAt: now };
}

async function updateToken(rowIndex, updatedFields, existingToken) {
  const now = new Date().toISOString();
  const merged = { ...existingToken, ...updatedFields, updatedAt: now };
  await updateRow(SHEET_TOKENS, rowIndex, tokenToRow(merged));
  return merged;
}

async function searchTokens({
  query,
  studentType,
  hostelOrDayScholar,
  section,
  status,
  dateFrom,
  dateTo,
}) {
  const rows = await readRange(`${SHEET_TOKENS}!A2:L`);
  let tokens = rows
    .map((row, i) => rowToToken(row, i + 1))
    .filter(Boolean)
    .filter(t => t.tokenId);

  if (query) {
    const q = query.toLowerCase();
    tokens = tokens.filter(t =>
      t.studentName?.toLowerCase().includes(q) ||
      t.tokenId?.toLowerCase().includes(q) ||
      t.parentNumber?.includes(q) ||
      t.studentMobile?.includes(q)
    );
  }

  const typeFilter = studentType || hostelOrDayScholar;
  if (typeFilter) {
    tokens = tokens.filter(t =>
      t.studentType?.toLowerCase() === typeFilter.toLowerCase()
    );
  }

  if (section) {
    tokens = tokens.filter(t =>
      t.section?.toUpperCase() === section.toUpperCase()
    );
  }

  if (status) tokens = tokens.filter(t => t.status === status);

  if (dateFrom) tokens = tokens.filter(t => t.createdAt >= dateFrom);
  if (dateTo)   tokens = tokens.filter(t => t.createdAt <= dateTo + 'T23:59:59Z');

  return tokens;
}

// ─── ADMINS ────────────────────────────────────────────────

function rowToAdmin(row) {
  if (!row || row.length < 3) return null;
  return {
    id:           row[0] || '',
    username:     row[1] || '',
    passwordHash: row[2] || '',
    role:         row[3] || 'ADMIN',
    createdAt:    row[4] || '',
    lastLogin:    row[5] || '',
  };
}

async function getAllAdmins() {
  const rows = await readRange(`${SHEET_ADMINS}!A2:F`);
  return rows.map(rowToAdmin).filter(Boolean);
}

async function getAdminByUsername(username) {
  const target = (username || '').trim().toLowerCase();
  const rows = await readRange(`${SHEET_ADMINS}!A2:F`);
  for (let i = 0; i < rows.length; i++) {
    if ((rows[i][1] || '').trim().toLowerCase() === target) {
      return { admin: rowToAdmin(rows[i]), rowIndex: i + 2 };
    }
  }
  return null;
}

async function createAdmin(adminData) {
  const row = [
    adminData.id,
    adminData.username,
    adminData.passwordHash,
    adminData.role || 'ADMIN',
    new Date().toISOString(),
    '',
  ];
  await appendRow(SHEET_ADMINS, row);
}

async function updateAdminLastLogin(rowIndex, existingAdmin) {
  const now = new Date().toISOString();
  const row = [
    existingAdmin.id,
    existingAdmin.username,
    existingAdmin.passwordHash,
    existingAdmin.role,
    existingAdmin.createdAt,
    now,
  ];
  await updateRow(SHEET_ADMINS, rowIndex, row);
}

// ─── AUDIT LOGS ────────────────────────────────────────────

async function appendAuditLog(logData) {
  const row = [
    logData.id,
    new Date().toISOString(),
    logData.adminUsername || 'system',
    logData.action,
    logData.targetTokenId || '',
    logData.oldValue ? JSON.stringify(logData.oldValue) : '',
    logData.newValue ? JSON.stringify(logData.newValue) : '',
    logData.ipAddress || '',
  ];
  await appendRow(SHEET_AUDIT, row);
}

async function getAllAuditLogs({ limit = 100, offset = 0 } = {}) {
  const rows = await readRange(`${SHEET_AUDIT}!A2:H`);
  const logs = rows.map(row => ({
    id:             row[0],
    timestamp:      row[1],
    adminUsername:  row[2],
    action:         row[3],
    targetTokenId:  row[4],
    oldValue:       row[5] ? tryParse(row[5]) : null,
    newValue:       row[6] ? tryParse(row[6]) : null,
    ipAddress:      row[7],
  })).filter(l => l.id);

  return logs.reverse().slice(offset, offset + limit);
}

function tryParse(s) {
  try { return JSON.parse(s); } catch { return s; }
}

// ─── SETTINGS / COUNTER ────────────────────────────────────

async function getCounter() {
  const tokenRows = await readRange(`${SHEET_TOKENS}!B2:B`);
  const existingTokenIds = tokenRows
    .map(r => r[0])
    .filter(val => val && val.trim() !== '');

  if (existingTokenIds.length === 0) {
    await setCounter(0);
    return 0;
  }

  let maxSeq = 0;
  for (const tid of existingTokenIds) {
    const match = tid.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  const effectiveCounter = Math.max(maxSeq, existingTokenIds.length);

  const settingsRows = await readRange(`${SHEET_SETTINGS}!A2:B`);
  let storedCounter = null;
  for (const row of settingsRows) {
    if (row[0] === 'token_counter') {
      storedCounter = parseInt(row[1] || '0', 10);
      break;
    }
  }

  if (storedCounter === null || storedCounter !== effectiveCounter) {
    await setCounter(effectiveCounter);
  }

  return effectiveCounter;
}

async function setCounter(value) {
  const rows = await readRange(`${SHEET_SETTINGS}!A2:B`);
  let counterRowIndex = null;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === 'token_counter') { counterRowIndex = i + 2; break; }
  }
  if (counterRowIndex) {
    await updateRow(SHEET_SETTINGS, counterRowIndex, ['token_counter', String(value)]);
  } else {
    await appendRow(SHEET_SETTINGS, ['token_counter', String(value)]);
  }
}

// ─── SHEET INITIALIZATION ─────────────────────────────────

async function initializeSheets() {
  const sheets = await getSheetsClient();

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existingSheets = meta.data.sheets.map(s => s.properties.title);

  const sheetsToCreate = [];
  const sheetNames = [SHEET_TOKENS, SHEET_ADMINS, SHEET_AUDIT, SHEET_SETTINGS];
  for (const name of sheetNames) {
    if (!existingSheets.includes(name)) {
      sheetsToCreate.push({ addSheet: { properties: { title: name } } });
    }
  }
  if (sheetsToCreate.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: sheetsToCreate },
    });
  }

  // Ensure header row matches clean 12-col TOKEN_HEADERS
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_TOKENS}!A1:L1`,
    valueInputOption: 'RAW',
    requestBody: { values: [TOKEN_HEADERS] },
  });

  const otherHeaderMap = {
    [SHEET_ADMINS]: ['ID', 'Username', 'Password Hash', 'Role', 'Created At', 'Last Login'],
    [SHEET_AUDIT]:  ['ID', 'Timestamp', 'Admin Username', 'Action', 'Target Token ID', 'Old Value', 'New Value', 'IP Address'],
    [SHEET_SETTINGS]: ['Key', 'Value'],
  };
  for (const [sheet, headers] of Object.entries(otherHeaderMap)) {
    const existing = await readRange(`${sheet}!A1:Z1`);
    if (!existing || existing.length === 0) {
      await appendRow(sheet, headers);
    }
  }

  const counter = await getCounter();
  if (counter === 0) await setCounter(0);

  const existingAdmins = await getAllAdmins();
  if (existingAdmins.length === 0) {
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    await createAdmin({ id: uuidv4(), username: adminUsername, passwordHash, role: 'SUPER_ADMIN' });
  }

  console.log('[Sheets] All sheets verified & initialized.');
}

module.exports = {
  getAllTokens,
  getTokenByTokenId,
  getTokenById,
  createToken,
  updateToken,
  searchTokens,
  getAllAdmins,
  getAdminByUsername,
  createAdmin,
  updateAdminLastLogin,
  appendAuditLog,
  getAllAuditLogs,
  getCounter,
  setCounter,
  initializeSheets,
};

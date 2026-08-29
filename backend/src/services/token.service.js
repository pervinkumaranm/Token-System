// src/services/token.service.js
// Atomic token generation with mutex to prevent duplicates under concurrent load

const { Mutex } = require('async-mutex');
const { getCounter, setCounter, getTokenByTokenId, createToken } = require('./sheets.service');
const { TOKEN_PREFIX, TOKEN_YEAR, STATUS_ACTIVE } = require('../config/constants');

// Process-level mutex: only one request can run the token-generation critical section at a time
const tokenMutex = new Mutex();

/**
 * Format: SSEC-2026-0001 (4-digit sequence)
 */
function buildTokenId(counter) {
  const padded = String(counter).padStart(4, '0');
  return `${TOKEN_PREFIX}-${TOKEN_YEAR}-${padded}`;
}

/**
 * Atomically generate the next unique token number based on Google Sheets state.
 */
async function generateUniqueTokenId() {
  const currentMaxSeq = await getCounter();
  const nextSeq = currentMaxSeq + 1;
  return buildTokenId(nextSeq);
}

/**
 * Student registration flow:
 * 1. Acquire mutex lock
 * 2. Read highest existing sequence directly from Google Sheets (source of truth)
 * 3. Reserve next sequential number (e.g. S.No 1 -> SSEC-2026-0001)
 * 4. Write record directly to Google Sheets at row (sno + 1)
 * 5. Release mutex lock
 */
async function registerStudent(data) {
  const release = await tokenMutex.acquire();
  try {
    // 1. Determine next sequence directly from Google Sheets
    const currentMaxSeq = await getCounter();
    const nextSeq = currentMaxSeq + 1;

    // 2. Generate Token ID & S.No (always synchronized)
    const tokenId = buildTokenId(nextSeq);
    const sno = nextSeq;

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const generatedDate = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
    const generatedTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const studentType = data.studentType || data.hostelOrDayScholar || 'Day Scholar';
    const studentMobile = (data.studentMobile || '').trim();

    const tokenRecord = {
      tokenId,
      sno,
      studentName: data.studentName.trim(),
      studentType,
      hostelOrDayScholar: studentType,
      parentNumber: (data.parentNumber || '').trim(),
      studentMobile,
      generatedDate,
      generatedTime,
      status: STATUS_ACTIVE,
    };

    // 3. Atomically write to Google Sheets while holding the lock
    const created = await createToken(tokenRecord);
    return { ...tokenRecord, sno: created.sno };
  } finally {
    release();
  }
}

module.exports = { generateUniqueTokenId, registerStudent };

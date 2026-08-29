// src/controllers/student.controller.js
const { registerStudent }      = require('../services/token.service');
const { getTokenByTokenId, updateToken } = require('../services/sheets.service');
const { generateTokenPDF }     = require('../services/pdf.service');
const { validateRegistration } = require('../validators/student.validator');

/**
 * POST /api/student/register
 * Public endpoint — no auth required.
 *
 * Flow:
 *   1. Validate input
 *   2. Generate unique token (atomic, concurrency-safe)
 *   3. Save to Google Sheets
 *   4. Return token to client immediately
 */
async function registerStudentHandler(req, res) {
  try {
    console.log('[REGISTRATION] Request received:', JSON.stringify(req.body));

    // ── 1. Validate ────────────────────────────────────────
    const { valid, errors, data } = validateRegistration(req.body);
    if (!valid) {
      console.warn('[REGISTRATION] Validation failed:', JSON.stringify(errors));
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    console.log('[REGISTRATION] Validation passed');

    // ── 2 & 3. Register student (generates token + writes Sheet) ──
    console.log('[REGISTRATION] Generating token & saving to Google Sheets...');
    let tokenRecord;
    try {
      tokenRecord = await registerStudent(data);
      console.log(`[REGISTRATION] Token generated: ${tokenRecord.tokenId} (S.No ${tokenRecord.sno})`);
      console.log('[REGISTRATION] Google Sheets save successful');
    } catch (err) {
      console.error('[REGISTRATION] Google Sheets / Token Generation ERROR:', err.message);
      if (err.status === 409) {
        return res.status(409).json({
          success: false,
          message: err.message,
          existingTokenId: err.existingToken?.tokenId,
        });
      }
      throw err;
    }

    // ── 4. Return response immediately ────────────────────
    console.log('[REGISTRATION] Returning success response');
    return res.status(201).json({
      success: true,
      message: 'Token generated successfully.',
      tokenId: tokenRecord.tokenId,
      token: {
        sno:               tokenRecord.sno,
        tokenId:           tokenRecord.tokenId,
        studentName:       tokenRecord.studentName,
        studentType:       tokenRecord.studentType,
        hostelOrDayScholar: tokenRecord.studentType,
        parentNumber:      tokenRecord.parentNumber,
        studentMobile:     tokenRecord.studentMobile,
        generatedDate:     tokenRecord.generatedDate,
        generatedTime:     tokenRecord.generatedTime,
        status:            tokenRecord.status,
      },
    });

  } catch (err) {
    console.error('[REGISTRATION] Unexpected error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
}

/**
 * GET /api/token/:tokenId
 * Public — returns token details for the success page
 */
async function getTokenHandler(req, res) {
  try {
    const { tokenId } = req.params;
    const found = await getTokenByTokenId(tokenId);
    if (!found) {
      return res.status(404).json({ success: false, message: 'Token not found.' });
    }
    const { token } = found;
    return res.json({
      success: true,
      token: {
        sno:               token.sno,
        tokenId:           token.tokenId,
        studentName:       token.studentName,
        studentType:       token.studentType || token.hostelOrDayScholar || 'Day Scholar',
        hostelOrDayScholar: token.studentType || token.hostelOrDayScholar || 'Day Scholar',
        parentNumber:      token.parentNumber,
        studentMobile:     token.studentMobile,
        generatedDate:     token.generatedDate,
        generatedTime:     token.generatedTime,
        status:            token.status,
      },
    });
  } catch (err) {
    console.error('[GetToken]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

/**
 * GET /api/token/:tokenId/pdf
 * Public — streams PDF to client
 */
async function downloadTokenPDFHandler(req, res) {
  try {
    const { tokenId } = req.params;
    const found = await getTokenByTokenId(tokenId);
    if (!found) {
      return res.status(404).json({ success: false, message: 'Token not found.' });
    }

    const pdfBuffer = await generateTokenPDF(found.token);
    const safeName = (found.token.studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    const filename = `${tokenId}-${safeName}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('[PDF Download]', err);
    return res.status(500).json({ success: false, message: 'Failed to generate PDF.' });
  }
}

/**
 * GET /api/verify/:tokenId
 * Public — QR gate verification
 */
async function verifyTokenHandler(req, res) {
  try {
    const { tokenId } = req.params;
    const found = await getTokenByTokenId(tokenId);
    if (!found) {
      return res.json({ success: true, valid: false, message: 'TOKEN NOT FOUND' });
    }

    const { token } = found;
    const isValid = token.status === 'ACTIVE';

    return res.json({
      success: true,
      valid: isValid,
      alreadyUsed: token.status === 'USED',
      cancelled:   token.status === 'CANCELLED',
      message:
        token.status === 'USED'      ? 'TOKEN ALREADY USED'
        : token.status === 'CANCELLED' ? 'TOKEN CANCELLED'
        : token.status === 'ACTIVE'    ? 'TOKEN VALID'
        : `TOKEN ${token.status}`,
      token: {
        tokenId:           token.tokenId,
        studentName:       token.studentName,
        studentType:       token.studentType || token.hostelOrDayScholar || 'Day Scholar',
        hostelOrDayScholar: token.studentType || token.hostelOrDayScholar || 'Day Scholar',
        generatedDate:     token.generatedDate,
        generatedTime:     token.generatedTime,
        status:            token.status,
      },
    });
  } catch (err) {
    console.error('[Verify]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

/**
 * PATCH /api/verify/:tokenId/use
 * Mark token as USED (requires admin/staff JWT)
 */
async function markTokenUsedHandler(req, res) {
  try {
    const { tokenId } = req.params;
    const found = await getTokenByTokenId(tokenId);
    if (!found) {
      return res.status(404).json({ success: false, message: 'Token not found.' });
    }

    const { token, rowIndex } = found;
    if (token.status === 'USED') {
      return res.status(400).json({ success: false, message: 'Token is already marked as used.' });
    }
    if (token.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Cannot mark a cancelled token as used.' });
    }

    const { logAction } = require('../services/audit.service');
    const updated = await updateToken(rowIndex, { status: 'USED' }, token);
    await logAction({
      adminUsername: req.admin?.username || 'staff',
      action: 'MARK_USED',
      targetTokenId: tokenId,
      oldValue: { status: token.status },
      newValue: { status: 'USED' },
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Token marked as USED.', token: updated });
  } catch (err) {
    console.error('[MarkUsed]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = {
  registerStudentHandler,
  getTokenHandler,
  downloadTokenPDFHandler,
  verifyTokenHandler,
  markTokenUsedHandler,
};

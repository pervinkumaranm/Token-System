// src/services/pdf.service.js
// Generates a professional college token PDF using PDFKit + QRCode

const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { COLLEGE_NAME, COLLEGE_SHORT } = require('../config/constants');

function getLogoPath() {
  const pngPath = path.join(__dirname, '../../assets/logo.png');
  const jpgPath = path.join(__dirname, '../../assets/logo.jpg');
  if (fs.existsSync(pngPath)) return pngPath;
  if (fs.existsSync(jpgPath)) return jpgPath;
  return null;
}

function getFrontendUrl() {
  const url = process.env.FRONTEND_URL || 'http://localhost:3000';
  return url.trim().replace(/\/$/, '');
}

/**
 * Generate a token PDF as a Buffer (in-memory, no disk write needed for streaming)
 */
async function generateTokenPDF(token) {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate QR code pointing to the verification page
      const verifyUrl = `${getFrontendUrl()}/verify/${token.tokenId}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'H',
        width: 180,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        info: {
          Title: `College Token - ${token.tokenId}`,
          Author: COLLEGE_NAME,
          Subject: 'Student Entry Token',
        },
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const W = doc.page.width;   // 595
      const H = doc.page.height;  // 841

      // ── BACKGROUND ──────────────────────────────────────────
      doc.rect(0, 0, W, H).fill('#f8fafc');

      // ── HEADER BAND ─────────────────────────────────────────
      doc.rect(0, 0, W, 130).fill('#0f172a');
      // Decorative accent stripe
      doc.rect(0, 128, W, 6).fill('#f59e0b');

      // College logo
      const logoPath = getLogoPath();
      if (logoPath) {
        doc.image(logoPath, 30, 20, { width: 80, height: 80 });
      } else {
        // Placeholder circle logo
        doc.circle(70, 60, 40).fill('#ffffff').stroke('#f59e0b');
        doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold').text(COLLEGE_SHORT, 45, 47);
      }

      // College name
      doc.fillColor('#ffffff')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(COLLEGE_NAME.toUpperCase(), 125, 28, { width: W - 155, align: 'left' });

      doc.fillColor('#f59e0b')
        .fontSize(10)
        .font('Helvetica')
        .text('Approved by AICTE | Affiliated to Anna University', 125, 54, { width: W - 155 });

      doc.fillColor('#cbd5e1')
        .fontSize(10)
        .font('Helvetica')
        .text('Karamadai, Coimbatore - 641 104, Tamil Nadu', 125, 70, { width: W - 155 });

      // "STUDENT ENTRY TOKEN" label
      doc.fillColor('#f59e0b')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('STUDENT ENTRY TOKEN PASS', 0, 100, { width: W, align: 'center' });

      // ── TOKEN NUMBER BADGE ───────────────────────────────────
      const badgeWidth = 340;
      const badgeX = (W - badgeWidth) / 2;

      doc.roundedRect(badgeX, 144, badgeWidth, 56, 12).fill('#ffffff').stroke('#0f172a');
      doc.rect(badgeX, 144, 6, 56).fill('#f59e0b');

      doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold')
        .text('OFFICIAL TOKEN NUMBER', badgeX, 151, { width: badgeWidth, align: 'center', lineBreak: false });

      doc.fillColor('#0f172a').fontSize(22).font('Helvetica-Bold')
        .text(token.tokenId, badgeX, 165, { width: badgeWidth, align: 'center', lineBreak: false });

      // ── STUDENT DETAILS CARD ────────────────────────────────
      const cardY = 220;
      const cardH = 300;
      doc.roundedRect(30, cardY, W - 60 - 200, cardH, 10)
        .fill('#ffffff').stroke('#cbd5e1');

      // Card header
      doc.roundedRect(30, cardY, W - 60 - 200, 36, 10).fill('#0f172a');
      doc.rect(30, cardY + 26, W - 60 - 200, 10).fill('#0f172a');

      doc.fillColor('#ffffff').fontSize(11)
        .font('Helvetica-Bold')
        .text('STUDENT CREDENTIALS', 30, cardY + 11, { width: W - 60 - 200, align: 'center' });

      // Details rows
      const fields = [
        ['Student Name', token.studentName],
        ['Hostel / Day Scholar', token.studentType || token.hostelOrDayScholar || 'Day Scholar'],
        ['Section', `Section ${token.section || 'A'}`],
        ['Parent Contact', token.parentNumber ? `+91 ${token.parentNumber}` : 'Not Provided'],
        ['Student Mobile', `+91 ${token.studentMobile}`],
      ];

      let fieldY = cardY + 48;
      for (const [label, value] of fields) {
        doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold')
          .text(label.toUpperCase(), 45, fieldY);
        doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold')
          .text(value || '-', 45, fieldY + 13, { width: W - 60 - 200 - 30 });

        // Divider
        fieldY += 46;
        if (fields.indexOf([label, value]) < fields.length - 1) {
          doc.moveTo(45, fieldY - 8).lineTo(W - 60 - 200 - 15, fieldY - 8)
            .strokeColor('#f1f5f9').lineWidth(0.5).stroke();
        }
      }

      // ── QR CODE PANEL ────────────────────────────────────────
      const qrPanelX = W - 230;
      doc.roundedRect(qrPanelX, cardY, 200, cardH, 10).fill('#ffffff').stroke('#cbd5e1');

      // QR header
      doc.roundedRect(qrPanelX, cardY, 200, 36, 10).fill('#f59e0b');
      doc.rect(qrPanelX, cardY + 26, 200, 10).fill('#f59e0b');

      doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold')
        .text('SCAN TO VERIFY', qrPanelX, cardY + 11, { width: 200, align: 'center' });

      // QR image
      doc.image(qrBuffer, qrPanelX + 20, cardY + 50, { width: 160, height: 160 });

      doc.fillColor('#64748b').fontSize(8).font('Helvetica')
        .text('Scan this QR code at campus gates\nto verify entry authorization', qrPanelX, cardY + 225, { width: 200, align: 'center' });

      // ── DATE / TIME / STATUS ROW ─────────────────────────────
      const dtY = cardY + cardH + 15;
      doc.roundedRect(30, dtY, 180, 50, 8).fill('#ffffff').stroke('#cbd5e1');
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('DATE ISSUED', 30, dtY + 8, { width: 180, align: 'center' });
      doc.fillColor('#0f172a').fontSize(13).font('Helvetica-Bold').text(token.generatedDate, 30, dtY + 24, { width: 180, align: 'center' });

      doc.roundedRect(225, dtY, 140, 50, 8).fill('#ffffff').stroke('#cbd5e1');
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('TIME ISSUED', 225, dtY + 8, { width: 140, align: 'center' });
      doc.fillColor('#0f172a').fontSize(13).font('Helvetica-Bold').text(token.generatedTime, 225, dtY + 24, { width: 140, align: 'center' });

      // Status badge
      const statusColors = {
        ACTIVE: ['#ecfdf5', '#047857'],
        USED: ['#fffbeb', '#b45309'],
        CANCELLED: ['#fff1f2', '#be123c'],
        EXPIRED: ['#faf5ff', '#7e22ce'],
      };
      const [bg, fg] = statusColors[token.status] || ['#f1f5f9', '#0f172a'];
      doc.roundedRect(380, dtY, 185, 50, 8).fill(bg).stroke(fg);
      doc.fillColor('#64748b').fontSize(8.5).font('Helvetica-Bold').text('STATUS', 380, dtY + 8, { width: 185, align: 'center' });
      doc.fillColor(fg).fontSize(13).font('Helvetica-Bold').text(token.status, 380, dtY + 24, { width: 185, align: 'center' });

      // ── INSTRUCTIONS BOX ─────────────────────────────────────
      const instrY = dtY + 70;
      doc.roundedRect(30, instrY, W - 60, 80, 8).fill('#fffbeb').stroke('#f59e0b');
      doc.fillColor('#b45309').fontSize(10).font('Helvetica-Bold')
        .text('CAMPUS ENTRY INSTRUCTIONS', 30, instrY + 10, { width: W - 60, align: 'center' });

      const instructions = [
        '• This token is valid for verified entry and is non-transferable.',
        '• Present this token (printed or on mobile screen) at security checkpoints.',
        '• This token should be presented along with your college identity card.',
        '• Any duplicate reproduction or tampering will result in immediate cancellation.',
      ];
      doc.fillColor('#78350f').fontSize(8.5).font('Helvetica')
        .text(instructions.join('\n'), 45, instrY + 28, { width: W - 90, lineGap: 2.5 });

      // ── FOOTER ───────────────────────────────────────────────
      doc.rect(0, H - 50, W, 50).fill('#0f172a');
      doc.fillColor('#f59e0b').fontSize(8.5).font('Helvetica-Bold')
        .text(COLLEGE_NAME.toUpperCase(), 0, H - 38, { width: W, align: 'center' });
      doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica')
        .text(`Verify online at: ${verifyUrl}`, 0, H - 23, { width: W, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateTokenPDF };

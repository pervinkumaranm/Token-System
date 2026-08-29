// src/utils/excel.utils.js
// Excel export utility using ExcelJS

const ExcelJS = require('exceljs');

async function generateExcelExport(tokens) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sree Sakthi Engineering College Token System';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Student Tokens', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  // ── Column definitions ──────────────────────────────────
  sheet.columns = [
    { header: 'S.No', key: 'sno', width: 6 },
    { header: 'Token Number', key: 'tokenId', width: 18 },
    { header: 'Student Name', key: 'studentName', width: 25 },
    { header: 'Hostel / Day Scholar', key: 'studentType', width: 22 },
    { header: 'Parent Mobile Number', key: 'parentNumber', width: 22 },
    { header: 'Student Mobile Number', key: 'studentMobile', width: 24 },
    { header: 'Date Generated', key: 'generatedDate', width: 15 },
    { header: 'Time Generated', key: 'generatedTime', width: 15 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Created At', key: 'createdAt', width: 24 },
  ];

  // ── Header row styling ──────────────────────────────────
  const headerRow = sheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFF59E0B' } },
      bottom: { style: 'thin', color: { argb: 'FFF59E0B' } },
      left: { style: 'thin', color: { argb: 'FFF59E0B' } },
      right: { style: 'thin', color: { argb: 'FFF59E0B' } },
    };
  });
  headerRow.height = 30;

  // ── Status color map ────────────────────────────────────
  const statusColors = {
    ACTIVE: { bg: 'FFECFDF5', fg: 'FF047857' },
    USED: { bg: 'FFFFFBEB', fg: 'FFB45309' },
    CANCELLED: { bg: 'FFFFF1F2', fg: 'FFBE123C' },
    EXPIRED: { bg: 'FFFAF5FF', fg: 'FF7E22CE' },
  };

  // ── Data rows ───────────────────────────────────────────
  tokens.forEach((token, idx) => {
    const row = sheet.addRow({
      sno: idx + 1,
      tokenId: token.tokenId,
      studentName: token.studentName,
      studentType: token.studentType || token.hostelOrDayScholar || 'Day Scholar',
      parentNumber: token.parentNumber || 'Not Provided',
      studentMobile: token.studentMobile || '-',
      generatedDate: token.generatedDate,
      generatedTime: token.generatedTime,
      status: token.status,
      createdAt: token.createdAt,
    });

    // Alternating row background
    const rowBg = idx % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF';
    row.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false };
      cell.border = {
        bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } },
      };
    });

    // Status cell coloring
    const statusCell = row.getCell('status');
    const sc = statusColors[token.status];
    if (sc) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sc.bg } };
      statusCell.font = { bold: true, color: { argb: sc.fg } };
      statusCell.alignment = { horizontal: 'center' };
    }

    row.height = 22;
  });

  // ── Summary row ─────────────────────────────────────────
  sheet.addRow([]);
  const totalRow = sheet.addRow([
    'TOTAL RECORDS', tokens.length, '', '', '', '', '', '', '', '', '',
  ]);
  totalRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
    cell.font = { bold: true, color: { argb: 'FF0F172A' } };
  });

  return workbook;
}

module.exports = { generateExcelExport };

// src/validators/student.validator.js
// Zod schemas for student registration validation

const { z } = require('zod');
const { STUDENT_TYPES, SECTIONS } = require('../config/constants');

const indianMobileRegex = /^[6-9]\d{9}$/;

const registerStudentSchema = z.object({
  studentName: z.string()
    .min(2, 'Student name must be at least 2 characters')
    .max(100, 'Student name too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Student name can only contain letters, spaces, dots, apostrophes, and hyphens'),

  studentType: z.enum(STUDENT_TYPES, {
    errorMap: () => ({ message: 'Please select Hostel or Day Scholar' }),
  }),

  section: z.enum(SECTIONS, {
    errorMap: () => ({ message: 'Please select a valid section (A to O)' }),
  }),

  parentNumber: z.string()
    .optional()
    .refine(val => !val || indianMobileRegex.test(val.trim()), {
      message: 'Parent mobile number must be a valid 10-digit Indian mobile number',
    }),

  studentMobile: z.string()
    .min(1, 'Student mobile number is required')
    .regex(indianMobileRegex, 'Student mobile number must be a valid 10-digit Indian mobile number'),
});

function validateRegistration(data) {
  // Normalize field names seamlessly
  const normalizedData = {
    ...data,
    studentName: (data.studentName || '').trim(),
    studentType: (data.studentType || data.hostelOrDayScholar || '').trim(),
    section: (data.section || '').trim().toUpperCase(),
    parentNumber: (data.parentNumber || data.parentMobile || '').trim(),
    studentMobile: (data.studentMobile || '').trim(),
  };

  const result = registerStudentSchema.safeParse(normalizedData);
  if (!result.success) {
    const issues = result.error?.issues || result.error?.errors || [];
    const errors = issues.map(e => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
      message: e.message || 'Validation error',
    }));
    return { valid: false, errors };
  }
  return { valid: true, data: result.data };
}

module.exports = { validateRegistration };

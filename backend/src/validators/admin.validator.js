// src/validators/admin.validator.js
const { z } = require('zod');

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required').max(100),
});

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'USED', 'CANCELLED', 'EXPIRED'], {
    errorMap: () => ({ message: 'Status must be ACTIVE, USED, CANCELLED, or EXPIRED' }),
  }),
  reason: z.string().max(500).optional(),
});

function validateLogin(data) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error?.issues || result.error?.errors || [];
    return {
      valid: false,
      errors: issues.map(e => ({
        field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
        message: e.message || 'Validation error',
      })),
    };
  }
  return { valid: true, data: result.data };
}

function validateStatusUpdate(data) {
  const result = updateStatusSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error?.issues || result.error?.errors || [];
    return {
      valid: false,
      errors: issues.map(e => ({
        field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
        message: e.message || 'Validation error',
      })),
    };
  }
  return { valid: true, data: result.data };
}

const studentEditSchema = z.object({
  studentName: z.string()
    .min(2, 'Student name must be at least 2 characters')
    .max(100, 'Student name too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Student name can only contain letters, spaces, dots, apostrophes, and hyphens'),

  studentType: z.enum(['Hostel', 'Day Scholar'], {
    errorMap: () => ({ message: 'Please select Hostel or Day Scholar' }),
  }),

  parentNumber: z.string()
    .optional()
    .refine(val => !val || /^[6-9]\d{9}$/.test(val.trim()), {
      message: 'Parent mobile number must be a valid 10-digit Indian mobile number',
    }),

  studentMobile: z.string()
    .min(1, 'Student mobile number is required')
    .regex(/^[6-9]\d{9}$/, 'Student mobile number must be a valid 10-digit Indian mobile number'),
});

function validateStudentEdit(data) {
  const normalizedData = {
    ...data,
    studentName: (data.studentName || '').trim(),
    studentType: (data.studentType || data.hostelOrDayScholar || '').trim(),
    parentNumber: (data.parentNumber || data.parentMobile || '').trim(),
    studentMobile: (data.studentMobile || '').trim(),
  };

  const result = studentEditSchema.safeParse(normalizedData);
  if (!result.success) {
    const issues = result.error?.issues || result.error?.errors || [];
    return {
      valid: false,
      errors: issues.map(e => ({
        field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
        message: e.message || 'Validation error',
      })),
    };
  }
  return { valid: true, data: result.data };
}

module.exports = { validateLogin, validateStatusUpdate, validateStudentEdit };

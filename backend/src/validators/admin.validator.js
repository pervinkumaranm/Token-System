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

module.exports = { validateLogin, validateStatusUpdate };

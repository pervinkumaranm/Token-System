// src/lib/constants.ts

export const COLLEGE_NAME = 'Sree Sakthi Engineering College';
export const COLLEGE_SHORT = 'SSEC';
export const COLLEGE_TAGLINE = 'Student Entry Token System';

export const STUDENT_TYPES = ['Hostel', 'Day Scholar'] as const;

export const TOKEN_STATUSES = ['ACTIVE', 'USED', 'CANCELLED', 'EXPIRED'] as const;

export const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
  USED: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20',
  EXPIRED: 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20',
};

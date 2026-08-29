// src/lib/api.ts
// Centralized API client for frontend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  [key: string]: any;
}

async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok && res.status !== 201 && res.status !== 400 && res.status !== 401 && res.status !== 409 && res.status !== 404) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}

// ── Student API ─────────────────────────────────────────────

export async function registerStudent(data: {
  studentName: string;
  studentType: string;
  hostelOrDayScholar?: string;
  section: string;
  parentNumber?: string;
  parentMobile?: string;
  studentMobile: string;
}) {
  return apiFetch('/student/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getToken(tokenId: string) {
  return apiFetch(`/token/${tokenId}`);
}

export async function verifyToken(tokenId: string) {
  return apiFetch(`/verify/${tokenId}`);
}

export function getTokenPDFUrl(tokenId: string) {
  return `${API_BASE}/token/${tokenId}/pdf`;
}

// ── Admin API ───────────────────────────────────────────────

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function adminLogin(username: string, password: string) {
  return apiFetch('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function adminLogout() {
  return apiFetch('/admin/logout', {
    method: 'POST',
    headers: getAuthHeader(),
  });
}

export async function getDashboardStats() {
  return apiFetch('/admin/dashboard', {
    headers: getAuthHeader(),
  });
}

export async function listStudents(params: {
  query?: string;
  studentType?: string;
  section?: string;
  status?: string;
  smsStatus?: string;
  whatsappStatus?: string;
  page?: number;
  limit?: number;
}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])
  ).toString();
  return apiFetch(`/admin/students${qs ? '?' + qs : ''}`, {
    headers: getAuthHeader(),
  });
}

export async function updateTokenStatus(tokenId: string, status: string) {
  return apiFetch(`/admin/token/${tokenId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    headers: getAuthHeader(),
  });
}



export function getAdminTokenPDFUrl(tokenId: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
  return `${API_BASE}/admin/token/${tokenId}/pdf?token=${token}`;
}

export function getExportUrl(params: Record<string, string> = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';
  const qs = new URLSearchParams({ ...params, token: token || '' }).toString();
  return `${API_BASE}/admin/export?${qs}`;
}

export async function getAuditLogs(limit = 100, offset = 0) {
  return apiFetch(`/admin/audit-logs?limit=${limit}&offset=${offset}`, {
    headers: getAuthHeader(),
  });
}

export async function markTokenUsed(tokenId: string) {
  return apiFetch(`/verify/${tokenId}/use`, {
    method: 'PATCH',
    headers: getAuthHeader(),
  });
}

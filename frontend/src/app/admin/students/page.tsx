'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Filter, Download, CheckCircle2,
  XCircle, Eye, RefreshCw, Loader2, ChevronLeft, ChevronRight,
  FileSpreadsheet, AlertCircle, X, Shield, Calendar, Pencil
} from 'lucide-react';
import { AdminLayoutWrapper } from '../dashboard/page';
import {
  listStudents, updateTokenStatus, updateStudentDetails,
  getAdminTokenPDFUrl, getExportUrl
} from '@/lib/api';
import { STUDENT_TYPES, STATUS_COLORS } from '@/lib/constants';

interface TokenRecord {
  id: string;
  tokenId: string;
  studentName: string;
  studentType?: string;
  hostelOrDayScholar?: string;
  parentNumber?: string;
  studentMobile?: string;
  generatedDate: string;
  generatedTime: string;
  status: string;
  createdAt: string;
}

interface PaginationState {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/* ── DETAILS MODAL ── */
function TokenDetailsModal({
  token,
  onClose,
}: {
  token: TokenRecord;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-100">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Shield className="w-4 h-4" />
            <span>Student Token Details</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="text-center bg-slate-950/80 rounded-2xl p-4 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
              Official Token ID
            </span>
            <p className="text-3xl font-black text-amber-400 font-mono mt-1 tracking-wider">
              {token.tokenId}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[token.status] || ''}`}>
                {token.status}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              ['Student Name', token.studentName],
              ['Category', token.studentType || token.hostelOrDayScholar || 'Day Scholar'],
              ['Parent Mobile', token.parentNumber ? `+91 ${token.parentNumber}` : 'Not Provided'],
              ['Student Mobile', `+91 ${token.studentMobile}`],
              ['Issued Timestamp', `${token.generatedDate} • ${token.generatedTime}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400 uppercase font-bold text-[10px]">{label}</span>
                <span className="font-semibold text-slate-200 text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <a
              href={getAdminTokenPDFUrl(token.tokenId)}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all text-center"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── EDIT STUDENT MODAL ── */
function EditStudentModal({
  token,
  onClose,
  onUpdated,
}: {
  token: TokenRecord;
  onClose: () => void;
  onUpdated: (updatedToken: TokenRecord) => void;
}) {
  const [studentName, setStudentName] = useState(token.studentName);
  const [studentType, setStudentType] = useState(token.studentType || token.hostelOrDayScholar || 'Day Scholar');
  const [parentNumber, setParentNumber] = useState(token.parentNumber || '');
  const [studentMobile, setStudentMobile] = useState(token.studentMobile || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSaveChanges(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setGlobalError('');
    setSuccessMsg('');

    const newErrors: Record<string, string> = {};
    if (!studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    } else if (studentName.trim().length < 2) {
      newErrors.studentName = 'Student name must be at least 2 characters';
    }

    if (parentNumber.trim() && !/^[6-9]\d{9}$/.test(parentNumber.trim())) {
      newErrors.parentNumber = 'Enter a valid 10-digit mobile number';
    }

    if (!studentMobile.trim()) {
      newErrors.studentMobile = 'Student mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(studentMobile.trim())) {
      newErrors.studentMobile = 'Enter a valid 10-digit mobile number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await updateStudentDetails(token.tokenId, {
        studentName: studentName.trim(),
        studentType,
        parentNumber: parentNumber.trim() || undefined,
        studentMobile: studentMobile.trim(),
      });

      if (res.success && res.token) {
        setSuccessMsg('Student details updated successfully.');
        setTimeout(() => {
          onUpdated(res.token);
          onClose();
        }, 1500);
      } else {
        setGlobalError(res.message || 'Failed to update student details.');
      }
    } catch {
      setGlobalError('Connection error while saving changes.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-slate-100">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Edit Student Details</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors animate-none">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveChanges} className="p-6 space-y-4">
          <div className="text-xs text-slate-400">
            Editing Record: <strong className="text-amber-400 font-mono">{token.tokenId}</strong>
          </div>

          {globalError && (
            <div className="p-3 bg-rose-950/50 border border-rose-900 text-rose-300 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{globalError}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-900 text-emerald-300 rounded-xl text-xs flex items-start gap-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Student Name */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Student Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              disabled={loading}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-850 text-white focus:outline-none focus:border-amber-400"
            />
            {errors.studentName && <p className="text-rose-400 text-[10px] mt-0.5">{errors.studentName}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Hostel / Day Scholar
            </label>
            <select
              value={studentType}
              onChange={e => setStudentType(e.target.value)}
              disabled={loading}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-850 text-slate-200 focus:outline-none focus:border-amber-400"
            >
              {STUDENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Parent Mobile */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Parent Mobile Number
            </label>
            <input
              type="tel"
              maxLength={10}
              value={parentNumber}
              onChange={e => setParentNumber(e.target.value)}
              disabled={loading}
              placeholder="10-digit Indian mobile number"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-850 text-white focus:outline-none focus:border-amber-400"
            />
            {errors.parentNumber && <p className="text-rose-400 text-[10px] mt-0.5">{errors.parentNumber}</p>}
          </div>

          {/* Student Mobile */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Student Mobile Number
            </label>
            <input
              type="tel"
              maxLength={10}
              value={studentMobile}
              onChange={e => setStudentMobile(e.target.value)}
              disabled={loading}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-850 text-white focus:outline-none focus:border-amber-400"
            />
            {errors.studentMobile && <p className="text-rose-400 text-[10px] mt-0.5">{errors.studentMobile}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 spinner" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── STATUS UPDATE MODAL ── */
function StatusUpdateModal({
  token,
  onClose,
  onUpdated,
}: {
  token: TokenRecord;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState(token.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSaveStatus() {
    if (selectedStatus === token.status) {
      onClose();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await updateTokenStatus(token.tokenId, selectedStatus);
      if (res.success) {
        onUpdated();
        onClose();
      } else {
        setError(res.message || 'Failed to update token status.');
      }
    } catch {
      setError('Connection error while updating status.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden text-slate-100">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Change Token Status</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-400">
            Target Token: <strong className="text-amber-400 font-mono">{token.tokenId}</strong> ({token.studentName})
          </p>

          <div className="grid grid-cols-2 gap-2">
            {(['ACTIVE', 'USED', 'CANCELLED', 'EXPIRED'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedStatus === st
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-rose-400 text-xs font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveStatus}
              disabled={loading}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 spinner" /> : null}
              Save Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN STUDENTS & TOKEN MANAGEMENT PAGE ── */
export default function StudentsManagementPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ total: 0, page: 1, limit: 50, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter states
  const [query, setQuery] = useState('');
  const [studentType, setStudentType] = useState('');
  const [status, setStatus] = useState('');

  // Modals
  const [modalState, setModalState] = useState<{ type: 'details' | 'status' | 'edit' | null; token: TokenRecord | null }>({
    type: null,
    token: null,
  });

  const loadTokens = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await listStudents({
        query,
        studentType,
        status,
        page,
        limit: 50,
      });

      if (res.success) {
        setTokens(res.tokens || []);
        setPagination(res.pagination || { total: 0, page: 1, limit: 50, pages: 1 });
      } else {
        router.push('/admin');
      }
    } catch {
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  }, [router, query, studentType, status]);

  useEffect(() => {
    loadTokens(1);
  }, [loadTokens]);

  function handleExcelExport() {
    const url = getExportUrl({ query, studentType, status });
    window.open(url, '_blank');
  }

  function handleClearFilters() {
    setQuery('');
    setStudentType('');
    setStatus('');
  }

  return (
    <AdminLayoutWrapper active="Token Management">
      {/* Modals */}
      {modalState.type === 'details' && modalState.token && (
        <TokenDetailsModal
          token={modalState.token}
          onClose={() => setModalState({ type: null, token: null })}
        />
      )}

      {modalState.type === 'status' && modalState.token && (
        <StatusUpdateModal
          token={modalState.token}
          onClose={() => setModalState({ type: null, token: null })}
          onUpdated={() => loadTokens(pagination.page)}
        />
      )}

      {modalState.type === 'edit' && modalState.token && (
        <EditStudentModal
          token={modalState.token}
          onClose={() => setModalState({ type: null, token: null })}
          onUpdated={(updatedToken) => {
            // Update only the modified record in-place in local React state
            setTokens(prev => prev.map(t => t.tokenId === updatedToken.tokenId ? updatedToken : t));
          }}
        />
      )}

      <div className="space-y-6">
        {/* Top Filter Bar */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search student name, token ID, mobile..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadTokens(1)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={studentType}
              onChange={e => setStudentType(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="">All Categories</option>
              {STUDENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="py-2.5 px-3 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="USED">USED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadTokens(1)}
                className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>

              <button
                onClick={handleClearFilters}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                title="Clear Filters"
              >
                Clear
              </button>

              <button
                onClick={handleExcelExport}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── DATA TABLE / MOBILE CARDS ── */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              {loading ? 'Searching records...' : `${pagination.total} Total Student Record${pagination.total !== 1 ? 's' : ''}`}
            </span>
            <button
              onClick={() => loadTokens(pagination.page)}
              className="text-slate-400 hover:text-white p-1 transition-colors"
              title="Refresh table"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'spinner' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Loader2 className="w-8 h-8 text-amber-400 spinner mb-2" />
              <span>Fetching database records...</span>
            </div>
          ) : tokens.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs space-y-2">
              <Search className="w-10 h-10 mx-auto opacity-30" />
              <p className="font-semibold text-slate-400">No token records matched your filter criteria.</p>
              <p className="text-[11px]">Try clearing search parameters or adjusting filters.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Token ID</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Parent Mobile</th>
                      <th className="py-3.5 px-4">Student Mobile</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tokens.map(t => (
                      <tr key={t.tokenId} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                          {t.tokenId}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {t.studentName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {t.studentType || t.hostelOrDayScholar || 'Day Scholar'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                          {t.parentNumber ? `+91 ${t.parentNumber}` : '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                          +91 {t.studentMobile}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[t.status] || ''}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setModalState({ type: 'details', token: t })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setModalState({ type: 'edit', token: t })}
                              className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-950/60 transition-colors"
                              title="Edit Student"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setModalState({ type: 'status', token: t })}
                              className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-950/60 transition-colors"
                              title="Change Status"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>

                            <a
                              href={getAdminTokenPDFUrl(t.tokenId)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden divide-y divide-slate-800">
                {tokens.map(t => (
                  <div key={t.tokenId} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 text-sm">{t.tokenId}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[t.status] || ''}`}>
                        {t.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-white text-sm">{t.studentName}</p>
                      <p className="text-xs text-slate-400">
                        {t.studentType || t.hostelOrDayScholar || 'Day Scholar'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Mobile: +91 {t.studentMobile}
                        {t.parentNumber && ` | Parent: +91 ${t.parentNumber}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setModalState({ type: 'details', token: t })}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                      <button
                        onClick={() => setModalState({ type: 'edit', token: t })}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-blue-900/20 text-blue-400 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => setModalState({ type: 'status', token: t })}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-amber-400/20 text-amber-400 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Status
                      </button>
                      <a
                        href={getAdminTokenPDFUrl(t.tokenId)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Page {pagination.page} of {pagination.pages} ({pagination.total} records)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadTokens(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => loadTokens(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}

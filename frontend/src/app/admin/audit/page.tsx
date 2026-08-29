'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList, Search, RefreshCw, Loader2,
  Calendar, Shield, User, Globe, ArrowDownRight, Tag
} from 'lucide-react';
import { AdminLayoutWrapper } from '../dashboard/page';
import { getAuditLogs } from '@/lib/api';

interface AuditLogRecord {
  id: string;
  timestamp: string;
  adminUsername: string;
  action: string;
  targetTokenId: string;
  oldValue: any;
  newValue: any;
  ipAddress: string;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs(100, 0);
      if (res.success) {
        setLogs(res.logs || []);
      } else {
        router.push('/admin');
      }
    } catch {
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter(l => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      l.adminUsername?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q) ||
      l.targetTokenId?.toLowerCase().includes(q) ||
      l.ipAddress?.includes(q)
    );
  });

  const actionColorMap: Record<string, string> = {
    LOGIN_SUCCESS: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    LOGIN_FAILED: 'bg-rose-950 text-rose-300 border-rose-800',
    LOGOUT: 'bg-slate-800 text-slate-300 border-slate-700',
    STATUS_CHANGE_USED: 'bg-amber-950 text-amber-300 border-amber-800',
    STATUS_CHANGE_CANCELLED: 'bg-rose-950 text-rose-300 border-rose-800',
    STATUS_CHANGE_ACTIVE: 'bg-blue-950 text-blue-300 border-blue-800',
    MARK_USED: 'bg-amber-950 text-amber-300 border-amber-800',
    WHATSAPP_RESEND: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    EXCEL_EXPORT: 'bg-purple-950 text-purple-300 border-purple-800',
  };

  return (
    <AdminLayoutWrapper active="Audit Logs">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Immutable System Audit Trail</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanently logs every login, status change, export, and security action with IP addresses.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter action, admin, token..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all shrink-0"
              title="Refresh Audit Logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'spinner' : ''}`} />
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              {loading ? 'Reading audit trail...' : `${filteredLogs.length} Total Audit Entries`}
            </span>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Loader2 className="w-8 h-8 text-amber-400 spinner mb-2" />
              <span>Fetching audit entries...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs space-y-2">
              <ClipboardList className="w-10 h-10 mx-auto opacity-30" />
              <p className="font-semibold text-slate-400">No audit logs match your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Admin / Origin</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Target Token</th>
                    <th className="py-3.5 px-4">Changes / Details</th>
                    <th className="py-3.5 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredLogs.map(l => (
                    <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(l.timestamp).toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          <span>{l.adminUsername}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${actionColorMap[l.action] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                          {l.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {l.targetTokenId || '—'}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-slate-300">
                        {l.newValue ? (
                          <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 block truncate">
                            {JSON.stringify(l.newValue)}
                          </span>
                        ) : '—'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-slate-500" />
                          <span>{l.ipAddress || 'unknown'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}

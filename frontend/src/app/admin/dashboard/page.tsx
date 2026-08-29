'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard, Users, ClipboardList, LogOut, Menu, X,
  CheckCircle2, XCircle, Clock,
  Shield, ArrowUpRight, ChevronRight, RefreshCw, Loader2, FileSpreadsheet,
  Search, ExternalLink, Home, Building2
} from 'lucide-react';
import { getDashboardStats, adminLogout, getExportUrl } from '@/lib/api';
import { COLLEGE_NAME, COLLEGE_SHORT, STATUS_COLORS } from '@/lib/constants';

interface DashboardStats {
  total: number;
  active: number;
  used: number;
  cancelled: number;
  expired: number;
  hostelCount?: number;
  dayScholarCount?: number;
  recent: Array<{
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
  }>;
}

export function AdminLayoutWrapper({
  children,
  active,
}: {
  children: React.ReactNode;
  active: string;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userStr = localStorage.getItem('adminUser');
    if (!token) {
      router.push('/admin');
      return;
    }
    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch {
        setAdminUser(null);
      }
    }
  }, [router]);

  async function handleLogout() {
    try {
      await adminLogout();
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      router.push('/admin');
    }
  }

  function handleDirectExport() {
    const url = getExportUrl();
    window.open(url, '_blank');
  }

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/students', label: 'Token Management', icon: Users },
    { href: '/admin/audit', label: 'Audit Logs', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-amber-400 selection:text-slate-950">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 border-r border-slate-800 shrink-0">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-950 border border-amber-400 overflow-hidden shrink-0">
              <Image
                src="/logo.jpg"
                alt={COLLEGE_NAME}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white leading-tight">
                {COLLEGE_SHORT} Admin Portal
              </span>
              <span className="text-[11px] text-amber-400 font-medium">
                Sree Sakthi Eng. College
              </span>
            </div>
          </Link>
        </div>

        {/* Nav list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">
            Main Management
          </div>

          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = active === label;
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{label}</span>
              </Link>
            );
          })}

          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pt-6 pb-2">
            Operations & Reports
          </div>

          <button
            onClick={handleDirectExport}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/30 transition-all text-left cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            <span>View Public Portal</span>
          </Link>
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          {adminUser && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                {adminUser.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-white truncate">{adminUser.username}</span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">{adminUser.role || 'ADMIN'}</span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 border border-rose-900/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 bg-slate-900 flex flex-col z-10 border-r border-slate-800">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase">{COLLEGE_SHORT} Admin</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold ${
                    active === label ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
              <button
                onClick={handleDirectExport}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">{active}</h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">{COLLEGE_NAME}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/students"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search Tokens</span>
            </Link>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync
            </span>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-950 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardStats();
      if (res.success && res.stats) {
        setStats(res.stats);
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
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <AdminLayoutWrapper active="Dashboard">
        <div className="h-96 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-amber-400 spinner mb-3" />
          <p className="text-xs font-semibold text-slate-400">Loading live campus statistics...</p>
        </div>
      </AdminLayoutWrapper>
    );
  }

  const statCards = stats
    ? [
        {
          label: 'Total Registrations',
          value: stats.total,
          icon: Users,
          color: 'text-blue-400',
          bg: 'bg-blue-950/60 border-blue-800/40',
          trend: '100% Unique',
        },
        {
          label: 'Active Tokens',
          value: stats.active,
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/60 border-emerald-800/40',
          trend: 'Ready for Entry',
        },
        {
          label: 'Tokens Used',
          value: stats.used,
          icon: Clock,
          color: 'text-amber-400',
          bg: 'bg-amber-950/60 border-amber-800/40',
          trend: 'Scanned at Gate',
        },
        {
          label: 'Cancelled Passes',
          value: stats.cancelled,
          icon: XCircle,
          color: 'text-rose-400',
          bg: 'bg-rose-950/60 border-rose-800/40',
          trend: 'Immutable Record',
        },
      ]
    : [];

  const hostelCount = stats?.hostelCount || 0;
  const dayScholarCount = stats?.dayScholarCount || 0;
  const hostelPercent = stats?.total ? Math.round((hostelCount / stats.total) * 100) : 0;
  const dayScholarPercent = stats?.total ? Math.round((dayScholarCount / stats.total) * 100) : 0;

  return (
    <AdminLayoutWrapper active="Dashboard">
      <div className="space-y-6">
        {/* Top Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Real-Time Campus Overview
            </h2>
            <p className="text-xs text-slate-400">
              Live token activity, entry statistics, and registration type details.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spinner' : ''}`} />
              <span>Refresh Metrics</span>
            </button>

            <Link
              href="/admin/students"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm transition-all"
            >
              <span>Manage Tokens</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── 4 STAT CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map(c => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-between ${c.bg}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {c.label}
                  </span>
                  <div className={`p-2 rounded-xl bg-slate-900/60 ${c.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-3xl font-black text-white font-mono tracking-tight">
                    {c.value}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {c.trend}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── TOKEN CATEGORY ALLOCATION & SYSTEM OPERATIONS ── */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Token Category Allocation Card */}
            <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Student Category Breakdown</h3>
                </div>
                <span className="text-[11px] font-mono text-blue-400 font-bold bg-blue-950 px-2 py-0.5 rounded-full border border-blue-800">
                  {stats.total > 0 ? `${hostelPercent}% Hostel` : 'System Ready'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-950 text-blue-400">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white font-mono">{hostelCount}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Hostel ({hostelPercent}%)</p>
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-950 text-amber-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-white font-mono">{dayScholarCount}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Day Scholar ({dayScholarPercent}%)</p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Visualizing student allocations for Hostel vs Day Scholar registrations. Live synchronization handles safe concurrent updates.
              </p>
            </div>

            {/* Quick Actions & Guidelines */}
            <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">System Operations & Verification</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/admin/students"
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-400/50 hover:bg-slate-800/50 transition-all flex items-center justify-between text-xs group"
                >
                  <span className="font-semibold text-slate-200">Manage All Tokens</span>
                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/admin/audit"
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-400/50 hover:bg-slate-800/50 transition-all flex items-center justify-between text-xs group"
                >
                  <span className="font-semibold text-slate-200">View Audit Logs</span>
                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <a
                  href="/api/admin/export"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all flex items-center justify-between text-xs group"
                >
                  <span className="font-semibold text-emerald-400">Export All to Excel</span>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </a>

                <Link
                  href="/register"
                  target="_blank"
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-400/50 hover:bg-slate-800/50 transition-all flex items-center justify-between text-xs group"
                >
                  <span className="font-semibold text-blue-400">Open Public Registration</span>
                  <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── RECENT REGISTRATIONS TABLE ── */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Student Registrations</h3>
              <p className="text-[11px] text-slate-400">Latest tokens generated</p>
            </div>
            <Link
              href="/admin/students"
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View All Records</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {stats?.recent && stats.recent.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Token ID</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {stats.recent.map(t => (
                    <tr key={t.tokenId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {t.tokenId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {t.studentName}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {t.studentType || (t as any).hostelOrDayScholar || 'Day Scholar'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[t.status] || 'bg-slate-800 text-slate-300'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No student tokens generated yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}

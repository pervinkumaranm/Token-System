'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Shield, Lock, User, Eye, EyeOff, Loader2,
  AlertCircle, ArrowLeft, CheckCircle2, Sparkles
} from 'lucide-react';
import { adminLogin } from '@/lib/api';
import { COLLEGE_NAME, COLLEGE_TAGLINE, COLLEGE_SHORT } from '@/lib/constants';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both your administrative username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin(username.trim(), password);
      if (res && res.success && res.token) {
        localStorage.setItem('adminToken', res.token);
        localStorage.setItem('adminUser', JSON.stringify(res.admin));
        window.location.href = '/admin/dashboard';
      } else {
        setError(res?.message || 'Invalid username or password.');
      }
    } catch (err: any) {
      console.error('[Admin Login Error]', err);
      setError('Unable to reach server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Portal</span>
        </Link>
      </header>

      {/* Main Center Container */}
      <main className="max-w-4xl w-full mx-auto px-4 py-8">
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Branding & Security Badge */}
          <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-blue-950 border-2 border-amber-400 overflow-hidden shadow-md">
                <Image
                  src="/logo.jpg"
                  alt={COLLEGE_NAME}
                  width={56}
                  height={56}
                  className="object-cover"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                  Institutional Access
                </span>
                <h1 className="text-xl font-black text-white mt-1 leading-snug">
                  {COLLEGE_NAME}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Token Management System
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-400 bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-[11px]">
                <Shield className="w-4 h-4" />
                <span>Protected Administrative Area</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Role-based session with encrypted token verification, full audit tracking, and automated Google Sheets sync.
              </p>
            </div>
          </div>

          {/* Right: Secure Login Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 bg-slate-900/40 flex flex-col justify-center">
            <div className="mb-6 space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Staff Authentication
              </h2>
              <p className="text-xs text-slate-400">
                Enter your credentials to access the token dashboard.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-5 bg-rose-950/60 border border-rose-600/40 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <p className="font-medium leading-snug">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    placeholder="Enter admin username"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md hover:shadow-lg active:scale-98 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 spinner" />
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Login to Admin Panel
                  </>
                )}
              </button>
            </form>

            <p className="text-[11px] text-slate-500 text-center mt-6">
              Default administrator seed: <code className="text-slate-400 font-mono">admin</code> / <code className="text-slate-400 font-mono">changeme123</code>
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="p-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {COLLEGE_NAME}. SSEC Token Security System.
      </footer>
    </div>
  );
}

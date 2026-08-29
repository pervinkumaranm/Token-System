'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2, XCircle, AlertTriangle, Loader2,
  User, Calendar, Clock,
  Shield, ArrowLeft, Check, Home
} from 'lucide-react';
import { verifyToken, markTokenUsed } from '@/lib/api';
import { COLLEGE_NAME } from '@/lib/constants';

interface VerifyResult {
  valid: boolean;
  alreadyUsed?: boolean;
  cancelled?: boolean;
  message: string;
  token?: {
    tokenId: string;
    studentName: string;
    studentType?: string;
    hostelOrDayScholar?: string;
    generatedDate: string;
    generatedTime: string;
    status: string;
  };
}

export default function VerifyTokenPage() {
  const params = useParams();
  const tokenId = params.token as string;

  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    async function runVerification() {
      try {
        const res = await verifyToken(tokenId);
        setResult(res as unknown as VerifyResult);
      } catch {
        setResult({ valid: false, message: 'Verification server unavailable.' });
      } finally {
        setLoading(false);
      }
    }

    if (tokenId) runVerification();

    if (typeof window !== 'undefined') {
      setIsAdminLoggedIn(!!localStorage.getItem('adminToken'));
    }
  }, [tokenId]);

  async function handleMarkUsed() {
    if (!isAdminLoggedIn) {
      alert('Only authenticated college staff/admins can mark tokens as USED. Please log in through the Admin Portal.');
      return;
    }

    setMarking(true);
    try {
      const res = await markTokenUsed(tokenId);
      if (res.success) {
        setMarked(true);
        setResult(prev =>
          prev
            ? { ...prev, alreadyUsed: true, valid: false, message: 'TOKEN ALREADY USED' }
            : prev
        );
      } else {
        alert(res.message || 'Failed to mark token as used.');
      }
    } catch {
      alert('Error updating token status. Session may have expired.');
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-amber-400 spinner" />
        </div>
        <p className="font-bold text-base text-slate-200">Verifying Campus Pass...</p>
        <p className="text-xs text-slate-400 font-mono mt-1">{tokenId}</p>
      </div>
    );
  }

  const isValid = result?.valid && !marked;
  const isUsed = result?.alreadyUsed || marked;
  const isCancelled = result?.cancelled;

  const statusTheme = isValid
    ? {
        bg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
        badge: 'bg-emerald-500 text-slate-950',
        icon: <CheckCircle2 className="w-16 h-16 text-emerald-400" />,
        headline: 'VALID ENTRY PASS',
        sub: 'Student authorized for campus entry.',
      }
    : isUsed
    ? {
        bg: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
        badge: 'bg-amber-500 text-slate-950',
        icon: <AlertTriangle className="w-16 h-16 text-amber-400" />,
        headline: 'TOKEN ALREADY USED',
        sub: 'This pass has already been presented at the entrance.',
      }
    : isCancelled
    ? {
        bg: 'bg-rose-950/80 border-rose-500/40 text-rose-300',
        badge: 'bg-rose-500 text-white',
        icon: <XCircle className="w-16 h-16 text-rose-400" />,
        headline: 'TOKEN CANCELLED',
        sub: 'This token is no longer valid for campus entry.',
      }
    : {
        bg: 'bg-slate-900 border-slate-700 text-slate-300',
        badge: 'bg-slate-700 text-white',
        icon: <XCircle className="w-16 h-16 text-rose-400" />,
        headline: 'INVALID TOKEN',
        sub: 'No valid token record found in the college database.',
      };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full max-w-md space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Gate Security Verification</span>
          </div>
          <h1 className="text-lg font-bold text-slate-200">
            {COLLEGE_NAME}
          </h1>
        </div>

        {/* Big Status Card */}
        <div className={`rounded-3xl p-8 border shadow-2xl backdrop-blur-md text-center space-y-4 ${statusTheme.bg}`}>
          <div className="flex justify-center">
            {statusTheme.icon}
          </div>

          <div className="space-y-1">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${statusTheme.badge}`}>
              {statusTheme.headline}
            </span>
            <p className="text-xs text-slate-400 pt-1">
              {statusTheme.sub}
            </p>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-white/5 font-mono text-base sm:text-lg font-bold tracking-wider text-amber-300 whitespace-nowrap truncate">
            {tokenId}
          </div>
        </div>

        {/* Student Details Card (if found) */}
        {result?.token && (
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Verified Student Record</span>
              <span className="text-emerald-400 text-[11px] font-mono font-bold">100% Match</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-amber-400" /> Student Name
                </span>
                <span className="font-bold text-white text-sm">{result.token.studentName}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-2">
                  <Home className="w-3.5 h-3.5 text-amber-400" /> Category
                </span>
                <span className="font-bold text-white text-sm">
                  {result.token.studentType || result.token.hostelOrDayScholar || 'Day Scholar'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Issued On
                </span>
                <span className="font-medium text-slate-300">{result.token.generatedDate} • {result.token.generatedTime}</span>
              </div>
            </div>

            {/* Staff Action: Mark as Used */}
            {isValid && !marked && (
              <div className="pt-3">
                <button
                  onClick={handleMarkUsed}
                  disabled={marking}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  {marking ? (
                    <>
                      <Loader2 className="w-4 h-4 spinner" />
                      Marking as USED...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      Mark Token as USED
                    </>
                  )}
                </button>
                {!isAdminLoggedIn && (
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    Note: Staff authentication required to commit status changes.
                  </p>
                )}
              </div>
            )}

            {marked && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-300 text-center text-xs font-bold">
                ✓ Token recorded as USED in system database
              </div>
            )}
          </div>
        )}

        {/* Back navigation */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

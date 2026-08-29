'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2, Download, Calendar, Clock,
  User, Phone, ArrowLeft, Copy, Check,
  QrCode, Shield, Share2, AlertCircle, Loader2, Home, Layers,
  Smartphone, MessageSquare
} from 'lucide-react';
import { getToken, getTokenPDFUrl } from '@/lib/api';
import { COLLEGE_NAME, STATUS_COLORS } from '@/lib/constants';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface TokenData {
  tokenId: string;
  studentName: string;
  studentType?: string;
  hostelOrDayScholar?: string;
  section: string;
  parentNumber?: string;
  studentMobile?: string;
  generatedDate: string;
  generatedTime: string;
  status: string;
}

export default function TokenSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const tokenId = params.token as string;

  const [token, setToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await getToken(tokenId);
        if (res.success && res.token) {
          setToken(res.token);
        } else {
          setError(res.message || 'Token record not found.');
        }
      } catch {
        setError('Failed to fetch token details. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }
    if (tokenId) fetchToken();
  }, [tokenId]);

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      const url = getTokenPDFUrl(tokenId);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${tokenId}_token.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      alert('Failed to download PDF. You can also view or save this page as reference.');
    } finally {
      setDownloading(false);
    }
  }

  function handleCopyToken() {
    navigator.clipboard.writeText(tokenId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SSEC Token - ${tokenId}`,
          text: `My college entry token for ${COLLEGE_NAME}: ${tokenId}`,
          url: window.location.href,
        });
      } catch {
        handleCopyToken();
      }
    } else {
      handleCopyToken();
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4 shadow-sm">
            <Loader2 className="w-8 h-8 spinner" />
          </div>
          <p className="font-bold text-slate-800 text-base">Loading Your Token...</p>
          <p className="text-xs text-slate-400 mt-1 font-mono">{tokenId}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Token Not Found</h2>
            <p className="text-xs text-slate-500">{error || 'The requested token could not be verified.'}</p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-900 text-white font-bold text-xs shadow-sm hover:bg-blue-950 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Registration
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top Success Badge Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Registration Successful
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Your Entry Token is Ready
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Present this verified pass on your phone or show the downloaded PDF at the campus entry gates.
            </p>
          </div>
        </div>

        {/* ── DIGITAL TOKEN PASS CARD ── */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden relative">
          {/* Card Top Collegiate Header */}
          <div className="bg-slate-900 text-white px-6 sm:px-8 py-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-950 border border-amber-400 overflow-hidden flex-shrink-0">
                <Image
                  src="/logo.jpg"
                  alt={COLLEGE_NAME}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-400">
                  {COLLEGE_NAME}
                </p>
                <p className="text-[11px] text-slate-300">
                  Official Student Campus Entry Token
                </p>
              </div>
            </div>

            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[token.status] || 'bg-slate-100 text-slate-800'}`}>
              {token.status}
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Big Token Display Box */}
            <div className="bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-50/30 rounded-2xl p-6 border border-blue-100 text-center relative overflow-hidden">
              <span className="text-[10px] font-bold text-blue-900/70 uppercase tracking-widest block mb-1">
                Official Token Number
              </span>
              <p className="whitespace-nowrap font-mono text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-blue-950 tracking-normal sm:tracking-wider leading-none py-1">
                {token.tokenId}
              </p>

              {/* Copy Button */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={handleCopyToken}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Token ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Student Credential Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Student Name */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <User className="w-4 h-4 text-blue-900 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Student Name</p>
                  <p className="font-bold text-slate-900 mt-0.5 text-sm">{token.studentName}</p>
                </div>
              </div>

              {/* Hostel / Day Scholar */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Home className="w-4 h-4 text-blue-900 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Category</p>
                  <p className="font-bold text-slate-900 mt-0.5 text-sm">
                    {token.studentType || token.hostelOrDayScholar || 'Day Scholar'}
                  </p>
                </div>
              </div>

              {/* Section */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Layers className="w-4 h-4 text-blue-900 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Section</p>
                  <p className="font-bold text-slate-900 mt-0.5 text-sm font-mono">
                    Section {token.section}
                  </p>
                </div>
              </div>

              {/* Parent Mobile */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Phone className="w-4 h-4 text-blue-900 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Parent Contact</p>
                  <p className="font-medium text-slate-900 mt-0.5 font-mono">
                    {token.parentNumber ? `+91 ${token.parentNumber}` : 'Not Provided'}
                  </p>
                </div>
              </div>

              {/* Student Mobile */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Smartphone className="w-4 h-4 text-blue-900 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Student Mobile</p>
                  <p className="font-medium text-slate-900 mt-0.5 font-mono">+91 {token.studentMobile || token.studentWhatsApp}</p>
                </div>
              </div>

              {/* Issued Timestamp */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Calendar className="w-4 h-4 text-blue-900 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Issued Date & Time</p>
                  <p className="font-medium text-slate-900 mt-0.5">{token.generatedDate} • {token.generatedTime}</p>
                </div>
              </div>
            </div>



            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-98 disabled:opacity-60 transition-all"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 spinner" />
                    Preparing PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-amber-400" />
                    Download Token PDF
                  </>
                )}
              </button>

              <Link
                href={`/verify/${token.tokenId}`}
                className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs hover:shadow-xs active:scale-98 transition-all"
              >
                <QrCode className="w-4 h-4 text-blue-900" />
                View & Verify Pass
              </Link>

              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs hover:shadow-xs active:scale-98 transition-all"
              >
                <Share2 className="w-4 h-4 text-slate-600" />
                Share Pass
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home Portal
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

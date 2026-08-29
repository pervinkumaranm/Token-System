'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle2, Download, Calendar, Clock,
  User, Phone, ArrowLeft, Copy, Check,
  Shield, Share2, AlertCircle, Loader2, Home,
  Smartphone, Info
} from 'lucide-react';
import { getToken, getTokenPDFUrl, getWhatsAppStatus } from '@/lib/api';
import { COLLEGE_NAME, STATUS_COLORS } from '@/lib/constants';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface TokenData {
  tokenId: string;
  studentName: string;
  studentType?: string;
  hostelOrDayScholar?: string;
  parentNumber?: string;
  studentMobile?: string;
  studentWhatsApp?: string;
  generatedDate: string;
  generatedTime: string;
  status: string;
}

export default function TokenSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const tokenIdRaw = params.tokenId as string;
  // Safely extract and clean the token ID
  const tokenId = (tokenIdRaw || '').trim();

  const [token, setToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');
  const [whatsappStatus, setWhatsappStatus] = useState<'PENDING' | 'SENT' | 'FAILED' | null>(null);

  // Cached PDF Blob to avoid multiple network calls between Download and Share
  const pdfBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    async function fetchToken() {
      if (!tokenId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Try reading from cache first for instant load performance
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem(`token_data_${tokenId}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setToken(parsed);
            setLoading(false);
            return;
          } catch (e) {
            // Ignore parse errors and fetch fresh
          }
        }
      }

      try {
        setLoading(true);
        setNotFound(false);
        setError(false);
        const res = await getToken(tokenId);
        if (res.success && res.token) {
          setToken(res.token);
          // Cache it for subsequent back-button or direct visits
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(`token_data_${tokenId}`, JSON.stringify(res.token));
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('[FetchToken Error]', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchToken();
  }, [tokenId]);

  // Poll background WhatsApp status
  useEffect(() => {
    if (!tokenId || !token) return;

    let attempts = 0;
    const maxAttempts = 12; // Poll for up to 24 seconds (12 * 2s)

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await getWhatsAppStatus(tokenId);
        if (res.success && res.status) {
          setWhatsappStatus(res.status);
          // Stop polling once transitioned out of PENDING
          if (res.status === 'SENT' || res.status === 'FAILED') {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('[WhatsApp Polling Error]', err);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        // Fallback status if polling times out
        setWhatsappStatus(prev => prev === 'PENDING' ? 'FAILED' : prev);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [tokenId, token]);

  function getPdfFilename() {
    return `SSEC-${tokenId}.pdf`;
  }

  async function getOrFetchPDFBlob(): Promise<Blob> {
    if (pdfBlobRef.current) {
      return pdfBlobRef.current;
    }
    const url = getTokenPDFUrl(tokenId);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch PDF');
    const blob = await res.blob();
    pdfBlobRef.current = blob;
    return blob;
  }

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      const blob = await getOrFetchPDFBlob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = getPdfFilename();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  async function handleSharePDF() {
    setSharing(true);
    setShareError('');
    try {
      const blob = await getOrFetchPDFBlob();
      const filename = getPdfFilename();
      const file = new File([blob], filename, { type: 'application/pdf' });

      // Check if Web Share API with files is supported by this device/browser
      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `${COLLEGE_NAME} - Student Entry Token`,
          text: `Student Entry Token: ${tokenId}`,
        });
      } else {
        // Desktop / Unsupported browser fallback
        setShareError('PDF file sharing is not supported by this browser.');
      }
    } catch (err: any) {
      // User cancelled the share dialog — not a real error
      if (err?.name === 'AbortError') {
        // Do nothing
      } else {
        setShareError('Unable to share the PDF. Please download it and share manually.');
      }
    } finally {
      setSharing(false);
    }
  }

  function handleCopyToken() {
    navigator.clipboard.writeText(tokenId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4 shadow-sm">
            <Loader2 className="w-8 h-8 spinner" />
          </div>
          <p className="font-bold text-slate-800 text-base">Loading Token Details...</p>
          <p className="text-xs text-slate-400 mt-1 font-mono">{tokenId}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Token Not Found</h2>
            <p className="text-xs text-slate-500">The requested token could not be verified.</p>
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

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Unable to load token details</h2>
            <p className="text-xs text-slate-500">Please try again.</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 sm:col-span-2">
                <Calendar className="w-4 h-4 text-blue-900 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Issued Date & Time</p>
                  <p className="font-medium text-slate-900 mt-0.5">{token.generatedDate} • {token.generatedTime}</p>
                </div>
              </div>
            </div>
            {/* WhatsApp Status Indicator */}
            {whatsappStatus && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-semibold transition-all ${
                whatsappStatus === 'PENDING'
                  ? 'bg-slate-50 border-slate-200 text-slate-600 animate-pulse'
                  : whatsappStatus === 'SENT'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                {whatsappStatus === 'PENDING' ? (
                  <Loader2 className="w-4 h-4 spinner text-slate-500 mt-0.5 shrink-0" />
                ) : whatsappStatus === 'SENT' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">WhatsApp Delivery</p>
                  <p className="mt-0.5">
                    {whatsappStatus === 'PENDING'
                      ? 'Sending token PDF to WhatsApp...'
                      : whatsappStatus === 'SENT'
                      ? 'Token PDF sent successfully.'
                      : 'WhatsApp delivery failed. You can share the PDF manually.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 pt-0 space-y-6">
            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
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

              <button
                onClick={handleSharePDF}
                disabled={sharing}
                className="inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs hover:shadow-xs active:scale-98 transition-all"
              >
                {sharing ? (
                  <>
                    <Loader2 className="w-4 h-4 spinner" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-slate-600" />
                    Share PDF
                  </>
                )}
              </button>
            </div>

            {/* Share Fallback / Support Message */}
            {shareError && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-xs font-bold text-amber-900">{shareError}</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      You can download the token PDF to your device or share token details directly via WhatsApp.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={handleDownloadPDF}
                      disabled={downloading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-2xs transition-all active:scale-98"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`*${COLLEGE_NAME}*\nOfficial Student Entry Token: *${tokenId}*\nStudent Name: ${token.studentName}\nView Pass: https://token-system-coral.vercel.app/succrss/${tokenId}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all active:scale-98"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Open WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  User, Building2,
  Loader2, CheckCircle2, AlertCircle, Shield, ArrowLeft,
  Lock, Home, Check, Smartphone
} from 'lucide-react';
import { registerStudent } from '@/lib/api';
import { COLLEGE_NAME, COLLEGE_TAGLINE, STUDENT_TYPES } from '@/lib/constants';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface FormData {
  studentName: string;
  studentType: string; // 'Hostel' | 'Day Scholar' | ''
  parentNumber: string;
  studentMobile: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    studentName: '',
    studentType: '', // Initialized empty so validation triggers if not selected
    parentNumber: '',
    studentMobile: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setGlobalError('');
  }

  function handleTypeSelect(type: string) {
    setForm(prev => ({ ...prev, studentType: type }));
    if (errors.studentType || errors.hostelOrDayScholar) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.studentType;
        delete next.hostelOrDayScholar;
        return next;
      });
    }
    setGlobalError('');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // CRITICAL: Prevent default browser form submission (page refresh)
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setErrors({});
    setGlobalError('');

    // ── Client-side Validation ──
    const newErrors: Record<string, string> = {};

    if (!form.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    if (!form.studentType) {
      newErrors.studentType = 'Please select Hostel or Day Scholar';
    }

    // Parent Mobile Number is OPTIONAL - validate 10 digits only if provided
    if (form.parentNumber.trim() && !/^[6-9]\d{9}$/.test(form.parentNumber.trim())) {
      newErrors.parentNumber = 'Enter a valid 10-digit Indian mobile number';
    }

    // Student Mobile Number is REQUIRED
    if (!form.studentMobile.trim()) {
      newErrors.studentMobile = 'Student mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(form.studentMobile.trim())) {
      newErrors.studentMobile = 'Enter a valid 10-digit Indian mobile number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setLoading(true);
    try {
      // Dispatch API request with normalized payloads for 100% backend compatibility
      const res = await registerStudent({
        studentName: form.studentName.trim(),
        studentType: form.studentType,
        hostelOrDayScholar: form.studentType,
        parentNumber: form.parentNumber.trim() || undefined,
        parentMobile: form.parentNumber.trim() || undefined,
        studentMobile: form.studentMobile.trim(),
      });

      if (res && res.success && res.tokenId) {
        if (typeof window !== 'undefined' && res.token) {
          sessionStorage.setItem(`token_data_${res.tokenId}`, JSON.stringify(res.token));
        }
        // Redirect to success token page on clean completion
        router.push(`/succrss/${res.tokenId}`);
      } else if (res && res.errors) {
        const errMap: Record<string, string> = {};
        res.errors.forEach((err: { field: string; message: string }) => {
          const key = err.field === 'hostelOrDayScholar' ? 'studentType' : err.field;
          errMap[key] = err.message;
        });
        setErrors(errMap);
      } else {
        setGlobalError(res?.message || 'Unable to generate your token. Please try again.');
      }
    } catch (err: any) {
      console.error('[Registration Submission Error]', err);
      setGlobalError('Unable to generate your token. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* ── SPLIT SCREEN CONTAINER ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── LEFT SIDE: Branding & Highlights ── */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-950 border-2 border-amber-400 overflow-hidden flex-shrink-0 shadow-md">
                  <Image
                    src="/logo.jpg"
                    alt={COLLEGE_NAME}
                    width={56}
                    height={56}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-base font-bold leading-tight text-white">
                    {COLLEGE_NAME}
                  </h2>
                  <p className="text-xs text-amber-400 font-medium mt-0.5">
                    {COLLEGE_TAGLINE}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-2xl font-black tracking-tight text-white">
                  Fast, Verified Campus Entry Pass
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Enter your student credentials to receive your official entry pass instantly. Your token number is generated uniquely through atomic sequence locking.
                </p>
              </div>

              <div className="space-y-3.5 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Instant PDF Token</p>
                    <p className="text-[11px] text-slate-400">Download high-resolution official pass with QR code</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Secure Gate Scan</p>
                    <p className="text-[11px] text-slate-400">Security gates can scan and verify your token instantly</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Unique Sequential Pass</p>
                    <p className="text-[11px] text-slate-400">Permanently secured to prevent duplicates or collisions</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Official institutional verification system by SSEC Coimbatore.</span>
            </div>
          </div>

          {/* ── RIGHT SIDE: Registration Form ── */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg">
            <div className="mb-6 space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Register for Your Token
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Enter your details to receive your unique entry token.
              </p>
            </div>

            {/* Global Error Banner */}
            {globalError && (
              <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-rose-800 leading-snug">
                  {globalError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* 1. Student Name * */}
              <div>
                <label htmlFor="studentName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="studentName"
                    name="studentName"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full official name"
                    value={form.studentName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all ${
                      errors.studentName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.studentName && (
                  <p className="text-rose-500 text-xs font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.studentName}
                  </p>
                )}
              </div>

              {/* 2. Hostel / Day Scholar * */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hostel / Day Scholar <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {STUDENT_TYPES.map(type => {
                    const isSelected = form.studentType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTypeSelect(type)}
                        className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                            : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {type === 'Hostel' ? <Home className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                        <span>{type}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
                {errors.studentType && (
                  <p className="text-rose-500 text-xs font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.studentType}
                  </p>
                )}
              </div>

              {/* 3. Parent Mobile Number (OPTIONAL) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="parentNumber" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Parent Mobile Number
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    (Optional)
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    id="parentNumber"
                    name="parentNumber"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit number (optional)"
                    value={form.parentNumber}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 text-sm rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all ${
                      errors.parentNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.parentNumber && (
                  <p className="text-rose-500 text-xs font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.parentNumber}
                  </p>
                )}
              </div>

              {/* 4. Student Mobile Number * */}
              <div>
                <label htmlFor="studentMobile" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-900">
                    +91
                  </span>
                  <input
                    id="studentMobile"
                    name="studentMobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={form.studentMobile}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 text-sm rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all ${
                      errors.studentMobile ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  <Smartphone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {errors.studentMobile && (
                  <p className="text-rose-500 text-xs font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.studentMobile}
                  </p>
                )}
              </div>

              {/* Register & Get Token Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 spinner" />
                    Generating Token...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    Register & Get Token
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-400 pt-2">
                🔒 Your token number is generated uniquely and permanently recorded.
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

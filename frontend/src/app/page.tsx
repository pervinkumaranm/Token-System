'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, ShieldCheck, MessageSquare, QrCode, Zap,
  CheckCircle2, Lock, Sparkles, Clock, FileText, ChevronRight,
  GraduationCap, HelpCircle, PhoneCall, Award, Smartphone, Phone
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { COLLEGE_NAME, COLLEGE_SHORT } from '@/lib/constants';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Sticky Header with Admin Panel Top-Right */}
      <Navbar />

      {/* ───────────────────────────────────────────────────────────
          1. HERO SECTION
         ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-slate-50 border-b border-slate-100">
        {/* Subtle decorative background gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Official Digital Campus Token Portal 2026</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Smart Student Entry,<br />
                <span className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 bg-clip-text text-transparent">
                  Simplified.
                </span>
              </h1>

              {/* Supporting text */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Generate your unique entry token in seconds and enjoy a seamless, secure and organized campus entry experience at <span className="font-semibold text-slate-800">{COLLEGE_NAME}</span>.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-white bg-blue-900 hover:bg-blue-950 font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
                >
                  <span>Get Your Token</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 font-semibold text-sm shadow-xs transition-all duration-200"
                >
                  <span>How It Works</span>
                </Link>
              </div>

              {/* Feature Highlights Pills */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">No login required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">Instant PDF download</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">Instant QR verification</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual: Abstract Floating Token Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Decorative floating ring */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-amber-500 rounded-3xl blur-xl opacity-20 animate-pulse-glow" />

                {/* Main Pass Card */}
                <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden animate-float">
                  {/* Top Collegiate Banner */}
                  <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-950 border border-amber-400 overflow-hidden flex-shrink-0">
                        <Image
                          src="/logo.jpg"
                          alt="SSEC"
                          width={36}
                          height={36}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          {COLLEGE_SHORT} Campus Entry
                        </p>
                        <p className="text-[11px] text-slate-300 font-medium">
                          Digital Token Pass
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Active
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-5 bg-white">
                    {/* Big Token Number */}
                    <div className="text-center bg-slate-50 rounded-xl p-4 border border-slate-100 relative overflow-hidden">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Token Identification
                      </span>
                      <p className="text-2xl sm:text-3xl font-black font-mono text-blue-950 tracking-wider">
                        SSEC-2026-00128
                      </p>
                    </div>

                    {/* Student Info preview */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 col-span-2">
                        <p className="text-[10px] text-slate-400 font-medium uppercase">Student Name</p>
                        <p className="font-semibold text-slate-800 truncate mt-0.5">Karthik Raja M</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-medium uppercase">Category</p>
                        <p className="font-semibold text-slate-800 mt-0.5">Day Scholar</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-medium uppercase">Section</p>
                        <p className="font-semibold text-slate-800 font-mono mt-0.5">Section A</p>
                      </div>
                    </div>

                    {/* QR Code + Security Badge Strip */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <QrCode className="w-8 h-8 text-blue-900" />
                        <div>
                          <p className="font-bold text-slate-800 text-[11px]">QR Encrypted</p>
                          <p className="text-[10px] text-slate-400">Scan at entrance</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                          ✓ Token Verified
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Notification Badge */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-slate-100 p-3 flex items-center gap-3 animate-bounce [animation-duration:4s]">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Direct PDF Token</p>
                    <p className="text-[10px] text-slate-400">Download & Gate Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          2. TRUST / FEATURES SECTION (4 CARDS)
         ─────────────────────────────────────────────────────────── */}
      <section id="benefits" className="py-16 md:py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-700">
              Why Use SSEC Token Portal
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Designed for Speed, Security & Convenience
            </p>
            <p className="text-sm text-slate-500">
              A reliable digital pass system built to streamline student entry across all campus gates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-slate-50/60 rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Unique Token
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every student receives a secure unique token generated sequentially through atomic locking.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50/60 rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Instant PDF Pass
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download your official college entry pass with embedded QR code directly to your mobile device.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50/60 rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift transition-all group">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Secure Registration
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your registration details are securely stored and synced in official institutional databases.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-50/60 rounded-2xl p-6 border border-slate-200/80 shadow-xs hover-lift transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Quick & Easy
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete registration in just a few simple steps with zero logins and instantaneous pass generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          3. HOW IT WORKS (3-STEP TIMELINE)
         ─────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 md:py-24 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              3 Simple Steps
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              How The Token System Works
            </h2>
            <p className="text-sm text-slate-500">
              Follow these three seamless steps to receive your verified college entry pass.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs relative flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-black text-slate-200 font-mono">01</span>
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-900 font-bold flex items-center justify-center border border-blue-100">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Enter Your Details
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide your student name, category (Hostel / Day Scholar), section (A to O), parent contact, and mobile number.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs relative flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-black text-slate-200 font-mono">02</span>
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 font-bold flex items-center justify-center border border-amber-100">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Generate Your Token
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click register. The atomic concurrency server assigns an immutable, unique sequential token ID.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs relative flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-black text-slate-200 font-mono">03</span>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center border border-emerald-100">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Receive & Use Your Token
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download the official PDF pass or show the QR code on your phone screen at campus security gates.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white bg-blue-900 hover:bg-blue-950 font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <span>Start Registration Now</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          4. CAMPUS GUIDELINES / FAQ
         ─────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Entry Guidelines & FAQs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Essential instructions for a hassle-free college entry experience.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-900" />
                Do I need to carry a printed physical copy of the token?
              </h4>
              <p className="text-xs text-slate-600 mt-2 pl-4">
                Both printed PDF copies and digital tokens on your mobile phone screen are accepted at the security checkpoints.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-900" />
                Is Parent Mobile Number mandatory?
              </h4>
              <p className="text-xs text-slate-600 mt-2 pl-4">
                No, Parent Mobile Number is optional. You only need to provide your Student Name, Category, Section, and your Student Mobile Number.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-900" />
                How does Gate QR Verification work?
              </h4>
              <p className="text-xs text-slate-600 mt-2 pl-4">
                Gate security officers scan the QR code on your pass using their devices to verify your active student status and mark the pass as used upon entry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          5. BOTTOM CTA BANNER
         ─────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Generate Your SSEC Entry Token?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            It only takes 30 seconds. No login credentials needed. Instant delivery.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-slate-950 bg-amber-400 hover:bg-amber-300 font-bold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              <span>Get Your Token Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white bg-white/10 hover:bg-white/15 border border-white/20 font-semibold text-sm transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

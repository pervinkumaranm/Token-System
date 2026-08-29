'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Menu, X, ArrowRight, CheckCircle, GraduationCap } from 'lucide-react';
import { COLLEGE_NAME, COLLEGE_TAGLINE, COLLEGE_SHORT } from '@/lib/constants';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 shadow-sm backdrop-blur-md border-b border-slate-200/80 py-3'
          : 'bg-white/70 backdrop-blur-sm border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Left: College Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-sm flex-shrink-0 bg-blue-900 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/logo.jpg"
                alt={COLLEGE_NAME}
                width={44}
                height={44}
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg text-slate-900 leading-tight tracking-tight group-hover:text-blue-900 transition-colors">
                {COLLEGE_NAME}
              </span>
              <span className="text-xs font-medium text-blue-700/90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {COLLEGE_TAGLINE}
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link
              href="/"
              className="hover:text-blue-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-900 hover:after:w-full after:transition-all"
            >
              Home
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-blue-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-900 hover:after:w-full after:transition-all"
            >
              How It Works
            </Link>
            <Link
              href="/#benefits"
              className="hover:text-blue-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-900 hover:after:w-full after:transition-all"
            >
              Benefits
            </Link>
            <Link
              href="/register"
              className="text-blue-700 font-semibold hover:text-blue-900 transition-colors flex items-center gap-1"
            >
              Get Token
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-blue-100 text-blue-800 rounded-full">
                Instant
              </span>
            </Link>
            <Link
              href="/#contact"
              className="hover:text-blue-900 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-900 hover:after:w-full after:transition-all"
            >
              Contact
            </Link>
          </nav>

          {/* Right: ADMIN PANEL BUTTON (TOP-RIGHT CORNER) */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="relative inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-blue-950 border border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group"
            >
              <Shield className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
              <span>Admin Panel</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            How It Works
          </Link>
          <Link
            href="/#benefits"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Benefits
          </Link>
          <Link
            href="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50"
          >
            Get Your Token →
          </Link>
          <Link
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Contact & Support
          </Link>
          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              Admin Portal Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

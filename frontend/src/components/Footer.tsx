import Link from 'next/link';
import Image from 'next/image';
import { COLLEGE_NAME, COLLEGE_TAGLINE, COLLEGE_SHORT } from '@/lib/constants';
import { Shield, Phone, Mail, MapPin, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400/80 bg-blue-950 flex-shrink-0">
                <Image
                  src="/logo.jpg"
                  alt={COLLEGE_NAME}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-white text-sm leading-snug">{COLLEGE_NAME}</p>
                <p className="text-xs text-amber-400 font-medium">{COLLEGE_TAGLINE}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Approved by AICTE, New Delhi & Affiliated to Anna University, Chennai. Dedicated to academic excellence and seamless digital campus operations.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Token System Operational (v2.4)
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-amber-400 transition-colors font-medium text-blue-400">
                  Generate Student Token →
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-amber-400 transition-colors">
                  How Token System Works
                </Link>
              </li>
              <li>
                <Link href="/#benefits" className="hover:text-amber-400 transition-colors">
                  Features & Campus Benefits
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Campus & Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Campus Location
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  Sree Sakthi Engineering College<br />
                  Karamadai, Coimbatore — 641 104,<br />
                  Tamil Nadu, India.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>+91 94425 94444 / 04254 262333</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>admissions@sreesakthi.edu.in</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Token Guidelines */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Entry Verification
            </h4>
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 space-y-2 text-xs text-slate-300">
              <p className="font-semibold text-amber-400">Important Reminders:</p>
              <ul className="space-y-1.5 list-disc list-inside text-slate-400 text-[11px]">
                <li>One unique token per register number.</li>
                <li>Digital PDF & WhatsApp copy valid at entry gates.</li>
                <li>Physical or digital college ID card required.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {COLLEGE_NAME}. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Powered by SSEC Digital Campus System
          </p>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth';
import { usersApi } from '@/lib/api';
import { GHANA_UNIVERSITIES } from '@intemso/shared';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  IdentificationIcon,
  AcademicCapIcon,
  ChevronUpDownIcon,
  CheckIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

type AuthMethod = 'email' | 'ghana-card';

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: 'bg-gray-200' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-amber-500' };
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  return { score: 5, label: 'Excellent', color: 'bg-emerald-600' };
}

const CATEGORY_TILES = [
  { emoji: '🏃', name: 'Delivery' }, { emoji: '🎨', name: 'Design' }, { emoji: '💻', name: 'Dev' }, { emoji: '📚', name: 'Tutoring' },
  { emoji: '📸', name: 'Photo' }, { emoji: '🎪', name: 'Events' }, { emoji: '🍳', name: 'Cooking' }, { emoji: '📲', name: 'Social' },
  { emoji: '⌨️', name: 'Data Entry' }, { emoji: '🚗', name: 'Transport' }, { emoji: '🧹', name: 'Cleaning' }, { emoji: '✍️', name: 'Writing' },
];

export default function StudentRegisterPage() {
  const { register, registerWithGhanaCard } = useAuth();
  const router = useRouter();
  const [method, setMethod] = useState<AuthMethod>('email');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [ghanaCard, setGhanaCard] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // University combobox
  const [uniSearch, setUniSearch] = useState('');
  const [uniOpen, setUniOpen] = useState(false);
  const uniRef = useRef<HTMLDivElement>(null);

  // Parallax
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const sortedUnis = useMemo(
    () => [...GHANA_UNIVERSITIES].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const filteredUnis = useMemo(() => {
    if (!uniSearch.trim()) return sortedUnis;
    const q = uniSearch.toLowerCase();
    return sortedUnis.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.abbreviation.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q),
    );
  }, [uniSearch, sortedUnis]);

  const pwStrength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (uniRef.current && !uniRef.current.contains(e.target as Node)) setUniOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Mouse parallax ── */
  const onMove = useCallback((e: React.MouseEvent) => {
    if (!panelRef.current) return;
    const r = panelRef.current.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - r.left) / r.width - 0.5) * 2,
      y: ((e.clientY - r.top) / r.height - 0.5) * 2,
    });
  }, []);
  const onLeave = useCallback(() => setMouse({ x: 0, y: 0 }), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (method === 'email') {
        await register(email, password);
      } else {
        await registerWithGhanaCard({
          ghanaCardNumber: ghanaCard,
          fullName,
          password,
          role: 'student',
          university: university || undefined,
        });
      }

      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      try {
        await usersApi.updateStudentProfile({
          firstName,
          lastName,
          university: university || undefined,
        });
      } catch {
        // Best-effort
      }

      router.push('/');
    } catch (err: any) {
      const msg = Array.isArray(err?.message) ? err.message[0] : err?.message;
      setError(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ═══ Left Interactive Showcase ═══ */}
      <div
        ref={panelRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden cursor-default select-none"
      >
        {/* Deep background */}
        <div className="absolute inset-0 bg-[#020e08]" />

        {/* Aurora blobs — follow mouse */}
        <div
          className="absolute w-150 h-150 rounded-full blur-[160px] opacity-[0.25] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, transparent 70%)',
            top: `calc(15% + ${mouse.y * 25}px)`,
            left: `calc(5% + ${mouse.x * 25}px)`,
            transition: 'top 0.8s cubic-bezier(.17,.67,.35,.96), left 0.8s cubic-bezier(.17,.67,.35,.96)',
          }}
        />
        <div
          className="absolute w-125 h-125 rounded-full blur-[140px] opacity-[0.2] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(20,184,166,0.5) 0%, transparent 70%)',
            bottom: `calc(5% + ${mouse.y * -20}px)`,
            right: `calc(0% + ${mouse.x * -20}px)`,
            transition: 'bottom 1s cubic-bezier(.17,.67,.35,.96), right 1s cubic-bezier(.17,.67,.35,.96)',
          }}
        />

        {/* Mouse spotlight */}
        <div
          className="absolute w-62.5 h-62.5 rounded-full pointer-events-none opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, white 0%, transparent 70%)',
            top: `calc(${(mouse.y + 1) * 50}% - 125px)`,
            left: `calc(${(mouse.x + 1) * 50}% - 125px)`,
            transition: 'top 0.15s ease-out, left 0.15s ease-out',
          }}
        />

        {/* Content */}
        <div className="relative z-20 flex flex-col justify-between w-full px-12 xl:px-16 py-12">
          {/* Logo */}
          <div className={`flex items-center gap-3 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0 -translate-y-4'}`}>
            <div className="w-10 h-10 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-xl flex items-center justify-center">
              <AcademicCapIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xl font-bold text-white/90 tracking-tight">Intemso</span>
            <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/15">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[0.55rem] text-emerald-400/80 font-medium tracking-wider uppercase">Student</span>
            </div>
          </div>

          {/* Headline */}
          <div className="flex-1 flex flex-col justify-center -mt-4">
            <div className={`transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-[3.2rem] xl:text-[3.8rem] font-black text-white leading-[1.02] tracking-tighter mb-3">
                Your campus hustle{' '}
                <span
                  className="bg-linear-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent"
                  style={{ backgroundSize: '200% 100%', animation: 'gradient-x 4s ease-in-out infinite' }}
                >
                  starts here.
                </span>
              </h1>
              <p className="text-white/30 text-[0.8rem] max-w-xs leading-relaxed font-light">
                Every student has something to offer. Find gigs that fit your skills and schedule.
              </p>
            </div>

            {/* Cascading category tiles */}
            <div className="mt-10 grid grid-cols-4 gap-2">
              {CATEGORY_TILES.map((cat, i) => (
                <div
                  key={cat.name}
                  className={`group flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl
                    bg-white/4 border border-white/6 backdrop-blur-sm
                    hover:bg-white/10 hover:border-emerald-400/20 hover:scale-105
                    hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-500
                    ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90'}`}
                  style={{
                    transitionDelay: `${600 + i * 80}ms`,
                    transform: mounted ? `translate(${mouse.x * (2 + (i % 4))}px, ${mouse.y * (2 + (i % 3))}px)` : undefined,
                  }}
                >
                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
                  <span className="text-[0.55rem] font-medium text-white/35 group-hover:text-white/70 transition-colors">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom badges */}
          <div className={`flex flex-wrap items-center gap-2 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '1.5s' }}>
            {['No experience needed', '15 free applies/month', 'Instant withdrawals'].map((badge, i) => (
              <div key={badge} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/4 border border-white/6">
                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400/70" />
                <span className="text-[0.6rem] text-white/40">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Right Form Panel ═══ */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10 relative overflow-y-auto">
        <div className="absolute inset-0 bg-linear-to-br from-gray-50/50 via-white to-emerald-50/20" />

        <div className={`w-full max-w-104 relative z-10 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Intemso</span>
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create your account</h2>
            <p className="text-sm text-gray-400 mt-1.5">Start earning while you study</p>
          </div>

          {/* Auth method tabs */}
          <div className="flex bg-gray-100/80 rounded-xl p-1 mb-6 border border-gray-200/50">
            {(['email', 'ghana-card'] as AuthMethod[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMethod(m); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                  ${method === m
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5'
                    : 'text-gray-400 hover:text-gray-600'}`}
              >
                {m === 'email' ? <EnvelopeIcon className="w-4 h-4" /> : <IdentificationIcon className="w-4 h-4" />}
                {m === 'email' ? 'University Email' : 'Ghana Card'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full name</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none">
                  <UserIcon className="w-4 h-4 text-gray-300 group-focus-within:text-emerald-500 transition-colors duration-300" />
                </div>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder:text-gray-300 hover:border-gray-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300"
                  placeholder="Kwame Asante" required />
              </div>
            </div>

            {method === 'email' ? (
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">University email</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none">
                    <EnvelopeIcon className="w-4 h-4 text-gray-300 group-focus-within:text-emerald-500 transition-colors duration-300" />
                  </div>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder:text-gray-300 hover:border-gray-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300"
                    placeholder="you@st.ug.edu.gh" required />
                </div>
                <p className="text-[0.6rem] text-gray-400 mt-1.5">Must be your university domain email</p>
              </div>
            ) : (
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ghana Card Number</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none">
                    <IdentificationIcon className="w-4 h-4 text-gray-300 group-focus-within:text-emerald-500 transition-colors duration-300" />
                  </div>
                  <input type="text" value={ghanaCard} onChange={(e) => setGhanaCard(e.target.value.toUpperCase())}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder:text-gray-300 hover:border-gray-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 font-mono tracking-wide"
                    placeholder="GHA-XXXXXXXXX-X" pattern="GHA-\d{9}-\d" required />
                </div>
              </div>
            )}

            {/* University selector */}
            <div ref={uniRef} className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">University</label>
              <button type="button" onClick={() => setUniOpen((v) => !v)}
                className={`w-full flex items-center justify-between bg-gray-50/50 border rounded-xl px-4 py-3 text-sm text-left outline-none transition-all duration-300 hover:border-gray-300
                  ${uniOpen ? 'border-emerald-500 ring-2 ring-emerald-500/10 bg-white' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className={`w-4 h-4 transition-colors ${uniOpen ? 'text-emerald-500' : 'text-gray-300'}`} />
                  <span className={university ? 'text-gray-900 font-medium' : 'text-gray-300'}>
                    {university || 'Select your university'}
                  </span>
                </div>
                <ChevronUpDownIcon className={`w-4 h-4 transition-all ${uniOpen ? 'text-emerald-500 rotate-180' : 'text-gray-300'}`} />
              </button>
              {uniOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl shadow-gray-200/40 max-h-64 overflow-hidden animate-slide-up">
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input type="text" value={uniSearch} onChange={(e) => setUniSearch(e.target.value)}
                        className="w-full text-sm px-3 py-2 pl-9 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                        placeholder="Search universities..." autoFocus />
                    </div>
                  </div>
                  <ul className="max-h-48 overflow-y-auto py-1">
                    {filteredUnis.map((u) => (
                      <li key={u.name}>
                        <button type="button"
                          onClick={() => { setUniversity(u.name); setUniOpen(false); setUniSearch(''); }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors
                            ${university === u.name ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                            ${university === u.name ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                            {university === u.name && <CheckIcon className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className={university === u.name ? 'font-medium' : ''}>{u.name}</span>
                          <span className="ml-auto text-[0.6rem] text-gray-400 font-medium">{u.abbreviation}</span>
                        </button>
                      </li>
                    ))}
                    {filteredUnis.length === 0 && (
                      <li className="px-4 py-4 text-sm text-gray-400 text-center">No universities found</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 placeholder:text-gray-300 hover:border-gray-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300"
                  placeholder="Create a strong password" minLength={8} required />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all">
                  {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength.score ? pwStrength.color : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-[0.6rem] font-medium ${pwStrength.score <= 1 ? 'text-red-500' : pwStrength.score <= 2 ? 'text-orange-500' : pwStrength.score <= 3 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {pwStrength.label} password
                  </p>
                </div>
              )}
              {!password && <p className="text-[0.6rem] text-gray-400 mt-1.5">Minimum 8 characters</p>}
            </div>

            <p className="text-[0.6rem] text-gray-400 leading-relaxed">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-gray-500 underline underline-offset-2">Terms of Service</a>{' '}
              and{' '}
              <a href="/privacy" className="text-gray-500 underline underline-offset-2">Privacy Policy</a>.
            </p>

            <button type="submit" disabled={loading}
              className="relative w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/25 hover:-translate-y-px active:translate-y-0 overflow-hidden group/btn">
              <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              {loading ? (
                <span className="flex items-center justify-center gap-2 relative">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  Creating account...
                </span>
              ) : <span className="relative">Create Account</span>}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2.5">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">Sign in</Link>
            </p>
            <p className="text-xs text-gray-300">
              Employer?{' '}
              <a href={`${process.env.NEXT_PUBLIC_EMPLOYER_URL || 'https://hire.intemso.com'}/auth/register`}
                className="text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2">
                hire.intemso.com
              </a>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[0.65rem] text-gray-300">
            <ShieldCheckIcon className="w-3 h-3" />
            <span>256-bit SSL encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}

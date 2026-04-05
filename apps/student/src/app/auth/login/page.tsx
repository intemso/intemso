'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  IdentificationIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

type AuthMethod = 'email' | 'ghana-card';

const TYPEWRITER_WORDS = [
  'Deliver food across campus',
  'Design logos for startups',
  'Build mobile apps',
  'Tutor your classmates',
  'Photograph graduations',
  'Manage social media pages',
  'Cook for campus events',
  'Usher at conferences',
];

const FLOATING_GIGS = [
  { emoji: '🏃', name: 'Delivery', t: 12, l: 8 },
  { emoji: '🎨', name: 'Design', t: 6, l: 58 },
  { emoji: '💻', name: 'Code', t: 45, l: 76 },
  { emoji: '📚', name: 'Tutoring', t: 66, l: 10 },
  { emoji: '📸', name: 'Photo', t: 74, l: 55 },
  { emoji: '🎪', name: 'Events', t: 30, l: 42 },
  { emoji: '🍳', name: 'Cooking', t: 20, l: 80 },
  { emoji: '📲', name: 'Social', t: 85, l: 32 },
];

const LIVE_FEED = [
  { name: 'Kwame A.', action: 'earned GH₵250 from', gig: 'Logo Design' },
  { name: 'Ama B.', action: 'just completed', gig: 'Campus Food Delivery' },
  { name: 'Kofi M.', action: 'earned GH₵180 from', gig: 'Math Tutoring' },
  { name: 'Abena K.', action: 'started working on', gig: 'Event Photography' },
  { name: 'Yaw D.', action: 'earned GH₵500 from', gig: 'React App Build' },
];

export default function StudentLoginPage() {
  const { login, loginWithGhanaCard } = useAuth();
  const router = useRouter();
  const [method, setMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [ghanaCard, setGhanaCard] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* ── Interactive state ── */
  const [typeText, setTypeText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [feedIdx, setFeedIdx] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  /* ── Typewriter ── */
  useEffect(() => {
    const word = TYPEWRITER_WORDS[wordIdx];
    if (!deleting && typeText === word) {
      const t = setTimeout(() => setDeleting(true), 2200);
      return () => clearTimeout(t);
    }
    if (deleting && typeText === '') {
      setDeleting(false);
      setWordIdx((p) => (p + 1) % TYPEWRITER_WORDS.length);
      return;
    }
    const t = setTimeout(
      () => setTypeText(deleting ? word.slice(0, typeText.length - 1) : word.slice(0, typeText.length + 1)),
      deleting ? 25 : 60,
    );
    return () => clearTimeout(t);
  }, [typeText, deleting, wordIdx]);

  /* ── Activity rotation ── */
  useEffect(() => {
    const iv = setInterval(() => setFeedIdx((p) => (p + 1) % LIVE_FEED.length), 3500);
    return () => clearInterval(iv);
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
      if (method === 'email') { await login(email, password); }
      else { await loginWithGhanaCard(ghanaCard, password); }
      router.push('/');
    } catch (err: any) {
      const msg = Array.isArray(err?.message) ? err.message[0] : err?.message;
      setError(msg || 'Invalid credentials');
    } finally { setLoading(false); }
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
        <div
          className="absolute w-87.5 h-87.5 rounded-full blur-[120px] opacity-[0.15] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(52,211,153,0.5) 0%, transparent 70%)',
            top: `calc(55% + ${mouse.y * 30}px)`,
            right: `calc(25% + ${mouse.x * -30}px)`,
            transition: 'top 1.2s cubic-bezier(.17,.67,.35,.96), right 1.2s cubic-bezier(.17,.67,.35,.96)',
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

        {/* Floating gig category bubbles with parallax */}
        {FLOATING_GIGS.map((g, i) => (
          <div
            key={g.name}
            className="absolute z-10"
            style={{
              top: `${g.t}%`,
              left: `${g.l}%`,
              transform: `translate(${mouse.x * (6 + i * 2)}px, ${mouse.y * (6 + i * 2)}px)`,
              transition: 'transform 0.6s cubic-bezier(.17,.67,.35,.96)',
              animation: mounted ? `float-orbit-${(i % 3) + 1} ${10 + i * 1.5}s ease-in-out infinite ${i * 0.7}s` : 'none',
            }}
          >
            <div
              className={`group backdrop-blur-md bg-white/5 border border-white/7 rounded-2xl px-3 py-2
                flex items-center gap-2 hover:bg-white/12 hover:border-emerald-400/20 hover:scale-110
                hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-500
                ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
              style={{ transitionDelay: `${800 + i * 120}ms` }}
            >
              <span className="text-base leading-none">{g.emoji}</span>
              <span className="text-[0.6rem] font-medium text-white/40 group-hover:text-white/80 transition-colors duration-300">
                {g.name}
              </span>
            </div>
          </div>
        ))}

        {/* Content layer */}
        <div className="relative z-20 flex flex-col justify-between w-full px-12 xl:px-16 py-12 pointer-events-none">
          {/* Logo */}
          <div className={`flex items-center gap-3 pointer-events-auto transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0 -translate-y-4'}`}>
            <div className="w-10 h-10 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-xl flex items-center justify-center">
              <AcademicCapIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xl font-bold text-white/90 tracking-tight">Intemso</span>
            <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/15">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[0.55rem] text-emerald-400/80 font-medium tracking-wider uppercase">Student</span>
            </div>
          </div>

          {/* Headline + typewriter */}
          <div className="flex-1 flex flex-col justify-center -mt-4">
            <div className={`transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-[3.5rem] xl:text-[4.2rem] font-black text-white leading-[1.02] tracking-tighter">
                Earn while<br />
                <span
                  className="bg-linear-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent"
                  style={{ backgroundSize: '200% 100%', animation: 'gradient-x 4s ease-in-out infinite' }}
                >
                  you learn.
                </span>
              </h1>
              <div className="mt-5 h-8 flex items-center">
                <span className="text-lg xl:text-xl font-light tracking-wide text-white/50">
                  {typeText}
                </span>
                <span
                  className="inline-block w-0.5 h-5 bg-emerald-400 ml-0.5"
                  style={{ animation: 'cursor-blink 1s step-end infinite' }}
                />
              </div>
              <p className="text-white/25 text-[0.8rem] mt-8 max-w-xs leading-relaxed font-light">
                320+ gig types across 23 categories. From zero-skill errands to expert freelancing.
                Your campus, your schedule, your hustle.
              </p>
            </div>
          </div>

          {/* Live activity feed */}
          <div
            className={`pointer-events-auto transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '1.2s' }}
          >
            <div className="bg-white/3 backdrop-blur-sm border border-white/5 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="relative flex items-center justify-center w-4 h-4">
                  <div className="absolute w-2 h-2 rounded-full bg-emerald-400" />
                  <div className="absolute w-4 h-4 rounded-full bg-emerald-400/30 animate-ping" />
                </div>
                <span className="text-[0.55rem] text-white/25 uppercase tracking-[0.2em] font-medium">Live on Intemso</span>
              </div>
              <div className="relative h-5 overflow-hidden">
                {LIVE_FEED.map((a, i) => (
                  <div
                    key={i}
                    className="absolute inset-x-0 flex items-center gap-1.5 text-[0.75rem] transition-all duration-500"
                    style={{ opacity: i === feedIdx ? 1 : 0, transform: `translateY(${i === feedIdx ? 0 : 8}px)` }}
                  >
                    <span className="text-emerald-300/90 font-semibold">{a.name}</span>
                    <span className="text-white/35">{a.action}</span>
                    <span className="text-white/70 font-medium">{a.gig}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Right Form Panel ═══ */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-12 relative">
        <div className="absolute inset-0 bg-linear-to-br from-gray-50/50 via-white to-emerald-50/20" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

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

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-gray-400 mt-1.5">Sign in to your student dashboard</p>
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
                {m === 'email' ? 'Email' : 'Ghana Card'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {method === 'email' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">University email</label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none">
                    <EnvelopeIcon className="w-4 h-4 text-gray-300 group-focus-within:text-emerald-500 transition-colors duration-300" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder:text-gray-300 hover:border-gray-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300"
                    placeholder="you@st.ug.edu.gh"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ghana Card Number</label>
                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center pointer-events-none">
                    <IdentificationIcon className="w-4 h-4 text-gray-300 group-focus-within:text-emerald-500 transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    value={ghanaCard}
                    onChange={(e) => setGhanaCard(e.target.value.toUpperCase())}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder:text-gray-300 hover:border-gray-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 font-mono tracking-wide"
                    placeholder="GHA-XXXXXXXXX-X"
                    pattern="GHA-\d{9}-\d"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <a href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://intemso.com'}/auth/forgot-password`} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative group">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 placeholder:text-gray-300 hover:border-gray-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all"
                >
                  {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/25 hover:-translate-y-px active:translate-y-0 overflow-hidden group/btn"
            >
              <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              {loading ? (
                <span className="flex items-center justify-center gap-2 relative">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  Signing in...
                </span>
              ) : <span className="relative">Sign In</span>}
            </button>
          </form>

          <div className="mt-8 text-center space-y-2.5">
            <p className="text-sm text-gray-400">
              New here?{' '}
              <Link href="/auth/register" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Create account
              </Link>
            </p>
            <p className="text-xs text-gray-300">
              Employer?{' '}
              <a
                href={`${process.env.NEXT_PUBLIC_EMPLOYER_URL || 'https://hire.intemso.com'}/auth/login`}
                className="text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
              >
                hire.intemso.com
              </a>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-1.5 text-[0.65rem] text-gray-300">
            <ShieldCheckIcon className="w-3 h-3" />
            <span>256-bit SSL encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}

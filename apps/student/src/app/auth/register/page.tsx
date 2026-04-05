'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
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
  SparklesIcon,
  RocketLaunchIcon,
  MagnifyingGlassIcon,
  StarIcon,
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

      // Update student profile with name + university
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
      {/* ───── Left Showcase Panel ───── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Animated gradient mesh - emerald theme */}
        <div className="absolute inset-0 bg-[#062a1e]">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-600/50 blur-[120px] animate-float-slow" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-500/40 blur-[100px] animate-float-slower" />
            <div className="absolute top-[40%] right-[20%] w-[40%] h-[40%] rounded-full bg-green-400/30 blur-[80px] animate-float-slow" style={{ animationDelay: '4s' }} />
          </div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full px-12 xl:px-16 py-12">
          {/* Logo */}
          <div className={`flex items-center gap-3 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="w-11 h-11 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Intemso</span>
          </div>

          {/* Hero content */}
          <div className="flex-1 flex flex-col justify-center -mt-8">
            <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/20 backdrop-blur-sm mb-8">
                <RocketLaunchIcon className="w-3.5 h-3.5 text-teal-300" />
                <span className="text-xs font-medium text-teal-200 tracking-wide">JOIN FREE TODAY</span>
              </div>
              <h1 className="text-[2.75rem] xl:text-[3.25rem] font-extrabold text-white leading-[1.1] tracking-tight mb-5">
                Launch your<br />
                <span className="bg-linear-to-r from-emerald-300 via-teal-300 to-green-300 bg-clip-text text-transparent">freelance career</span>
              </h1>
              <p className="text-emerald-200/80 text-[1.05rem] leading-relaxed max-w-md">
                Join thousands of students earning through gigs while studying at Ghanaian universities.
              </p>
            </div>

            {/* Earnings preview card */}
            <div className={`mt-10 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                <p className="text-[0.65rem] text-emerald-300/60 uppercase tracking-wider font-medium mb-3">What students are earning</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { cat: 'Design', range: 'GH₵200-800', emoji: '🎨' },
                    { cat: 'Tutoring', range: 'GH₵150-500', emoji: '📚' },
                    { cat: 'Delivery', range: 'GH₵50-200', emoji: '🏃' },
                  ].map((item) => (
                    <div key={item.cat} className="text-center">
                      <div className="text-lg mb-1">{item.emoji}</div>
                      <p className="text-xs font-medium text-white/90">{item.cat}</p>
                      <p className="text-[0.6rem] text-emerald-300/50 mt-0.5">{item.range}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom badges */}
          <div className={`flex flex-wrap items-center gap-2 transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            {['100+ universities', 'No experience needed', '60% zero-skill gigs'].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[0.65rem] text-emerald-200/70">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ───── Right Form Panel ───── */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10 relative overflow-y-auto">
        <div className="absolute inset-0 bg-linear-to-br from-gray-50/50 via-white to-emerald-50/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

        <div className={`w-full max-w-104 relative z-10 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/25">
                <AcademicCapIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Intemso</span>
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-[1.75rem] font-extrabold text-gray-900 tracking-tight">Create your account</h2>
            <p className="text-sm text-gray-500 mt-1.5">Start earning while you study</p>
          </div>

          {/* Auth method tabs */}
          <div className="flex bg-gray-100/80 rounded-2xl p-1.5 mb-6 border border-gray-200/50">
            {(['email', 'ghana-card'] as AuthMethod[]).map((m) => (
              <button key={m} type="button"
                onClick={() => { setMethod(m); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                  ${method === m
                    ? 'bg-white text-gray-900 shadow-md shadow-gray-200/50 ring-1 ring-gray-200/60'
                    : 'text-gray-500 hover:text-gray-700'}`}>
                {m === 'email' ? <EnvelopeIcon className="w-4 h-4" /> : <IdentificationIcon className="w-4 h-4" />}
                {m === 'email' ? 'University Email' : 'Ghana Card'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl px-4 py-3.5 animate-slide-up">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full name</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">
                  <UserIcon className="w-[1.1rem] h-[1.1rem] text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:ring-[3px] focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-200"
                  placeholder="Kwame Asante" required />
              </div>
            </div>

            {method === 'email' ? (
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">University email</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">
                    <EnvelopeIcon className="w-[1.1rem] h-[1.1rem] text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:ring-[3px] focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-200"
                    placeholder="you@st.ug.edu.gh" required />
                </div>
                <p className="text-[0.65rem] text-gray-400 mt-1.5">Must be your university domain email (not Gmail or Outlook)</p>
              </div>
            ) : (
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ghana Card Number</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">
                    <IdentificationIcon className="w-[1.1rem] h-[1.1rem] text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input type="text" value={ghanaCard} onChange={(e) => setGhanaCard(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:ring-[3px] focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-200 font-mono tracking-wide"
                    placeholder="GHA-XXXXXXXXX-X" pattern="GHA-\d{9}-\d" required />
                </div>
              </div>
            )}

            {/* University selector - enhanced */}
            <div ref={uniRef} className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">University</label>
              <button type="button" onClick={() => setUniOpen((v) => !v)}
                className={`w-full flex items-center justify-between bg-white border rounded-2xl px-4 py-3.5 text-sm text-left outline-none transition-all duration-200 hover:border-gray-300
                  ${uniOpen ? 'border-emerald-500 ring-[3px] ring-emerald-500/10' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className={`w-[1.1rem] h-[1.1rem] transition-colors ${uniOpen ? 'text-emerald-500' : 'text-gray-400'}`} />
                  <span className={university ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                    {university || 'Select your university'}
                  </span>
                </div>
                <ChevronUpDownIcon className={`w-4 h-4 transition-all ${uniOpen ? 'text-emerald-500 rotate-180' : 'text-gray-400'}`} />
              </button>
              {uniOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/40 max-h-64 overflow-hidden animate-slide-up">
                  <div className="p-2.5 border-b border-gray-100">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={uniSearch} onChange={(e) => setUniSearch(e.target.value)}
                        className="w-full text-sm px-3 py-2.5 pl-9 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-[3px] focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
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
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                            ${university === u.name ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                            {university === u.name && <CheckIcon className="w-3 h-3 text-white" />}
                          </div>
                          <span className={university === u.name ? 'font-medium' : ''}>{u.name}</span>
                          <span className="ml-auto text-[0.65rem] text-gray-400 font-medium">{u.abbreviation}</span>
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
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pr-12 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:ring-[3px] focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-200"
                  placeholder="Create a strong password" minLength={8} required />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                  {showPw ? <EyeSlashIcon className="w-[1.15rem] h-[1.15rem]" /> : <EyeIcon className="w-[1.15rem] h-[1.15rem]" />}
                </button>
              </div>
              {/* Password strength meter */}
              {password && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength.score ? pwStrength.color : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <p className={`text-[0.65rem] font-medium ${pwStrength.score <= 1 ? 'text-red-500' : pwStrength.score <= 2 ? 'text-orange-500' : pwStrength.score <= 3 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {pwStrength.label} password
                  </p>
                </div>
              )}
              {!password && <p className="text-[0.65rem] text-gray-400 mt-1.5">Minimum 8 characters</p>}
            </div>

            {/* Terms */}
            <p className="text-[0.65rem] text-gray-400 leading-relaxed">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-gray-500 underline underline-offset-2">Terms of Service</a>{' '}
              and{' '}
              <a href="/privacy" className="text-gray-500 underline underline-offset-2">Privacy Policy</a>.
            </p>

            <button type="submit" disabled={loading}
              className="relative w-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3.5 rounded-2xl text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-px active:translate-y-0 group/btn overflow-hidden">
              <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              {loading ? (
                <span className="flex items-center justify-center gap-2 relative">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" /></svg>
                  Creating account...
                </span>
              ) : <span className="relative">Create Account</span>}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">Sign in</Link>
            </p>
            <p className="text-sm text-gray-400">
              Are you an employer?{' '}
              <a href={`${process.env.NEXT_PUBLIC_EMPLOYER_URL || 'https://hire.intemso.com'}/auth/register`}
                className="font-medium text-gray-600 hover:text-gray-800 transition-colors underline underline-offset-2 decoration-gray-300 hover:decoration-gray-500">
                Employer Portal
              </a>
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[0.7rem] text-gray-400">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Your data is protected with 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}

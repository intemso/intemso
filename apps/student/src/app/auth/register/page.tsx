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
} from '@heroicons/react/24/outline';

type AuthMethod = 'email' | 'ghana-card';

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

  // University combobox
  const [uniSearch, setUniSearch] = useState('');
  const [uniOpen, setUniOpen] = useState(false);
  const uniRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <img src="/auth-register.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-br from-emerald-900/80 via-emerald-800/60 to-teal-900/70" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Intemso</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Launch your<br />freelance career
          </h1>
          <p className="text-emerald-100 text-lg leading-relaxed max-w-md">
            Join thousands of students earning through gigs while studying at Ghanaian universities.
          </p>
          <div className="mt-12 space-y-4">
            {['Use your university email or Ghana Card', 'Get matched with real employers', 'Build a verified portfolio'].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-emerald-50 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                <AcademicCapIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Intemso</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-sm text-gray-500 mt-1">Register as a student on Intemso</p>
          </div>

          {/* Auth method tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button type="button" onClick={() => { setMethod('email'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${method === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <EnvelopeIcon className="w-4 h-4" /> University Email
            </button>
            <button type="button" onClick={() => { setMethod('ghana-card'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${method === 'ghana-card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <IdentificationIcon className="w-4 h-4" /> Ghana Card
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                placeholder="Kwame Asante" required />
            </div>

            {method === 'email' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">University email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="you@st.ug.edu.gh" required />
                </div>
                <p className="text-xs text-gray-400 mt-1">Must be your university domain email (not Gmail or Outlook)</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghana Card Number</label>
                <div className="relative">
                  <IdentificationIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={ghanaCard} onChange={(e) => setGhanaCard(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition font-mono"
                    placeholder="GHA-XXXXXXXXX-X" pattern="GHA-\d{9}-\d" required />
                </div>
              </div>
            )}

            {/* University selector */}
            <div ref={uniRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">University</label>
              <button type="button" onClick={() => setUniOpen((v) => !v)}
                className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-left focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition">
                <span className={university ? 'text-gray-900' : 'text-gray-400'}>
                  {university || 'Select your university'}
                </span>
                <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />
              </button>
              {uniOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <input type="text" value={uniSearch} onChange={(e) => setUniSearch(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Search universities..." autoFocus />
                  </div>
                  <ul className="max-h-48 overflow-y-auto">
                    {filteredUnis.map((u) => (
                      <li key={u.name}>
                        <button type="button"
                          onClick={() => { setUniversity(u.name); setUniOpen(false); setUniSearch(''); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 text-left">
                          {university === u.name && <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />}
                          <span className={university === u.name ? 'font-medium text-emerald-700' : ''}>{u.name}</span>
                          <span className="ml-auto text-xs text-gray-400">{u.abbreviation}</span>
                        </button>
                      </li>
                    ))}
                    {filteredUnis.length === 0 && (
                      <li className="px-4 py-3 text-sm text-gray-500 text-center">No universities found</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="Create a strong password" minLength={8} required />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" /></svg>
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-emerald-600 font-medium hover:underline">Sign in</Link>
            </p>
            <p className="text-sm text-gray-500">
              Are you an employer?{' '}
              <a href={`${process.env.NEXT_PUBLIC_EMPLOYER_URL || 'https://hire.intemso.com'}/auth/register`}
                className="text-emerald-600 font-medium hover:underline">Employer Portal</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

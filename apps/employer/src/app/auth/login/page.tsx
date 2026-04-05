'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  IdentificationIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

type AuthMethod = 'email' | 'ghana-card';

export default function EmployerLoginPage() {
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

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (method === 'email') {
        await login(email, password);
      } else {
        await loginWithGhanaCard(ghanaCard, password);
      }
      router.push('/');
    } catch (err: any) {
      const msg = Array.isArray(err?.message) ? err.message[0] : err?.message;
      setError(msg || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ───── Left Showcase Panel ───── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 bg-[#0a1628]">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/50 blur-[120px] animate-float-slow" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/40 blur-[100px] animate-float-slower" />
            <div className="absolute top-[40%] right-[20%] w-[40%] h-[40%] rounded-full bg-cyan-400/30 blur-[80px] animate-float-slow" style={{ animationDelay: '4s' }} />
          </div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full px-12 xl:px-16 py-12">
          {/* Logo */}
          <div className={`flex items-center gap-3 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="w-11 h-11 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
              <BriefcaseIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Intemso</span>
          </div>

          {/* Hero content */}
          <div className="flex-1 flex flex-col justify-center -mt-8">
            <div className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/20 backdrop-blur-sm mb-8">
                <SparklesIcon className="w-3.5 h-3.5 text-blue-300" />
                <span className="text-xs font-medium text-blue-200 tracking-wide">EMPLOYER PORTAL</span>
              </div>
              <h1 className="text-[2.75rem] xl:text-[3.25rem] font-extrabold text-white leading-[1.1] tracking-tight mb-5">
                Find the perfect<br />
                <span className="bg-linear-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">student talent</span>
              </h1>
              <p className="text-blue-200/80 text-[1.05rem] leading-relaxed max-w-md">
                Post gigs, review proposals, and collaborate with verified university students from 100+ campuses across Ghana.
              </p>
            </div>

            {/* Floating stat cards */}
            <div className={`mt-10 grid grid-cols-3 gap-3 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {[
                { icon: UserGroupIcon, val: '5,000+', label: 'Students', color: 'from-blue-500/20 to-blue-600/10' },
                { icon: ShieldCheckIcon, val: '100%', label: 'Escrow protected', color: 'from-cyan-500/20 to-cyan-600/10' },
                { icon: CurrencyDollarIcon, val: 'Free', label: 'To post gigs', color: 'from-indigo-500/20 to-indigo-600/10' },
              ].map((stat) => (
                <div key={stat.label} className={`group relative bg-linear-to-br ${stat.color} backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5`}>
                  <stat.icon className="w-5 h-5 text-blue-300/80 mb-2" />
                  <p className="text-lg font-bold text-white">{stat.val}</p>
                  <p className="text-[0.7rem] text-blue-300/60 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom trust */}
          <div className={`flex items-center gap-4 transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex -space-x-2">
              {[...'ABCD'].map((l, i) => (
                <div key={l} className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 border-2 border-[#0a1628] flex items-center justify-center text-[0.65rem] font-bold text-white" style={{ zIndex: 4 - i }}>
                  {l}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-blue-200/70 leading-tight">Trusted by employers across Ghana</p>
              <div className="flex items-center gap-1 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
                <span className="text-[0.65rem] text-blue-300/50 ml-1">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Right Form Panel ───── */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-12 relative">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-linear-to-br from-gray-50/50 via-white to-blue-50/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

        <div className={`w-full max-w-104 relative z-10 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25">
                <BriefcaseIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Intemso</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-[1.75rem] font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1.5">Sign in to manage your gigs and contracts</p>
          </div>

          {/* Auth method tabs */}
          <div className="flex bg-gray-100/80 rounded-2xl p-1.5 mb-7 border border-gray-200/50">
            {(['email', 'ghana-card'] as AuthMethod[]).map((m) => (
              <button key={m} type="button"
                onClick={() => { setMethod(m); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                  ${method === m
                    ? 'bg-white text-gray-900 shadow-md shadow-gray-200/50 ring-1 ring-gray-200/60'
                    : 'text-gray-500 hover:text-gray-700'}`}>
                {m === 'email' ? <EnvelopeIcon className="w-4 h-4" /> : <IdentificationIcon className="w-4 h-4" />}
                {m === 'email' ? 'Email' : 'Ghana Card'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl px-4 py-3.5 animate-slide-up">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <span>{error}</span>
              </div>
            )}

            {method === 'email' ? (
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">
                    <EnvelopeIcon className="w-[1.1rem] h-[1.1rem] text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:ring-[3px] focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-200"
                    placeholder="you@company.com" required />
                </div>
              </div>
            ) : (
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ghana Card Number</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">
                    <IdentificationIcon className="w-[1.1rem] h-[1.1rem] text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input type="text" value={ghanaCard} onChange={(e) => setGhanaCard(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:ring-[3px] focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-200 font-mono tracking-wide"
                    placeholder="GHA-XXXXXXXXX-X" pattern="GHA-\d{9}-\d" required />
                </div>
              </div>
            )}

            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <Link href="/auth/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pr-12 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:ring-[3px] focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-200"
                  placeholder="Enter your password" required />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                  {showPw ? <EyeSlashIcon className="w-[1.15rem] h-[1.15rem]" /> : <EyeIcon className="w-[1.15rem] h-[1.15rem]" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="relative w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 rounded-2xl text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-px active:translate-y-0 group/btn overflow-hidden">
              <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              {loading ? (
                <span className="flex items-center justify-center gap-2 relative">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" /></svg>
                  Signing in...
                </span>
              ) : <span className="relative">Sign In</span>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Create account
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Are you a student?{' '}
              <a href={`${process.env.NEXT_PUBLIC_STUDENT_URL || 'https://jobs.intemso.com'}/auth/login`}
                className="font-medium text-gray-600 hover:text-gray-800 transition-colors underline underline-offset-2 decoration-gray-300 hover:decoration-gray-500">
                Student Portal
              </a>
            </p>
          </div>

          {/* Trust badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-[0.7rem] text-gray-400">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Protected with 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  AcademicCapIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  StarIcon,
  SparklesIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

type AuthMethod = 'email' | 'ghana-card';

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
        {/* Animated gradient mesh - emerald/teal theme */}
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/20 backdrop-blur-sm mb-8">
                <SparklesIcon className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-xs font-medium text-emerald-200 tracking-wide">STUDENT PORTAL</span>
              </div>
              <h1 className="text-[2.75rem] xl:text-[3.25rem] font-extrabold text-white leading-[1.1] tracking-tight mb-5">
                Your gigs are<br />
                <span className="bg-linear-to-r from-emerald-300 via-green-300 to-teal-300 bg-clip-text text-transparent">waiting for you</span>
              </h1>
              <p className="text-emerald-200/80 text-[1.05rem] leading-relaxed max-w-md">
                Sign in to browse opportunities, track contracts, and manage your freelance earnings.
              </p>
            </div>

            {/* Floating stat cards */}
            <div className={`mt-10 grid grid-cols-3 gap-3 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {[
                { icon: BriefcaseIcon, val: '320+', label: 'Gig types', color: 'from-emerald-500/20 to-emerald-600/10' },
                { icon: ShieldCheckIcon, val: '100%', label: 'Secure pay', color: 'from-teal-500/20 to-teal-600/10' },
                { icon: CurrencyDollarIcon, val: 'Instant', label: 'Withdrawals', color: 'from-green-500/20 to-green-600/10' },
              ].map((stat) => (
                <div key={stat.label} className={`group relative bg-linear-to-br ${stat.color} backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5`}>
                  <stat.icon className="w-5 h-5 text-emerald-300/80 mb-2" />
                  <p className="text-lg font-bold text-white">{stat.val}</p>
                  <p className="text-[0.7rem] text-emerald-300/60 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom testimonial */}
          <div className={`transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-white/80 leading-relaxed italic">&ldquo;I earned enough to cover my semester&apos;s expenses just from doing gigs on Intemso during holiday.&rdquo;</p>
              <div className="flex items-center gap-2.5 mt-3">
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-[0.6rem] font-bold text-white">K</div>
                <div>
                  <p className="text-xs font-medium text-white/90">Kofi A.</p>
                  <p className="text-[0.6rem] text-emerald-300/50">University of Ghana</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Right Form Panel ───── */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-12 relative">
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

          <div className="mb-8">
            <h2 className="text-[1.75rem] font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1.5">Sign in to your student dashboard</p>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">University email</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">
                    <EnvelopeIcon className="w-[1.1rem] h-[1.1rem] text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:ring-[3px] focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-200"
                    placeholder="you@st.ug.edu.gh" required />
                </div>
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

            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <Link href="/auth/forgot-password" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pr-12 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:ring-[3px] focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-200"
                  placeholder="Enter your password" required />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                  {showPw ? <EyeSlashIcon className="w-[1.15rem] h-[1.15rem]" /> : <EyeIcon className="w-[1.15rem] h-[1.15rem]" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="relative w-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3.5 rounded-2xl text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-px active:translate-y-0 group/btn overflow-hidden">
              <span className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              {loading ? (
                <span className="flex items-center justify-center gap-2 relative">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" /></svg>
                  Signing in...
                </span>
              ) : <span className="relative">Sign In</span>}
            </button>
          </form>

          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-linear-to-r from-transparent via-gray-200 to-transparent" />
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                Create account
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Are you an employer?{' '}
              <a href={`${process.env.NEXT_PUBLIC_EMPLOYER_URL || 'https://hire.intemso.com'}/auth/login`}
                className="font-medium text-gray-600 hover:text-gray-800 transition-colors underline underline-offset-2 decoration-gray-300 hover:decoration-gray-500">
                Employer Portal
              </a>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[0.7rem] text-gray-400">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Protected with 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}

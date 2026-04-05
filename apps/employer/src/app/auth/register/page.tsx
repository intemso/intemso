'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth';
import { usersApi } from '@/lib/api';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  IdentificationIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  BuildingOffice2Icon,
  UserIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ClockIcon,
  BoltIcon,
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

export default function EmployerRegisterPage() {
  const { register, registerWithGhanaCard } = useAuth();
  const router = useRouter();
  const [method, setMethod] = useState<AuthMethod>('email');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [ghanaCard, setGhanaCard] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const pwStrength = useMemo(() => getPasswordStrength(password), [password]);

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
          role: 'employer',
        });
      }

      // Update employer profile with name and company
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      try {
        await usersApi.updateEmployerProfile({
          businessName: company || undefined,
          contactPerson: fullName || undefined,
        });
      } catch {
        // Profile update is best-effort, account is already created
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
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 bg-[#0a1628]">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/50 blur-[120px] animate-float-slow" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-500/40 blur-[100px] animate-float-slower" />
            <div className="absolute top-[40%] right-[20%] w-[40%] h-[40%] rounded-full bg-cyan-400/30 blur-[80px] animate-float-slow" style={{ animationDelay: '4s' }} />
          </div>
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/15 border border-violet-400/20 backdrop-blur-sm mb-8">
                <RocketLaunchIcon className="w-3.5 h-3.5 text-violet-300" />
                <span className="text-xs font-medium text-violet-200 tracking-wide">GET STARTED FREE</span>
              </div>
              <h1 className="text-[2.75rem] xl:text-[3.25rem] font-extrabold text-white leading-[1.1] tracking-tight mb-5">
                Start building<br />
                <span className="bg-linear-to-r from-blue-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">your dream team</span>
              </h1>
              <p className="text-blue-200/80 text-[1.05rem] leading-relaxed max-w-md">
                Join hundreds of employers discovering verified student talent across 100+ Ghanaian campuses.
              </p>
            </div>

            {/* Steps preview */}
            <div className={`mt-10 space-y-3 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {[
                { icon: UserIcon, text: 'Create your free account', time: '2 min' },
                { icon: BuildingOffice2Icon, text: 'Post your first gig', time: '5 min' },
                { icon: BoltIcon, text: 'Start receiving proposals', time: 'Instant' },
              ].map((step, i) => (
                <div key={step.text} className="flex items-center gap-4 group">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center group-hover:bg-white/15 group-hover:border-white/20 transition-all">
                      <step.icon className="w-5 h-5 text-blue-300" />
                    </div>
                    {i < 2 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-3 bg-white/10" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/90">{step.text}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[0.65rem] text-blue-300/50">
                    <ClockIcon className="w-3 h-3" />
                    {step.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom social proof */}
          <div className={`flex items-center gap-4 transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-blue-200/70">No credit card required</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-blue-200/70">Free to post gigs</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Right Form Panel ───── */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10 relative">
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

          <div className="mb-7">
            <h2 className="text-[1.75rem] font-extrabold text-gray-900 tracking-tight">Create your account</h2>
            <p className="text-sm text-gray-500 mt-1.5">Start hiring talented students in minutes</p>
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
                {m === 'email' ? 'Email' : 'Ghana Card'}
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
                  <UserIcon className="w-[1.1rem] h-[1.1rem] text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:ring-[3px] focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-200"
                  placeholder="John Mensah" required />
              </div>
            </div>

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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company name <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none">
                  <BuildingOffice2Icon className="w-[1.1rem] h-[1.1rem] text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pl-12 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:ring-[3px] focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-200"
                  placeholder="Acme Ltd." />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 pr-12 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:ring-[3px] focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-200"
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
              className="relative w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 rounded-2xl text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-px active:translate-y-0 group/btn overflow-hidden">
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
              <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">Sign in</Link>
            </p>
            <p className="text-sm text-gray-400">
              Are you a student?{' '}
              <a href={`${process.env.NEXT_PUBLIC_STUDENT_URL || 'https://jobs.intemso.com'}/auth/register`}
                className="font-medium text-gray-600 hover:text-gray-800 transition-colors underline underline-offset-2 decoration-gray-300 hover:decoration-gray-500">
                Student Portal
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

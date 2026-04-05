'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CheckIcon,
  ChevronUpDownIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useAuth } from '@/context/auth';
import { usersApi } from '@/lib/api';
import { GHANA_UNIVERSITIES } from '@intemso/shared';

type Role = 'student' | 'employer';
type AuthMethod = 'email' | 'ghana-card';

export default function RegisterPage() {
  const router = useRouter();
  const { register, registerWithGhanaCard } = useAuth();
  const [role, setRole] = useState<Role>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [ghanaCard, setGhanaCard] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [company, setCompany] = useState('');

  // University search combobox
  const [uniSearch, setUniSearch] = useState('');
  const [uniOpen, setUniOpen] = useState(false);
  const uniRef = useRef<HTMLDivElement>(null);
  const uniInputRef = useRef<HTMLInputElement>(null);

  const sortedUniversities = useMemo(
    () => [...GHANA_UNIVERSITIES].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const filteredUnis = useMemo(() => {
    if (!uniSearch.trim()) return sortedUniversities;
    const q = uniSearch.toLowerCase();
    return sortedUniversities.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.abbreviation.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q),
    );
  }, [uniSearch, sortedUniversities]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (uniRef.current && !uniRef.current.contains(e.target as Node)) {
        setUniOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (authMethod === 'ghana-card') {
        await registerWithGhanaCard({
          ghanaCardNumber: ghanaCard,
          fullName,
          password,
          role,
          university: role === 'student' ? university || undefined : undefined,
        });
      } else {
        await register(email, password, role);
      }

      // After registration, create the initial profile (non-blocking: user is already registered)
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      try {
        if (role === 'student') {
          await usersApi.updateStudentProfile({
            firstName,
            lastName,
            university: university || undefined,
          });
        } else {
          await usersApi.updateEmployerProfile({
            businessName: company || undefined,
            contactPerson: fullName,
          });
        }
      } catch {
        // Profile creation is best-effort; user can complete it later from dashboard.
        // Registration itself succeeded, so we continue to redirect.
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      const apiErr = err as { message?: string | string[] };
      const msg = Array.isArray(apiErr.message)
        ? apiErr.message[0]
        : apiErr.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-semibold text-primary-600 hover:text-primary-700"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > 1 ? <CheckIcon className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm font-medium text-gray-700">Role</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 2
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium text-gray-400">Details</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    I want to...
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`relative flex flex-col items-center gap-2.5 sm:gap-3 p-4 sm:p-6 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                        role === 'student'
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {role === 'student' && (
                        <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </span>
                      )}
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                          role === 'student'
                            ? 'bg-primary-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        <AcademicCapIcon
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            role === 'student'
                              ? 'text-primary-600'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <div className="text-center">
                        <p
                          className={`text-sm font-semibold ${
                            role === 'student'
                              ? 'text-primary-700'
                              : 'text-gray-700'
                          }`}
                        >
                          Find Work
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          I&apos;m a student
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('employer')}
                      className={`relative flex flex-col items-center gap-2.5 sm:gap-3 p-4 sm:p-6 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                        role === 'employer'
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {role === 'employer' && (
                        <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </span>
                      )}
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                          role === 'employer'
                            ? 'bg-primary-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        <BriefcaseIcon
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            role === 'employer'
                              ? 'text-primary-600'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <div className="text-center">
                        <p
                          className={`text-sm font-semibold ${
                            role === 'employer'
                              ? 'text-primary-700'
                              : 'text-gray-700'
                          }`}
                        >
                          Hire Talent
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          I&apos;m an employer
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full btn-lg">
                  Continue
                </button>
              </>
            ) : (
              <>
                {/* Auth method toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1 mb-1">
                  <button type="button" onClick={() => { setAuthMethod('email'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${authMethod === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <EnvelopeIcon className="w-4 h-4" /> {role === 'student' ? 'University Email' : 'Email'}
                  </button>
                  <button type="button" onClick={() => { setAuthMethod('ghana-card'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${authMethod === 'ghana-card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <IdentificationIcon className="w-4 h-4" /> Ghana Card
                  </button>
                </div>

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                {/* Email or Ghana Card */}
                {authMethod === 'email' ? (
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    {role === 'student' ? 'University email' : 'Email address'}
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder={
                        role === 'student'
                          ? 'you@st.ug.edu.gh'
                          : 'you@company.com'
                      }
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-11"
                    />
                  </div>
                  {role === 'student' && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      Must be your university domain email (not Gmail or Outlook)
                    </p>
                  )}
                </div>
                ) : (
                <div>
                  <label
                    htmlFor="ghanaCard"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Ghana Card Number
                  </label>
                  <div className="relative">
                    <IdentificationIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="ghanaCard"
                      type="text"
                      placeholder="GHA-XXXXXXXXX-X"
                      pattern="GHA-\d{9}-\d"
                      required
                      value={ghanaCard}
                      onChange={(e) => setGhanaCard(e.target.value.toUpperCase())}
                      className="input-field pl-11 font-mono"
                    />
                  </div>
                </div>
                )}

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {role === 'student' && (
                  <div>
                    <label
                      htmlFor="university"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      University
                    </label>
                    <div ref={uniRef} className="relative">
                      <div
                        className="relative cursor-pointer"
                        onClick={() => {
                          setUniOpen(true);
                          setTimeout(() => uniInputRef.current?.focus(), 0);
                        }}
                      >
                        <input
                          ref={uniInputRef}
                          id="university"
                          type="text"
                          placeholder="Search your university..."
                          autoComplete="off"
                          value={uniOpen ? uniSearch : university || ''}
                          onChange={(e) => {
                            setUniSearch(e.target.value);
                            setUniOpen(true);
                            if (university) setUniversity('');
                          }}
                          onFocus={() => setUniOpen(true)}
                          className="input-field pr-10"
                        />
                        <ChevronUpDownIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>

                      {uniOpen && (
                        <ul className="absolute z-50 mt-1 w-full max-h-48 sm:max-h-60 overflow-auto rounded-lg bg-white border border-gray-200 shadow-lg py-1">
                          {filteredUnis.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-gray-400">
                              No universities found
                            </li>
                          ) : (
                            filteredUnis.map((uni) => (
                              <li
                                key={uni.abbreviation}
                                onClick={() => {
                                  setUniversity(uni.name);
                                  setUniSearch('');
                                  setUniOpen(false);
                                }}
                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                                  university === uni.name
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span>{uni.name}</span>
                                <span className="ml-2 text-xs text-gray-400">
                                  ({uni.abbreviation})
                                </span>
                              </li>
                            ))
                          )}
                          <li
                            onClick={() => {
                              setUniversity('Other');
                              setUniSearch('');
                              setUniOpen(false);
                            }}
                            className={`px-4 py-2.5 text-sm cursor-pointer border-t border-gray-100 transition-colors ${
                              university === 'Other'
                                ? 'bg-primary-50 text-primary-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            Other
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {role === 'employer' && (
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Company / Business Name
                    </label>
                    <input
                      id="company"
                      type="text"
                      placeholder="Enter your company name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="input-field"
                    />
                  </div>
                )}

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-500">
                    I agree to Intemso&apos;s{' '}
                    <Link
                      href="/terms"
                      className="text-primary-600 hover:underline"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="text-primary-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-1"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 btn-lg disabled:opacity-60"
                  >
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>

          {step === 1 && (
            <>
              <div className="relative mt-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400">
                    Or sign up with
                  </span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right - Hero Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <Image
          src="/about-im.png"
          alt="Ghanaian university students on campus — walking, carrying event equipment, working on laptops"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-gray-950/80 via-gray-950/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            {role === 'student'
              ? 'Start your freelance journey'
              : 'Find amazing student talent'}
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-sm mb-6">
            {role === 'student'
              ? 'Earn while you study. Thousands of campus gigs waiting for you.'
              : 'Access skilled, motivated university students ready to help your business grow.'}
          </p>
          <div className="flex flex-col gap-2">
            {(role === 'student'
              ? [
                  'Free to create a profile',
                  'Get 40 free connects to start',
                  'Withdraw earnings to any bank',
                  'Build a verified portfolio',
                ]
              : [
                  'Post gigs for free',
                  'Browse verified student profiles',
                  'Milestone-based secure payments',
                  'Dedicated support team',
                ]
            ).map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="w-5 h-5 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0">
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

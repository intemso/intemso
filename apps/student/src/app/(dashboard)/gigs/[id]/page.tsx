'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  EyeIcon,
  BoltIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { gigsApi, applicationsApi, connectsApi, type GigListItem } from '@/lib/api';

function formatBudget(min: string | null, max: string | null) {
  const f = (n: number) =>
    n >= 1000 ? `GH₵${(n / 1000).toFixed(1)}k` : `GH₵${n}`;
  const minN = min ? parseFloat(min) : 0;
  const maxN = max ? parseFloat(max) : 0;
  if (minN && maxN) return `${f(minN)} - ${f(maxN)}`;
  if (minN) return `From ${f(minN)}`;
  if (maxN) return `Up to ${f(maxN)}`;
  return 'Negotiable';
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

type GigDetail = GigListItem & {
  applications?: { id: string; status: string; suggestedRate: string | null }[];
  screeningQuestions?: string[];
};

export default function GigDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [gig, setGig] = useState<GigDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply form state
  const [applyNote, setApplyNote] = useState('');
  const [suggestedRate, setSuggestedRate] = useState('');
  const [screeningAnswers, setScreeningAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  // Connects balance
  const [connectsBalance, setConnectsBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    gigsApi
      .getById(id)
      .then((res) => {
        const data = res as GigDetail;
        setGig(data);
        // Check if student already applied
        if (data.applications && data.applications.length > 0) {
          setAlreadyApplied(true);
        }
        // Init screening answers
        if (data.screeningQuestions && data.screeningQuestions.length > 0) {
          setScreeningAnswers(new Array(data.screeningQuestions.length).fill(''));
        }
      })
      .catch(() => setError('Gig not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    connectsApi
      .getBalance()
      .then((r) => setConnectsBalance(r.total))
      .catch(() => {});
  }, []);

  const handleApply = async () => {
    if (!gig || submitting) return;
    setSubmitting(true);
    setApplyError('');

    try {
      await applicationsApi.create(gig.id, {
        ...(applyNote.trim() && { note: applyNote.trim() }),
        ...(suggestedRate && { suggestedRate: parseFloat(suggestedRate) }),
        ...(screeningAnswers.some(a => a.trim()) && { screeningAnswers }),
      });
      setApplySuccess(true);
    } catch (err: any) {
      const msg = Array.isArray(err?.message)
        ? err.message.join(', ')
        : err?.message || 'Failed to submit application';
      setApplyError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-80 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-64 bg-gray-200 rounded-2xl" />
          <div className="lg:col-span-2 h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="text-center py-16">
        <BriefcaseIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-500">{error || 'Gig not found'}</p>
        <Link href="/gigs" className="text-primary-600 text-sm font-medium mt-2 inline-block hover:underline">
          Browse all gigs
        </Link>
      </div>
    );
  }

  const employerName = gig.employer.businessName || gig.employer.contactPerson || 'Employer';
  const hasEnoughConnects = connectsBalance !== null && connectsBalance >= gig.connectsRequired;

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <ClockIcon className="w-3.5 h-3.5" />
          Posted {timeAgo(gig.createdAt)}
          {gig.category && (
            <>
              <span>&middot;</span>
              <span>{gig.category.name}</span>
            </>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{gig.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full">
            <CurrencyDollarIcon className="w-4 h-4" />
            {formatBudget(gig.budgetMin, gig.budgetMax)}
          </span>
          <span className="px-3 py-1.5 bg-gray-50 text-gray-600 text-sm rounded-full">
            {gig.budgetType === 'FIXED' ? 'Fixed Price' : 'Hourly'}
          </span>
          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full capitalize">
            {gig.experienceLevel}
          </span>
          {gig.durationHours && (
            <span className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 text-sm rounded-full">
              <CalendarIcon className="w-3.5 h-3.5" />
              {gig.durationHours}h
            </span>
          )}
          {gig.locationAddress && (
            <span className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 text-sm rounded-full">
              <MapPinIcon className="w-3.5 h-3.5" />
              {gig.locationAddress}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — Details */}
        <div className="lg:col-span-3 space-y-5">
          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">Project Description</h2>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {gig.description}
            </div>
          </div>

          {/* Skills */}
          {gig.requiredSkills.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {gig.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">Activity</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <UserGroupIcon className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{gig.applicationsCount}</p>
                <p className="text-xs text-gray-500">Applicants</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <EyeIcon className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{gig.viewsCount}</p>
                <p className="text-xs text-gray-500">Views</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <BoltIcon className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{gig.connectsRequired}</p>
                <p className="text-xs text-gray-500">Connects</p>
              </div>
            </div>
          </div>

          {/* About Employer */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">About the Client</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-primary-600">{employerName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{employerName}</p>
                {gig.locationAddress && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3" /> {gig.locationAddress}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Apply Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 sticky top-20">
            {applySuccess ? (
              /* Success state */
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Application Submitted!</h3>
                <p className="text-sm text-gray-500 mb-5">
                  The employer will review your application and get back to you.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/applications"
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    View My Applications
                  </Link>
                  <Link
                    href="/gigs"
                    className="text-sm text-primary-600 font-medium hover:underline"
                  >
                    Browse more gigs
                  </Link>
                </div>
              </div>
            ) : alreadyApplied ? (
              /* Already applied */
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Already Applied</h3>
                <p className="text-sm text-gray-500 mb-4">
                  You&apos;ve already submitted an application for this gig.
                </p>
                <Link
                  href="/applications"
                  className="text-sm text-primary-600 font-medium hover:underline"
                >
                  Track your applications
                </Link>
              </div>
            ) : gig.status !== 'open' ? (
              /* Gig closed */
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">This gig is no longer accepting applications.</p>
              </div>
            ) : (
              /* Apply form */
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Apply for this Gig</h3>
                <p className="text-xs text-gray-400 mb-5">
                  {gig.connectsRequired} connect{gig.connectsRequired !== 1 ? 's' : ''} required
                  {connectsBalance !== null && (
                    <span className={hasEnoughConnects ? ' text-emerald-600' : ' text-red-500'}>
                      {' '}· You have {connectsBalance}
                    </span>
                  )}
                </p>

                {!hasEnoughConnects && connectsBalance !== null && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      You need {gig.connectsRequired} connects to apply.{' '}
                      <a
                        href="/connects"
                        className="font-medium underline"
                      >
                        Get more connects
                      </a>
                    </p>
                  </div>
                )}

                {applyError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-4">
                    {applyError}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Cover note <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      maxLength={280}
                      placeholder="Briefly introduce yourself and why you're a great fit..."
                      value={applyNote}
                      onChange={(e) => setApplyNote(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{applyNote.length}/280</p>
                  </div>

                  {/* Suggested rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Your rate <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        GH₵
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Your proposed rate"
                        value={suggestedRate}
                        onChange={(e) => setSuggestedRate(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Screening questions (if any) */}
                  {gig.screeningQuestions && gig.screeningQuestions.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700">Screening Questions</p>
                      {gig.screeningQuestions.map((q, i) => (
                        <div key={i}>
                          <label className="block text-sm text-gray-600 mb-1">
                            {i + 1}. {q}
                          </label>
                          <textarea
                            rows={2}
                            value={screeningAnswers[i] || ''}
                            onChange={(e) => {
                              const copy = [...screeningAnswers];
                              copy[i] = e.target.value;
                              setScreeningAnswers(copy);
                            }}
                            className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            placeholder="Your answer..."
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handleApply}
                    disabled={submitting || (!hasEnoughConnects && connectsBalance !== null)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <PaperAirplaneIcon className="w-4 h-4" />
                    )}
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

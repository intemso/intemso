'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ShareIcon,
  FlagIcon,
  CalendarIcon,
  BriefcaseIcon,
  ChevronRightIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { gigsApi, reportsApi, savedGigsApi, communityApi, type GigListItem } from '@/lib/api';
import { useAuth } from '@/context/auth';

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

export default function GigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const gigId = params.id as string;

  const [gig, setGig] = useState<(GigListItem & { applications?: { id: string; status: string; suggestedRate: string | null }[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Community discussion state
  const [discussionPostId, setDiscussionPostId] = useState<string | null>(null);
  const [creatingDiscussion, setCreatingDiscussion] = useState(false);

  useEffect(() => {
    if (!gigId) return;
    setLoading(true);
    gigsApi.getById(gigId)
      .then((data) => setGig(data))
      .catch(() => setError('Gig not found'))
      .finally(() => setLoading(false));
  }, [gigId]);

  // Check if a community discussion exists for this gig
  useEffect(() => {
    if (!gigId) return;
    communityApi.getGigDiscussionId(gigId)
      .then((res) => { if (res.postId) setDiscussionPostId(res.postId); })
      .catch(() => {});
  }, [gigId]);

  // Check if gig is saved (students only)
  useEffect(() => {
    if (!gigId || !user || user.role !== 'student') return;
    savedGigsApi.list({ limit: 100 })
      .then((res) => {
        if (res.data.some((g: { id: string }) => g.id === gigId)) setSaved(true);
      })
      .catch(() => {});
  }, [gigId, user]);

  const toggleSave = async () => {
    if (!user) return;
    try {
      if (saved) {
        await savedGigsApi.unsave(gigId);
      } else {
        await savedGigsApi.save(gigId);
      }
      setSaved(!saved);
    } catch { /* ignore */ }
  };

  const handleDiscuss = async () => {
    if (!user || creatingDiscussion) return;
    setCreatingDiscussion(true);
    try {
      const res = await communityApi.createGigDiscussion(gigId);
      setDiscussionPostId(res.postId);
      router.push(`/community?post=${res.postId}`);
    } catch { /* ignore */ }
    setCreatingDiscussion(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading gig...</p>
        </div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BriefcaseIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{error || 'Gig not found'}</p>
          <Link href="/gigs" className="text-primary-600 text-sm font-medium mt-2 inline-block hover:underline">
            Browse all gigs
          </Link>
        </div>
      </div>
    );
  }

  const employerName = gig.employer.businessName || gig.employer.contactPerson || 'Employer';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/gigs" className="hover:text-primary-600">
              Browse Gigs
            </Link>
            <ChevronRightIcon className="w-3 h-3" />
            {gig.category && (
              <>
                <span className="hover:text-primary-600">
                  {gig.category.name}
                </span>
                <ChevronRightIcon className="w-3 h-3" />
              </>
            )}
            <span className="text-gray-600 truncate max-w-xs">{gig.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <ClockIcon className="w-3.5 h-3.5" />
                    <span>Posted {timeAgo(gig.createdAt)}</span>
                    {gig.locationAddress && (
                      <>
                        <span className="text-gray-200">Ã¢â‚¬Â¢</span>
                        <MapPinIcon className="w-3.5 h-3.5" />
                        <span>{gig.locationAddress}</span>
                      </>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-snug">
                    {gig.title}
                  </h1>
                </div>
              </div>

              {/* Meta badges */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 sm:mt-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-green-50 text-green-700 text-xs sm:text-sm font-semibold rounded-full">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  {formatBudget(gig.budgetMin, gig.budgetMax)}
                </span>
                <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-50 text-gray-600 text-xs sm:text-sm font-medium rounded-full">
                  {gig.budgetType === 'FIXED' ? 'Fixed Price' : 'Hourly'}
                </span>
                <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium rounded-full">
                  {gig.experienceLevel}
                </span>
                {gig.durationHours && (
                <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-50 text-gray-600 text-xs sm:text-sm font-medium rounded-full">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {gig.durationHours}h
                </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
                {user?.role === 'STUDENT' && (
                  <button
                    onClick={toggleSave}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
                      saved
                        ? 'border-red-200 bg-red-50 text-red-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <HeartIcon className="w-4 h-4" />
                    {saved ? 'Saved' : 'Save'}
                  </button>
                )}
                <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors">
                  <ShareIcon className="w-4 h-4" />
                  Share
                </button>
                {discussionPostId ? (
                  <Link
                    href={`/community?post=${discussionPostId}`}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border border-primary-200 bg-primary-50 text-primary-700 text-xs sm:text-sm font-medium hover:bg-primary-100 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    View Discussion
                  </Link>
                ) : user ? (
                  <button
                    onClick={handleDiscuss}
                    disabled={creatingDiscussion}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    {creatingDiscussion ? 'Creating...' : 'Discuss'}
                  </button>
                ) : null}
                <button
                  onClick={() => { setShowReportModal(true); setReportSuccess(false); setReportReason(''); }}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <FlagIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Report</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                Project Description
              </h2>
              <div className="prose prose-sm prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {gig.description}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-2">
                {gig.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-full hover:bg-primary-100 transition-colors cursor-pointer"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                Activity on this gig
              </h2>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center p-2.5 sm:p-4 bg-gray-50 rounded-xl">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {gig.applicationsCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Applications</p>
                </div>
                <div className="text-center p-2.5 sm:p-4 bg-gray-50 rounded-xl">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {gig.viewsCount}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Views</p>
                </div>
                <div className="text-center p-2.5 sm:p-4 bg-gray-50 rounded-xl">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {gig.connectsRequired}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Connects</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* CTA Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 sticky top-20 sm:top-36">
              {user?.role === 'EMPLOYER' ? (
                <p className="text-sm text-gray-500 text-center">You are viewing this gig as an employer.</p>
              ) : (
                <>
                  <a
                    href={`${process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL || 'https://jobs.intemso.com'}/gigs/${gigId}`}
                    className="btn-primary w-full btn-lg flex items-center justify-center gap-2"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                    {user?.role === 'STUDENT' ? 'Apply Now' : 'Log in to apply'}
                  </a>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    {gig.connectsRequired} connect{gig.connectsRequired !== 1 ? 's' : ''} required &middot; Apply from your dashboard
                  </p>
                </>
              )}

              {/* Employer Info */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-4">
                  About the Client
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-600">
                      {employerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800">
                      {employerName}
                    </span>
                    {gig.locationAddress && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPinIcon className="w-3 h-3" />
                        {gig.locationAddress}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            {reportSuccess ? (
              <div className="text-center py-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Report Submitted</h3>
                <p className="text-sm text-gray-500 mb-4">Thank you. We&apos;ll review your report.</p>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="btn-primary"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Report this Gig</h3>
                <p className="text-sm text-gray-500 mb-4">Let us know why you&apos;re reporting this listing.</p>
                <textarea
                  rows={4}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="input-field mb-4"
                  placeholder="Describe the issue..."
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!reportReason.trim()) return;
                      setReportSubmitting(true);
                      try {
                        await reportsApi.create({
                          reportedEntity: 'gig',
                          reportedId: gigId,
                          reason: reportReason.trim(),
                        });
                        setReportSuccess(true);
                      } catch {
                        // ignore
                      } finally {
                        setReportSubmitting(false);
                      }
                    }}
                    disabled={reportSubmitting || !reportReason.trim()}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

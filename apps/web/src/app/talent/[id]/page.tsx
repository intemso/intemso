'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  CalendarIcon,
  CheckBadgeIcon,
  LinkIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { studentsApi, reviewsApi, reportsApi, type StudentDetail, type Review } from '@/lib/api';
import { useAuth } from '@/context/auth';

const BADGE_LABELS: Record<string, string> = {
  rising_talent: 'Rising Talent',
  top_rated: 'Top Rated',
  top_rated_plus: 'Top Rated Plus',
};

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params.id as string;
  const { user } = useAuth();

  const [profile, setProfile] = useState<StudentDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Report modal
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    Promise.all([
      studentsApi.getById(studentId),
      reviewsApi.getByUser(studentId, { limit: 10 }),
    ])
      .then(([p, r]) => {
        setProfile(p);
        setReviews(r.data);
      })
      .catch(() => setError('Student not found'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center py-16">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-16">
        <p className="text-sm text-red-500 mb-2">{error || 'Not found'}</p>
        <Link href="/talent" className="text-primary-600 text-sm font-medium hover:underline">
          Back to Talent
        </Link>
      </div>
    );
  }

  const displayName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  const badge = BADGE_LABELS[profile.talentBadge];
  const memberSince = new Date(profile.user?.createdAt || profile.createdAt).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Link
          href="/talent"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Talent
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden mb-4 sm:mb-6">
          <div className="h-24 sm:h-32 bg-linear-to-r from-primary-500 to-primary-700" />
          <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 -mt-10 sm:-mt-12">
              <div className="relative">
                {(profile as any).avatarUrl ? (
                  <img
                    src={(profile as any).avatarUrl.includes('cloudinary.com') ? (profile as any).avatarUrl.replace('/upload/', '/upload/w_192,h_192,c_fill,g_face,f_auto,q_auto/') : (profile as any).avatarUrl}
                    alt={displayName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary-200 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-2xl sm:text-3xl font-bold text-primary-600">{initials}</span>
                  </div>
                )}
                {profile.isVerified && (
                  <CheckBadgeIcon className="absolute -bottom-1 -right-1 w-7 h-7 text-primary-600 bg-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0 sm:pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{displayName}</h1>
                  {badge && (
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {profile.professionalTitle || 'Student'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {user && (
                  <button
                    onClick={() => { setShowReport(true); setReportSuccess(false); setReportReason(''); }}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <FlagIcon className="w-4 h-4" />
                    Report
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
              {profile.university && (
                <span className="flex items-center gap-1.5">
                  <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                  {profile.university}
                  {profile.major && ` — ${profile.major}`}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                Member since {memberSince}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Job Success Score</h2>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="50" fill="none" stroke="#3366ff" strokeWidth="10"
                      strokeDasharray={`${(profile.jobSuccessScore / 100) * 314} 314`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{profile.jobSuccessScore}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Completed</span>
                  <span className="font-semibold text-gray-800">{profile.gigsCompleted} gigs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rating</span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-amber-400" />
                    {Number(profile.ratingAvg).toFixed(1)} ({profile.ratingCount})
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">On Time</span>
                  <span className="font-semibold text-green-600">{Number(profile.onTimeRate).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Response Time</span>
                  <span className="font-semibold text-gray-800">
                    {profile.responseTimeHrs ? `${Number(profile.responseTimeHrs)}h` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills */}
            {profile.skills.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-3 sm:mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hourly Rate */}
            {profile.hourlyRate && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-2">Hourly Rate</h2>
                <p className="text-xl sm:text-2xl font-bold text-primary-600">GH₵{Number(profile.hourlyRate)}/hr</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">About</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {profile.bio || 'No bio provided.'}
              </p>
            </div>

            {/* Portfolio */}
            {profile.portfolioUrls.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Portfolio</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {profile.portfolioUrls.map((url, idx) => {
                    const isImage = /\.(jpg|jpeg|png|webp|avif|gif|bmp)(\?|$)/i.test(url) || url.includes('cloudinary.com');
                    if (isImage) {
                      const thumbSrc = url.includes('cloudinary.com') ? url.replace('/upload/', '/upload/w_400,h_300,c_fill,f_auto,q_auto/') : url;
                      return (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-4/3 rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-primary-500 transition-all">
                          <img src={thumbSrc} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </a>
                      );
                    }
                    return (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:underline col-span-full">
                        <LinkIcon className="w-4 h-4" />
                        {url}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                Reviews ({reviews.length})
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {review.reviewerName || 'Anonymous'}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.contract && (
                        <p className="text-xs text-gray-400">{review.contract.title}</p>
                      )}
                      {review.comment && (
                        <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            {reportSuccess ? (
              <div className="text-center py-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Report Submitted</h3>
                <p className="text-sm text-gray-500 mb-4">Thank you. We&apos;ll review your report.</p>
                <button onClick={() => setShowReport(false)} className="btn-primary">Close</button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Report this User</h3>
                <p className="text-sm text-gray-500 mb-4">Let us know why you&apos;re reporting this user.</p>
                <textarea
                  rows={4}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="input-field mb-4"
                  placeholder="Describe the issue..."
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowReport(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!reportReason.trim()) return;
                      setReportSubmitting(true);
                      try {
                        await reportsApi.create({ reportedEntity: 'user', reportedId: studentId, reason: reportReason.trim() });
                        setReportSuccess(true);
                      } catch { /* ignore */ }
                      finally { setReportSubmitting(false); }
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

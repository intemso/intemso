'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPinIcon,
  AcademicCapIcon,
  CalendarIcon,
  ClockIcon,
  GlobeAltIcon,
  PencilIcon,
  CheckBadgeIcon,
  StarIcon as StarOutline,
  LinkIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/context/auth';
import { reviewsApi, type Review } from '@/lib/api';

interface StudentProfile {
  firstName: string;
  lastName: string;
  professionalTitle?: string;
  university: string;
  major?: string;
  bio?: string;
  skills: string[];
  hourlyRate?: number;
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  jobSuccessScore: number;
  totalEarned: number;
  gigsCompleted: number;
  responseTimeHrs?: number;
  onTimeRate: number;
  portfolioUrls: string[];
}

interface EmployerProfile {
  businessName: string;
  businessType?: string;
  description?: string;
  website?: string;
  contactPerson?: string;
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  totalSpent: number;
  gigsPosted: number;
  hireRate: number;
}

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const sp = user.studentProfile as unknown as StudentProfile | null;
  const ep = user.employerProfile as unknown as EmployerProfile | null;
  const isStudent = user.role === 'STUDENT';

  const displayName = sp
    ? `${sp.firstName} ${sp.lastName}`.trim()
    : ep?.contactPerson || ep?.businessName || user.email.split('@')[0];

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });

  const isVerified = sp?.isVerified || ep?.isVerified || false;

  // Fetch reviews for this user
  const profileId = isStudent ? (sp as any)?.id : (ep as any)?.id;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (!profileId) return;
    setReviewsLoading(true);
    reviewsApi
      .getByUser(profileId, { limit: 10 })
      .then((res) => setReviews(res.data))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [profileId]);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-linear-to-r from-primary-500 to-primary-700" />

        <div className="px-6 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="relative">
              <div className="w-24 h-24 bg-primary-200 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-3xl font-bold text-primary-600">{initials}</span>
              </div>
              {isVerified && (
                <CheckBadgeIcon className="absolute -bottom-1 -right-1 w-7 h-7 text-primary-600 bg-white rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0 sm:pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {displayName}
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {isStudent ? sp?.professionalTitle || 'Student' : ep?.businessName || 'Employer'}
              </p>
            </div>
            <Link
              href="/profile/edit"
              className="btn-secondary flex items-center gap-2 shrink-0"
            >
              <PencilIcon className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>

          {/* Quick info */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
            {isStudent && sp?.university && (
              <span className="flex items-center gap-1.5">
                <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                {sp.university}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              Member since {memberSince}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Stats */}
          {isStudent && sp && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">
              Job Success Score
            </h2>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#3366ff"
                    strokeWidth="10"
                    strokeDasharray={`${(sp.jobSuccessScore / 100) * 314} 314`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {sp.jobSuccessScore}%
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completed</span>
                <span className="font-semibold text-gray-800">
                  {sp.gigsCompleted} gigs
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rating</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-amber-400" />
                  {Number(sp.ratingAvg).toFixed(1)} ({sp.ratingCount})
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">On Time</span>
                <span className="font-semibold text-green-600">
                  {Number(sp.onTimeRate).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Response Time</span>
                <span className="font-semibold text-gray-800">
                  {sp.responseTimeHrs ? `${sp.responseTimeHrs}h` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Earned</span>
                <span className="font-semibold text-gray-800">
                  GH?{Number(sp.totalEarned).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          )}

          {/* Skills */}
          {isStudent && sp && sp.skills.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {sp.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          )}

          {/* Hourly Rate */}
          {isStudent && sp?.hourlyRate && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              Hourly Rate
            </h2>
            <p className="text-2xl font-bold text-primary-600">
              GH?{Number(sp.hourlyRate)}/hr
            </p>
          </div>
          )}

          {/* Employer stats */}
          {!isStudent && ep && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-4">Business Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Gigs Posted</span>
                <span className="font-semibold text-gray-800">{ep.gigsPosted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Spent</span>
                <span className="font-semibold text-gray-800">GH?{Number(ep.totalSpent).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Hire Rate</span>
                <span className="font-semibold text-green-600">{Number(ep.hireRate).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rating</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1">
                  <StarIcon className="w-4 h-4 text-amber-400" />
                  {Number(ep.ratingAvg).toFixed(1)} ({ep.ratingCount})
                </span>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {isStudent ? sp?.bio || 'No bio yet. Edit your profile to add one.' : ep?.description || 'No description yet.'}
            </p>
          </div>

          {/* Portfolio */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Portfolio</h2>
            {isStudent && sp && sp.portfolioUrls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {sp.portfolioUrls.map((url: string, idx: number) => {
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
            ) : (
              <p className="text-sm text-gray-400">No portfolio items yet. Add links in your profile settings.</p>
            )}
          </div>

          {/* Work History & Reviews */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Reviews ({reviews.length})
            </h2>
            {reviewsLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : reviews.length > 0 ? (
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
                      <Link
                        href={`/contracts/${review.contract.id}`}
                        className="text-xs text-primary-600 hover:underline"
                      >
                        {review.contract.title}
                      </Link>
                    )}
                    {review.comment && (
                      <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No reviews yet. Your reviews will appear here after completing contracts.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

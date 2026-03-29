'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  HeartIcon as HeartOutline,
  EyeIcon,
  CalendarIcon,
  LinkIcon,
  UserIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  StarIcon,
} from '@heroicons/react/24/solid';
import {
  showcaseApi,
  type PortfolioItem,
} from '@/lib/api';
import { useAuth } from '@/context/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function resolveImage(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

const BADGE_LABELS: Record<string, string> = {
  rising_talent: 'Rising Talent',
  top_rated: 'Top Rated',
  top_rated_plus: 'Top Rated Plus',
};

export default function ShowcaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [related, setRelated] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  useEffect(() => {
    if (!itemId) return;
    setLoading(true);
    showcaseApi
      .getById(itemId)
      .then((data) => {
        setItem(data);
        setLikeCount(data.likeCount);
        // Load related items from same student
        if (data.studentId) {
          showcaseApi
            .list({ studentId: data.studentId, limit: 4 })
            .then((res) => {
              setRelated(res.data.filter((r) => r.id !== data.id).slice(0, 3));
            })
            .catch(() => {});
        }
      })
      .catch(() => setError('Portfolio item not found'))
      .finally(() => setLoading(false));
  }, [itemId]);

  const handleLike = async () => {
    if (!isAuthenticated || liking) return;
    setLiking(true);
    try {
      const res = await showcaseApi.like(itemId);
      setLikeCount(res.likeCount);
      setLiked((prev) => !prev);
    } catch {
      /* ignore */
    } finally {
      setLiking(false);
    }
  };

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    if (!item) return;
    setLightboxIdx((prev) => (prev + 1) % item.images.length);
  };

  const prevImage = () => {
    if (!item) return;
    setLightboxIdx((prev) => (prev - 1 + item.images.length) % item.images.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, item]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="h-96 bg-gray-200 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <EyeIcon className="w-8 h-8 text-red-300" />
        </div>
        <p className="text-sm text-red-500 mb-2">{error || 'Not found'}</p>
        <Link href="/showcase" className="text-primary-600 text-sm font-medium hover:underline">
          Back to Showcase
        </Link>
      </div>
    );
  }

  const student = item.student;
  const displayName = `${student?.firstName || ''} ${student?.lastName || ''}`.trim();
  const badge = student ? BADGE_LABELS[(student as any).talentBadge] : null;
  const completedDate = item.completedAt
    ? new Date(item.completedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : null;
  const createdDate = new Date(item.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══ Lightbox ═══ */}
      {lightboxOpen && item.images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>
          {item.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 text-white/70 hover:text-white z-10 p-2"
              >
                <ChevronLeftIcon className="w-10 h-10" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 text-white/70 hover:text-white z-10 p-2"
              >
                <ChevronRightIcon className="w-10 h-10" />
              </button>
            </>
          )}
          <div className="relative max-w-5xl max-h-[85vh] w-full mx-8">
            <Image
              src={resolveImage(item.images[lightboxIdx])}
              alt={`${item.title} — image ${lightboxIdx + 1}`}
              width={1600}
              height={1000}
              className="object-contain w-full h-full max-h-[85vh] rounded-lg"
            />
            {item.images.length > 1 && (
              <p className="text-center text-white/50 text-sm mt-4">
                {lightboxIdx + 1} / {item.images.length}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/showcase"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Showcase
        </Link>

        {/* ═══ Hero Image Gallery ═══ */}
        {item.images.length > 0 && (
          <div className="mb-4 sm:mb-8">
            {/* Main image */}
            <div
              className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group"
              onClick={() => openLightbox(0)}
            >
              <Image
                src={resolveImage(item.images[0])}
                alt={item.title}
                fill
                sizes="(max-width: 1024px) 100vw, 960px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            {/* Thumbnail strip */}
            {item.images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-3 overflow-x-auto pb-2">
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => openLightbox(idx)}
                    className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition ${
                      lightboxIdx === idx && lightboxOpen
                        ? 'border-primary-500'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={resolveImage(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No images placeholder */}
        {item.images.length === 0 && (
          <div className="mb-8 rounded-2xl bg-linear-to-br from-primary-50 via-purple-50 to-pink-50 aspect-video flex items-center justify-center">
            <span className="text-8xl font-black text-primary-200">
              {item.title[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {/* ═══ Content Grid ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left — Project Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Title & Meta */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight">
                  {item.title}
                </h1>
                <button
                  onClick={handleLike}
                  disabled={!isAuthenticated || liking}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
                    liked
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'
                  } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {liked ? (
                    <HeartSolid className="w-5 h-5" />
                  ) : (
                    <HeartOutline className="w-5 h-5" />
                  )}
                  <span className="text-sm font-semibold">{likeCount}</span>
                </button>
              </div>

              {/* Stats bar */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <EyeIcon className="w-4 h-4" />
                  {item.viewCount.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1.5">
                  <HeartOutline className="w-4 h-4" />
                  {likeCount} likes
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4" />
                  {createdDate}
                </span>
                {item.category && (
                  <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                    {item.category.name}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">About This Project</h2>
              <div className="prose prose-sm prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Skills Used */}
            {item.skills.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Skills & Technologies</h2>
                <div className="flex flex-wrap gap-2">
                  {item.skills.map((skill) => (
                    <Link
                      key={skill}
                      href={`/showcase?skills=${encodeURIComponent(skill)}`}
                      className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 transition"
                    >
                      {skill}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Project Details */}
            {(item.clientName || item.projectUrl || completedDate) && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Project Details</h2>
                <dl className="space-y-3">
                  {item.clientName && (
                    <div className="flex items-center gap-3">
                      <dt className="text-sm text-gray-400 w-28">Client</dt>
                      <dd className="text-sm font-medium text-gray-700">{item.clientName}</dd>
                    </div>
                  )}
                  {completedDate && (
                    <div className="flex items-center gap-3">
                      <dt className="text-sm text-gray-400 w-28">Completed</dt>
                      <dd className="text-sm font-medium text-gray-700">{completedDate}</dd>
                    </div>
                  )}
                  {item.projectUrl && (
                    <div className="flex items-center gap-3">
                      <dt className="text-sm text-gray-400 w-28">Live Project</dt>
                      <dd>
                        <a
                          href={item.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          <LinkIcon className="w-4 h-4" />
                          View Live
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* More from this creator */}
            {related.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  More from {student?.firstName}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/showcase/${r.id}`}
                      className="group block"
                    >
                      <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-4/3 shadow-sm group-hover:shadow-lg transition-shadow">
                        {r.images?.[0] ? (
                          <Image
                            src={resolveImage(r.images[0])}
                            alt={r.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-linear-to-br from-primary-100 via-purple-50 to-pink-100 flex items-center justify-center">
                            <span className="text-3xl font-bold text-primary-200">
                              {r.title[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {r.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Creator Card & Actions */}
          <div className="space-y-4 sm:space-y-6">
            {/* Creator Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 sticky top-20 sm:top-24">
              <div className="text-center">
                {student?.user?.avatarUrl ? (
                  <Image
                    src={resolveImage(student.user.avatarUrl)}
                    alt={displayName}
                    width={72}
                    height={72}
                    className="rounded-full mx-auto ring-4 ring-gray-50"
                  />
                ) : (
                  <div className="w-18 h-18 rounded-full mx-auto bg-linear-to-br from-primary-400 to-purple-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {student?.firstName?.[0]}{student?.lastName?.[0]}
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mt-3">{displayName}</h3>
                {student?.professionalTitle && (
                  <p className="text-sm text-gray-500 mt-0.5">{student.professionalTitle}</p>
                )}
                {badge && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full">
                    <CheckBadgeIcon className="w-3.5 h-3.5" />
                    {badge}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-5 py-4 border-t border-b border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{student?.gigsCompleted || 0}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Jobs</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 flex items-center justify-center gap-0.5">
                    <StarIcon className="w-4 h-4 text-amber-400" />
                    {student?.ratingAvg ? Number(student.ratingAvg).toFixed(1) : '—'}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{student?.ratingCount || 0}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Reviews</p>
                </div>
              </div>

              {/* University */}
              {student?.university && (
                <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                  <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                  {student.university}
                </div>
              )}

              {/* Skills preview */}
              {student?.skills && student.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {student.skills.slice(0, 6).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 text-[10px] font-medium bg-gray-50 text-gray-500 rounded"
                    >
                      {s}
                    </span>
                  ))}
                  {student.skills.length > 6 && (
                    <span className="px-2 py-0.5 text-[10px] text-gray-400">
                      +{student.skills.length - 6}
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <Link
                  href={`/talent/${student?.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition"
                >
                  <UserIcon className="w-4 h-4" />
                  View Full Profile
                </Link>
                {isAuthenticated && user?.role === 'EMPLOYER' && (
                  <Link
                    href={`/dashboard/messages?invite=${student?.id}`}
                    className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition"
                  >
                    Invite to a Gig
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

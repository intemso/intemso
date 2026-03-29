'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  StarIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/solid';
import {
  AcademicCapIcon,
  BriefcaseIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  LinkIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  HandThumbUpIcon,
  SparklesIcon,
  FireIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  usersApi,
  communityApi,
  type PublicUserProfile,
  type CommunityPost,
} from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/auth';

// ===================================================================
// HELPERS
// ===================================================================

function getDisplayName(profile: PublicUserProfile): string {
  if (profile.studentProfile) {
    const { firstName, lastName } = profile.studentProfile;
    return [firstName, lastName].filter(Boolean).join(' ') || 'Student';
  }
  if (profile.employerProfile) {
    return profile.employerProfile.contactPerson || profile.employerProfile.businessName;
  }
  return 'User';
}

function getTitle(profile: PublicUserProfile): string {
  if (profile.studentProfile?.professionalTitle) return profile.studentProfile.professionalTitle;
  if (profile.employerProfile?.businessType) return profile.employerProfile.businessType;
  return profile.role === 'student' ? 'Student Freelancer' : 'Employer';
}

function getOrg(profile: PublicUserProfile): string {
  if (profile.studentProfile?.university) return profile.studentProfile.university;
  if (profile.employerProfile?.businessName) return profile.employerProfile.businessName;
  return '';
}

function getRating(profile: PublicUserProfile): { avg: number; count: number } {
  if (profile.studentProfile) {
    return { avg: Number(profile.studentProfile.ratingAvg), count: profile.studentProfile.ratingCount };
  }
  if (profile.employerProfile) {
    return { avg: Number(profile.employerProfile.ratingAvg), count: profile.employerProfile.ratingCount };
  }
  return { avg: 0, count: 0 };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

function Avatar({ url, name, size = 96 }: { url: string | null; name: string; size?: number }) {
  if (url) {
    const optimizedSrc = url.includes('/uploads/') && !url.includes('?w=')
      ? `${url}?w=${size * 2}&h=${size * 2}`
      : url;
    return (
      <img
        src={optimizedSrc}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover border-4 border-white shadow-lg"
        style={{ width: size, height: size }}
        loading="lazy"
        decoding="async"
      />
    );
  }
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div
      className="rounded-full bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold border-4 border-white shadow-lg"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

// Badge mapping
const BADGE_CONFIG: Record<string, { label: string; color: string }> = {
  none: { label: '', color: '' },
  rising: { label: 'Rising Talent', color: 'bg-blue-100 text-blue-700' },
  top_rated: { label: 'Top Rated', color: 'bg-amber-100 text-amber-700' },
  expert: { label: 'Expert', color: 'bg-purple-100 text-purple-700' },
};

// ===================================================================
// STATS CARD
// ===================================================================

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <Icon className="w-5 h-5 text-primary-600 mx-auto mb-1.5" />
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// ===================================================================
// REVIEW CARD
// ===================================================================

function ReviewCard({ review }: { review: PublicUserProfile['reviewsReceived'][number] }) {
  const reviewerName = review.reviewer.studentProfile
    ? `${review.reviewer.studentProfile.firstName} ${review.reviewer.studentProfile.lastName}`
    : review.reviewer.employerProfile?.businessName || 'User';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${review.reviewer.id}`}>
          <Avatar url={review.reviewer.avatarUrl} name={reviewerName} size={40} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <Link href={`/profile/${review.reviewer.id}`} className="text-sm font-semibold text-gray-900 hover:underline">
              {reviewerName}
            </Link>
            <span className="text-xs text-gray-400">{timeAgo(review.createdAt)}</span>
          </div>
          <div className="mt-0.5">
            <StarRating rating={review.rating} size={14} />
          </div>
          {review.comment && (
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// POST CARD (simplified for profile)
// ===================================================================

function ProfilePostCard({ post }: { post: CommunityPost }) {
  const POST_TYPES: Record<string, { icon: string; color: string }> = {
    discussion: { icon: '\uD83D\uDCAC', color: 'bg-blue-100 text-blue-700' },
    question: { icon: '\u2753', color: 'bg-amber-100 text-amber-700' },
    tip: { icon: '\uD83D\uDCA1', color: 'bg-green-100 text-green-700' },
    achievement: { icon: '\uD83C\uDFC6', color: 'bg-purple-100 text-purple-700' },
    event: { icon: '\uD83D\uDCC5', color: 'bg-red-100 text-red-700' },
  };
  const typeConfig = POST_TYPES[post.type] || POST_TYPES.discussion;

  return (
    <Link href={`/community`} className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConfig.color}`}>
            {typeConfig.icon} {post.type}
          </span>
          <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-800 line-clamp-3 leading-relaxed">{post.content}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <HandThumbUpIcon className="w-3.5 h-3.5" />
            {post.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
            {post.commentCount}
          </span>
          {post.viewCount > 0 && (
            <span className="flex items-center gap-1">
              <EyeIcon className="w-3.5 h-3.5" />
              {post.viewCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ===================================================================
// MAIN PAGE
// ===================================================================

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const toast = useToast();
  const { user } = useAuth();

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'reviews' | 'about'>('about');
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotalPages, setPostsTotalPages] = useState(1);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [followLoading, setFollowLoading] = useState(false);
  const [reputation, setReputation] = useState<{ score: number; tier: { name: string; level: number } } | null>(null);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await usersApi.getPublicProfile(userId);
        setProfile(data);
        setFollowCounts({
          followers: data._count.followers,
          following: data._count.following,
        });
      } catch {
        toast.error('Failed to load profile.');
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  // Load reputation
  useEffect(() => {
    communityApi.getReputation(userId).then(setReputation).catch(() => {});
  }, [userId]);

  // Load follow status for logged-in users viewing someone else's profile
  useEffect(() => {
    if (!user || isOwnProfile) return;
    usersApi
      .getFollowStatus(userId)
      .then((res) => {
        setIsFollowing(res.isFollowing);
        setFollowCounts({ followers: res.followers, following: res.following });
      })
      .catch(() => {});
  }, [userId, user, isOwnProfile]);

  async function handleFollowToggle() {
    if (!user || isOwnProfile) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await usersApi.unfollowUser(userId);
        setIsFollowing(false);
        setFollowCounts((c) => ({ ...c, followers: Math.max(0, c.followers - 1) }));
      } else {
        await usersApi.followUser(userId);
        setIsFollowing(true);
        setFollowCounts((c) => ({ ...c, followers: c.followers + 1 }));
      }
    } catch {
      toast.error('Failed to update follow status.');
    }
    setFollowLoading(false);
  }

  const loadPosts = useCallback(async (page = 1) => {
    setPostsLoading(true);
    try {
      const res = await communityApi.getUserFeed(userId, { page, limit: 10 });
      if (page === 1) {
        setPosts(res.items);
      } else {
        setPosts((prev) => [...prev, ...res.items]);
      }
      setPostsPage(page);
      setPostsTotalPages(res.pages);
    } catch {
      toast.error('Failed to load posts.');
    }
    setPostsLoading(false);
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'posts' && posts.length === 0) {
      loadPosts(1);
    }
  }, [activeTab, loadPosts, posts.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Profile not found</p>
        <Link href="/" className="text-primary-600 hover:underline text-sm font-medium">
          Go home
        </Link>
      </div>
    );
  }

  const displayName = getDisplayName(profile);
  const title = getTitle(profile);
  const org = getOrg(profile);
  const rating = getRating(profile);
  const isStudent = profile.role === 'student';
  const sp = profile.studentProfile;
  const ep = profile.employerProfile;
  const badge = sp ? BADGE_CONFIG[sp.talentBadge] : null;

  const tabs = [
    { key: 'about' as const, label: 'About' },
    { key: 'posts' as const, label: `Posts (${profile._count.communityPosts})` },
    { key: 'reviews' as const, label: `Reviews (${profile._count.reviewsReceived})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover & Header */}
      <div className="bg-linear-to-br from-gray-900 via-gray-800 to-primary-900 h-48 sm:h-56 relative">
        <div className="absolute top-4 left-4">
          <Link
            href="/community"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Community
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 -mt-16 relative z-10">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="-mt-20 sm:-mt-24 shrink-0">
                <Avatar url={profile.avatarUrl} name={displayName} size={112} />
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{displayName}</h1>
                  {((sp?.isVerified) || (ep?.isVerified)) && (
                    <CheckBadgeIcon className="w-6 h-6 text-primary-500 shrink-0" />
                  )}
                  {badge && badge.label && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                  )}
                  {reputation && reputation.score >= 50 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      reputation.tier.name === 'Leader' ? 'bg-amber-100 text-amber-700' :
                      reputation.tier.name === 'Expert' ? 'bg-purple-100 text-purple-700' :
                      reputation.tier.name === 'Contributor' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {reputation.tier.name}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mt-0.5">{title}</p>

                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                  {org && (
                    <span className="flex items-center gap-1">
                      {isStudent ? <AcademicCapIcon className="w-4 h-4" /> : <BriefcaseIcon className="w-4 h-4" />}
                      {org}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    Joined {formatDate(profile.createdAt)}
                  </span>
                </div>

                {rating.count > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={rating.avg} size={16} />
                    <span className="text-sm text-gray-600 font-medium">
                      {rating.avg.toFixed(1)} ({rating.count} review{rating.count !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}

                {/* Follow counts & button */}
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{followCounts.followers}</span>{' '}
                    follower{followCounts.followers !== 1 ? 's' : ''}
                  </span>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{followCounts.following}</span>{' '}
                    following
                  </span>

                  {user && !isOwnProfile && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`ml-auto px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                        isFollowing
                          ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-300'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      } disabled:opacity-50`}
                    >
                      {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="border-t border-gray-100 bg-gray-50/50 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {isStudent && sp ? (
                <>
                  <StatCard icon={BriefcaseIcon} label="Gigs Completed" value={sp.gigsCompleted} />
                  <StatCard icon={ChartBarIcon} label="Job Success" value={`${sp.jobSuccessScore}%`} />
                  <StatCard icon={ClockIcon} label="On-Time Rate" value={`${Number(sp.onTimeRate)}%`} />
                  <StatCard icon={ChatBubbleLeftRightIcon} label="Community Posts" value={profile._count.communityPosts} />
                  {reputation && <StatCard icon={SparklesIcon} label="Reputation" value={reputation.score} sub={reputation.tier.name} />}
                </>
              ) : ep ? (
                <>
                  <StatCard icon={BriefcaseIcon} label="Gigs Posted" value={ep.gigsPosted} />
                  <StatCard icon={CurrencyDollarIcon} label="Total Spent" value={`GH\u20B5${Number(ep.totalSpent).toLocaleString()}`} />
                  <StatCard icon={UserGroupIcon} label="Hire Rate" value={`${Number(ep.hireRate)}%`} />
                  <StatCard icon={ChatBubbleLeftRightIcon} label="Community Posts" value={profile._count.communityPosts} />
                  {reputation && <StatCard icon={SparklesIcon} label="Reputation" value={reputation.score} sub={reputation.tier.name} />}
                </>
              ) : (
                <>
                  <StatCard icon={ChatBubbleLeftRightIcon} label="Community Posts" value={profile._count.communityPosts} />
                  {reputation && <StatCard icon={SparklesIcon} label="Reputation" value={reputation.score} sub={reputation.tier.name} />}
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex px-3 sm:px-6 lg:px-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4 sm:mt-6 pb-16">
          {/* ── About Tab ── */}
          {activeTab === 'about' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Bio */}
              {(sp?.bio || ep?.description) && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {sp?.bio || ep?.description}
                  </p>
                </div>
              )}

              {/* Student Details */}
              {isStudent && sp && (
                <>
                  {/* Skills */}
                  {sp.skills.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                      <h2 className="text-lg font-bold text-gray-900 mb-3">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {sp.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education & Rate */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sp.university && (
                        <div className="flex items-start gap-3">
                          <AcademicCapIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{sp.university}</div>
                            {sp.major && <div className="text-xs text-gray-500">{sp.major}</div>}
                          </div>
                        </div>
                      )}
                      {sp.hourlyRate && (
                        <div className="flex items-start gap-3">
                          <CurrencyDollarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              GH{'\u20B5'}{Number(sp.hourlyRate).toFixed(2)}/hr
                            </div>
                            <div className="text-xs text-gray-500">Hourly Rate</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Portfolio */}
                  {sp.portfolioUrls.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                      <h2 className="text-lg font-bold text-gray-900 mb-3">Portfolio</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {sp.portfolioUrls.map((url, i) => {
                          const isImage = /\.(jpg|jpeg|png|webp|avif|gif|bmp)(\?|$)/i.test(url) || url.includes('/uploads/portfolio/');
                          if (isImage) {
                            const thumbSrc = url.includes('/uploads/') ? `${url}?w=400&h=300` : url;
                            return (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-4/3 rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-primary-500 transition-all">
                                <img src={thumbSrc} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                              </a>
                            );
                          }
                          return (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:underline text-sm col-span-full">
                              <LinkIcon className="w-4 h-4" />
                              {url.replace(/^https?:\/\//, '').slice(0, 50)}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Employer Details */}
              {!isStudent && ep && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Company Info</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ep.businessType && (
                      <div className="flex items-start gap-3">
                        <BriefcaseIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ep.businessType}</div>
                          <div className="text-xs text-gray-500">Industry</div>
                        </div>
                      </div>
                    )}
                    {ep.website && (
                      <div className="flex items-start gap-3">
                        <LinkIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <a
                          href={ep.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:underline"
                        >
                          {ep.website.replace(/^https?:\/\//, '').slice(0, 40)}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Posts Tab ── */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {postsLoading && posts.length === 0 ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No community posts yet</p>
                </div>
              ) : (
                <>
                  {posts.map((post) => (
                    <ProfilePostCard key={post.id} post={post} />
                  ))}
                  {postsPage < postsTotalPages && (
                    <button
                      onClick={() => loadPosts(postsPage + 1)}
                      disabled={postsLoading}
                      className="w-full py-3 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-xl border border-gray-200 bg-white transition-colors disabled:opacity-50"
                    >
                      {postsLoading ? 'Loading...' : 'Load more posts'}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Reviews Tab ── */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {profile.reviewsReceived.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <StarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No reviews yet</p>
                </div>
              ) : (
                profile.reviewsReceived.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

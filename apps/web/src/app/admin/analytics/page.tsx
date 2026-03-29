'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChatBubbleLeftRightIcon,
  HeartIcon,
  EyeIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { communityApi, type CommunityAnalytics } from '@/lib/api';

// ===================================================================
// HELPERS
// ===================================================================

function getContributorName(c: CommunityAnalytics['topContributors'][number]): string {
  if (c.studentProfile) return `${c.studentProfile.firstName} ${c.studentProfile.lastName}`;
  if (c.employerProfile) return c.employerProfile.businessName;
  return 'User';
}

function getPostAuthorName(p: CommunityAnalytics['topPosts'][number]): string {
  if (p.author.studentProfile) return `${p.author.studentProfile.firstName} ${p.author.studentProfile.lastName}`;
  if (p.author.employerProfile) return p.author.employerProfile.businessName;
  return 'User';
}

function getTierStyle(score: number): string {
  if (score >= 1000) return 'bg-amber-100 text-amber-700';
  if (score >= 500) return 'bg-purple-100 text-purple-700';
  if (score >= 200) return 'bg-green-100 text-green-700';
  if (score >= 50) return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-600';
}

function getTierName(score: number): string {
  if (score >= 1000) return 'Leader';
  if (score >= 500) return 'Expert';
  if (score >= 200) return 'Contributor';
  if (score >= 50) return 'Active';
  return 'Newcomer';
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GH', { month: 'short', day: 'numeric' });
}

function Avatar({ url, name, size = 32 }: { url: string | null; name: string; size?: number }) {
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
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        loading="lazy"
        decoding="async"
      />
    );
  }
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div
      className="rounded-full bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

// ===================================================================
// STAT CARD
// ===================================================================

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ===================================================================
// ACTIVITY CHART (Simple bar chart)
// ===================================================================

function DailyChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) return <p className="text-sm text-gray-400 text-center py-8">No data yet</p>;

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1 h-40">
      {data.map((d, i) => {
        const height = Math.max((d.count / max) * 100, 2);
        const dateObj = new Date(d.date);
        const label = dateObj.toLocaleDateString('en-GH', { month: 'short', day: 'numeric' });
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full bg-primary-500 rounded-t hover:bg-primary-600 transition-colors min-w-1"
              style={{ height: `${height}%` }}
            />
            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-10">
              {label}: {d.count} post{d.count !== 1 ? 's' : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===================================================================
// MAIN PAGE
// ===================================================================

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<CommunityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    communityApi.getCommunityAnalytics()
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center py-16">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8">
        <p className="text-red-500">Failed to load community analytics.</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Community Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Engagement metrics, top contributors, and growth trends</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={DocumentTextIcon}
          label="Total Posts"
          value={analytics.overview.totalPosts}
          sub={`${analytics.activity.posts.today} today · ${analytics.activity.posts.week} this week`}
          color="bg-blue-500"
        />
        <StatCard
          icon={ChatBubbleLeftIcon}
          label="Total Comments"
          value={analytics.overview.totalComments}
          sub={`${analytics.activity.comments.today} today · ${analytics.activity.comments.week} this week`}
          color="bg-green-500"
        />
        <StatCard
          icon={HeartIcon}
          label="Total Likes"
          value={analytics.overview.totalLikes}
          color="bg-red-500"
        />
        <StatCard
          icon={EyeIcon}
          label="Total Views"
          value={analytics.overview.totalViews}
          sub={`${analytics.activity.activeUsersWeek} active users this week`}
          color="bg-purple-500"
        />
      </div>

      {/* Activity Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Posts Activity</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Today</span>
              <span className="font-semibold text-gray-900">{analytics.activity.posts.today}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">This Week</span>
              <span className="font-semibold text-gray-900">{analytics.activity.posts.week}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">This Month</span>
              <span className="font-semibold text-gray-900">{analytics.activity.posts.month}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Comments Activity</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Today</span>
              <span className="font-semibold text-gray-900">{analytics.activity.comments.today}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">This Week</span>
              <span className="font-semibold text-gray-900">{analytics.activity.comments.week}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">This Month</span>
              <span className="font-semibold text-gray-900">{analytics.activity.comments.month}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Engagement</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Active Users (7d)</span>
              <span className="font-semibold text-gray-900">{analytics.activity.activeUsersWeek}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Avg Likes/Post</span>
              <span className="font-semibold text-gray-900">
                {analytics.overview.totalPosts > 0
                  ? (analytics.overview.totalLikes / analytics.overview.totalPosts).toFixed(1)
                  : '0'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Avg Comments/Post</span>
              <span className="font-semibold text-gray-900">
                {analytics.overview.totalPosts > 0
                  ? (analytics.overview.totalComments / analytics.overview.totalPosts).toFixed(1)
                  : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Post Counts Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-700">Posts Per Day (Last 30 Days)</h3>
        </div>
        <DailyChart data={analytics.dailyPostCounts} />
      </div>

      {/* Two columns: Top Posts & Top Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Engaged Posts */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Most Engaged Posts</h3>
          </div>
          <div className="space-y-3">
            {analytics.topPosts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No posts yet</p>
            )}
            {analytics.topPosts.map((post, i) => (
              <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xs font-bold text-gray-400 mt-1 w-5 shrink-0">#{i + 1}</span>
                <Avatar url={post.author.avatarUrl} name={getPostAuthorName(post)} size={28} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="font-medium text-gray-500">{getPostAuthorName(post)}</span>
                    <span>{timeAgo(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-0.5">
                      <HeartIcon className="w-3 h-3" /> {post.likeCount}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <ChatBubbleLeftIcon className="w-3 h-3" /> {post.commentCount}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <EyeIcon className="w-3 h-3" /> {post.viewCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Top Contributors</h3>
          </div>
          <div className="space-y-3">
            {analytics.topContributors.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No contributors yet</p>
            )}
            {analytics.topContributors.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xs font-bold text-gray-400 w-5 shrink-0">#{i + 1}</span>
                <Avatar url={c.avatarUrl} name={getContributorName(c)} size={36} />
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${c.id}`} className="text-sm font-semibold text-gray-900 hover:underline">
                    {getContributorName(c)}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getTierStyle(c.reputationScore)}`}>
                      {getTierName(c.reputationScore)}
                    </span>
                    <span className="text-xs text-gray-400">{c.reputationScore} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

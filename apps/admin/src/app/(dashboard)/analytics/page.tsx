'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChatBubbleLeftRightIcon,
  HeartIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { communityApi, type CommunityAnalytics } from '@/lib/api';

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
  if (score >= 1000) return 'bg-amber-900/50 text-amber-300';
  if (score >= 500) return 'bg-purple-900/50 text-purple-300';
  if (score >= 200) return 'bg-green-900/50 text-green-300';
  if (score >= 50) return 'bg-blue-900/50 text-blue-300';
  return 'bg-gray-700 text-gray-400';
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
      className="rounded-full bg-linear-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 flex items-start gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p className="text-sm text-gray-400 font-medium">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function DailyChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) return <p className="text-sm text-gray-500 text-center py-8">No data yet</p>;

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
              className="w-full bg-red-600 rounded-t hover:bg-red-500 transition-colors min-w-1"
              style={{ height: `${height}%` }}
            />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-[10px] px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-10 border border-gray-600">
              {label}: {d.count} post{d.count !== 1 ? 's' : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-3 border-gray-600 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return <p className="text-red-400">Failed to load community analytics.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Community Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Engagement metrics, top contributors, and growth trends</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={DocumentTextIcon}
          label="Total Posts"
          value={analytics.overview.totalPosts}
          sub={`${analytics.activity.posts.today} today · ${analytics.activity.posts.week} this week`}
          color="bg-blue-600"
        />
        <StatCard
          icon={ChatBubbleLeftIcon}
          label="Total Comments"
          value={analytics.overview.totalComments}
          sub={`${analytics.activity.comments.today} today · ${analytics.activity.comments.week} this week`}
          color="bg-green-600"
        />
        <StatCard
          icon={HeartIcon}
          label="Total Likes"
          value={analytics.overview.totalLikes}
          color="bg-red-600"
        />
        <StatCard
          icon={EyeIcon}
          label="Total Views"
          value={analytics.overview.totalViews}
          sub={`${analytics.activity.activeUsersWeek} active users this week`}
          color="bg-purple-600"
        />
      </div>

      {/* Activity Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Posts Activity</h3>
          <div className="space-y-2">
            {[
              ['Today', analytics.activity.posts.today],
              ['This Week', analytics.activity.posts.week],
              ['This Month', analytics.activity.posts.month],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between text-sm">
                <span className="text-gray-400">{label}</span>
                <span className="font-semibold text-white">{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Comments Activity</h3>
          <div className="space-y-2">
            {[
              ['Today', analytics.activity.comments.today],
              ['This Week', analytics.activity.comments.week],
              ['This Month', analytics.activity.comments.month],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between text-sm">
                <span className="text-gray-400">{label}</span>
                <span className="font-semibold text-white">{val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Engagement</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Active Users (7d)</span>
              <span className="font-semibold text-white">{analytics.activity.activeUsersWeek}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Avg Likes/Post</span>
              <span className="font-semibold text-white">
                {analytics.overview.totalPosts > 0
                  ? (analytics.overview.totalLikes / analytics.overview.totalPosts).toFixed(1)
                  : '0'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Avg Comments/Post</span>
              <span className="font-semibold text-white">
                {analytics.overview.totalPosts > 0
                  ? (analytics.overview.totalComments / analytics.overview.totalPosts).toFixed(1)
                  : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Post Counts Chart */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ArrowTrendingUpIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-300">Posts Per Day (Last 30 Days)</h3>
        </div>
        <DailyChart data={analytics.dailyPostCounts} />
      </div>

      {/* Two columns: Top Posts & Top Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-300">Most Engaged Posts</h3>
          </div>
          <div className="space-y-3">
            {analytics.topPosts.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No posts yet</p>
            )}
            {analytics.topPosts.map((post, i) => (
              <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                <span className="text-xs font-bold text-gray-500 mt-1 w-5 shrink-0">#{i + 1}</span>
                <Avatar url={post.author.avatarUrl} name={getPostAuthorName(post)} size={28} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="font-medium text-gray-400">{getPostAuthorName(post)}</span>
                    <span>{timeAgo(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-0.5"><HeartIcon className="w-3 h-3" /> {post.likeCount}</span>
                    <span className="flex items-center gap-0.5"><ChatBubbleLeftIcon className="w-3 h-3" /> {post.commentCount}</span>
                    <span className="flex items-center gap-0.5"><EyeIcon className="w-3 h-3" /> {post.viewCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-300">Top Contributors</h3>
          </div>
          <div className="space-y-3">
            {analytics.topContributors.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No contributors yet</p>
            )}
            {analytics.topContributors.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors">
                <span className="text-xs font-bold text-gray-500 w-5 shrink-0">#{i + 1}</span>
                <Avatar url={c.avatarUrl} name={getContributorName(c)} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{getContributorName(c)}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getTierStyle(c.reputationScore)}`}>
                      {getTierName(c.reputationScore)}
                    </span>
                    <span className="text-xs text-gray-500">{c.reputationScore} pts</span>
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

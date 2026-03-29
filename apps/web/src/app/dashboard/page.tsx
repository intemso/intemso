'use client';

import Link from 'next/link';
import {
  ArrowTrendingUpIcon,
  ArrowUpRightIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
  HeartIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

const STATS = [
  {
    label: 'Active Contracts',
    value: '2',
    change: '+1 this week',
    changeType: 'positive' as const,
    icon: BriefcaseIcon,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Pending Proposals',
    value: '5',
    change: '2 viewed',
    changeType: 'neutral' as const,
    icon: DocumentTextIcon,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Earnings (This Month)',
    value: 'GH₵680',
    change: '+23% vs last month',
    changeType: 'positive' as const,
    icon: CurrencyDollarIcon,
    color: 'bg-green-50 text-green-600',
  },
  {
    label: 'Profile Views',
    value: '47',
    change: '+12 this week',
    changeType: 'positive' as const,
    icon: EyeIcon,
    color: 'bg-purple-50 text-purple-600',
  },
];

const ACTIVE_CONTRACTS = [
  {
    id: 'c1',
    title: 'Type Up 50 Pages of Lecture Notes',
    client: 'Nana Agyeman',
    budget: 'GH₵200',
    milestone: 'Pages 26-50 - 50%',
    dueDate: 'Mar 20, 2026',
    status: 'in-progress',
  },
  {
    id: 'c2',
    title: 'Manage Instagram & TikTok for 1 Month',
    client: 'CampusWear GH',
    budget: 'GH₵500',
    milestone: 'Week 2 Posts - 50%',
    dueDate: 'Mar 31, 2026',
    status: 'in-progress',
  },
  {
    id: 'c3',
    title: 'App Testing for QuickDrop Campus Delivery',
    client: 'QuickDrop GH',
    budget: 'GH₵60',
    milestone: 'Feedback Submitted - 100%',
    dueDate: 'Mar 11, 2026',
    status: 'review',
  },
];

const RECENT_PROPOSALS = [
  {
    id: 'p1',
    title: 'Conduct Campus Survey on Study Habits',
    budget: 'GH₵350',
    submitted: '2 days ago',
    status: 'pending',
  },
  {
    id: 'p2',
    title: '3 Ushers for Wedding Reception Saturday',
    budget: 'GH₵250',
    submitted: '3 days ago',
    status: 'viewed',
  },
  {
    id: 'p3',
    title: 'Distribute 500 Flyers Around Legon Campus',
    budget: 'GH₵100',
    submitted: '5 days ago',
    status: 'shortlisted',
  },
  {
    id: 'p4',
    title: 'Beta Test a Study Group Matching App',
    budget: 'GH₵70',
    submitted: '1 week ago',
    status: 'declined',
  },
];

const RECOMMENDED_GIGS = [
  {
    id: 'r1',
    title: '8 Students to Hand Out Flyers at KNUST',
    budget: 'GH₵80 - GH₵120',
    skills: ['Flyer Distribution', 'Physical Tasks'],
    proposals: 4,
    postedAt: '1 hour ago',
  },
  {
    id: 'r2',
    title: 'Tutor for Level 100 Maths This Weekend',
    budget: 'GH₵150 - GH₵250',
    skills: ['Maths Tutoring', 'Tutoring'],
    proposals: 7,
    postedAt: '3 hours ago',
  },
  {
    id: 'r3',
    title: 'Enter Survey Data Into Google Sheets (200 Responses)',
    budget: 'GH₵100 - GH₵180',
    skills: ['Data Entry', 'Google Sheets'],
    proposals: 2,
    postedAt: '5 hours ago',
  },
];

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Pending' },
  viewed: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Viewed' },
  shortlisted: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    label: 'Shortlisted',
  },
  declined: { bg: 'bg-red-50', text: 'text-red-600', label: 'Declined' },
  'in-progress': {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    label: 'In Progress',
  },
  review: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    label: 'In Review',
  },
};

// Earnings chart data (simplified)
const EARNINGS_MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EARNINGS_DATA = [45000, 78000, 62000, 120000, 155000, 185000];
const maxEarning = Math.max(...EARNINGS_DATA);

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Welcome back, Jay! 👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            Here&apos;s what&apos;s happening with your work today.
          </p>
        </div>
        <Link
          href="/gigs"
          className="hidden sm:flex items-center gap-2 btn-primary"
        >
          Find New Gigs
          <ArrowUpRightIcon className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3.5 sm:p-5 hover:shadow-card transition-shadow active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              {stat.changeType === 'positive' && (
                <span className="hidden sm:flex items-center gap-0.5 text-xs font-medium text-green-600">
                  <ArrowTrendingUpIcon className="w-3 h-3" />
                  {stat.change}
                </span>
              )}
              {stat.changeType === 'neutral' && (
                <span className="hidden sm:block text-xs text-gray-400">{stat.change}</span>
              )}
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Active Contracts */}
        <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Active Contracts
            </h2>
            <Link
              href="/dashboard/contracts"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View All
              <ChevronRightIcon className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {ACTIVE_CONTRACTS.map((contract) => {
              const style = statusStyles[contract.status];
              return (
                <Link
                  key={contract.id}
                  href={`/dashboard/contracts/${contract.id}`}
                  className="block p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {contract.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {contract.client} • {contract.budget}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
                    >
                      {style.label}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-500">
                        {contract.milestone}
                      </span>
                      <span className="text-gray-400">
                        Due {contract.dueDate}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          contract.status === 'review'
                            ? 'bg-amber-400'
                            : 'bg-primary-500'
                        }`}
                        style={{
                          width: contract.milestone.match(/\d+/)?.[0] + '%',
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Earnings Chart */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Earnings</h2>
            <Link
              href="/dashboard/earnings"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Details
            </Link>
          </div>
          <div className="text-center mb-4 sm:mb-6">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">GH₵645,000</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Total earned</p>
          </div>
          {/* Simple bar chart */}
          <div className="flex items-end gap-2 h-32">
            {EARNINGS_DATA.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    idx === EARNINGS_DATA.length - 1
                      ? 'bg-primary-500'
                      : 'bg-primary-100'
                  }`}
                  style={{ height: `${(val / maxEarning) * 100}%` }}
                />
                <span className="text-[10px] text-gray-400">
                  {EARNINGS_MONTHS[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Proposals */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Recent Proposals
            </h2>
            <Link
              href="/dashboard/proposals"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View All
              <ChevronRightIcon className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {RECENT_PROPOSALS.map((proposal) => {
              const style = statusStyles[proposal.status];
              return (
                <div
                  key={proposal.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {proposal.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {proposal.budget} • {proposal.submitted}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
                  >
                    {style.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Gigs */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Recommended for You
            </h2>
            <Link
              href="/gigs"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Browse All
              <ChevronRightIcon className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {RECOMMENDED_GIGS.map((gig) => (
              <Link
                key={gig.id}
                href={`/gigs/${gig.id}`}
                className="block p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {gig.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {gig.budget} • {gig.proposals} proposals •{' '}
                      {gig.postedAt}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {gig.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-medium rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Community Activity */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-primary-600" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Community Activity</h2>
          </div>
          <Link
            href="/community"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View Community
            <ChevronRightIcon className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="text-center p-4 bg-primary-50/50 rounded-xl">
            <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">--</p>
            <p className="text-xs text-gray-500">Your Posts</p>
          </div>
          <div className="text-center p-4 bg-red-50/50 rounded-xl">
            <HeartIcon className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">--</p>
            <p className="text-xs text-gray-500">Total Likes</p>
          </div>
          <div className="text-center p-4 bg-amber-50/50 rounded-xl">
            <ExclamationCircleIcon className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">--</p>
            <p className="text-xs text-gray-500">Unread Replies</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center">
          Stats will populate once you start posting in the community
        </p>
      </div>
    </div>
  );
}

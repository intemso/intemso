'use client';

import { useState, useEffect } from 'react';
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
import { useAuth } from '@/context/auth';
import { contractsApi, applicationsApi, type ContractListItem, type ApplicationListItem } from '@/lib/api';

interface DashboardStats {
  activeContracts: number;
  pendingApplications: number;
  monthlyEarnings: number;
  profileViews: number;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  applied: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Applied' },
  reviewed: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Under Review' },
  hired: { bg: 'bg-green-50', text: 'text-green-700', label: 'Hired' },
  declined: { bg: 'bg-red-50', text: 'text-red-600', label: 'Declined' },
  withdrawn: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Withdrawn' },
  active: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'In Progress' },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'In Progress' },
  review: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'In Review' },
  completed: { bg: 'bg-green-50', text: 'text-green-700', label: 'Completed' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ activeContracts: 0, pendingApplications: 0, monthlyEarnings: 0, profileViews: 0 });
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = (user?.studentProfile as any)?.firstName
    ?? (user?.employerProfile as any)?.contactName?.split(' ')[0]
    ?? 'there';

  useEffect(() => {
    async function load() {
      try {
        const [contractsRes, appsRes] = await Promise.allSettled([
          contractsApi.listMine({ status: 'active', limit: 3 }),
          applicationsApi.listMine({ limit: 4 }),
        ]);
        if (contractsRes.status === 'fulfilled') {
          setContracts(contractsRes.value?.data ?? []);
          setStats(prev => ({ ...prev, activeContracts: contractsRes.value?.meta?.total ?? 0 }));
        }
        if (appsRes.status === 'fulfilled') {
          setApplications(appsRes.value?.data ?? []);
          setStats(prev => ({ ...prev, pendingApplications: appsRes.value?.meta?.total ?? 0 }));
        }
      } catch {
        // silently fail — dashboard shows zeros
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const STATS_DISPLAY = [
    { label: 'Active Contracts', value: String(stats.activeContracts), icon: BriefcaseIcon, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Applications', value: String(stats.pendingApplications), icon: DocumentTextIcon, color: 'bg-amber-50 text-amber-600' },
    { label: 'Earnings (This Month)', value: `GH₵${stats.monthlyEarnings.toLocaleString()}`, icon: CurrencyDollarIcon, color: 'bg-green-50 text-green-600' },
    { label: 'Profile Views', value: '--', icon: EyeIcon, color: 'bg-purple-50 text-purple-600' },
  ];
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Welcome back, {firstName}!
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
        {STATS_DISPLAY.map((stat) => (
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
              href="/contracts"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View All
              <ChevronRightIcon className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {contracts.length === 0 ? (
              <div className="text-center py-8">
                <BriefcaseIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active contracts yet</p>
                <Link href="/gigs" className="text-sm text-primary-600 font-medium hover:underline mt-1 inline-block">Browse gigs to get started</Link>
              </div>
            ) : contracts.map((contract) => {
              const style = statusStyles[contract.status] ?? statusStyles.pending;
              return (
                <Link
                  key={contract.id}
                  href={`/contracts/${contract.id}`}
                  className="block p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {contract.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {contract.employer?.businessName} &bull; GH₵{parseFloat(contract.agreedRate).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
                    >
                      {style.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Earnings</h2>
            <Link
              href="/earnings"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Details
            </Link>
          </div>
          <div className="text-center py-8">
            <CurrencyDollarIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">GH₵{stats.monthlyEarnings.toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1">This month</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Recent Applications
            </h2>
            <Link
              href="/applications"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View All
              <ChevronRightIcon className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No applications yet</p>
                <Link href="/gigs" className="text-sm text-primary-600 font-medium hover:underline mt-1 inline-block">Find gigs to apply</Link>
              </div>
            ) : applications.map((application) => {
              const style = statusStyles[application.status] ?? statusStyles.applied;
              return (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {application.gig?.title ?? 'Untitled Gig'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {application.gig?.budgetMin ? `GH₵${parseFloat(application.gig.budgetMin).toLocaleString()}` : 'Negotiable'} &bull; {new Date(application.createdAt).toLocaleDateString()}
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

        {/* Browse Gigs */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Find Work
            </h2>
            <Link
              href="/gigs"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Browse All
              <ChevronRightIcon className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-center py-8">
            <ArrowUpRightIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">Explore available gigs and start earning</p>
            <Link href="/gigs" className="btn-primary inline-flex items-center gap-2">
              Browse Gigs
              <ArrowUpRightIcon className="w-4 h-4" />
            </Link>
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
          <a
            href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://intemso.com'}/community`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View Community
            <ChevronRightIcon className="w-3 h-3" />
          </a>
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

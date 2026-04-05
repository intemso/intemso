'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  RectangleStackIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/auth';
import {
  contractsApi,
  applicationsApi,
  gigsApi,
  type ContractListItem,
  type ApplicationListItem,
  type GigListItem,
} from '@/lib/api';

const statusColors: Record<string, string> = {
  applied: 'bg-blue-500',
  reviewed: 'bg-amber-500',
  hired: 'bg-green-500',
  declined: 'bg-red-400',
  withdrawn: 'bg-gray-400',
  active: 'bg-blue-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  paused: 'bg-amber-400',
  open: 'bg-emerald-500',
  draft: 'bg-gray-400',
  closed: 'bg-red-400',
};

const statusLabels: Record<string, string> = {
  applied: 'Applied',
  reviewed: 'Reviewing',
  hired: 'Hired',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
  active: 'Active',
  in_progress: 'In Progress',
  completed: 'Completed',
  paused: 'Paused',
  open: 'Open',
  draft: 'Draft',
  closed: 'Closed',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatCurrency(value: string | number) {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (!n || isNaN(n)) return 'GH₵0';
  return `GH₵${n.toLocaleString()}`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [gigs, setGigs] = useState<GigListItem[]>([]);
  const [totals, setTotals] = useState({ contracts: 0, applications: 0, gigs: 0 });
  const [loading, setLoading] = useState(true);

  const ep = user?.employerProfile as Record<string, any> | null;
  const firstName = ep?.contactPerson?.split(' ')[0] || ep?.businessName?.split(' ')[0] || '';

  const load = useCallback(async () => {
    try {
      const [contractsRes, appsRes, gigsRes] = await Promise.allSettled([
        contractsApi.listMine({ status: 'active', limit: 5 }),
        applicationsApi.listReceived({ limit: 5 }),
        gigsApi.listMine({ limit: 4 }),
      ]);
      if (contractsRes.status === 'fulfilled') {
        setContracts(contractsRes.value?.data ?? []);
        setTotals(t => ({ ...t, contracts: contractsRes.value?.meta?.total ?? 0 }));
      }
      if (appsRes.status === 'fulfilled') {
        setApplications(appsRes.value?.data ?? []);
        setTotals(t => ({ ...t, applications: appsRes.value?.meta?.total ?? 0 }));
      }
      if (gigsRes.status === 'fulfilled') {
        setGigs(gigsRes.value?.data ?? []);
        setTotals(t => ({ ...t, gigs: gigsRes.value?.meta?.total ?? 0 }));
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const hasActivity = contracts.length > 0 || applications.length > 0 || gigs.length > 0;

  // Skeleton loader
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-72 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {hasActivity
              ? 'Here\u2019s an overview of your hiring activity.'
              : 'Get started by posting your first gig.'}
          </p>
        </div>
        <Link
          href="/post-gig"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl shadow-sm shadow-amber-200 transition-all hover:shadow-md hover:shadow-amber-200 active:scale-[0.97]"
        >
          <PlusCircleIcon className="w-5 h-5" />
          Post a Gig
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Active Gigs', value: totals.gigs, icon: BriefcaseIcon, color: 'text-blue-600 bg-blue-50', accent: 'border-blue-100' },
          { label: 'Applications', value: totals.applications, icon: DocumentTextIcon, color: 'text-amber-600 bg-amber-50', accent: 'border-amber-100' },
          { label: 'Contracts', value: totals.contracts, icon: CheckCircleIcon, color: 'text-emerald-600 bg-emerald-50', accent: 'border-emerald-100' },
          { label: 'Total Spent', value: formatCurrency(ep?.totalSpent || 0), icon: CurrencyDollarIcon, color: 'text-violet-600 bg-violet-50', accent: 'border-violet-100', isText: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-2xl border ${stat.accent} p-4 sm:p-5 transition-shadow hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — wider */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Contracts */}
          <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900">Active Contracts</h2>
              <Link href="/contracts" className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                View all <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            {contracts.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BriefcaseIcon className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 mb-1">No active contracts</p>
                <p className="text-xs text-gray-400">Hire a student to start a contract</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {contracts.map((c) => (
                  <Link key={c.id} href={`/contracts/${c.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-blue-600">
                        {c.student?.firstName?.[0]}{c.student?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {c.student?.firstName} {c.student?.lastName} &middot; {formatCurrency(c.agreedRate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusColors[c.status] ?? 'bg-gray-400'}`} />
                      <span className="text-xs text-gray-500">{statusLabels[c.status] ?? c.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Recent Applications */}
          <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900">Recent Applications</h2>
              <Link href="/applications" className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                View all <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            {applications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <DocumentTextIcon className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 mb-1">No applications yet</p>
                <p className="text-xs text-gray-400">Post a gig and students will apply</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {applications.map((a) => (
                  <Link key={a.id} href={`/gigs/${a.gigId}/applications`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-amber-600">
                        {a.student?.firstName?.[0]}{a.student?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {a.student?.firstName} {a.student?.lastName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {a.gig?.title ?? 'Gig application'} &middot; {timeAgo(a.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusColors[a.status] ?? 'bg-gray-400'}`} />
                      <span className="text-xs text-gray-500">{statusLabels[a.status] ?? a.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Your Gigs */}
          <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-gray-900">Your Gigs</h2>
              <Link href="/gigs" className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                All gigs <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
            {gigs.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="w-6 h-6 text-amber-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">Post your first gig</p>
                <p className="text-xs text-gray-400 mb-4">Reach thousands of talented students</p>
                <Link
                  href="/post-gig"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <PlusCircleIcon className="w-4 h-4" />
                  Post a Gig
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {gigs.map((g) => (
                  <a
                    key={g.id}
                    href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://intemso.com'}/gigs/${g.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{g.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{g.applicationsCount} applicant{g.applicationsCount !== 1 ? 's' : ''}</span>
                        <span className="text-gray-200">&middot;</span>
                        <span className="text-xs text-gray-400">{timeAgo(g.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusColors[g.status] ?? 'bg-gray-400'}`} />
                      <span className="text-xs text-gray-500 capitalize">{statusLabels[g.status] ?? g.status}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/post-gig"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors group"
              >
                <PlusCircleIcon className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-amber-700">Post a Gig</span>
              </Link>
              <Link
                href="/talent"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
              >
                <MagnifyingGlassIcon className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-blue-700">Find Talent</span>
              </Link>
              <Link
                href="/messages"
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-violet-50 hover:bg-violet-100 transition-colors group"
              >
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-violet-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-violet-700">Messages</span>
              </Link>
              <a
                href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://intemso.com'}/showcase`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors group"
              >
                <RectangleStackIcon className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-emerald-700">Showcase</span>
              </a>
            </div>
          </section>

          {/* Hiring Tips */}
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                <SparklesIcon className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Hiring Tip</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Add screening questions to your gig posts to quickly filter the best candidates and save time reviewing applications.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

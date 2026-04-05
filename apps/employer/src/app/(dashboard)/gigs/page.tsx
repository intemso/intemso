'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

import { gigsApi, type GigListItem } from '@/lib/api';

const TABS = ['active', 'draft', 'closed', 'all'] as const;
const TAB_LABELS: Record<string, string> = {
  active: 'Active',
  draft: 'Draft',
  closed: 'Closed',
  all: 'All',
};

// Map tab to API status filter values
const TAB_STATUS_MAP: Record<string, string | undefined> = {
  active: 'open',
  draft: 'draft',
  closed: 'closed',
  all: undefined,
};

const statusStyles: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-green-50', text: 'text-green-700' },
  draft: { bg: 'bg-gray-100', text: 'text-gray-600' },
  closed: { bg: 'bg-red-50', text: 'text-red-600' },
  reviewing: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  hired: { bg: 'bg-blue-50', text: 'text-blue-700' },
  in_progress: { bg: 'bg-purple-50', text: 'text-purple-700' },
  completed: { bg: 'bg-green-50', text: 'text-green-700' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-600' },
};

function formatBudget(min: string | null, max: string | null) {
  const f = (n: number) => (n >= 1000 ? `GH₵${(n / 1000).toFixed(1)}k` : `GH₵${n}`);
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

export default function MyGigsPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('active');
  const [gigs, setGigs] = useState<GigListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGigs = useCallback(async (tab: string) => {
    setLoading(true);
    try {
      const res = await gigsApi.listMine({ status: TAB_STATUS_MAP[tab] });
      setGigs(res.data);
    } catch {
      setGigs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGigs(activeTab);
  }, [activeTab, fetchGigs]);

  const handleTabChange = (tab: (typeof TABS)[number]) => {
    setActiveTab(tab);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Gigs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your posted gigs and track applications</p>
        </div>
        <Link href="/post-gig" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          Post New Gig
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Gigs */}
      {!loading && (
        <div className="space-y-4">
          {gigs.map((gig) => {
            const style = statusStyles[gig.status] || statusStyles.open;
            return (
              <div
                key={gig.id}
                className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                        {gig.title}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
                        {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {gig.requiredSkills.slice(0, 5).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-full">
                          {skill}
                        </span>
                      ))}
                      {gig.requiredSkills.length > 5 && (
                        <span className="px-2 py-0.5 text-gray-400 text-xs">
                          +{gig.requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-500">
                    <span>Budget: <span className="font-medium text-gray-900">{formatBudget(gig.budgetMin, gig.budgetMax)}</span></span>
                    <span>
                      Applications: <span className="font-medium text-gray-900">{gig.applicationsCount}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <EyeIcon className="w-3.5 h-3.5" />
                      {gig.viewsCount} views
                    </span>
                    <span>Posted {gig.publishedAt ? timeAgo(gig.publishedAt) : timeAgo(gig.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/gigs/${gig.id}/applications`}
                      className="text-sm text-primary-600 font-medium hover:underline"
                    >
                      Applications ({gig.applicationsCount})
                    </Link>
                    <a
                      href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://intemso.com'}/gigs/${gig.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 font-medium hover:underline"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && gigs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No gigs in this category</p>
          <Link href="/post-gig" className="text-primary-600 text-sm font-medium mt-2 inline-block hover:underline">
            Post your first gig
          </Link>
        </div>
      )}
    </div>
  );
}

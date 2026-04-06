'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { gigsApi, type GigListItem } from '@/lib/api';

function formatBudget(min: string | null, max: string | null) {
  const f = (n: number) =>
    n >= 1000 ? `GH₵${(n / 1000).toFixed(1)}k` : `GH₵${n}`;
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

export default function FindWorkPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [gigs, setGigs] = useState<GigListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await gigsApi.list({
        page,
        limit: 12,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(category && { category }),
      });
      setGigs(res.data);
      setTotalPages(res.meta.totalPages);
      setTotal(res.meta.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Find Work</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse available gigs and apply directly.
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search gigs by title, skill, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          <option value="web-app-development">Web & App Development</option>
          <option value="design-creative">Design & Creative</option>
          <option value="writing-content">Writing & Content</option>
          <option value="marketing-social-media">Marketing & Social Media</option>
          <option value="data-analytics">Data & Analytics</option>
          <option value="video-photography">Video & Photography</option>
          <option value="tutoring-academics">Tutoring & Academics</option>
          <option value="business-support">Business Support</option>
          <option value="errands-delivery">Errands & Delivery</option>
          <option value="events-promotions">Events & Promotions</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-gray-400">
          {total} gig{total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-16">
          <BriefcaseIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No gigs found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          {/* Gig cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gigs.map((gig) => (
              <Link
                key={gig.id}
                href={`/gigs/${gig.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                      {gig.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      {gig.employer.businessName}
                      {gig.locationAddress && (
                        <>
                          <span className="text-gray-200">&middot;</span>
                          <MapPinIcon className="w-3 h-3 inline" />
                          {gig.locationAddress}
                        </>
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                    {gig.status === 'open' ? 'Open' : gig.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                  {gig.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {gig.requiredSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {gig.requiredSkills.length > 3 && (
                    <span className="text-xs text-gray-400">+{gig.requiredSkills.length - 3}</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CurrencyDollarIcon className="w-3.5 h-3.5" />
                      {formatBudget(gig.budgetMin, gig.budgetMax)}
                    </span>
                    <span className="capitalize">{gig.budgetType === 'FIXED' ? 'Fixed' : 'Hourly'}</span>
                    <span className="capitalize">{gig.experienceLevel}</span>
                  </div>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {timeAgo(gig.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  HeartIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon,
} from '@heroicons/react/24/solid';

import { GIG_CATEGORIES } from '@intemso/shared';
import { gigsApi, categoriesApi, type GigListItem } from '@/lib/api';

const BUDGET_RANGES = [
  { label: 'Any budget', min: 0, max: 0 },
  { label: 'Under GH₵100', min: 0, max: 100 },
  { label: 'GH₵100 - GH₵300', min: 100, max: 300 },
  { label: 'GH₵300 - GH₵500', min: 300, max: 500 },
  { label: 'GH₵500 - GH₵1,000', min: 500, max: 1000 },
  { label: 'GH₵1,000+', min: 1000, max: 0 },
];

const EXPERIENCE_LEVELS = ['Entry Level', 'Intermediate', 'Expert'];
const DURATIONS = ['Less than 1 day', '1-3 days', '3-7 days', '1-4 weeks', '1+ month'];

function formatBudget(min: string | null, max: string | null) {
  const f = (n: number) =>
    n >= 1000 ? `GH₵${(n / 1000).toFixed(0)}k` : `GH₵${n}`;
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

export default function BrowseGigsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);
  const [expandedSubTypes, setExpandedSubTypes] = useState<Set<string>>(new Set());
  const [budgetRange, setBudgetRange] = useState(0);
  const [experienceLevel, setExperienceLevel] = useState<string[]>([]);
  const [duration, setDuration] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedGig, setSelectedGig] = useState<GigListItem | null>(null);
  const [savedGigs, setSavedGigs] = useState<Set<string>>(new Set());
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // API state
  const [gigs, setGigs] = useState<GigListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchGigs = useCallback(async (pageNum: number, append: boolean = false) => {
    setLoading(true);
    try {
      const res = await gigsApi.list({
        page: pageNum,
        limit: 20,
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
      });
      setGigs((prev) => append ? [...prev, ...res.data] : res.data);
      setTotalPages(res.meta.totalPages);
      setTotal(res.meta.total);
      setPage(pageNum);
    } catch {
      // silently fail — show empty state
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory]);

  // Fetch on filter/search change
  useEffect(() => {
    fetchGigs(1);
  }, [fetchGigs]);

  const loadMore = () => {
    if (page < totalPages) {
      fetchGigs(page + 1, true);
    }
  };

  const toggleSaved = (id: string) => {
    setSavedGigs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExperience = (val: string) => {
    setExperienceLevel((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubType(null);
    setBudgetRange(0);
    setExperienceLevel([]);
    setDuration(null);
  };

  const activeFilters =
    (selectedCategory ? 1 : 0) +
    (selectedSubType ? 1 : 0) +
    (budgetRange > 0 ? 1 : 0) +
    experienceLevel.length +
    (duration ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-14 sm:top-16 z-30">
        <div className="px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gigs..."
                className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-gray-50"
              />
            </div>
            {/* Mobile filter button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden relative p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
              {activeFilters > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <span className="hidden md:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs sm:text-sm font-medium text-gray-700 border border-gray-200 bg-white rounded-lg px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
              >
                <option value="relevance">Most Relevant</option>
                <option value="newest">Newest</option>
                <option value="budget-high">Highest Budget</option>
                <option value="budget-low">Lowest Budget</option>
                <option value="proposals">Fewest Proposals</option>
              </select>
            </div>
            <span className="hidden sm:inline text-xs sm:text-sm text-gray-400">
              {loading ? '...' : `${total} gigs`}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
              <h2 className="text-base font-bold text-gray-900">Filters</h2>
              <div className="flex items-center gap-3">
                {activeFilters > 0 && (
                  <button onClick={clearFilters} className="text-xs text-primary-600 font-medium">
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-4">
              {/* Sort (mobile) */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full text-sm font-medium text-gray-700 border border-gray-200 bg-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="newest">Newest</option>
                  <option value="budget-high">Highest Budget</option>
                  <option value="budget-low">Lowest Budget</option>
                  <option value="proposals">Fewest Proposals</option>
                </select>
              </div>
              {/* Reuse the same filter content */}
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                <div className="space-y-0.5">
                  {GIG_CATEGORIES.filter((c) => c.slug !== 'other').map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          if (isSelected) { setSelectedCategory(null); setSelectedSubType(null); }
                          else { setSelectedCategory(cat.name); setSelectedSubType(null); }
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          isSelected ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-base">{cat.emoji}</span>
                        <span className="flex-1 text-left truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-gray-100 my-5" />
              {/* Budget */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Budget</h3>
                <div className="space-y-1.5">
                  {BUDGET_RANGES.map((range, idx) => (
                    <label key={range.label} className="flex items-center gap-2.5 cursor-pointer px-2 py-2 rounded-lg hover:bg-gray-50">
                      <input type="radio" name="budget-mobile" checked={budgetRange === idx} onChange={() => setBudgetRange(idx)} className="h-4 w-4 text-primary-600 border-gray-300" />
                      <span className="text-sm text-gray-600">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 my-5" />
              {/* Experience */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Experience Level</h3>
                <div className="space-y-1.5">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <label key={level} className="flex items-center gap-2.5 cursor-pointer px-2 py-2 rounded-lg hover:bg-gray-50">
                      <input type="checkbox" checked={experienceLevel.includes(level)} onChange={() => toggleExperience(level)} className="h-4 w-4 rounded text-primary-600 border-gray-300" />
                      <span className="text-sm text-gray-600">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {/* Apply button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition"
              >
                Show Results {!loading && `(${total})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Layout */}
      <div className="flex">
        {/* ═══ LEFT SIDEBAR — Filters ═══ */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-gray-200 bg-white sticky top-30 h-[calc(100vh-7.5rem)] overflow-y-auto">
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Filters</h2>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="text-xs text-primary-600 font-medium hover:underline">
                  Clear all ({activeFilters})
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
              <div className="space-y-0.5">
                {GIG_CATEGORIES.filter((c) => c.slug !== 'other').map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  const isExpanded = expandedCategory === cat.slug;
                  return (
                    <div key={cat.slug}>
                      <button
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCategory(null);
                            setSelectedSubType(null);
                            setExpandedCategory(null);
                          } else {
                            setSelectedCategory(cat.name);
                            setSelectedSubType(null);
                            setExpandedCategory(isExpanded ? null : cat.slug);
                          }
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isSelected
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span className="text-base leading-none">{cat.emoji}</span>
                        <span className="flex-1 text-left truncate">{cat.name}</span>
                        {cat.subTypes.length > 0 && (
                          <ChevronDownIcon
                            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </button>
                      {/* Subcategories */}
                      {isExpanded && cat.subTypes.length > 0 && (
                        <div className="ml-8 mt-1 mb-2 space-y-0.5 border-l-2 border-gray-100 pl-3">
                          {(expandedSubTypes.has(cat.name) ? cat.subTypes : cat.subTypes.slice(0, 8)).map((sub) => (
                            <button
                              key={sub}
                              onClick={() =>
                                setSelectedSubType(selectedSubType === sub ? null : sub)
                              }
                              className={`block w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors ${
                                selectedSubType === sub
                                  ? 'bg-primary-50 text-primary-700 font-medium'
                                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {sub}
                            </button>
                          ))}
                          {cat.subTypes.length > 8 && (
                            <button
                              onClick={() =>
                                setExpandedSubTypes((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(cat.name)) next.delete(cat.name);
                                  else next.add(cat.name);
                                  return next;
                                })
                              }
                              className="block px-2 py-1 text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                            >
                              {expandedSubTypes.has(cat.name)
                                ? 'Show less'
                                : `+${cat.subTypes.length - 8} more`}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-5" />

            {/* Budget Range */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Budget</h3>
              <div className="space-y-1.5">
                {BUDGET_RANGES.map((range, idx) => (
                  <label key={range.label} className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="budget"
                      checked={budgetRange === idx}
                      onChange={() => setBudgetRange(idx)}
                      className="h-3.5 w-3.5 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-5" />

            {/* Experience Level */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Experience Level</h3>
              <div className="space-y-1.5">
                {EXPERIENCE_LEVELS.map((level) => (
                  <label key={level} className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={experienceLevel.includes(level)}
                      onChange={() => toggleExperience(level)}
                      className="h-3.5 w-3.5 rounded text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-5" />

            {/* Duration */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Duration</h3>
              <div className="space-y-1.5">
                {DURATIONS.map((d) => (
                  <label key={d} className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="duration"
                      checked={duration === d}
                      onChange={() => setDuration(duration === d ? null : d)}
                      className="h-3.5 w-3.5 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">{d}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ═══ CENTER — Gig List ═══ */}
        <main className={`flex-1 min-w-0 transition-all duration-300 ${selectedGig ? 'lg:mr-0' : ''}`}>
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Active Filters Chips */}
            {activeFilters > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-gray-400">Filtered by:</span>
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                    {selectedCategory}
                    <button onClick={() => { setSelectedCategory(null); setSelectedSubType(null); setExpandedCategory(null); }}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedSubType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                    {selectedSubType}
                    <button onClick={() => setSelectedSubType(null)}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {budgetRange > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                    {BUDGET_RANGES[budgetRange].label}
                    <button onClick={() => setBudgetRange(0)}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {experienceLevel.map((l) => (
                  <span key={l} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                    {l}
                    <button onClick={() => toggleExperience(l)}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {duration && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                    {duration}
                    <button onClick={() => setDuration(null)}>
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Gig Cards */}
            <div className="space-y-3">
              {loading && gigs.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray-400 mt-3">Loading gigs...</p>
                </div>
              )}
              {!loading && gigs.length === 0 && (
                <div className="text-center py-12">
                  <BriefcaseIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No gigs found. Try adjusting your filters.</p>
                </div>
              )}
              {gigs.map((gig) => (
                <button
                  key={gig.id}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      window.location.href = `/gigs/${gig.id}`;
                    } else {
                      setSelectedGig(gig);
                    }
                  }}
                  className={`w-full text-left bg-white rounded-xl border p-3.5 sm:p-5 hover:shadow-md transition-all duration-200 active:scale-[0.99] group ${
                    selectedGig?.id === gig.id
                      ? 'border-primary-400 ring-1 ring-primary-400/30 shadow-md'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
                        <ClockIcon className="w-3.5 h-3.5" />
                        <span>Posted {timeAgo(gig.createdAt)}</span>
                        {gig.category && (
                          <>
                            <span className="text-gray-200">•</span>
                            <span className="text-primary-500 font-medium">{gig.category.name}</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {gig.title}
                      </h3>
                    </div>
                    <div
                      onClick={(e) => { e.stopPropagation(); toggleSaved(gig.id); }}
                      className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      {savedGigs.has(gig.id) ? (
                        <HeartSolidIcon className="w-4 h-4 text-red-500" />
                      ) : (
                        <HeartIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                      <CurrencyDollarIcon className="w-3 h-3" />
                      {formatBudget(gig.budgetMin, gig.budgetMax)}
                    </span>
                    <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-50 rounded-full">
                      {gig.budgetType === 'FIXED' ? 'Fixed Price' : 'Hourly'}
                    </span>
                    {gig.durationHours && (
                      <span className="text-xs text-gray-400">
                        Est. {gig.durationHours}h
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-2.5 text-sm text-gray-500 leading-relaxed line-clamp-2">
                    {gig.description}
                  </p>

                  {/* Skills */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {gig.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Bottom Row */}
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-600">
                          {(gig.employer.businessName || gig.employer.contactPerson || '?').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-700">
                          {gig.employer.businessName || gig.employer.contactPerson || 'Employer'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {gig.proposalsCount} proposals
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Load More */}
            {page < totalPages && (
            <div className="mt-6 text-center">
              <button onClick={loadMore} disabled={loading} className="btn-secondary px-8 text-sm">
                {loading ? 'Loading...' : 'Load More Gigs'}
              </button>
            </div>
            )}
          </div>
        </main>

        {/* ═══ RIGHT PANEL — Gig Detail Slide-out ═══ */}
        <aside
          className={`hidden lg:block border-l border-gray-200 bg-white sticky top-30 h-[calc(100vh-7.5rem)] overflow-y-auto transition-all duration-300 ${
            selectedGig ? 'w-105 opacity-100' : 'w-0 opacity-0 overflow-hidden'
          }`}
        >
          {selectedGig && (
            <div className="p-6">
              {/* Close button */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2.5 py-1 rounded-full">
                  {selectedGig.category?.name || 'Uncategorized'}
                </span>
                <button
                  onClick={() => setSelectedGig(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Title */}
              <h2 className="text-lg font-bold text-gray-900 leading-snug mb-4">
                {selectedGig.title}
              </h2>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-green-600 font-medium">Budget</p>
                  <p className="text-sm font-bold text-green-700 mt-0.5">
                    {formatBudget(selectedGig.budgetMin, selectedGig.budgetMax)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-blue-600 font-medium">Duration</p>
                  <p className="text-sm font-bold text-blue-700 mt-0.5">
                    {selectedGig.durationHours ? `${selectedGig.durationHours}h` : 'Flexible'}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-purple-600 font-medium">Proposals</p>
                  <p className="text-sm font-bold text-purple-700 mt-0.5">
                    {selectedGig.proposalsCount}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-amber-600 font-medium">Level</p>
                  <p className="text-sm font-bold text-amber-700 mt-0.5">
                    {selectedGig.experienceLevel}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedGig.description}
                </p>
              </div>

              {/* Skills */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedGig.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Details</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-sm">
                    <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium text-gray-700">{selectedGig.budgetType === 'FIXED' ? 'Fixed Price' : 'Hourly'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Posted:</span>
                    <span className="font-medium text-gray-700">{timeAgo(selectedGig.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Experience:</span>
                    <span className="font-medium text-gray-700">{selectedGig.experienceLevel}</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-5" />

              {/* Employer */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">About the Employer</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">
                      {(selectedGig.employer.businessName || selectedGig.employer.contactPerson || '?').charAt(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedGig.employer.businessName || selectedGig.employer.contactPerson || 'Employer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <Link
                  href={`/gigs/${selectedGig.id}`}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                >
                  Apply Now
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => toggleSaved(selectedGig.id)}
                  className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                >
                  {savedGigs.has(selectedGig.id) ? (
                    <>
                      <HeartSolidIcon className="w-4 h-4 text-red-500" />
                      Saved
                    </>
                  ) : (
                    <>
                      <HeartIcon className="w-4 h-4" />
                      Save Gig
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Empty state when no gig selected */}
          {!selectedGig && (
            <div className="flex items-center justify-center h-full p-6 text-center">
              <div>
                <BriefcaseIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Click a gig to see details</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

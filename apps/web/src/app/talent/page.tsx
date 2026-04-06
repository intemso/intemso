'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  HeartIcon,
  ChevronDownIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon,
} from '@heroicons/react/24/solid';

import { studentsApi, savedTalentApi, type StudentListItem } from '@/lib/api';
import { useAuth } from '@/context/auth';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'gigsCompleted', label: 'Most Gigs' },
  { value: 'hourlyRate', label: 'Hourly Rate' },
  { value: 'responseTime', label: 'Fastest Response' },
];

const BADGE_LABELS: Record<string, string> = {
  rising_talent: 'Rising Talent',
  top_rated: 'Top Rated',
  top_rated_plus: 'Top Rated Plus',
};

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'Any Availability' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'weekends', label: 'Weekends Only' },
  { value: 'evenings', label: 'Evenings Only' },
];

const BADGE_OPTIONS = [
  { value: '', label: 'Any Badge' },
  { value: 'rising_talent', label: 'Rising Talent' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'top_rated_plus', label: 'Top Rated Plus' },
];

export default function FindTalentPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('rating');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [skillsFilter, setSkillsFilter] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [minRating, setMinRating] = useState('');
  const [talentBadge, setTalentBadge] = useState('');
  const [availability, setAvailability] = useState('');

  const isEmployer = user?.role === 'EMPLOYER';

  const activeFilterCount = [skillsFilter, universityFilter, minRate, maxRate, minRating, talentBadge, availability].filter(Boolean).length;

  const clearFilters = () => {
    setSkillsFilter('');
    setUniversityFilter('');
    setMinRate('');
    setMaxRate('');
    setMinRating('');
    setTalentBadge('');
    setAvailability('');
  };

  const fetchStudents = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await studentsApi.search({
        search: search || undefined,
        skills: skillsFilter || undefined,
        university: universityFilter || undefined,
        minRate: minRate ? Number(minRate) : undefined,
        maxRate: maxRate ? Number(maxRate) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        talentBadge: talentBadge || undefined,
        availability: availability || undefined,
        sortBy,
        page: p,
        limit: 20,
      });
      setStudents(res.data);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
      setPage(res.meta.page);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, skillsFilter, universityFilter, minRate, maxRate, minRating, talentBadge, availability]);

  useEffect(() => {
    const timer = setTimeout(() => fetchStudents(1), 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  // Load saved talent IDs for employer
  useEffect(() => {
    if (!isEmployer) return;
    savedTalentApi.list({ limit: 100 }).then((res) => {
      setSavedIds(new Set(res.data.map((s: any) => s.id)));
    }).catch(() => {});
  }, [isEmployer]);

  const toggleSave = async (studentId: string) => {
    if (!isEmployer) return;
    const isSaved = savedIds.has(studentId);
    try {
      if (isSaved) {
        await savedTalentApi.unsave(studentId);
        setSavedIds((prev) => { const next = new Set(prev); next.delete(studentId); return next; });
      } else {
        await savedTalentApi.save(studentId);
        setSavedIds((prev) => new Set(prev).add(studentId));
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Find Talent</h1>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
            Discover skilled university students ready to bring your projects to life
          </p>

          {/* Search + Filter Toggle */}
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 sm:pl-12 text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'bg-primary-50 border-primary-200 text-primary-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-0.5 sm:ml-1 px-1.5 py-0.5 bg-primary-600 text-white text-[10px] sm:text-xs font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="relative hidden sm:block">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field pr-10 appearance-none min-w-45"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Filter Talent</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="w-3.5 h-3.5" />
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {/* Skills */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Skills</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Python"
                    value={skillsFilter}
                    onChange={(e) => setSkillsFilter(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>

                {/* University */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">University</label>
                  <input
                    type="text"
                    placeholder="e.g. University of Ghana"
                    value={universityFilter}
                    onChange={(e) => setUniversityFilter(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>

                {/* Hourly Rate Range */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Hourly Rate (GH₵)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={minRate}
                      onChange={(e) => setMinRate(e.target.value)}
                      className="input-field text-sm w-full"
                    />
                    <span className="text-gray-400 text-xs">–</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={maxRate}
                      onChange={(e) => setMaxRate(e.target.value)}
                      className="input-field text-sm w-full"
                    />
                  </div>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Min Rating</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="3">3+ Stars</option>
                  </select>
                </div>

                {/* Talent Badge */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Talent Badge</label>
                  <select
                    value={talentBadge}
                    onChange={(e) => setTalentBadge(e.target.value)}
                    className="input-field text-sm"
                  >
                    {BADGE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Availability</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="input-field text-sm"
                  >
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{total}</span> talents found
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((s) => {
              const initials = `${s.firstName[0]}${s.lastName[0]}`.toUpperCase();
              const badge = BADGE_LABELS[s.talentBadge];
              return (
                <Link
                  key={s.id}
                  href={`/talent/${s.id}`}
                  className="block bg-white border border-gray-100 rounded-xl p-3.5 sm:p-6 hover:shadow-md transition-all active:scale-[0.99] group"
                >
                  <div className="flex gap-3 sm:gap-5">
                    {/* Avatar */}
                    <div className="shrink-0">
                      {s.avatarUrl ? (
                        <img
                          src={s.avatarUrl.includes('cloudinary.com') ? s.avatarUrl.replace('/upload/', '/upload/w_128,h_128,c_fill,g_face,f_auto,q_auto/') : s.avatarUrl}
                          alt={`${s.firstName} ${s.lastName}`}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-base sm:text-xl font-bold text-primary-600">{initials}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                              {s.firstName} {s.lastName}
                            </h3>
                            {s.isVerified && (
                              <CheckBadgeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                            )}
                            {badge && (
                              <span className="px-1.5 sm:px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] sm:text-xs font-semibold rounded-full">
                                {badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 font-medium">{s.professionalTitle || 'Student'}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{s.university}</p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          {isEmployer && (
                            <button
                              onClick={(e) => { e.preventDefault(); toggleSave(s.id); }}
                              className="p-2 sm:p-2 hover:bg-gray-50 rounded-full transition-colors"
                            >
                              {savedIds.has(s.id) ? (
                                <HeartSolidIcon className="w-5 h-5 text-red-500" />
                              ) : (
                                <HeartIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          )}
                          {s.hourlyRate && (
                            <span className="text-sm sm:text-lg font-bold text-gray-900">
                              GH₵{Number(s.hourlyRate)}<span className="text-[10px] sm:text-sm font-normal text-gray-400">/hr</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {s.bio && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{s.bio}</p>
                      )}

                      {/* Skills */}
                      {s.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {s.skills.slice(0, 6).map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {s.skills.length > 6 && (
                            <span className="px-2.5 py-1 text-gray-400 text-xs">
                              +{s.skills.length - 6} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <StarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                          <span className="font-semibold text-gray-900">
                            {Number(s.ratingAvg).toFixed(1)}
                          </span>
                          <span className="hidden sm:inline">({s.ratingCount} reviews)</span>
                        </span>
                        <span>{s.gigsCompleted} gigs</span>
                        <span className="hidden sm:inline">{Number(s.jobSuccessScore)}% success</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && students.length === 0 && (
          <div className="text-center py-16">
            <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No talent found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8 overflow-x-auto">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => fetchStudents(p)}
                    className={`px-3 py-1.5 text-sm rounded-lg ${
                      p === page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon,
} from '@heroicons/react/24/solid';
import { savedTalentApi, type StudentListItem } from '@/lib/api';
import { useAuth } from '@/context/auth';

const BADGE_LABELS: Record<string, string> = {
  rising_talent: 'Rising Talent',
  top_rated: 'Top Rated',
  top_rated_plus: 'Top Rated Plus',
};

export default function DashboardTalentPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<(StudentListItem & { savedAt?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 20;

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    try {
      const res = await savedTalentApi.list({ page, limit });
      setStudents(res.data);
      setTotal(res.meta?.total ?? res.data.length);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const handleUnsave = async (studentId: string) => {
    try {
      await savedTalentApi.unsave(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setTotal((prev) => prev - 1);
    } catch {
      /* ignore */
    }
  };

  const filtered = students.filter(
    (t) =>
      !search ||
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Saved Talent</h1>
        <p className="text-sm text-gray-500 mt-1">Students you&apos;ve saved for future gigs</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by name or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((talent) => {
            const name = `${talent.firstName} ${talent.lastName}`;
            const initials = `${talent.firstName[0]}${talent.lastName[0]}`.toUpperCase();
            const badge = BADGE_LABELS[talent.talentBadge];

            return (
              <div
                key={talent.id}
                className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all"
              >
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary-600">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/talent/${talent.id}`} className="text-base font-semibold text-gray-900 hover:text-primary-600">
                            {name}
                          </Link>
                          {talent.isVerified && <CheckBadgeIcon className="w-4 h-4 text-blue-500" />}
                          {badge && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">
                              {badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {talent.professionalTitle || 'Student'}
                          {talent.university && ` · ${talent.university}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUnsave(talent.id)}
                          className="p-1.5 hover:bg-gray-50 rounded-full"
                          title="Unsave"
                        >
                          <HeartSolidIcon className="w-5 h-5 text-red-500" />
                        </button>
                        {talent.hourlyRate && (
                          <span className="text-lg font-bold text-gray-900">
                            GH₵{Number(talent.hourlyRate)}/hr
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {talent.skills.slice(0, 6).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                        {Number(talent.ratingAvg).toFixed(1)} ({talent.ratingCount})
                      </span>
                      <span>{talent.gigsCompleted} gigs</span>
                      <span>{Number(talent.jobSuccessScore)}% success</span>
                      <span className="text-green-600 font-medium">
                        GH₵{Number(talent.totalEarned).toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/talent/${talent.id}`}
                      className="mt-3 inline-block text-sm text-primary-600 font-medium hover:underline"
                    >
                      View Profile →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">
            {search ? 'No saved talent matching your search' : 'You haven\u0027t saved any talent yet'}
          </p>
          <Link href="/talent" className="mt-3 inline-block text-sm text-primary-600 font-medium hover:underline">
            Browse Talent →
          </Link>
        </div>
      )}
    </div>
  );
}

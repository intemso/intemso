'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  StarIcon as StarOutlineIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { servicesApi, type ServiceListItem, type PaginatedServices } from '@/lib/api';

export default function ServicesBrowsePage() {
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchServices = useCallback(async (s: string, sort: string, p: number) => {
    setLoading(true);
    try {
      const res = await servicesApi.list({
        search: s || undefined,
        sortBy: sort,
        page: p,
        limit: 12,
      });
      setServices(res.data);
      setTotalPages(res.meta.totalPages);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices(search, sortBy, page);
  }, [sortBy, page, fetchServices]);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchServices(search, sortBy, 1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Catalog</h1>
          <p className="text-gray-500 mt-1">Browse fixed-price services offered by students</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="input-field w-auto min-w-40"
          >
            <option value="newest">Newest</option>
            <option value="rating">Top Rated</option>
            <option value="orders">Most Ordered</option>
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : services.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Placeholder image area */}
                  <div className="h-40 bg-linear-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary-200">
                      {service.title[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 line-clamp-2 mb-1">
                      {service.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span className="font-medium text-gray-700">
                        {service.student.firstName} {service.student.lastName}
                      </span>
                      {service.student.isVerified && (
                        <span className="text-blue-500 text-[10px]">✓</span>
                      )}
                      {service.student.university && (
                        <span className="truncate">· {service.student.university}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                        {Number(service.ratingAvg).toFixed(1)} ({service.ratingCount})
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {service.deliveryDays}d delivery
                      </span>
                    </div>

                    {service.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {service.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-400">{service.ordersCount} orders</span>
                      {service.tiers && typeof service.tiers === 'object' && (
                        <span className="text-sm font-bold text-gray-900">
                          From GH₵{
                            Math.min(
                              ...Object.values(service.tiers as Record<string, { price?: number }>)
                                .map((t) => t.price || 0)
                                .filter(Boolean)
                            ) || 0
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">No services found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

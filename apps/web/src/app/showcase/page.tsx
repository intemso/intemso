'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  HeartIcon as HeartOutline,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import {
  showcaseApi,
  type PortfolioItem,
  type PaginatedPortfolio,
} from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function resolveImage(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Liked' },
  { value: 'views', label: 'Most Viewed' },
];

export default function ShowcaseGalleryPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const debounceRef = useRef<NodeJS.Timeout>();
  const observerRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchItems = useCallback(
    async (
      s: string,
      sort: string,
      p: number,
      skill: string,
      append = false,
    ) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await showcaseApi.list({
          search: s || undefined,
          skills: skill || undefined,
          sortBy: sort,
          page: p,
          limit: 24,
        });
        if (append) {
          setItems((prev) => [...prev, ...res.data]);
        } else {
          setItems(res.data);
        }
        setTotalPages(res.meta.totalPages);
        setTotal(res.meta.total);
        setHasMore(p < res.meta.totalPages);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchItems(search, sortBy, 1, selectedSkill);
    setPage(1);
  }, [sortBy, selectedSkill, fetchItems]);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchItems(search, sortBy, 1, selectedSkill);
    }, 350);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Infinite scroll
  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const next = page + 1;
          setPage(next);
          fetchItems(search, sortBy, next, selectedSkill, true);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, loading, page]);

  // Collect all skills from loaded items for quick filter chips
  const allSkills = Array.from(
    new Set(items.flatMap((i) => i.skills)),
  ).slice(0, 20);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Talent{' '}
            <span className="bg-linear-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              Showcase
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Discover incredible work by Ghana&apos;s top student talent.
            Browse portfolios, get inspired, and connect with creators.
          </p>
          <div className="mt-6 text-sm text-gray-400">
            {total > 0 && `${total.toLocaleString()} project${total !== 1 ? 's' : ''} showcased`}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, skills, creators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 min-w-36"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border text-sm flex items-center gap-2 transition ${
                showFilters
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Skill filter chips */}
        {showFilters && allSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
            {selectedSkill && (
              <button
                onClick={() => setSelectedSkill('')}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1 transition"
              >
                <XMarkIcon className="w-3 h-3" /> Clear
              </button>
            )}
            {allSkills.map((skill) => (
              <button
                key={skill}
                onClick={() =>
                  setSelectedSkill(selectedSkill === skill ? '' : skill)
                }
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  selectedSkill === skill
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((item) => (
                <ShowcaseCard key={item.id} item={item} />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={observerRef} className="py-8 flex justify-center">
              {loadingMore && (
                <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <EyeIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No projects found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Showcase card — Dribbble-style image-first card */
function ShowcaseCard({ item }: { item: PortfolioItem }) {
  const [hovered, setHovered] = useState(false);
  const thumbnail = item.images?.[0];

  return (
    <Link
      href={`/showcase/${item.id}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-4/3 shadow-sm group-hover:shadow-xl transition-shadow duration-300">
        {thumbnail ? (
          <Image
            src={resolveImage(thumbnail)}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-primary-100 via-purple-50 to-pink-100 flex items-center justify-center">
            <span className="text-5xl font-bold text-primary-200">
              {item.title[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h3 className="text-white font-semibold text-sm truncate">
            {item.title}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {item.student?.user?.avatarUrl ? (
                <Image
                  src={resolveImage(item.student.user.avatarUrl)}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full ring-2 ring-white/30"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/20 ring-2 ring-white/30 flex items-center justify-center text-[10px] font-bold text-white">
                  {item.student?.firstName?.[0]}
                </div>
              )}
              <span className="text-white/80 text-xs">
                {item.student?.firstName} {item.student?.lastName}
              </span>
            </div>
            <div className="flex items-center gap-3 text-white/70 text-xs">
              <span className="flex items-center gap-1">
                <HeartOutline className="w-3.5 h-3.5" />
                {item.likeCount}
              </span>
              <span className="flex items-center gap-1">
                <EyeIcon className="w-3.5 h-3.5" />
                {item.viewCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card footer — visible on mobile, hidden on desktop (overlay takes over) */}
      <div className="mt-3 sm:hidden">
        <h3 className="text-sm font-semibold text-gray-900 truncate">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {item.student?.user?.avatarUrl ? (
            <Image
              src={resolveImage(item.student.user.avatarUrl)}
              alt=""
              width={20}
              height={20}
              className="rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-[9px] font-bold text-primary-700">
              {item.student?.firstName?.[0]}
            </div>
          )}
          <span className="text-xs text-gray-500">
            {item.student?.firstName} {item.student?.lastName}
          </span>
          <div className="ml-auto flex items-center gap-2 text-gray-400 text-xs">
            <span className="flex items-center gap-0.5">
              <HeartOutline className="w-3 h-3" />
              {item.likeCount}
            </span>
            <span className="flex items-center gap-0.5">
              <EyeIcon className="w-3 h-3" />
              {item.viewCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="rounded-xl bg-gray-200 aspect-4/3" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

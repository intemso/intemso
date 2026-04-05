'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  EyeIcon,
  TagIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { blogApi, type BlogPostSummary, type BlogCategory } from '@/lib/api';

export default function BlogListClient() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogApi.list({
        search: search || undefined,
        category: category || undefined,
        page,
        limit: 12,
      });
      setPosts(res.data);
      setTotalPages(res.meta.totalPages);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [search, category, page]);

  useEffect(() => {
    blogApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => { setPage(1); }, [search, category]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-linear-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Insights, tips, and stories from the Intemso community.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-200" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-sm"
            />
          </div>
        </div>
      </section>

      {/* Category Filters */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setCategory('')}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !category ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
              }`}
            >
              All Posts
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat.name
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <TagIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No articles found</h3>
            <p className="text-gray-500 mt-1">
              {search ? 'Try a different search term' : 'Check back soon for new content'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300 h-full flex flex-col">
                    {post.featuredImage ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={post.featuredImage}
                          alt={post.featuredImageAlt || post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-linear-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary-200">{post.title.charAt(0)}</span>
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      {post.category && (
                        <span className="inline-block text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full w-fit mb-3">
                          {post.category}
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3.5 h-3.5" />
                          {post.readingTimeMin} min read
                        </span>
                        {post.publishedAt && (
                          <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        )}
                        {post.viewCount > 0 && (
                          <span className="flex items-center gap-1 ml-auto">
                            <EyeIcon className="w-3.5 h-3.5" />
                            {post.viewCount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500 px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

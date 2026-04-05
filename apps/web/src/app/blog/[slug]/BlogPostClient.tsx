'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClockIcon,
  EyeIcon,
  ArrowLeftIcon,
  TagIcon,
  CalendarIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { blogApi, type BlogPost, type BlogPostSummary } from '@/lib/api';

export default function BlogPostClient({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    blogApi
      .getBySlug(slug)
      .then((p) => {
        setPost(p);
        blogApi.getRelated(slug).then(setRelated).catch(() => {});
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: post?.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-6">
          <div className="h-4 bg-gray-100 rounded w-24" />
          <div className="h-10 bg-gray-100 rounded w-4/5" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-72 bg-gray-100 rounded-xl" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post not found</h1>
          <p className="text-gray-500 mb-6">
            This blog post may have been removed or the URL is incorrect.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD Structured Data */}
      {post.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(post.structuredData) }}
        />
      )}

      {/* Hero / Featured Image */}
      {post.featuredImage && (
        <div className="w-full h-64 sm:h-80 md:h-96 relative">
          <img
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          All articles
        </Link>

        {/* Category */}
        {post.category && (
          <Link
            href={`/blog?category=${encodeURIComponent(post.category)}`}
            className="inline-block text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-4 hover:bg-primary-100 transition-colors"
          >
            {post.category}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
          {post.author && (
            <div className="flex items-center gap-2">
              {post.author.avatarUrl ? (
                <img
                  src={post.author.avatarUrl}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-600">
                  {post.author.firstName.charAt(0)}{post.author.lastName.charAt(0)}
                </div>
              )}
              <span className="font-medium text-gray-700">
                {post.author.firstName} {post.author.lastName}
              </span>
            </div>
          )}
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            {post.readingTimeMin} min read
          </span>
          {post.viewCount > 0 && (
            <span className="flex items-center gap-1">
              <EyeIcon className="w-4 h-4" />
              {post.viewCount.toLocaleString()} views
            </span>
          )}
          <button
            onClick={handleShare}
            className="flex items-center gap-1 ml-auto text-gray-400 hover:text-primary-600 transition-colors"
            title="Share"
          >
            <ShareIcon className="w-4 h-4" />
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-gray-600 italic mb-8 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="prose prose-lg prose-primary max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-md
            prose-blockquote:border-l-primary-500 prose-blockquote:bg-primary-50/30 prose-blockquote:px-6 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
            prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-900 prose-pre:rounded-xl
            prose-li:text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <TagIcon className="w-4 h-4 text-gray-400" />
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="text-sm text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`}>
                  <article className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary-200 transition-all h-full flex flex-col">
                    {p.featuredImage ? (
                      <div className="h-36 overflow-hidden">
                        <img
                          src={p.featuredImage}
                          alt={p.featuredImageAlt || p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="h-36 bg-linear-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary-200">
                          {p.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors text-sm">
                        {p.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-2">
                        {p.readingTimeMin} min read
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

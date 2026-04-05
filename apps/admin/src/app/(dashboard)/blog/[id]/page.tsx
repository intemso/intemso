'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  EyeIcon,
  SparklesIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { blogApi, type BlogPost } from '@/lib/api';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentImageRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    featuredImageAlt: '',
    category: '',
    tags: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogImage: '',
    noIndex: false,
    focusKeyword: '',
  });

  useEffect(() => {
    blogApi.adminGet(id).then((post: BlogPost) => {
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content,
        featuredImage: post.featuredImage || '',
        featuredImageAlt: post.featuredImageAlt || '',
        category: post.category || '',
        tags: post.tags.join(', '),
        status: post.status,
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
        canonicalUrl: post.canonicalUrl || '',
        ogImage: post.ogImage || '',
        noIndex: post.noIndex,
        focusKeyword: post.focusKeyword || '',
      });
      setLoading(false);
    }).catch(() => {
      router.push('/blog');
    });
  }, [id, router]);

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await blogApi.adminUploadImage(file);
      update('featuredImage', result.url);
      if (!form.ogImage) update('ogImage', result.url);
    } catch (err: any) {
      alert(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await blogApi.adminUploadImage(file);
      const imgTag = `<img src="${result.url}" alt="${file.name}" loading="lazy" />`;
      update('content', form.content + '\n' + imgTag + '\n');
    } catch (err: any) {
      alert(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (contentImageRef.current) contentImageRef.current.value = '';
    }
  };

  const handleSave = async (status?: 'draft' | 'published') => {
    if (!form.title.trim() || !form.content.trim()) {
      alert('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      const tags = form.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      await blogApi.adminUpdate(id, {
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt || undefined,
        content: form.content,
        featuredImage: form.featuredImage || undefined,
        featuredImageAlt: form.featuredImageAlt || undefined,
        category: form.category || undefined,
        tags: tags.length > 0 ? tags : [],
        status: status || form.status,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
        canonicalUrl: form.canonicalUrl || undefined,
        ogImage: form.ogImage || undefined,
        noIndex: form.noIndex,
        focusKeyword: form.focusKeyword || undefined,
      });
      router.push('/blog');
    } catch (err: any) {
      alert(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await blogApi.adminDelete(id);
      router.push('/blog');
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-3 border-gray-600 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  const wordCount = form.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 225));

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/blog" className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Edit Blog Post</h1>
            <p className="text-xs text-gray-500 mt-0.5">{wordCount} words · {readingTime} min read</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="px-3 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <EyeIcon className="w-4 h-4 inline mr-1" />
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-sm rounded-lg bg-gray-800 text-red-400 hover:bg-red-900/30 transition-colors"
          >
            <TrashIcon className="w-4 h-4 inline mr-1" />
            Delete
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : form.status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="xl:col-span-2 space-y-4">
          <input
            type="text"
            placeholder="Post title..."
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-lg font-semibold text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 shrink-0">Slug:</span>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => update('slug', e.target.value)}
              className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <textarea
            placeholder="Write a short excerpt..."
            value={form.excerpt}
            onChange={(e) => update('excerpt', e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />

          {preview ? (
            <div className="min-h-[400px] px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl">
              <div
                className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-red-400 prose-strong:text-white prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={() => contentImageRef.current?.click()}
                  disabled={uploading}
                  className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                  title="Insert image into content"
                >
                  <PhotoIcon className="w-4 h-4" />
                </button>
                <input ref={contentImageRef} type="file" accept="image/*" onChange={handleContentImageUpload} className="hidden" />
              </div>
              <textarea
                placeholder="Write your blog post content using HTML..."
                value={form.content}
                onChange={(e) => update('content', e.target.value)}
                rows={20}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-y font-mono leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-2">Status</h3>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Featured Image */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">Featured Image</h3>
            {form.featuredImage ? (
              <div className="relative">
                <img src={form.featuredImage} alt="Featured" className="w-full h-40 object-cover rounded-lg" />
                <button
                  onClick={() => update('featuredImage', '')}
                  className="absolute top-2 right-2 p-1 bg-gray-900/80 rounded-full text-white hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-40 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-red-500 hover:text-red-400 transition-colors"
              >
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-gray-600 border-t-red-500 rounded-full animate-spin" />
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-8 h-8" />
                    <span className="text-xs">Upload image (max 10MB)</span>
                  </>
                )}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {form.featuredImage && (
              <input
                type="text"
                placeholder="Image alt text..."
                value={form.featuredImageAlt}
                onChange={(e) => update('featuredImageAlt', e.target.value)}
                className="w-full mt-3 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            )}
          </div>

          {/* Category & Tags */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-medium text-white">Organization</h3>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. Career Tips"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="freelancing, students, tips"
                value={form.tags}
                onChange={(e) => update('tags', e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* SEO */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setSeoOpen(!seoOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-red-400" />
                SEO Settings
              </div>
              <span className="text-gray-500 text-xs">{seoOpen ? '▲' : '▼'}</span>
            </button>
            {seoOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-700 pt-3">
                <div>
                  <label className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Meta Title</span>
                    <span className={form.metaTitle.length > 60 ? 'text-red-400' : ''}>{form.metaTitle.length}/70</span>
                  </label>
                  <input
                    type="text"
                    placeholder="SEO title"
                    value={form.metaTitle}
                    onChange={(e) => update('metaTitle', e.target.value)}
                    maxLength={70}
                    className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Meta Description</span>
                    <span className={form.metaDescription.length > 155 ? 'text-red-400' : ''}>{form.metaDescription.length}/160</span>
                  </label>
                  <textarea
                    placeholder="SEO description"
                    value={form.metaDescription}
                    onChange={(e) => update('metaDescription', e.target.value)}
                    maxLength={160}
                    rows={3}
                    className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Focus Keyword</label>
                  <input
                    type="text"
                    value={form.focusKeyword}
                    onChange={(e) => update('focusKeyword', e.target.value)}
                    maxLength={100}
                    className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Canonical URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={form.canonicalUrl}
                    onChange={(e) => update('canonicalUrl', e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.noIndex}
                    onChange={(e) => update('noIndex', e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-500"
                  />
                  No-index (hide from search engines)
                </label>

                {/* Google Preview */}
                <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Google Preview</p>
                  <p className="text-blue-400 text-sm font-medium truncate">
                    {form.metaTitle || form.title || 'Post Title'} — Intemso Blog
                  </p>
                  <p className="text-green-400 text-xs mt-0.5">
                    intemso.com/blog/{form.slug || 'post-slug'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                    {form.metaDescription || form.excerpt || 'Post description will appear here...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

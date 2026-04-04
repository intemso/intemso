'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  HeartIcon,
  PhotoIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  ArchiveBoxIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import {
  showcaseApi,
  uploadsApi,
  categoriesApi,
  type PortfolioItem,
  type Category,
} from '@/lib/api';
import { useAuth } from '@/context/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function resolveImage(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof GlobeAltIcon; bg: string; text: string }> = {
  published: { label: 'Published', icon: GlobeAltIcon, bg: 'bg-green-50', text: 'text-green-700' },
  draft: { label: 'Draft', icon: DocumentIcon, bg: 'bg-gray-50', text: 'text-gray-600' },
  archived: { label: 'Archived', icon: ArchiveBoxIcon, bg: 'bg-amber-50', text: 'text-amber-700' },
};

export default function DashboardShowcasePage() {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // Create / Edit form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formProjectUrl, setFormProjectUrl] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formCompletedAt, setFormCompletedAt] = useState('');
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('published');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    try {
      const data = await showcaseApi.mine();
      setItems(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    categoriesApi.list().then(setCategories).catch(() => {});
  }, [fetchItems]);

  const resetForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDesc('');
    setFormSkills('');
    setFormCategory('');
    setFormProjectUrl('');
    setFormClientName('');
    setFormCompletedAt('');
    setFormStatus('published');
    setFormImages([]);
    setFormError('');
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (item: PortfolioItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormDesc(item.description);
    setFormSkills(item.skills.join(', '));
    setFormCategory(item.categoryId || '');
    setFormProjectUrl(item.projectUrl || '');
    setFormClientName(item.clientName || '');
    setFormCompletedAt(item.completedAt ? item.completedAt.substring(0, 10) : '');
    setFormStatus(item.status === 'archived' ? 'draft' : item.status as 'draft' | 'published');
    setFormImages(item.images || []);
    setFormError('');
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await uploadsApi.uploadPortfolio(Array.from(files));
      setFormImages((prev) => [...prev, ...uploaded.map((u) => u.url)]);
    } catch {
      setFormError('Failed to upload images. Try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!formDesc.trim()) {
      setFormError('Description is required');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const payload = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      skills: formSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      categoryId: formCategory || undefined,
      projectUrl: formProjectUrl.trim() || undefined,
      clientName: formClientName.trim() || undefined,
      completedAt: formCompletedAt || undefined,
      status: formStatus,
      images: formImages,
    };

    try {
      if (editingId) {
        await showcaseApi.update(editingId, payload);
      } else {
        await showcaseApi.create(payload);
      }
      setShowForm(false);
      resetForm();
      fetchItems();
    } catch (err: any) {
      setFormError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await showcaseApi.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      /* ignore */
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await showcaseApi.update(id, { status });
      fetchItems();
    } catch {
      /* ignore */
    }
  };

  // Aggregate stats
  const totalViews = items.reduce((sum, i) => sum + i.viewCount, 0);
  const totalLikes = items.reduce((sum, i) => sum + i.likeCount, 0);
  const publishedCount = items.filter((i) => i.status === 'published').length;

  if (!isStudent) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Portfolio showcase is available for students.</p>
        <Link href="/showcase" className="text-primary-600 text-sm font-medium hover:underline mt-2 inline-block">
          Browse the Showcase →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Portfolio</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            Showcase your best work to attract employers
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-primary-700 transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Add Project</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4">
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{items.length}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Total Projects</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4">
          <p className="text-lg sm:text-2xl font-bold text-green-600">{publishedCount}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Published</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="flex items-center gap-1.5">
            <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Total Views</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4">
          <div className="flex items-center gap-1.5">
            <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalLikes.toLocaleString()}</p>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Total Likes</p>
        </div>
      </div>

      {/* ═══ Create/Edit Form (Slide-in Panel) ═══ */}
      {showForm && (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? 'Edit Project' : 'Add New Project'}
            </h2>
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {formError && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-xl">
              <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Images
              </label>
              <div className="flex flex-wrap gap-3">
                {formImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group"
                  >
                    <Image
                      src={resolveImage(img)}
                      alt={`Image ${idx + 1}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary-300 hover:text-primary-500 transition"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="w-5 h-5" />
                      <span className="text-[10px]">Upload</span>
                    </>
                  )}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Upload project screenshots, mockups, or final deliverables
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. E-commerce Dashboard for TechStart Ghana"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Describe the project, your role, challenges solved, and the impact..."
                rows={5}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                maxLength={5000}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Skills Used</label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  placeholder="React, Node.js, Figma..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Name</label>
                <input
                  type="text"
                  value={formClientName}
                  onChange={(e) => setFormClientName(e.target.value)}
                  placeholder="e.g. TechStart Ghana"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Completed date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Completed</label>
                <input
                  type="date"
                  value={formCompletedAt}
                  onChange={(e) => setFormCompletedAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Project URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Project URL</label>
              <input
                type="url"
                value={formProjectUrl}
                onChange={(e) => setFormProjectUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormStatus('published')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition ${
                    formStatus === 'published'
                      ? 'border-green-300 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <GlobeAltIcon className="w-4 h-4" />
                  Published
                </button>
                <button
                  type="button"
                  onClick={() => setFormStatus('draft')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition ${
                    formStatus === 'draft'
                      ? 'border-gray-400 bg-gray-100 text-gray-700'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <DocumentIcon className="w-4 h-4" />
                  Draft
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 transition"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircleIcon className="w-4 h-4" />
                )}
                {editingId ? 'Save Changes' : 'Add Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══ Portfolio Items List ═══ */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-28 h-20 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => {
            const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
            const StatusIcon = sc.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Thumbnail */}
                  <Link
                    href={`/showcase/${item.id}`}
                    className="shrink-0 w-full sm:w-28 h-36 sm:h-20 rounded-lg overflow-hidden bg-gray-100 relative group"
                  >
                    {item.images?.[0] ? (
                      <Image
                        src={resolveImage(item.images[0])}
                        alt={item.title}
                        fill
                        sizes="112px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-primary-100 to-purple-100 flex items-center justify-center">
                        <PhotoIcon className="w-6 h-6 text-primary-300" />
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/showcase/${item.id}`}
                        className="text-sm font-bold text-gray-900 hover:text-primary-600 transition-colors truncate"
                      >
                        {item.title}
                      </Link>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {sc.label}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {item.description}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <EyeIcon className="w-3.5 h-3.5" />
                        {item.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <HeartIcon className="w-3.5 h-3.5" />
                        {item.likeCount}
                      </span>
                      {item.skills.length > 0 && (
                        <span className="text-gray-300">|</span>
                      )}
                      {item.skills.slice(0, 3).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px]">
                          {s}
                        </span>
                      ))}
                      {item.skills.length > 3 && (
                        <span className="text-gray-300">+{item.skills.length - 3}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => openEdit(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                      >
                        <PencilSquareIcon className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      {item.status === 'published' ? (
                        <button
                          onClick={() => handleStatusChange(item.id, 'archived')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                        >
                          <ArchiveBoxIcon className="w-3.5 h-3.5" />
                          Archive
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(item.id, 'published')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition"
                        >
                          <GlobeAltIcon className="w-3.5 h-3.5" />
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                      >
                        {deletingId === item.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                        ) : (
                          <TrashIcon className="w-3.5 h-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <PhotoIcon className="w-8 h-8 text-primary-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No projects yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Start showcasing your work to stand out from the crowd.
            Add your best projects and let employers discover your talent.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 mt-6 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition"
          >
            <PlusIcon className="w-4 h-4" />
            Add Your First Project
          </button>
        </div>
      )}
    </div>
  );
}

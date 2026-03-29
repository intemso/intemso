'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FlagIcon,
  XMarkIcon,
  TrashIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';
import { adminApi, type AdminReport } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
  action_taken: 'bg-red-50 text-red-700 border-red-200',
  dismissed: 'bg-gray-100 text-gray-600 border-gray-200',
};

const ENTITY_STYLES: Record<string, { label: string; icon: typeof FlagIcon; color: string }> = {
  community_post: { label: 'Community Post', icon: ChatBubbleLeftRightIcon, color: 'text-blue-500' },
  community_comment: { label: 'Community Comment', icon: ChatBubbleLeftRightIcon, color: 'text-purple-500' },
  user: { label: 'User', icon: UserCircleIcon, color: 'text-orange-500' },
  gig: { label: 'Gig', icon: FlagIcon, color: 'text-green-500' },
  review: { label: 'Review', icon: FlagIcon, color: 'text-amber-500' },
};

const REVIEW_ACTIONS = [
  { value: 'reviewed', label: 'Mark as Reviewed', description: 'Acknowledge but take no action' },
  { value: 'action_taken', label: 'Take Action', description: 'Content violates guidelines' },
  { value: 'dismissed', label: 'Dismiss', description: 'Report is invalid or unfounded' },
];

const ENTITY_FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'community_post', label: 'Community Posts' },
  { value: 'community_comment', label: 'Community Comments' },
  { value: 'user', label: 'Users' },
  { value: 'gig', label: 'Gigs' },
  { value: 'review', label: 'Reviews' },
];

export default function AdminModerationPage() {
  const toast = useToast();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [reviewModal, setReviewModal] = useState<AdminReport | null>(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = useCallback(async (status: string, entity: string, p: number) => {
    setLoading(true);
    try {
      const res = await adminApi.listReports({
        status: status || undefined,
        entity: entity || undefined,
        page: p,
        limit: 20,
      });
      setReports(res.data);
      setTotalPages(res.meta.totalPages);
      setTotal(res.meta.total);
    } catch {
      toast.error('Failed to load reports');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports(statusFilter, entityFilter, page);
  }, [statusFilter, entityFilter, page, fetchReports]);

  const openReview = (r: AdminReport) => {
    setReviewModal(r);
    setReviewStatus('');
    setAdminNotes('');
  };

  const handleReview = async () => {
    if (!reviewModal || !reviewStatus) return;
    setSubmitting(true);
    try {
      await adminApi.reviewReport(reviewModal.id, {
        status: reviewStatus,
        adminNotes: adminNotes || undefined,
      });
      toast.success('Report reviewed successfully');
      setReviewModal(null);
      fetchReports(statusFilter, entityFilter, page);
    } catch {
      toast.error('Failed to review report');
    }
    setSubmitting(false);
  };

  const handleHidePost = async (postId: string) => {
    try {
      await adminApi.hideCommunityPost(postId);
      toast.success('Post hidden from community');
      fetchReports(statusFilter, entityFilter, page);
    } catch {
      toast.error('Failed to hide post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await adminApi.deleteCommunityPost(postId);
      toast.success('Post permanently deleted');
      fetchReports(statusFilter, entityFilter, page);
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await adminApi.deleteCommunityComment(commentId);
      toast.success('Comment deleted');
      fetchReports(statusFilter, entityFilter, page);
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleSuspendUser = async (reportedId: string) => {
    try {
      await adminApi.updateUser(reportedId, { suspend: true });
      toast.success('User suspended');
    } catch {
      toast.error('Failed to suspend user');
    }
  };

  const isCommunityReport = (entity: string) =>
    entity === 'community_post' || entity === 'community_comment';

  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
        </div>
        <p className="text-sm text-gray-500">
          {total} total reports{statusFilter === 'pending' ? ` \u2022 ${pendingCount} pending review` : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="action_taken">Action Taken</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          {ENTITY_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Reports list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => {
            const entityConfig = ENTITY_STYLES[r.reportedEntity] || ENTITY_STYLES.user;
            const EntityIcon = entityConfig.icon;
            return (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-50 ${entityConfig.color}`}>
                      <EntityIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{entityConfig.label} Report</p>
                      <p className="text-xs text-gray-500">
                        By {r.reporter?.email ?? 'Unknown'} &bull; {new Date(r.createdAt).toLocaleDateString('en-GH', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${STATUS_STYLES[r.status] || ''}`}>
                    {r.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Reason */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Reason</p>
                  <p className="text-sm text-gray-700">{r.reason}</p>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                  <span>Entity ID: <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">{r.reportedId.slice(0, 12)}...</code></span>
                </div>

                {r.adminNotes && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-100">
                    <p className="text-xs font-medium text-blue-600 mb-1">Admin Notes</p>
                    <p className="text-sm text-gray-700">{r.adminNotes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 justify-end pt-2 border-t border-gray-50">
                  {/* Community-specific quick actions */}
                  {r.status === 'pending' && r.reportedEntity === 'community_post' && (
                    <>
                      <button
                        onClick={() => handleHidePost(r.reportedId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 border border-amber-200 transition-colors"
                      >
                        <EyeSlashIcon className="w-3.5 h-3.5" />
                        Hide Post
                      </button>
                      <button
                        onClick={() => handleDeletePost(r.reportedId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        Delete Post
                      </button>
                    </>
                  )}
                  {r.status === 'pending' && r.reportedEntity === 'community_comment' && (
                    <button
                      onClick={() => handleDeleteComment(r.reportedId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      Delete Comment
                    </button>
                  )}

                  {/* Suspend user action for any pending report */}
                  {r.status === 'pending' && isCommunityReport(r.reportedEntity) && (
                    <button
                      onClick={() => handleSuspendUser(r.reportedId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
                      title="Suspend the user who authored this content"
                    >
                      <NoSymbolIcon className="w-3.5 h-3.5" />
                      Suspend Author
                    </button>
                  )}

                  {/* Review action */}
                  {r.status === 'pending' && (
                    <button
                      onClick={() => openReview(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {reports.length === 0 && (
            <div className="text-center py-20">
              <ExclamationTriangleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No reports found</p>
              <p className="text-xs text-gray-300 mt-1">
                {statusFilter === 'pending' ? 'All caught up! No pending reports.' : 'Try adjusting your filters.'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages} ({total} reports)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setReviewModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Review Report</h3>
              <button onClick={() => setReviewModal(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="px-5 py-4">
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">
                  {(ENTITY_STYLES[reviewModal.reportedEntity] || ENTITY_STYLES.user).label} Report
                </p>
                <p className="text-sm text-gray-700">{reviewModal.reason}</p>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <div className="space-y-2 mb-4">
                {REVIEW_ACTIONS.map((a) => (
                  <label
                    key={a.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      reviewStatus === a.value ? 'border-primary-300 bg-primary-50' : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="review-action"
                      value={a.value}
                      checked={reviewStatus === a.value}
                      onChange={(e) => setReviewStatus(e.target.value)}
                      className="mt-0.5 accent-primary-600"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{a.label}</span>
                      <p className="text-xs text-gray-500">{a.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                placeholder="Add notes about this report..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setReviewModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={!reviewStatus || submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

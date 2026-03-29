'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FlagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { adminApi, type AdminReport } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  reviewed: 'bg-blue-50 text-blue-700',
  action_taken: 'bg-red-50 text-red-700',
  dismissed: 'bg-gray-100 text-gray-600',
};

const REVIEW_ACTIONS = [
  { value: 'reviewed', label: 'Mark as Reviewed' },
  { value: 'action_taken', label: 'Take Action' },
  { value: 'dismissed', label: 'Dismiss' },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [reviewModal, setReviewModal] = useState<AdminReport | null>(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = useCallback(async (status: string, p: number) => {
    setLoading(true);
    try {
      const res = await adminApi.listReports({
        status: status || undefined,
        page: p,
        limit: 20,
      });
      setReports(res.data);
      setTotalPages(res.meta.totalPages);
      setTotal(res.meta.total);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchReports(statusFilter, page);
  }, [statusFilter, page, fetchReports]);

  const openReview = (r: AdminReport) => {
    setReviewModal(r);
    setReviewStatus('');
    setAdminNotes('');
  };

  const handleReview = async () => {
    if (!reviewModal || !reviewStatus) return;
    setSubmitting(true);
    try {
      await adminApi.reviewReport(reviewModal.id, { status: reviewStatus, adminNotes: adminNotes || undefined });
      setReviewModal(null);
      fetchReports(statusFilter, page);
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Report Review</h1>
        <p className="text-sm text-gray-500 mt-1">{total} total reports</p>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field w-auto"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="action_taken">Action Taken</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FlagIcon className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{r.reportedEntity} Report</p>
                    <p className="text-xs text-gray-500">Reported by {r.reporter?.email ?? 'Unknown'}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[r.status] || 'bg-gray-100 text-gray-600'}`}>
                  {r.status.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-3">{r.reason}</p>

              <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                <span>Entity ID: {r.reportedId.slice(0, 8)}...</span>
                <span>·</span>
                <span>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>

              {r.adminNotes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Admin Notes</p>
                  <p className="text-sm text-gray-700">{r.adminNotes}</p>
                </div>
              )}

              <div className="flex justify-end">
                {r.status === 'pending' && (
                  <button
                    onClick={() => openReview(r)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">No reports found</div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500">Page {page} of {totalPages} ({total} reports)</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Previous</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Review Report</h3>
              <button onClick={() => setReviewModal(null)}>
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {reviewModal.reportedEntity} report — {reviewModal.reason}
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              className="input-field mb-4"
            >
              <option value="">Select action...</option>
              {REVIEW_ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="input-field mb-4"
              placeholder="Add notes about this report..."
            />

            <div className="flex gap-3 justify-end">
              <button onClick={() => setReviewModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={!reviewStatus || submitting}
                className="btn-primary text-sm disabled:opacity-50"
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

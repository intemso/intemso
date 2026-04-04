'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ScaleIcon,
  ChatBubbleBottomCenterTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { adminApi, type AdminDispute } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
  under_review: 'bg-blue-900/50 text-blue-300 border border-blue-700',
  resolved_student: 'bg-green-900/50 text-green-300 border border-green-700',
  resolved_employer: 'bg-green-900/50 text-green-300 border border-green-700',
  resolved_split: 'bg-teal-900/50 text-teal-300 border border-teal-700',
  closed: 'bg-gray-700 text-gray-400',
};

const RESOLUTIONS = [
  { value: 'resolved_student', label: 'Resolve in favour of Student' },
  { value: 'resolved_employer', label: 'Resolve in favour of Employer' },
  { value: 'resolved_split', label: 'Split Resolution' },
];

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [resolveModal, setResolveModal] = useState<AdminDispute | null>(null);
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDisputes = useCallback(async (status: string, p: number) => {
    setLoading(true);
    try {
      const res = await adminApi.listDisputes({
        status: status || undefined,
        page: p,
        limit: 20,
      });
      setDisputes(res.data);
      setTotalPages(res.meta.totalPages);
      setTotal(res.meta.total);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchDisputes(statusFilter, page);
  }, [statusFilter, page, fetchDisputes]);

  const openResolve = (d: AdminDispute) => {
    setResolveModal(d);
    setResolution('');
    setAdminNotes('');
  };

  const handleResolve = async () => {
    if (!resolveModal || !resolution) return;
    setSubmitting(true);
    try {
      await adminApi.resolveDispute(resolveModal.id, { resolution, adminNotes: adminNotes || undefined });
      setResolveModal(null);
      fetchDisputes(statusFilter, page);
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const canResolve = (d: AdminDispute) => d.status === 'open' || d.status === 'under_review';

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dispute Management</h1>
        <p className="text-sm text-gray-400 mt-1">{total} total disputes</p>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/40"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="under_review">Under Review</option>
          <option value="resolved_student">Resolved (Student)</option>
          <option value="resolved_employer">Resolved (Employer)</option>
          <option value="resolved_split">Resolved (Split)</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-gray-600 border-t-red-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <ScaleIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-semibold text-white">Contract #{d.contractId.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">Raised by {d.raisedBy?.email ?? 'Unknown'}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[d.status] || 'bg-gray-700 text-gray-400'}`}>
                  {d.status.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="text-sm text-gray-300 mb-3">{d.reason}</p>

              {d.adminNotes && (
                <div className="bg-gray-700/50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-gray-400 mb-1">Admin Notes</p>
                  <p className="text-sm text-gray-300">{d.adminNotes}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</p>
                {canResolve(d) && (
                  <button
                    onClick={() => openResolve(d)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5" />
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}

          {disputes.length === 0 && (
            <div className="text-center py-16 text-gray-500 text-sm">No disputes found</div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500">Page {page} of {totalPages} ({total} disputes)</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-600 text-gray-400 disabled:opacity-40 hover:bg-gray-700">Previous</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-600 text-gray-400 disabled:opacity-40 hover:bg-gray-700">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 w-full max-w-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Resolve Dispute</h3>
              <button onClick={() => setResolveModal(null)}>
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              Contract #{resolveModal.contractId.slice(0, 8)} — {resolveModal.reason}
            </p>

            <label className="block text-sm font-medium text-gray-300 mb-1">Resolution</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/40 mb-4"
            >
              <option value="">Select resolution...</option>
              {RESOLUTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-300 mb-1">Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 mb-4 resize-none"
              placeholder="Explain the resolution decision..."
            />

            <div className="flex gap-3 justify-end">
              <button onClick={() => setResolveModal(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={!resolution || submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

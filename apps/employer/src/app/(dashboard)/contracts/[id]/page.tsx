'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  PaperClipIcon,
  PauseIcon,
  PlayIcon,
  XMarkIcon,
  ArrowPathIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import {
  contractsApi,
  milestonesApi,
  paymentsApi,
  reviewsApi,
  reportsApi,
  uploadsApi,
  type ContractListItem,
  type MilestoneItem,
  type Review,
} from '@/lib/api';
import { useAuth } from '@/context/auth';

const milestoneStyles: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Pending' },
  funded: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Funded' },
  in_progress: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'In Progress' },
  submitted: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Submitted' },
  revision_requested: { bg: 'bg-red-50', text: 'text-red-600', label: 'Revision Requested' },
  approved: { bg: 'bg-green-50', text: 'text-green-700', label: 'Approved' },
  paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Cancelled' },
  disputed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Disputed' },
};

export default function ContractDetailPage() {
  const params = useParams();
  const contractId = params.id as string;
  const { user } = useAuth();

  const [contract, setContract] = useState<ContractListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Add milestone form
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);

  const isStudent = user?.role === 'STUDENT';
  const isEmployer = user?.role === 'EMPLOYER';

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [myReview, setMyReview] = useState<Review | null>(null);

  // Dispute
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  // Deliverable upload state
  const [submitMilestoneId, setSubmitMilestoneId] = useState<string | null>(null);
  const [deliverableFiles, setDeliverableFiles] = useState<File[]>([]);
  const [deliverableMsg, setDeliverableMsg] = useState('');
  const [uploadingDeliverables, setUploadingDeliverables] = useState(false);

  useEffect(() => {
    if (!contractId) return;
    setLoading(true);
    contractsApi
      .getById(contractId)
      .then((data) => setContract(data))
      .catch(() => setError('Contract not found'))
      .finally(() => setLoading(false));
  }, [contractId]);

  // Fetch reviews for the contract
  useEffect(() => {
    if (!contractId) return;
    reviewsApi.getByContract(contractId).then((data) => {
      setReviews(data);
      if (user) {
        const mine = data.find((r) => r.reviewerId === user.studentProfile?.id || r.reviewerId === user.employerProfile?.id);
        if (mine) setMyReview(mine);
      }
    }).catch(() => { /* no reviews yet */ });
  }, [contractId, user]);

  const handleStatusUpdate = async (status: string) => {
    if (!contract) return;
    setActionLoading(true);
    try {
      const updated = await contractsApi.updateStatus(contract.id, { status });
      setContract(updated);
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  };

  const handleMilestoneAction = async (
    milestoneId: string,
    action: 'submit' | 'approve' | 'request-revision',
  ) => {
    setActionLoading(true);
    try {
      let updated: MilestoneItem;
      if (action === 'submit') {
        // Upload files if any, then submit with URLs
        let deliverableUrls: string[] = [];
        if (deliverableFiles.length > 0) {
          setUploadingDeliverables(true);
          const uploaded = await uploadsApi.uploadDeliverable(deliverableFiles);
          deliverableUrls = uploaded.map((f) => f.url);
          setUploadingDeliverables(false);
        }
        updated = await milestonesApi.submit(milestoneId, {
          deliverables: deliverableUrls.length ? deliverableUrls : undefined,
          message: deliverableMsg || undefined,
        });
        // Reset submit form
        setSubmitMilestoneId(null);
        setDeliverableFiles([]);
        setDeliverableMsg('');
      } else if (action === 'approve') {
        updated = await milestonesApi.approve(milestoneId);
      } else {
        updated = await milestonesApi.requestRevision(milestoneId);
      }
      // Refresh contract
      const fresh = await contractsApi.getById(contractId);
      setContract(fresh);
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!contract || !newTitle.trim() || !newAmount) return;
    setAddingMilestone(true);
    try {
      await milestonesApi.create(contract.id, {
        title: newTitle.trim(),
        amount: parseFloat(newAmount),
      });
      const fresh = await contractsApi.getById(contractId);
      setContract(fresh);
      setNewTitle('');
      setNewAmount('');
      setShowAddMilestone(false);
    } catch {
      // ignore
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!contract) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const review = await reviewsApi.create(contract.id, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setMyReview(review);
      setReviews((prev) => [...prev, review]);
    } catch (err: any) {
      setReviewError(err?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSubmitDispute = async () => {
    if (!contract || !disputeReason.trim()) return;
    setDisputeSubmitting(true);
    try {
      await reportsApi.createDispute(contract.id, { reason: disputeReason.trim() });
      const fresh = await contractsApi.getById(contractId);
      setContract(fresh);
      setShowDisputeForm(false);
      setDisputeReason('');
    } catch {
      // ignore
    } finally {
      setDisputeSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl flex justify-center py-16">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl text-center py-16">
        <p className="text-sm text-red-500">{error || 'Contract not found'}</p>
        <Link
          href="/contracts"
          className="text-primary-600 text-sm font-medium mt-2 inline-block hover:underline"
        >
          Back to Contracts
        </Link>
      </div>
    );
  }

  const completedMilestones = contract.milestones.filter(
    (m) => m.status === 'approved' || m.status === 'paid',
  ).length;
  const progress =
    contract.milestones.length > 0
      ? (completedMilestones / contract.milestones.length) * 100
      : 0;
  const totalBudget = contract.milestones.reduce(
    (sum, m) => sum + parseFloat(m.amount),
    0,
  );
  const earned = contract.milestones
    .filter((m) => m.status === 'approved' || m.status === 'paid')
    .reduce((sum, m) => sum + parseFloat(m.amount), 0);

  const otherParty = isStudent
    ? `${contract.employer.businessName || contract.employer.contactPerson || 'Employer'}`
    : `${contract.student.firstName} ${contract.student.lastName}`;

  return (
    <div className="max-w-5xl">
      {/* Back */}
      <Link
        href="/contracts"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 sm:mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Contracts
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{contract.title}</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
              <span className="font-medium text-gray-700">{otherParty}</span>
              <span>Started {new Date(contract.startedAt).toLocaleDateString()}</span>
              <span className="capitalize">{contract.contractType}</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              contract.status === 'active'
                ? 'bg-green-50 text-green-700'
                : contract.status === 'paused'
                  ? 'bg-yellow-50 text-yellow-700'
                  : contract.status === 'completed'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-red-50 text-red-600'
            }`}
          >
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </span>
        </div>

        {contract.description && (
          <p className="text-sm text-gray-600 mb-5">{contract.description}</p>
        )}

        {/* Budget summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-gray-50 rounded-lg p-2.5 sm:p-4 text-center">
            <p className="text-[10px] sm:text-xs text-gray-500">Agreed Rate</p>
            <p className="text-base sm:text-lg font-bold text-gray-900">
              GH₵{parseFloat(contract.agreedRate).toFixed(0)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-2.5 sm:p-4 text-center">
            <p className="text-[10px] sm:text-xs text-gray-500">{isStudent ? 'Earned' : 'Paid'}</p>
            <p className="text-base sm:text-lg font-bold text-green-600">GH₵{earned.toFixed(0)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2.5 sm:p-4 text-center">
            <p className="text-[10px] sm:text-xs text-gray-500">Total Milestones</p>
            <p className="text-base sm:text-lg font-bold text-blue-600">
              GH₵{totalBudget.toFixed(0)}
            </p>
          </div>
        </div>

        {contract.contractType === 'hourly' && (
          <div className="mt-4">
            <Link
              href={`/contracts/${contract.id}/invoices`}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View Weekly Invoices &rarr;
            </Link>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Milestones */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Milestones</h2>
              <span className="text-sm text-gray-500">
                {completedMilestones}/{contract.milestones.length} completed
              </span>
            </div>
            {contract.milestones.length > 0 && (
              <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <div className="space-y-3">
              {contract.milestones.map((milestone, idx) => {
                const style = milestoneStyles[milestone.status] || milestoneStyles.pending;
                return (
                  <div
                    key={milestone.id}
                    className="p-4 border border-gray-100 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 font-mono w-6">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {milestone.title}
                          </p>
                          {milestone.description && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">
                          GH₵{parseFloat(milestone.amount).toFixed(0)}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
                        >
                          {style.label}
                        </span>
                      </div>
                    </div>

                    {/* Milestone actions */}
                    <div className="flex items-center gap-2 mt-2">
                      {/* Employer can fund escrow on pending milestones */}
                      {isEmployer && milestone.status === 'pending' && (
                        <button
                          onClick={async () => {
                            setActionLoading(true);
                            try {
                              const { authorizationUrl } = await paymentsApi.initialize({
                                purpose: 'milestone_escrow',
                                milestoneId: milestone.id,
                                callbackUrl: window.location.href,
                              });
                              window.location.href = authorizationUrl;
                            } catch {
                              // ignore
                            } finally {
                              setActionLoading(false);
                            }
                          }}
                          disabled={actionLoading}
                          className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          Fund Escrow
                        </button>
                      )}

                      {/* Student can submit deliverables */}
                      {isStudent &&
                        ['pending', 'funded', 'in_progress', 'revision_requested'].includes(milestone.status) && (
                          submitMilestoneId === milestone.id ? (
                            <div className="w-full mt-2 p-3 border border-primary-100 rounded-lg bg-primary-50/30 space-y-2">
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                  <PaperClipIcon className="w-3.5 h-3.5" />
                                  Attach Files
                                  <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => setDeliverableFiles(Array.from(e.target.files || []))}
                                  />
                                </label>
                                {deliverableFiles.length > 0 && (
                                  <span className="text-xs text-gray-500">{deliverableFiles.length} file(s)</span>
                                )}
                              </div>
                              <input
                                type="text"
                                placeholder="Optional message..."
                                value={deliverableMsg}
                                onChange={(e) => setDeliverableMsg(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleMilestoneAction(milestone.id, 'submit')}
                                  disabled={actionLoading || uploadingDeliverables}
                                  className="px-3 py-1 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                                >
                                  {uploadingDeliverables ? 'Uploading...' : 'Submit'}
                                </button>
                                <button
                                  onClick={() => { setSubmitMilestoneId(null); setDeliverableFiles([]); setDeliverableMsg(''); }}
                                  className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSubmitMilestoneId(milestone.id)}
                              disabled={actionLoading}
                              className="px-3 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
                            >
                              Submit Deliverables
                            </button>
                          )
                        )}

                      {/* Employer can approve or request revision */}
                      {isEmployer && milestone.status === 'submitted' && (
                        <>
                          <button
                            onClick={() => handleMilestoneAction(milestone.id, 'approve')}
                            disabled={actionLoading}
                            className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleMilestoneAction(milestone.id, 'request-revision')}
                            disabled={actionLoading}
                            className="px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <ArrowPathIcon className="w-3.5 h-3.5" />
                            Request Revision ({milestone.revisionCount}/{milestone.maxRevisions})
                          </button>
                        </>
                      )}

                      {/* Revision count info */}
                      {milestone.status === 'revision_requested' && (
                        <span className="text-xs text-gray-400">
                          Revision {milestone.revisionCount}/{milestone.maxRevisions}
                        </span>
                      )}

                      {/* Auto-approve info */}
                      {milestone.status === 'submitted' && milestone.autoApproveAt && (
                        <span className="text-xs text-gray-400 ml-auto">
                          Auto-approves {new Date(milestone.autoApproveAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add milestone */}
            {contract.status === 'active' && (
              <div className="mt-4">
                {showAddMilestone ? (
                  <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <input
                      type="text"
                      placeholder="Milestone title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="input-field"
                    />
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        GH₵
                      </span>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="input-field pl-8"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddMilestone}
                        disabled={addingMilestone || !newTitle.trim() || !newAmount}
                        className="btn-primary text-sm disabled:opacity-50"
                      >
                        {addingMilestone ? 'Adding...' : 'Add Milestone'}
                      </button>
                      <button
                        onClick={() => setShowAddMilestone(false)}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddMilestone(true)}
                    className="flex items-center gap-1 text-sm text-primary-600 font-medium hover:text-primary-700"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Milestone
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions sidebar */}
        <div className="space-y-6">
          {contract.status === 'active' && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contract Actions
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => handleStatusUpdate('paused')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 w-full p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <PauseIcon className="w-4 h-4" />
                  Pause Contract
                </button>
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 w-full p-3 text-sm text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Mark Complete
                </button>
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 w-full p-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Cancel Contract
                </button>
              </div>
            </div>
          )}

          {contract.status === 'paused' && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contract Paused
              </h2>
              <button
                onClick={() => handleStatusUpdate('active')}
                disabled={actionLoading}
                className="flex items-center gap-2 w-full p-3 text-sm text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <PlayIcon className="w-4 h-4" />
                Resume Contract
              </button>
            </div>
          )}

          {/* Contract info */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Details
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Type</dt>
                <dd className="text-gray-900 font-medium capitalize">{contract.contractType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Started</dt>
                <dd className="text-gray-900 font-medium">
                  {new Date(contract.startedAt).toLocaleDateString()}
                </dd>
              </div>
              {contract.completedAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Completed</dt>
                  <dd className="text-gray-900 font-medium">
                    {new Date(contract.completedAt).toLocaleDateString()}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Currency</dt>
                <dd className="text-gray-900 font-medium">{contract.currency}</dd>
              </div>
              {contract.gig && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Gig</dt>
                  <dd>
                    <a
                      href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://intemso.com'}/gigs/${contract.gig.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 font-medium hover:underline"
                    >
                      View Gig
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Raise Dispute — for active/paused contracts */}
          {(contract.status === 'active' || contract.status === 'paused') && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              {showDisputeForm ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-gray-900">Raise a Dispute</h2>
                  <p className="text-xs text-gray-500">
                    Describe the issue. This will pause the contract and notify the other party.
                  </p>
                  <textarea
                    rows={4}
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="input-field"
                    placeholder="Explain the issue..."
                    maxLength={2000}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmitDispute}
                      disabled={disputeSubmitting || !disputeReason.trim()}
                      className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {disputeSubmitting ? 'Submitting...' : 'Submit Dispute'}
                    </button>
                    <button
                      onClick={() => { setShowDisputeForm(false); setDisputeReason(''); }}
                      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDisputeForm(true)}
                  className="flex items-center gap-2 w-full p-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Raise a Dispute
                </button>
              )}
            </div>
          )}

          {contract.status === 'disputed' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                <ExclamationTriangleIcon className="w-5 h-5" />
                This contract is under dispute
              </div>
              <p className="text-xs text-red-600 mt-1">
                An admin will review and resolve the dispute.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      {contract.status === 'completed' && (
        <div className="mt-6 bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h2>

          {/* Existing reviews */}
          {reviews.length > 0 && (
            <div className="space-y-4 mb-6">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {review.reviewerName || 'Anonymous'}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  )}
                  {/* Allow reviewee to flag */}
                  {review.revieweeId === (isStudent ? user?.studentProfile?.id : user?.employerProfile?.id) && !review.isFlagged && (
                    <button
                      onClick={async () => {
                        try {
                          const updated = await reviewsApi.flag(review.id);
                          setReviews((prev) => prev.map((r) => r.id === review.id ? updated : r));
                        } catch { /* ignore */ }
                      }}
                      className="mt-2 text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                    >
                      <FlagIcon className="w-3 h-3" />
                      Flag as inappropriate
                    </button>
                  )}
                  {review.isFlagged && (
                    <span className="mt-2 text-xs text-amber-500 flex items-center gap-1">
                      <FlagIcon className="w-3 h-3" />
                      Flagged for review
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Submit review form — only if not already reviewed */}
          {!myReview ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Leave a Review</h3>
              {reviewError && (
                <div className="p-2 mb-3 bg-red-50 text-red-600 text-xs rounded-lg">{reviewError}</div>
              )}
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <StarIcon
                        className={`w-6 h-6 transition-colors ${
                          star <= reviewRating ? 'text-yellow-400' : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-gray-500 ml-2">{reviewRating}/5</span>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Comment (optional)</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="input-field"
                  placeholder="Share your experience..."
                  maxLength={2000}
                />
              </div>
              <button
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">You have already reviewed this contract.</p>
          )}
        </div>
      )}
    </div>
  );
}

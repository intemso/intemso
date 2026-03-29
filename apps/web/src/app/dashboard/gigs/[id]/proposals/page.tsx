'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  StarIcon as StarIconOutline,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { proposalsApi, gigsApi, type ProposalListItem, type GigListItem } from '@/lib/api';

const statusStyles: Record<string, string> = {
  submitted: 'bg-gray-100 text-gray-700',
  viewed: 'bg-blue-50 text-blue-700',
  shortlisted: 'bg-amber-50 text-amber-700',
  interview: 'bg-green-50 text-green-700',
  offer_sent: 'bg-purple-50 text-purple-700',
  hired: 'bg-green-100 text-green-800',
  declined: 'bg-red-50 text-red-600',
  withdrawn: 'bg-gray-100 text-gray-500',
};

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  viewed: 'Viewed',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offer_sent: 'Offer Sent',
  hired: 'Hired',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function GigProposalsPage() {
  const params = useParams();
  const gigId = params.id as string;

  const [gig, setGig] = useState<GigListItem | null>(null);
  const [proposals, setProposals] = useState<ProposalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!gigId) return;
    setLoading(true);
    Promise.all([
      gigsApi.getById(gigId),
      proposalsApi.listByGig(gigId),
    ])
      .then(([gigData, proposalsData]) => {
        setGig(gigData);
        setProposals(proposalsData.data);
      })
      .catch(() => setError('Failed to load proposals'))
      .finally(() => setLoading(false));
  }, [gigId]);

  const handleAction = async (proposalId: string, status: string) => {
    setActionLoading(proposalId);
    try {
      const result = await proposalsApi.updateStatus(proposalId, { status });
      // If hired, result may have a contract field
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status } : p)),
      );
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl flex justify-center py-16">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl text-center py-16">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <Link
        href="/dashboard/gigs"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to My Gigs
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
        {gig && (
          <p className="text-sm text-gray-500 mt-1">
            {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} for &ldquo;{gig.title}&rdquo;
          </p>
        )}
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-16">
          <UserIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No proposals yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all"
            >
              {/* Student info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">
                      {(proposal.student?.firstName?.[0] || '') + (proposal.student?.lastName?.[0] || '')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {proposal.student?.firstName} {proposal.student?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {proposal.student?.professionalTitle || proposal.student?.university}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusStyles[proposal.status] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {statusLabels[proposal.status] || proposal.status}
                  </span>
                </div>
              </div>

              {/* Student stats */}
              {proposal.student && (
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  {Number(proposal.student.ratingAvg) > 0 && (
                    <span className="flex items-center gap-0.5">
                      <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                      {parseFloat(proposal.student.ratingAvg).toFixed(1)} ({proposal.student.ratingCount})
                    </span>
                  )}
                  <span>{proposal.student.gigsCompleted} gigs completed</span>
                  {proposal.student.hourlyRate && (
                    <span>GH₵{parseFloat(proposal.student.hourlyRate)}/hr</span>
                  )}
                </div>
              )}

              {/* Cover letter */}
              <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">{proposal.coverLetter}</p>

              {/* Bid info */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>
                  Bid: <span className="font-semibold text-green-600">GH₵{parseFloat(proposal.proposedRate).toFixed(0)}</span>
                </span>
                {proposal.estimatedDuration && (
                  <span>Duration: <span className="font-medium text-gray-700">{proposal.estimatedDuration}</span></span>
                )}
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5" />
                  {timeAgo(proposal.createdAt)}
                </span>
              </div>

              {/* Skills */}
              {proposal.student?.skills && proposal.student.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {proposal.student.skills.slice(0, 6).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              {proposal.status !== 'hired' && proposal.status !== 'declined' && proposal.status !== 'withdrawn' && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                  {proposal.status === 'submitted' && (
                    <button
                      onClick={() => handleAction(proposal.id, 'shortlisted')}
                      disabled={actionLoading === proposal.id}
                      className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
                    >
                      Shortlist
                    </button>
                  )}
                  {(proposal.status === 'submitted' || proposal.status === 'shortlisted' || proposal.status === 'interview') && (
                    <>
                      <button
                        onClick={() => handleAction(proposal.id, 'hired')}
                        disabled={actionLoading === proposal.id}
                        className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Hire
                      </button>
                      <button
                        onClick={() => handleAction(proposal.id, 'declined')}
                        disabled={actionLoading === proposal.id}
                        className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircleIcon className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </>
                  )}
                </div>
              )}
              {proposal.status === 'hired' && (
                <div className="pt-3 border-t border-gray-50">
                  <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4" />
                    Hired — Contract created
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

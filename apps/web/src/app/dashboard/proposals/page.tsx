'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClockIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { proposalsApi, type ProposalListItem } from '@/lib/api';

const TABS = ['Active', 'Submitted', 'Archived'] as const;

const statusStyles: Record<string, string> = {
  submitted: 'bg-gray-100 text-gray-700',
  viewed: 'bg-blue-50 text-blue-700',
  shortlisted: 'bg-amber-50 text-amber-700',
  interview: 'bg-green-50 text-green-700',
  offer_sent: 'bg-purple-50 text-purple-700',
  hired: 'bg-green-100 text-green-800',
  declined: 'bg-red-50 text-red-600',
  withdrawn: 'bg-gray-100 text-gray-500',
  archived: 'bg-gray-50 text-gray-500',
};

const statusLabels: Record<string, string> = {
  submitted: 'Pending review',
  viewed: 'Reviewed by client',
  shortlisted: 'Shortlisted',
  interview: 'Interview scheduled',
  offer_sent: 'Offer sent',
  hired: 'Hired!',
  declined: 'Not selected',
  withdrawn: 'Withdrawn',
  archived: 'Archived',
};

function formatBudget(min: string | null, max: string | null) {
  const f = (n: number) =>
    n >= 1000 ? `GH₵${(n / 1000).toFixed(1)}k` : `GH₵${n}`;
  const minN = min ? parseFloat(min) : 0;
  const maxN = max ? parseFloat(max) : 0;
  if (minN && maxN) return `${f(minN)} - ${f(maxN)}`;
  if (minN) return `From ${f(minN)}`;
  if (maxN) return `Up to ${f(maxN)}`;
  return 'Negotiable';
}

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

export default function ProposalsPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Active');
  const [proposals, setProposals] = useState<ProposalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    proposalsApi
      .listMine()
      .then((res) => setProposals(res.data))
      .catch(() => setError('Failed to load proposals'))
      .finally(() => setLoading(false));
  }, []);

  const archivedStatuses = ['declined', 'withdrawn', 'archived'];
  const activeProposals = proposals.filter((p) => !archivedStatuses.includes(p.status));
  const submittedProposals = proposals.filter((p) => p.status === 'submitted');
  const archivedProposals = proposals.filter((p) => archivedStatuses.includes(p.status));

  const displayed =
    activeTab === 'Archived'
      ? archivedProposals
      : activeTab === 'Submitted'
        ? submittedProposals
        : activeProposals;

  const handleWithdraw = async (proposalId: string) => {
    setWithdrawingId(proposalId);
    try {
      await proposalsApi.withdraw(proposalId);
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: 'withdrawn' } : p)),
      );
    } catch {
      // ignore
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Proposals</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your submitted proposals</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            <span className="ml-1.5 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
              {tab === 'Archived'
                ? archivedProposals.length
                : tab === 'Submitted'
                  ? submittedProposals.length
                  : activeProposals.length}
            </span>
          </button>
        ))}
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      )}
      {error && (
        <div className="text-center py-16">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Proposals list */}
      {!loading && !error && (
        <div className="space-y-4">
          {displayed.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/gigs/${proposal.gigId}`}
                    className="text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
                  >
                    {proposal.gig?.title || 'Gig'}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <span>{proposal.gig?.employer?.businessName || 'Employer'}</span>
                    {proposal.gig?.employer?.ratingAvg && (
                      <span className="flex items-center gap-0.5">
                        <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                        {parseFloat(proposal.gig.employer.ratingAvg).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusStyles[proposal.status] || 'bg-gray-100 text-gray-700'}`}
                >
                  {statusLabels[proposal.status] || proposal.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{proposal.coverLetter}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    Budget:{' '}
                    <span className="font-medium text-gray-900">
                      {proposal.gig ? formatBudget(proposal.gig.budgetMin, proposal.gig.budgetMax) : '—'}
                    </span>
                  </span>
                  <span>
                    Your Bid:{' '}
                    <span className="font-semibold text-green-600">
                      GH₵{parseFloat(proposal.proposedRate).toFixed(0)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {timeAgo(proposal.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {proposal.status === 'interview' && (
                    <Link
                      href="/dashboard/messages"
                      className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      Open Chat
                    </Link>
                  )}
                  {!archivedStatuses.includes(proposal.status) && proposal.status !== 'hired' && (
                    <button
                      onClick={() => handleWithdraw(proposal.id)}
                      disabled={withdrawingId === proposal.id}
                      className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      {withdrawingId === proposal.id ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && displayed.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No proposals in this category</p>
          <Link
            href="/gigs"
            className="text-primary-600 text-sm font-medium mt-2 inline-block hover:underline"
          >
            Browse gigs to apply
          </Link>
        </div>
      )}
    </div>
  );
}

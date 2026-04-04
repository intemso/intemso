'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClockIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { contractsApi, type ContractListItem } from '@/lib/api';
import { useAuth } from '@/context/auth';

const TABS = ['Active', 'Completed', 'All'] as const;

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

export default function ContractsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Active');
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    contractsApi
      .listMine()
      .then((res) => setContracts(res.data))
      .catch(() => setError('Failed to load contracts'))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeTab === 'All'
      ? contracts
      : contracts.filter((c) =>
          activeTab === 'Active'
            ? c.status === 'active' || c.status === 'paused'
            : c.status === 'completed',
        );

  const isStudent = user?.role === 'STUDENT';

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Manage your active and past contracts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 sm:gap-1 mb-4 sm:mb-6 border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
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

      {/* Contracts */}
      {!loading && !error && (
        <div className="space-y-4">
          {filtered.map((contract) => {
            const completedMilestones = contract.milestones.filter(
              (m) => m.status === 'approved' || m.status === 'paid',
            ).length;
            const totalMilestones = contract.milestones.length;
            const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
            const otherParty = isStudent ? contract.employer : contract.student;
            const otherName = isStudent
              ? contract.employer.businessName || contract.employer.contactPerson || 'Employer'
              : `${contract.student.firstName} ${contract.student.lastName}`;

            return (
              <Link
                key={contract.id}
                href={`/contracts/${contract.id}`}
                className="block bg-white border border-gray-100 rounded-xl p-4 sm:p-5 hover:shadow-md transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-1">
                      {contract.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>{otherName}</span>
                      {Number(otherParty.ratingAvg) > 0 && (
                        <span className="flex items-center gap-0.5">
                          <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                          {parseFloat(otherParty.ratingAvg).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
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

                {/* Milestones progress */}
                {totalMilestones > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Milestones</span>
                      <span>
                        {completedMilestones}/{totalMilestones}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-3 sm:gap-4 text-gray-500">
                    <span>
                      Rate: <span className="font-medium text-gray-900">GH₵{parseFloat(contract.agreedRate).toFixed(0)}</span>
                    </span>
                    <span>
                      Type: <span className="font-medium text-gray-900">{contract.contractType === 'fixed' ? 'Fixed' : 'Hourly'}</span>
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-gray-400 text-xs">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {timeAgo(contract.updatedAt)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No contracts found</p>
        </div>
      )}
    </div>
  );
}

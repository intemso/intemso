'use client';

import { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { adminApi, type AdminStats } from '@/lib/api';

export default function AdminFinancialsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-3 border-gray-600 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-red-400">Failed to load financial data.</p>;
  }

  const cards = [
    { label: 'Total Payments', value: `GH₵${Number(stats.financial.totalPayments).toLocaleString()}`, icon: BanknotesIcon, color: 'bg-green-600' },
    { label: 'Escrow Held', value: `GH₵${Number(stats.financial.escrowHeld).toLocaleString()}`, icon: ShieldCheckIcon, color: 'bg-blue-600' },
    { label: 'Released to Students', value: `GH₵${Number(stats.financial.totalReleased).toLocaleString()}`, icon: ArrowTrendingUpIcon, color: 'bg-teal-600' },
    { label: 'Platform Fees Earned', value: `GH₵${Number(stats.financial.platformFees).toLocaleString()}`, icon: CurrencyDollarIcon, color: 'bg-red-600' },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Financial Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Platform payment &amp; revenue metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{c.value}</p>
            <p className="text-xs text-gray-400 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Platform Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Contract Activity</h2>
          <div className="space-y-4">
            {[
              ['Total Contracts', stats.contracts.total, 'text-white'],
              ['Active Contracts', stats.contracts.active, 'text-blue-400'],
              ['Completed Contracts', stats.contracts.completed, 'text-green-400'],
            ].map(([label, val, color]) => (
              <div key={label as string} className="flex justify-between">
                <span className="text-sm text-gray-400">{label}</span>
                <span className={`text-sm font-semibold ${color}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Gig Activity</h2>
          <div className="space-y-4">
            {[
              ['Total Gigs', stats.gigs.total, 'text-white'],
              ['Open Gigs', stats.gigs.open, 'text-green-400'],
              ['Open Disputes', stats.disputes.open, 'text-yellow-400'],
            ].map(([label, val, color]) => (
              <div key={label as string} className="flex justify-between">
                <span className="text-sm text-gray-400">{label}</span>
                <span className={`text-sm font-semibold ${color}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">User Growth</h2>
          <div className="space-y-4">
            {[
              ['Total Users', stats.users.total, 'text-white'],
              ['Students', stats.users.students, 'text-blue-400'],
              ['Employers', stats.users.employers, 'text-purple-400'],
              ['Signups (Last 30 Days)', stats.users.recentSignups, 'text-green-400'],
            ].map(([label, val, color]) => (
              <div key={label as string} className="flex justify-between">
                <span className="text-sm text-gray-400">{label}</span>
                <span className={`text-sm font-semibold ${color}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Trust &amp; Safety</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Open Disputes</span>
              <span className="text-sm font-semibold text-yellow-400">{stats.disputes.open}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Pending Reports</span>
              <span className="text-sm font-semibold text-red-400">{stats.reports.pending}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

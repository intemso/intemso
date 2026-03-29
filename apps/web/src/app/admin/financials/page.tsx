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
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <div className="p-6 text-gray-400">Failed to load financial data.</div>;
  }

  const cards = [
    {
      label: 'Total Payments',
      value: `GH₵${Number(stats.financial.totalPayments).toLocaleString()}`,
      icon: BanknotesIcon,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Escrow Held',
      value: `GH₵${Number(stats.financial.escrowHeld).toLocaleString()}`,
      icon: ShieldCheckIcon,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Released to Students',
      value: `GH₵${Number(stats.financial.totalReleased).toLocaleString()}`,
      icon: ArrowTrendingUpIcon,
      color: 'text-teal-600 bg-teal-50',
    },
    {
      label: 'Platform Fees Earned',
      value: `GH₵${Number(stats.financial.platformFees).toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'text-primary-600 bg-primary-50',
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Platform payment &amp; revenue metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Platform Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Activity</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Contracts</span>
              <span className="text-sm font-semibold text-gray-900">{stats.contracts.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Contracts</span>
              <span className="text-sm font-semibold text-blue-600">{stats.contracts.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completed Contracts</span>
              <span className="text-sm font-semibold text-green-600">{stats.contracts.completed}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gig Activity</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Gigs</span>
              <span className="text-sm font-semibold text-gray-900">{stats.gigs.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Open Gigs</span>
              <span className="text-sm font-semibold text-green-600">{stats.gigs.open}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Open Disputes</span>
              <span className="text-sm font-semibold text-yellow-600">{stats.disputes.open}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Users</span>
              <span className="text-sm font-semibold text-gray-900">{stats.users.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Students</span>
              <span className="text-sm font-semibold text-blue-600">{stats.users.students}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Employers</span>
              <span className="text-sm font-semibold text-purple-600">{stats.users.employers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Signups (Last 30 Days)</span>
              <span className="text-sm font-semibold text-green-600">{stats.users.recentSignups}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trust &amp; Safety</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Open Disputes</span>
              <span className="text-sm font-semibold text-yellow-600">{stats.disputes.open}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pending Reports</span>
              <span className="text-sm font-semibold text-red-600">{stats.reports.pending}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

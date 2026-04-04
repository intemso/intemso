'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ShieldExclamationIcon,
  FlagIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { adminApi, type AdminStats } from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-3 border-gray-600 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-red-400">Failed to load stats.</p>;
  }

  const cards = [
    { label: 'Total Users', value: stats.users.total, sub: `${stats.users.recentSignups} last 30d`, icon: UsersIcon, color: 'bg-blue-600' },
    { label: 'Students', value: stats.users.students, sub: `${((stats.users.students / (stats.users.total || 1)) * 100).toFixed(0)}% of users`, icon: UsersIcon, color: 'bg-indigo-600' },
    { label: 'Employers', value: stats.users.employers, sub: `${((stats.users.employers / (stats.users.total || 1)) * 100).toFixed(0)}% of users`, icon: UsersIcon, color: 'bg-purple-600' },
    { label: 'Total Gigs', value: stats.gigs.total, sub: `${stats.gigs.open} open`, icon: BriefcaseIcon, color: 'bg-green-600' },
    { label: 'Contracts', value: stats.contracts.total, sub: `${stats.contracts.active} active · ${stats.contracts.completed} completed`, icon: DocumentTextIcon, color: 'bg-teal-600' },
    { label: 'Open Disputes', value: stats.disputes.open, sub: 'Need resolution', icon: ShieldExclamationIcon, color: 'bg-red-600' },
    { label: 'Pending Reports', value: stats.reports.pending, sub: 'Awaiting review', icon: FlagIcon, color: 'bg-orange-600' },
    { label: 'Platform Fees', value: `GH₵${stats.financial.platformFees.toLocaleString()}`, sub: 'Total collected', icon: BanknotesIcon, color: 'bg-emerald-600' },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Platform overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
              </div>
              <div className={`${card.color} p-2.5 rounded-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-400">Total Payments</p>
            <p className="text-xl font-bold text-white">{stats.financial.totalPayments}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Escrow Held</p>
            <p className="text-xl font-bold text-amber-400">GH₵{stats.financial.escrowHeld.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Released</p>
            <p className="text-xl font-bold text-green-400">GH₵{stats.financial.totalReleased.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Platform Fees</p>
            <p className="text-xl font-bold text-red-400">GH₵{stats.financial.platformFees.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 sm:p-6">
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/disputes" className="px-4 py-3 bg-red-900/40 text-red-300 border border-red-800 rounded-lg text-sm font-medium text-center hover:bg-red-900/60 transition-colors">
            Resolve Disputes ({stats.disputes.open})
          </Link>
          <Link href="/reports" className="px-4 py-3 bg-orange-900/40 text-orange-300 border border-orange-800 rounded-lg text-sm font-medium text-center hover:bg-orange-900/60 transition-colors">
            Review Reports ({stats.reports.pending})
          </Link>
          <Link href="/users" className="px-4 py-3 bg-blue-900/40 text-blue-300 border border-blue-800 rounded-lg text-sm font-medium text-center hover:bg-blue-900/60 transition-colors">
            Manage Users
          </Link>
          <Link href="/categories" className="px-4 py-3 bg-purple-900/40 text-purple-300 border border-purple-800 rounded-lg text-sm font-medium text-center hover:bg-purple-900/60 transition-colors">
            Manage Categories
          </Link>
        </div>
      </div>
    </>
  );
}

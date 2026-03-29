'use client';

import { useState, useEffect } from 'react';
import {
  UsersIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ShieldExclamationIcon,
  FlagIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
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
      <div className="p-8 flex justify-center py-16">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <p className="text-red-500">Failed to load stats.</p>
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', value: stats.users.total, sub: `${stats.users.recentSignups} last 30d`, icon: UsersIcon, color: 'bg-blue-500' },
    { label: 'Students', value: stats.users.students, sub: `${((stats.users.students / (stats.users.total || 1)) * 100).toFixed(0)}% of users`, icon: UsersIcon, color: 'bg-indigo-500' },
    { label: 'Employers', value: stats.users.employers, sub: `${((stats.users.employers / (stats.users.total || 1)) * 100).toFixed(0)}% of users`, icon: UsersIcon, color: 'bg-purple-500' },
    { label: 'Total Gigs', value: stats.gigs.total, sub: `${stats.gigs.open} open`, icon: BriefcaseIcon, color: 'bg-green-500' },
    { label: 'Contracts', value: stats.contracts.total, sub: `${stats.contracts.active} active · ${stats.contracts.completed} completed`, icon: DocumentTextIcon, color: 'bg-teal-500' },
    { label: 'Open Disputes', value: stats.disputes.open, sub: 'Need resolution', icon: ShieldExclamationIcon, color: 'bg-red-500' },
    { label: 'Pending Reports', value: stats.reports.pending, sub: 'Awaiting review', icon: FlagIcon, color: 'bg-orange-500' },
    { label: 'Platform Fees', value: `GH₵${stats.financial.platformFees.toLocaleString()}`, sub: 'Total collected', icon: BanknotesIcon, color: 'bg-emerald-500' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <div className={`${card.color} p-2.5 rounded-lg`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Total Payments</p>
            <p className="text-xl font-bold text-gray-900">{stats.financial.totalPayments}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Escrow Held</p>
            <p className="text-xl font-bold text-amber-600">GH₵{stats.financial.escrowHeld.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Released</p>
            <p className="text-xl font-bold text-green-600">GH₵{stats.financial.totalReleased.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Platform Fees</p>
            <p className="text-xl font-bold text-primary-600">GH₵{stats.financial.platformFees.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a href="/admin/disputes" className="px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium text-center hover:bg-red-100 transition-colors">
            Resolve Disputes ({stats.disputes.open})
          </a>
          <a href="/admin/reports" className="px-4 py-3 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium text-center hover:bg-orange-100 transition-colors">
            Review Reports ({stats.reports.pending})
          </a>
          <a href="/admin/users" className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium text-center hover:bg-blue-100 transition-colors">
            Manage Users
          </a>
          <a href="/admin/categories" className="px-4 py-3 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium text-center hover:bg-purple-100 transition-colors">
            Manage Categories
          </a>
        </div>
      </div>
    </div>
  );
}

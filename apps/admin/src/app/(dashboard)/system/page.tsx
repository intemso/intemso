'use client';

import { useState, useEffect } from 'react';
import { ServerIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  database: string;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

export default function SystemPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealth = () => {
    setLoading(true);
    setError('');
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, '');
    fetch(`${baseUrl}/health`)
      .then((r) => r.json())
      .then((data) => setHealth(data))
      .catch(() => setError('Failed to reach API server'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const statusColor =
    health?.status === 'ok'
      ? 'text-green-400'
      : health?.status === 'degraded'
        ? 'text-yellow-400'
        : 'text-red-400';

  const dbColor =
    health?.database === 'connected' ? 'text-green-400' : 'text-red-400';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ServerIcon className="w-7 h-7 text-gray-400" />
            System
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            API health and platform information
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-sm text-gray-200 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Health cards  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            API Status
          </div>
          <div className={`text-2xl font-bold ${statusColor}`}>
            {loading ? '...' : health?.status?.toUpperCase() || 'UNKNOWN'}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Database
          </div>
          <div className={`text-2xl font-bold ${dbColor}`}>
            {loading
              ? '...'
              : health?.database?.toUpperCase() || 'UNKNOWN'}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Uptime
          </div>
          <div className="text-2xl font-bold text-white">
            {loading ? '...' : health ? formatUptime(health.uptime) : '—'}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Last Checked
          </div>
          <div className="text-lg font-medium text-white">
            {loading
              ? '...'
              : health
                ? new Date(health.timestamp).toLocaleTimeString()
                : '—'}
          </div>
        </div>
      </div>

      {/* Platform info */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <div className="px-5 py-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
            Platform Info
          </h2>
        </div>
        <div className="divide-y divide-gray-700">
          {[
            ['Platform', 'Intemso'],
            ['Frontend', 'Next.js 14 (App Router)'],
            ['Backend', 'NestJS 11'],
            ['Database', 'PostgreSQL 16 + Prisma'],
            ['Cache', 'Redis 7'],
            ['Runtime', 'Node.js 22'],
            ['Hosting', 'Hetzner CX23 (Docker)'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <span className="text-gray-400">{label}</span>
              <span className="text-gray-200 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <div className="px-5 py-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
            Services
          </h2>
        </div>
        <div className="divide-y divide-gray-700">
          {[
            { name: 'Web App', url: 'intemso.com', port: 3000 },
            { name: 'API', url: 'intemso.com/api', port: 3001 },
            { name: 'Student Portal', url: 'jobs.intemso.com', port: 3002 },
            { name: 'Employer Portal', url: 'hire.intemso.com', port: 3003 },
            { name: 'Admin Portal', url: 'admin.intemso.com', port: 3004 },
          ].map((svc) => (
            <div
              key={svc.name}
              className="flex items-center justify-between px-5 py-3 text-sm"
            >
              <div>
                <span className="text-gray-200 font-medium">{svc.name}</span>
                <span className="text-gray-500 ml-2">:{svc.port}</span>
              </div>
              <span className="text-gray-400">{svc.url}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

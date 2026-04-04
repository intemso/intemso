'use client';

import { useState, useEffect } from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { adminApi, type AuditLogEntry } from '@/lib/api';

const ACTION_STYLES: Record<string, string> = {
  UPDATE_USER: 'bg-blue-900/50 text-blue-300 border border-blue-700',
  RESOLVE_DISPUTE: 'bg-green-900/50 text-green-300 border border-green-700',
  REVIEW_REPORT: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
  CREATE_CATEGORY: 'bg-purple-900/50 text-purple-300 border border-purple-700',
  UPDATE_CATEGORY: 'bg-purple-900/50 text-purple-300 border border-purple-700',
  DELETE_CATEGORY: 'bg-red-900/50 text-red-300 border border-red-700',
  HIDE_POST: 'bg-orange-900/50 text-orange-300 border border-orange-700',
  DELETE_POST: 'bg-red-900/50 text-red-300 border border-red-700',
  DELETE_COMMENT: 'bg-red-900/50 text-red-300 border border-red-700',
};

const DEFAULT_STYLE = 'bg-gray-700/50 text-gray-300 border border-gray-600';

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    adminApi
      .getAuditLog(200)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? entries.filter((e) => e.action === filter)
    : entries;

  const actions = [...new Set(entries.map((e) => e.action))].sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-7 h-7 text-gray-400" />
            Audit Log
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {filtered.length} {filter ? 'matching ' : ''}entries
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-red-500 focus:border-red-500"
        >
          <option value="">All Actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No audit log entries found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      ACTION_STYLES[entry.action] || DEFAULT_STYLE
                    }`}
                  >
                    {entry.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-gray-300">
                    on <span className="font-medium text-white">{entry.entity}</span>
                    {entry.entityId && (
                      <span className="text-gray-500 ml-1 font-mono text-xs">
                        {entry.entityId.slice(0, 8)}...
                      </span>
                    )}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(entry.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-400">
                <span>
                  By <span className="text-gray-300">{entry.user.email}</span>
                </span>
                {entry.ipAddress && (
                  <span className="font-mono">{entry.ipAddress}</span>
                )}
              </div>

              {entry.details && Object.keys(entry.details).length > 0 && (
                <pre className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-400 overflow-x-auto">
                  {JSON.stringify(entry.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

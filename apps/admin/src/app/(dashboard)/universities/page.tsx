'use client';

import { useState } from 'react';
import { AcademicCapIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  GHANA_UNIVERSITIES,
  UNIVERSITIES_BY_TYPE,
  UNIVERSITIES_BY_REGION,
  TOTAL_UNIVERSITIES,
  UniversityType,
  type GhanaUniversity,
} from '@intemso/shared';

const TYPE_LABELS: Record<string, string> = {
  [UniversityType.PUBLIC]: 'Public',
  [UniversityType.TECHNICAL]: 'Technical',
  [UniversityType.PROFESSIONAL]: 'Professional',
  [UniversityType.CHARTERED_PRIVATE]: 'Chartered Private',
  [UniversityType.PRIVATE]: 'Private',
  [UniversityType.REGIONAL]: 'Regional',
};

const TYPE_STYLES: Record<string, string> = {
  [UniversityType.PUBLIC]: 'bg-blue-900/50 text-blue-300 border border-blue-700',
  [UniversityType.TECHNICAL]: 'bg-green-900/50 text-green-300 border border-green-700',
  [UniversityType.PROFESSIONAL]: 'bg-purple-900/50 text-purple-300 border border-purple-700',
  [UniversityType.CHARTERED_PRIVATE]: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
  [UniversityType.PRIVATE]: 'bg-orange-900/50 text-orange-300 border border-orange-700',
  [UniversityType.REGIONAL]: 'bg-cyan-900/50 text-cyan-300 border border-cyan-700',
};

export default function UniversitiesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'type' | 'region'>('none');

  const filtered = GHANA_UNIVERSITIES.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.abbreviation.toLowerCase().includes(q) ||
      u.location.toLowerCase().includes(q);
    const matchType = !typeFilter || u.type === typeFilter;
    const matchRegion = !regionFilter || u.region === regionFilter;
    return matchSearch && matchType && matchRegion;
  });

  const regions = [...new Set(GHANA_UNIVERSITIES.map((u) => u.region))].sort();

  const grouped: Record<string, GhanaUniversity[]> =
    groupBy === 'type'
      ? filtered.reduce<Record<string, GhanaUniversity[]>>((acc, u) => {
          const key = TYPE_LABELS[u.type] || u.type;
          if (!acc[key]) acc[key] = [];
          acc[key].push(u);
          return acc;
        }, {})
      : groupBy === 'region'
        ? filtered.reduce<Record<string, GhanaUniversity[]>>((acc, u) => {
            if (!acc[u.region]) acc[u.region] = [];
            acc[u.region].push(u);
            return acc;
          }, {})
        : { All: filtered };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AcademicCapIcon className="w-7 h-7 text-gray-400" />
          Universities
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {filtered.length} of {TOTAL_UNIVERSITIES} accredited Ghanaian institutions
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(UNIVERSITIES_BY_TYPE).map(([type, unis]) => (
          <button
            key={type}
            onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
            className={`p-3 rounded-lg border text-left transition-colors ${
              typeFilter === type
                ? 'bg-red-900/30 border-red-600'
                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-2xl font-bold text-white">{unis.length}</div>
            <div className="text-xs text-gray-400">{TYPE_LABELS[type] || type}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, abbreviation, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-gray-200 pl-9 pr-3 py-2 rounded-lg text-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-red-500 focus:border-red-500"
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as 'none' | 'type' | 'region')}
          className="bg-gray-700 border border-gray-600 text-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-red-500 focus:border-red-500"
        >
          <option value="none">No Grouping</option>
          <option value="type">Group by Type</option>
          <option value="region">Group by Region</option>
        </select>
      </div>

      {/* Table */}
      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([group, unis]) => (
          <div key={group}>
            {groupBy !== 'none' && (
              <h2 className="text-lg font-semibold text-white mb-3 mt-2">
                {group}{' '}
                <span className="text-sm font-normal text-gray-500">
                  ({unis.length})
                </span>
              </h2>
            )}
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-gray-400 text-xs uppercase">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Abbreviation</th>
                    <th className="px-4 py-3 hidden md:table-cell">Type</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Location</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Region</th>
                    <th className="px-4 py-3 hidden xl:table-cell">Founded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {unis.map((u) => (
                    <tr key={u.abbreviation} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 font-medium text-gray-200">
                        {u.name}
                        <span className="sm:hidden text-xs text-gray-500 ml-2">
                          ({u.abbreviation})
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-400 font-mono">
                        {u.abbreviation}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            TYPE_STYLES[u.type] || ''
                          }`}
                        >
                          {TYPE_LABELS[u.type] || u.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-400">
                        {u.location}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-400">
                        {u.region}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-gray-500">
                        {u.founded || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No universities match your filters.
        </div>
      )}
    </div>
  );
}

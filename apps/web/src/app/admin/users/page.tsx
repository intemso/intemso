'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  NoSymbolIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { adminApi, type AdminUser } from '@/lib/api';

const ROLE_STYLES: Record<string, string> = {
  student: 'bg-blue-50 text-blue-700',
  employer: 'bg-purple-50 text-purple-700',
  admin: 'bg-red-50 text-red-700',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout>();

  const fetchUsers = useCallback(async (s: string, role: string, status: string, p: number) => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers({
        search: s || undefined,
        role: role || undefined,
        status: status || undefined,
        page: p,
        limit: 20,
      });
      setUsers(res.data);
      setTotalPages(res.meta.totalPages);
      setTotal(res.meta.total);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchUsers(search, roleFilter, statusFilter, page);
  }, [roleFilter, statusFilter, page, fetchUsers]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(search, roleFilter, statusFilter, 1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSuspend = async (userId: string) => {
    await adminApi.updateUser(userId, { suspend: true });
    fetchUsers(search, roleFilter, statusFilter, page);
  };

  const handleActivate = async (userId: string) => {
    await adminApi.updateUser(userId, { activate: true });
    fetchUsers(search, roleFilter, statusFilter, page);
  };

  const getUserName = (u: AdminUser) => {
    if (u.studentProfile) return `${u.studentProfile.firstName} ${u.studentProfile.lastName}`;
    if (u.employerProfile) return u.employerProfile.businessName;
    return u.email;
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">{total} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input-field w-auto"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="employer">Employers</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field w-auto"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stats</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{getUserName(u)}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${ROLE_STYLES[u.role] || 'bg-gray-50 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isSuspended ? (
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-medium rounded-full">Suspended</span>
                      ) : u.isActive ? (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-full">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {u.studentProfile && (
                        <span>{u.studentProfile.gigsCompleted} gigs · GH₵{Number(u.studentProfile.totalEarned).toLocaleString()}</span>
                      )}
                      {u.employerProfile && (
                        <span>{u.employerProfile.gigsPosted} posted · GH₵{Number(u.employerProfile.totalSpent).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.isSuspended ? (
                        <button
                          onClick={() => handleActivate(u.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100"
                        >
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          Activate
                        </button>
                      ) : u.role !== 'admin' ? (
                        <button
                          onClick={() => handleSuspend(u.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100"
                        >
                          <NoSymbolIcon className="w-3.5 h-3.5" />
                          Suspend
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No users found</div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages} ({total} users)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

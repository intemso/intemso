'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BellIcon,
  CheckCircleIcon,
  TrashIcon,
  FunnelIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  StarIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  BoltIcon,
  ScaleIcon,
  HeartIcon,
  AtSymbolIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolid } from '@heroicons/react/24/solid';
import { notificationsApi, type Notification } from '@/lib/api';

/* ─── Notification Type Config ─── */
const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  new_application: { icon: DocumentTextIcon, color: 'bg-blue-100 text-blue-600', label: 'Application' },
  application_reviewed: { icon: DocumentTextIcon, color: 'bg-indigo-100 text-indigo-600', label: 'Application' },
  application_hired: { icon: CheckCircleIcon, color: 'bg-green-100 text-green-600', label: 'Hired' },
  application_declined: { icon: XMarkIcon, color: 'bg-red-100 text-red-600', label: 'Application' },
  contract_status_changed: { icon: BriefcaseIcon, color: 'bg-orange-100 text-orange-600', label: 'Contract' },
  milestone_funded: { icon: CurrencyDollarIcon, color: 'bg-emerald-100 text-emerald-600', label: 'Milestone' },
  milestone_submitted: { icon: DocumentTextIcon, color: 'bg-blue-100 text-blue-600', label: 'Milestone' },
  milestone_approved: { icon: CheckCircleIcon, color: 'bg-green-100 text-green-600', label: 'Milestone' },
  milestone_revision: { icon: ArrowPathIcon, color: 'bg-amber-100 text-amber-600', label: 'Revision' },
  payment_released: { icon: CurrencyDollarIcon, color: 'bg-emerald-100 text-emerald-600', label: 'Payment' },
  new_message: { icon: ChatBubbleLeftIcon, color: 'bg-sky-100 text-sky-600', label: 'Message' },
  review_received: { icon: StarIcon, color: 'bg-yellow-100 text-yellow-600', label: 'Review' },
  dispute_opened: { icon: ScaleIcon, color: 'bg-red-100 text-red-600', label: 'Dispute' },
  dispute_response: { icon: ScaleIcon, color: 'bg-amber-100 text-amber-600', label: 'Dispute' },
  dispute_resolved: { icon: ScaleIcon, color: 'bg-green-100 text-green-600', label: 'Dispute' },
  dispute_raised: { icon: ExclamationTriangleIcon, color: 'bg-red-100 text-red-600', label: 'Dispute' },
  community_comment: { icon: ChatBubbleLeftIcon, color: 'bg-pink-100 text-pink-600', label: 'Community' },
  community_reply: { icon: ChatBubbleLeftIcon, color: 'bg-pink-100 text-pink-600', label: 'Community' },
  community_like: { icon: HeartIcon, color: 'bg-rose-100 text-rose-600', label: 'Community' },
  community_mention: { icon: AtSymbolIcon, color: 'bg-purple-100 text-purple-600', label: 'Mention' },
  user_followed: { icon: UserGroupIcon, color: 'bg-violet-100 text-violet-600', label: 'Social' },
  jss_updated: { icon: ShieldCheckIcon, color: 'bg-teal-100 text-teal-600', label: 'Score' },
  badge_earned: { icon: ShieldCheckIcon, color: 'bg-amber-100 text-amber-600', label: 'Badge' },
  connects_low: { icon: BoltIcon, color: 'bg-orange-100 text-orange-600', label: 'Connects' },
  connects_refreshed: { icon: BoltIcon, color: 'bg-green-100 text-green-600', label: 'Connects' },
  service_order: { icon: BriefcaseIcon, color: 'bg-purple-100 text-purple-600', label: 'Service' },
};

const FILTER_OPTIONS = [
  { value: '', label: 'All Notifications' },
  { value: 'application', label: 'Applications', match: ['new_application', 'application_reviewed', 'application_hired', 'application_declined'] },
  { value: 'contract', label: 'Contracts & Milestones', match: ['contract_status_changed', 'milestone_funded', 'milestone_submitted', 'milestone_approved', 'milestone_revision'] },
  { value: 'payment', label: 'Payments', match: ['payment_released'] },
  { value: 'message', label: 'Messages', match: ['new_message'] },
  { value: 'dispute', label: 'Disputes', match: ['dispute_opened', 'dispute_response', 'dispute_resolved', 'dispute_raised'] },
  { value: 'community', label: 'Community', match: ['community_comment', 'community_reply', 'community_like', 'community_mention', 'user_followed'] },
  { value: 'review', label: 'Reviews', match: ['review_received'] },
];

function getNotificationRoute(type: string, data: Record<string, any>): string | null {
  switch (type) {
    case 'new_application':
      return data.gigId ? `/gigs/${data.gigId}` : '/gigs';
    case 'application_reviewed':
    case 'application_hired':
    case 'application_declined':
      return '/applications';
    case 'contract_status_changed':
    case 'milestone_funded':
    case 'milestone_submitted':
    case 'milestone_approved':
    case 'milestone_revision':
      return data.contractId ? `/contracts/${data.contractId}` : '/contracts';
    case 'payment_released':
      return '/earnings';
    case 'new_message':
      return data.conversationId ? `/messages?conversation=${data.conversationId}` : '/messages';
    case 'review_received':
      return '/profile';
    case 'dispute_opened':
    case 'dispute_response':
    case 'dispute_resolved':
    case 'dispute_raised':
      return data.contractId ? `/contracts/${data.contractId}` : '/contracts';
    case 'community_comment':
    case 'community_reply':
    case 'community_like':
    case 'community_mention':
      return data.postId ? `https://intemso.com/community?post=${data.postId}` : 'https://intemso.com/community';
    case 'user_followed':
      return '/profile';
    case 'connects_low':
    case 'connects_refreshed':
      return '/connects';
    case 'service_order':
      return '/services';
    default:
      return null;
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // If typeFilter has a match array, we need to make multiple calls or filter client-side
      // For simplicity, we use the type query param for single-type filters
      const filterOpt = FILTER_OPTIONS.find((o) => o.value === typeFilter);
      const typeParam = filterOpt?.match?.length === 1 ? filterOpt.match[0] : undefined;

      const res = await notificationsApi.list({
        page,
        limit: 20,
        unreadOnly: filter === 'unread',
        type: typeParam,
      });
      
      // Client-side filter for multi-type categories
      let data = res.data;
      if (filterOpt?.match && filterOpt.match.length > 1) {
        data = data.filter((n) => filterOpt.match!.includes(n.type));
      }
      
      setNotifications(data);
      setMeta(res.meta);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [page, filter, typeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await notificationsApi.markAsRead(notif.id);
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
      } catch {}
    }
    const route = getNotificationRoute(notif.type, notif.data || {});
    if (route) {
      if (route.startsWith('http')) {
        window.open(route, '_blank');
      } else {
        router.push(route);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setMeta((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch {}
  };

  const handleDeleteAllRead = async () => {
    try {
      const res = await notificationsApi.deleteAllRead();
      if (res.deleted > 0) {
        setNotifications((prev) => prev.filter((n) => !n.isRead));
        setMeta((prev) => ({ ...prev, total: prev.total - res.deleted }));
      }
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BellSolid className="w-6 h-6 text-primary-600" />
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total} total · {unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="w-3.5 h-3.5" />
            Mark all read
          </button>
          <button
            onClick={handleDeleteAllRead}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Clear read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'all' ? 'All' : 'Unread'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            typeFilter ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FunnelIcon className="w-3.5 h-3.5" />
          {typeFilter ? FILTER_OPTIONS.find((o) => o.value === typeFilter)?.label : 'Filter by type'}
        </button>

        {typeFilter && (
          <button onClick={() => { setTypeFilter(''); setPage(1); }} className="text-xs text-gray-400 hover:text-gray-600">
            Clear filter
          </button>
        )}
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setTypeFilter(opt.value); setShowFilters(false); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                typeFilter === opt.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Notification List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <BellIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </h3>
          <p className="text-sm text-gray-500">
            {filter === 'unread' ? 'You have no unread notifications.' : 'You\'ll be notified about applications, contracts, and more.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type] || { icon: BellIcon, color: 'bg-gray-100 text-gray-600', label: 'Notification' };
            const Icon = config.icon;
            return (
              <button
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`w-full group flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 hover:shadow-sm ${
                  notif.isRead
                    ? 'bg-white border-gray-100 hover:border-gray-200'
                    : 'bg-primary-50/40 border-primary-100 hover:border-primary-200'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm leading-tight ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notif.isRead && (
                        <span className="w-2 h-2 bg-primary-500 rounded-full" />
                      )}
                      <button
                        onClick={(e) => handleDelete(e, notif.id)}
                        className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-[11px] text-gray-400">{timeAgo(notif.createdAt)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Page {page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

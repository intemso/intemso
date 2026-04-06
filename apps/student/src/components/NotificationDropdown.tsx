'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  StarIcon,
  ScaleIcon,
  HeartIcon,
  AtSymbolIcon,
  ArrowPathIcon,
  UserGroupIcon,
  BoltIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolid } from '@heroicons/react/24/solid';
import { notificationsApi, type Notification } from '@/lib/api';

const TYPE_ICON: Record<string, { icon: React.ElementType; color: string }> = {
  new_application: { icon: DocumentTextIcon, color: 'text-blue-500' },
  application_reviewed: { icon: DocumentTextIcon, color: 'text-indigo-500' },
  application_hired: { icon: CheckCircleIcon, color: 'text-green-500' },
  application_declined: { icon: XMarkIcon, color: 'text-red-500' },
  contract_status_changed: { icon: BriefcaseIcon, color: 'text-orange-500' },
  milestone_funded: { icon: CurrencyDollarIcon, color: 'text-emerald-500' },
  milestone_submitted: { icon: DocumentTextIcon, color: 'text-blue-500' },
  milestone_approved: { icon: CheckCircleIcon, color: 'text-green-500' },
  milestone_revision: { icon: ArrowPathIcon, color: 'text-amber-500' },
  payment_released: { icon: CurrencyDollarIcon, color: 'text-emerald-500' },
  new_message: { icon: ChatBubbleLeftIcon, color: 'text-sky-500' },
  review_received: { icon: StarIcon, color: 'text-yellow-500' },
  dispute_opened: { icon: ScaleIcon, color: 'text-red-500' },
  dispute_response: { icon: ScaleIcon, color: 'text-amber-500' },
  dispute_resolved: { icon: ScaleIcon, color: 'text-green-500' },
  dispute_raised: { icon: ExclamationTriangleIcon, color: 'text-red-500' },
  community_comment: { icon: ChatBubbleLeftIcon, color: 'text-pink-500' },
  community_reply: { icon: ChatBubbleLeftIcon, color: 'text-pink-500' },
  community_like: { icon: HeartIcon, color: 'text-rose-500' },
  community_mention: { icon: AtSymbolIcon, color: 'text-purple-500' },
  user_followed: { icon: UserGroupIcon, color: 'text-violet-500' },
  jss_updated: { icon: ShieldCheckIcon, color: 'text-teal-500' },
  badge_earned: { icon: ShieldCheckIcon, color: 'text-amber-500' },
  connects_low: { icon: BoltIcon, color: 'text-orange-500' },
  connects_refreshed: { icon: BoltIcon, color: 'text-green-500' },
  service_order: { icon: BriefcaseIcon, color: 'text-purple-500' },
};

function getRoute(type: string, data: Record<string, any>): string | null {
  switch (type) {
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
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

interface NotificationDropdownProps {
  unreadCount: number;
  onUnreadChange: (count: number) => void;
}

export default function NotificationDropdown({ unreadCount, onUnreadChange }: NotificationDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Fetch when opened
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.list({ limit: 8 });
      setNotifications(res.data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  const handleClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await notificationsApi.markAsRead(notif.id);
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
        onUnreadChange(Math.max(0, unreadCount - 1));
      } catch {}
    }
    setOpen(false);
    const route = getRoute(notif.type, notif.data || {});
    if (route) router.push(route);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onUnreadChange(0);
    } catch {}
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <BellIcon className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-primary-600 hover:text-primary-700"
                >
                  <CheckIcon className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[60vh] sm:max-h-100 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <BellIcon className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const t = TYPE_ICON[notif.type] || { icon: BellIcon, color: 'text-gray-400' };
                const Icon = t.icon;
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                      !notif.isRead ? 'bg-primary-50/30' : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${t.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-snug ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{notif.body}</p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                    </div>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/50">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

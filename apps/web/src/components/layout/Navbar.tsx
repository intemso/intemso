'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Logo from '@/components/ui/Logo';
import {
  MagnifyingGlassIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightStartOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { Avatar } from '@/components/ui';
import { useAuth } from '@/context/auth';
import { categoriesApi, notificationsApi, type Category, type Notification } from '@/lib/api';

const navigation = [
  { name: 'Find Work', href: '/gigs' },
  { name: 'Find Talent', href: '/talent' },
  { name: 'Community', href: '/community' },
  { name: 'Showcase', href: '/showcase' },
  { name: 'Why Intemso', href: '/about' },
];

function getNotificationRoute(type: string, data: Record<string, any>): string | null {
  switch (type) {
    case 'proposal_received':
      return data.gigId ? `/dashboard/gigs/${data.gigId}/proposals` : '/dashboard/gigs';
    case 'proposal_hired':
      return data.contractId ? `/dashboard/contracts/${data.contractId}` : '/dashboard/contracts';
    case 'proposal_shortlisted':
    case 'proposal_declined':
      return '/dashboard/proposals';
    case 'contract_status_changed':
      return data.contractId ? `/dashboard/contracts/${data.contractId}` : '/dashboard/contracts';
    case 'milestone_submitted':
    case 'milestone_approved':
    case 'milestone_revision':
      return data.contractId ? `/dashboard/contracts/${data.contractId}` : '/dashboard/contracts';
    case 'new_message':
      return data.conversationId ? `/dashboard/messages?conversation=${data.conversationId}` : '/dashboard/messages';
    case 'review_received':
      return '/dashboard/profile';
    case 'dispute_raised':
      return data.contractId ? `/dashboard/contracts/${data.contractId}` : '/dashboard/contracts';
    case 'community_comment':
    case 'community_reply':
    case 'community_like':
      return '/community';
    case 'community_pin':
      return '/community';
    default:
      return null;
  }
}

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch categories from API
  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCount = () => {
      notificationsApi.getUnreadCount().then((r) => setUnreadCount(r.unread)).catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (notifOpen && isAuthenticated) {
      notificationsApi.list({ limit: 8 }).then((r) => setNotifications(r.data)).catch(() => {});
    }
  }, [notifOpen, isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.studentProfile
    ? `${(user.studentProfile as Record<string, string>).firstName || ''} ${(user.studentProfile as Record<string, string>).lastName || ''}`.trim()
    : user?.employerProfile
      ? (user.employerProfile as Record<string, string>).contactPerson || (user.employerProfile as Record<string, string>).businessName || ''
      : user?.email?.split('@')[0] || '';

  const isLoggedIn = isAuthenticated;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-nav">
      {/* Top bar */}
      <div className="px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={32} showText={true} textClassName="text-xl font-bold text-gray-900 hidden sm:block" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <div
              className={`relative w-full transition-all duration-200 ${
                searchFocused ? 'scale-[1.02]' : ''
              }`}
            >
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for gigs, skills, or students..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard/messages" className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                </Link>
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <BellIcon className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white rounded-xl border border-gray-100 shadow-lg z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              notificationsApi.markAllAsRead().then(() => {
                                setUnreadCount(0);
                                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                              }).catch(() => {});
                            }}
                            className="text-xs text-primary-600 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-400 text-sm">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => {
                                if (!notif.isRead) {
                                  notificationsApi.markAsRead(notif.id).then(() => {
                                    setUnreadCount((c) => Math.max(0, c - 1));
                                    setNotifications((prev) =>
                                      prev.map((n) => n.id === notif.id ? { ...n, isRead: true } : n),
                                    );
                                  }).catch(() => {});
                                }
                                setNotifOpen(false);
                                const route = getNotificationRoute(notif.type, notif.data || {});
                                if (route) router.push(route);
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                                !notif.isRead ? 'bg-primary-50/50' : ''
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {!notif.isRead && (
                                  <span className="mt-1.5 w-2 h-2 bg-primary-600 rounded-full shrink-0" />
                                )}
                                <div className={!notif.isRead ? '' : 'ml-4'}>
                                  <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                  {notif.body && (
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>
                                  )}
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    {new Date(notif.createdAt).toLocaleDateString()} · {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-1 pr-3 hover:bg-gray-50 rounded-full transition-colors"
                  >
                    <Avatar name={displayName || 'User'} size="sm" />
                    <ChevronDownIcon className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{displayName || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-3 sm:py-2.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <UserCircleIcon className="w-5 h-5 sm:w-4 sm:h-4 text-gray-400" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2.5 px-4 py-3 sm:py-2.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <UserCircleIcon className="w-5 h-5 sm:w-4 sm:h-4 text-gray-400" />
                        My Profile
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2.5 px-4 py-3 sm:py-2.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Cog6ToothIcon className="w-5 h-5 sm:w-4 sm:h-4 text-gray-400" />
                        Settings
                      </Link>
                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={() => { setDropdownOpen(false); logout(); }}
                          className="flex items-center gap-2.5 w-full px-4 py-3 sm:py-2.5 text-sm text-red-600 hover:bg-red-50 active:bg-red-100"
                        >
                          <ArrowRightStartOnRectangleIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors ml-1"
            >
              {mobileOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>



      {/* Mobile menu — Full-screen app-like overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-14 sm:top-16 bg-white z-40 animate-fade-in overflow-y-auto safe-bottom">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile search */}
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search gigs, skills, students..."
                className="w-full pl-12 pr-4 py-3.5 text-base bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all"
              />
            </div>

            {/* Navigation links — large touch targets */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center justify-between px-4 py-4 text-base font-semibold text-gray-800 hover:text-primary-600 active:bg-gray-50 rounded-2xl transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
                <ChevronDownIcon className="w-4 h-4 text-gray-300 -rotate-90" />
              </Link>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-100 my-2" />

            {/* Categories section */}
            <div className="px-2 pt-2">
              <p className="px-2 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                Popular Categories
              </p>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {categories.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/gigs?category=${encodeURIComponent(cat.id)}`}
                    className="px-3 py-3 text-sm font-medium text-gray-600 bg-gray-50 rounded-xl hover:bg-primary-50 hover:text-primary-600 active:bg-primary-100 transition-colors text-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Auth buttons for non-logged-in users */}
            {!isLoggedIn && (
              <div className="pt-4 space-y-2.5">
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center w-full py-4 text-base font-bold text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 rounded-2xl transition-all shadow-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started — Free
                </Link>
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center w-full py-4 text-base font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-2xl transition-all border border-gray-200"
                  onClick={() => setMobileOpen(false)}
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

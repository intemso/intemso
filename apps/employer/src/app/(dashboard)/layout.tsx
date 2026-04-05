'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  RectangleStackIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowRightStartOnRectangleIcon,
  StarIcon,
  ShieldCheckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/auth';
import { notificationsApi, apiFetch } from '@/lib/api';

const navigation = [
  { name: 'Overview', href: '/', icon: HomeIcon },
  { name: 'My Gigs', href: '/gigs', icon: BriefcaseIcon },
  { name: 'Applications', href: '/applications', icon: DocumentTextIcon },
  { name: 'Contracts', href: '/contracts', icon: BriefcaseIcon },
  { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Find Talent', href: '/talent', icon: MagnifyingGlassIcon },
  { name: 'Services', href: '/services', icon: RectangleStackIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function EmployerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ep = user?.employerProfile as Record<string, any> | null;
  const displayName = ep?.contactPerson || ep?.businessName || user?.email?.split('@')[0] || '';
  const businessName = ep?.businessName || '';
  const initials = displayName ? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  useEffect(() => {
    async function load() {
      try {
        const r = await notificationsApi.getUnreadCount();
        setUnreadCount(r.unread);
      } catch {}
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* ═══ TOP NAVBAR ═══ */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 h-16">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(true)}>
                <Bars3Icon className="w-5 h-5 text-gray-600" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">I</span>
                </div>
                <span className="text-lg font-bold text-gray-900 hidden sm:block">Employer Portal</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100">
                <BellIcon className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/messages" className="p-2 rounded-lg hover:bg-gray-100">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-amber-600">{initials}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">{displayName}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* ═══ MOBILE SIDEBAR ═══ */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
              <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-50 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <span className="text-lg font-bold text-gray-900">Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                      <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-gray-100">
                  <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl">
                    <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* ═══ LEFT SIDEBAR — Desktop ═══ */}
          <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 fixed inset-y-0 top-16 bg-white border-r border-gray-100 z-20">
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link key={item.name} href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 space-y-2 border-t border-gray-100">
              <Link href="/post-gig"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition-colors"
              >
                <PlusCircleIcon className="w-4 h-4" />
                Post a Gig
              </Link>
              <button onClick={logout}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Mobile bottom nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-gray-200 safe-bottom animate-slide-up-nav">
            <div className="flex items-stretch justify-around px-1 py-1">
              {navigation.slice(0, 5).map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link key={item.name} href={item.href}
                    className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-colors ${
                      isActive ? 'text-amber-600' : 'text-gray-400 active:text-gray-600'
                    }`}
                  >
                    <item.icon className={`w-6 h-6 ${isActive ? 'text-amber-600' : ''}`} />
                    <span className={`text-[10px] font-semibold ${isActive ? 'text-amber-600' : ''}`}>
                      {item.name.replace('My ', '')}
                    </span>
                    {isActive && <span className="w-1 h-1 rounded-full bg-amber-600 mt-0.5" />}
                  </Link>
                );
              })}
              <Link href="/settings"
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-colors ${
                  pathname.startsWith('/settings') ? 'text-amber-600' : 'text-gray-400'
                }`}
              >
                <Cog6ToothIcon className="w-6 h-6" />
                <span className="text-[10px] font-semibold">More</span>
              </Link>
            </div>
          </nav>

          {/* ═══ MAIN CONTENT ═══ */}
          <main className="flex-1 lg:ml-60 pb-20 lg:pb-0">
            <div className="flex">
              <div className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8">
                {children}
              </div>

              {/* ═══ RIGHT SIDEBAR — Employer Stats ═══ */}
              <aside className="hidden xl:block w-80 shrink-0 border-l border-gray-100 bg-white sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                <div className="p-5 space-y-5">
                  {/* Business Card */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto overflow-hidden">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-amber-600">{initials}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-3">{businessName || displayName}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ep?.businessType || 'Employer'}
                    </p>
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Hiring Stats */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Hiring Stats</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Gigs posted</span>
                        <span className="text-sm font-bold text-gray-900">{ep?.gigsPosted ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total spent</span>
                        <span className="text-sm font-bold text-gray-900">GH₵{ep?.totalSpent ? parseFloat(ep.totalSpent).toLocaleString() : '0'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Hire rate</span>
                        <span className="text-sm font-bold text-green-600">{ep?.hireRate ? `${parseFloat(ep.hireRate).toFixed(0)}%` : '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Avg. rating</span>
                        <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                          <StarIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {ep?.ratingAvg ? parseFloat(ep.ratingAvg).toFixed(1) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Quick Actions */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <Link href="/post-gig" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors w-full">
                        <PlusCircleIcon className="w-5 h-5" />
                        Post a New Gig
                      </Link>
                      <Link href="/talent" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors w-full">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                        Search Talent
                      </Link>
                      <a
                        href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3000'}/showcase`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors w-full"
                      >
                        <RectangleStackIcon className="w-5 h-5 text-gray-400" />
                        Browse Showcase
                      </a>
                    </div>
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Verification */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Verification</h4>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheckIcon className={`w-4 h-4 ${user?.emailVerified ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={`text-sm ${user?.emailVerified ? 'text-gray-600' : 'text-gray-400'}`}>
                          Email {user?.emailVerified ? 'verified' : 'not verified'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <ShieldCheckIcon className={`w-4 h-4 ${ep?.isVerified ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={`text-sm ${ep?.isVerified ? 'text-gray-600' : 'text-gray-400'}`}>
                          Business {ep?.isVerified ? 'verified' : 'not verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

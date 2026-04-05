'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  StarIcon,
  ShieldCheckIcon,
  ArrowUpRightIcon,
  RectangleStackIcon,
  ArrowRightStartOnRectangleIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/auth';
import { connectsApi, walletApi, notificationsApi, apiFetch } from '@/lib/api';

const navigation = [
  { name: 'Overview', href: '/', icon: HomeIcon },
  { name: 'My Applications', href: '/applications', icon: DocumentTextIcon },
  { name: 'Active Contracts', href: '/contracts', icon: BriefcaseIcon },
  { name: 'My Portfolio', href: '/showcase', icon: RectangleStackIcon },
  { name: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Earnings', href: '/earnings', icon: CurrencyDollarIcon },
  { name: 'Services', href: '/services', icon: BoltIcon },
  { name: 'My Profile', href: '/profile', icon: UserCircleIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [connects, setConnects] = useState<{ total: number; free: number; purchased: number } | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>('0.00');
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileScore, setProfileScore] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sp = user?.studentProfile as Record<string, any> | null;
  const displayName = sp ? `${sp.firstName || ''} ${sp.lastName || ''}`.trim() : user?.email?.split('@')[0] || '';
  const initials = displayName ? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  // Load live sidebar data
  useEffect(() => {
    async function loadSidebarData() {
      const [connRes, walRes, notifRes] = await Promise.allSettled([
        connectsApi.getBalance(),
        walletApi.getBalance(),
        notificationsApi.getUnreadCount(),
      ]);
      if (connRes.status === 'fulfilled') setConnects(connRes.value);
      if (walRes.status === 'fulfilled') setWalletBalance(walRes.value.balance);
      if (notifRes.status === 'fulfilled') setUnreadCount(notifRes.value.unread);
    }
    loadSidebarData();

    // Poll notifications every 30s
    const interval = setInterval(async () => {
      try {
        const r = await notificationsApi.getUnreadCount();
        setUnreadCount(r.unread);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate profile completeness
  useEffect(() => {
    if (!sp) return;
    let score = 0;
    if (sp.firstName) score += 15;
    if (sp.lastName) score += 15;
    if (sp.university) score += 15;
    if (sp.bio) score += 15;
    if (sp.professionalTitle) score += 10;
    if (sp.skills?.length > 0) score += 15;
    if (sp.hourlyRate) score += 5;
    if (user?.avatarUrl) score += 10;
    setProfileScore(Math.min(score, 100));
  }, [sp, user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* ═══ TOP NAVBAR ═══ */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 h-16">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon className="w-5 h-5 text-gray-600" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">I</span>
                </div>
                <span className="text-lg font-bold text-gray-900 hidden sm:block">Student Portal</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100">
                <BellIcon className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Messages */}
              <Link href="/messages" className="p-2 rounded-lg hover:bg-gray-100">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
              </Link>

              {/* Avatar + name */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-primary-600">{initials}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">{displayName}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
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
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
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
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 space-y-2 border-t border-gray-100">
              <a
                href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3000'}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-xl hover:bg-primary-100 transition-colors"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Find Gigs
              </a>
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Mobile bottom navigation */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-gray-200 safe-bottom animate-slide-up-nav">
            <div className="flex items-stretch justify-around px-1 py-1">
              {navigation.slice(0, 5).map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-colors ${
                      isActive ? 'text-primary-600' : 'text-gray-400 active:text-gray-600'
                    }`}
                  >
                    <item.icon className={`w-6 h-6 ${isActive ? 'text-primary-600' : ''}`} />
                    <span className={`text-[10px] font-semibold ${isActive ? 'text-primary-600' : ''}`}>
                      {item.name.replace('Active ', '').replace('My ', '')}
                    </span>
                    {isActive && <span className="w-1 h-1 rounded-full bg-primary-600 mt-0.5" />}
                  </Link>
                );
              })}
              <Link
                href="/settings"
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-colors ${
                  pathname.startsWith('/settings') ? 'text-primary-600' : 'text-gray-400'
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

              {/* ═══ RIGHT SIDEBAR — Live Profile & Connects ═══ */}
              <aside className="hidden xl:block w-80 shrink-0 border-l border-gray-100 bg-white sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
                <div className="p-5 space-y-5">
                  {/* Profile Card */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto overflow-hidden">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-primary-600">{initials}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-3">{displayName || 'Student'}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {sp?.professionalTitle || sp?.university || 'Student'}
                    </p>
                    {/* Live profile completeness */}
                    <div className="mt-3 px-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-gray-500">Profile completeness</span>
                        <span className="font-semibold text-primary-600">{profileScore}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${profileScore}%` }} />
                      </div>
                      {profileScore < 100 && (
                        <Link href="/profile/edit" className="text-xs text-primary-600 font-medium mt-2 inline-block hover:underline">
                          Complete your profile →
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Live Connects */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Connects</h4>
                      <a
                        href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3000'}/pricing`}
                        className="text-xs text-primary-600 font-medium hover:underline"
                      >
                        Get more
                      </a>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <BoltIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-primary-700">{connects?.total ?? '—'}</p>
                          <p className="text-xs text-primary-500">Available connects</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-primary-100 grid grid-cols-2 gap-2 text-center">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{connects?.free ?? '—'}</p>
                          <p className="text-[10px] text-gray-400">Free</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{connects?.purchased ?? '—'}</p>
                          <p className="text-[10px] text-gray-400">Purchased</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Live Wallet Balance */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Wallet</h4>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-xs text-green-600 font-medium">Available Balance</p>
                      <p className="text-2xl font-bold text-green-700 mt-1">GH₵{parseFloat(walletBalance).toLocaleString()}</p>
                      <Link href="/earnings" className="text-xs text-green-600 font-medium mt-2 inline-block hover:underline">
                        View earnings →
                      </Link>
                    </div>
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Live Stats */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Stats</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Jobs completed</span>
                        <span className="text-sm font-bold text-gray-900">{sp?.gigsCompleted ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Success rate</span>
                        <span className="text-sm font-bold text-green-600">{sp?.jobSuccessScore ?? 0}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Avg. rating</span>
                        <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                          <StarIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {sp?.ratingAvg ? parseFloat(sp.ratingAvg).toFixed(1) : '—'}
                        </span>
                      </div>
                      {sp?.talentBadge && sp.talentBadge !== 'none' && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Badge</span>
                          <span className="text-sm font-bold text-primary-600 capitalize">{sp.talentBadge.replace('_', ' ')}</span>
                        </div>
                      )}
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
                        <ShieldCheckIcon className={`w-4 h-4 ${sp?.isVerified ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className={`text-sm ${sp?.isVerified ? 'text-gray-600' : 'text-gray-400'}`}>
                          Student ID {sp?.isVerified ? 'verified' : 'not verified'}
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  TagIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  BellAlertIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/auth';
import { adminApi, type AdminStats } from '@/lib/api';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Disputes', href: '/disputes', icon: ExclamationTriangleIcon },
  { name: 'Reports', href: '/reports', icon: FlagIcon },
  { name: 'Community', href: '/moderation', icon: ChatBubbleLeftRightIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Categories', href: '/categories', icon: TagIcon },
  { name: 'Financials', href: '/financials', icon: CurrencyDollarIcon },
  { name: 'Audit Log', href: '/audit-log', icon: ClipboardDocumentListIcon },
  { name: 'Universities', href: '/universities', icon: AcademicCapIcon },
  { name: 'System', href: '/system', icon: ServerIcon },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    adminApi.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        {/* ═══ TOP BAR ═══ */}
        <header className="sticky top-0 z-40 bg-gray-800 border-b border-gray-700 h-16">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-lg hover:bg-gray-700" onClick={() => setMobileMenuOpen(true)}>
                <Bars3Icon className="w-5 h-5 text-gray-300" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-bold text-white">Intemso Admin</span>
                  <span className="text-xs text-gray-400 block -mt-1">Platform Management</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* Live alerts */}
              {stats && (stats.disputes.open > 0 || stats.reports.pending > 0) && (
                <div className="flex items-center gap-2">
                  {stats.disputes.open > 0 && (
                    <Link href="/disputes" className="flex items-center gap-1 px-2.5 py-1.5 bg-red-900/50 border border-red-700 rounded-lg text-xs font-medium text-red-300 hover:bg-red-900/70">
                      <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                      {stats.disputes.open} disputes
                    </Link>
                  )}
                  {stats.reports.pending > 0 && (
                    <Link href="/reports" className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-900/50 border border-amber-700 rounded-lg text-xs font-medium text-amber-300 hover:bg-amber-900/70">
                      <FlagIcon className="w-3.5 h-3.5" />
                      {stats.reports.pending} reports
                    </Link>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pl-3 border-l border-gray-700">
                <div className="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-red-300">AD</span>
                </div>
                <span className="text-sm font-medium text-gray-300 hidden md:block">{user?.email}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* ═══ MOBILE SIDEBAR ═══ */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
              <aside className="fixed inset-y-0 left-0 w-72 bg-gray-800 shadow-xl z-50 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <span className="text-lg font-bold text-white">Admin Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-700">
                    <XMarkIcon className="w-5 h-5 text-gray-300" />
                  </button>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                      <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive ? 'bg-red-900/50 text-red-300' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-red-400' : 'text-gray-500'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-gray-700">
                  <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-900/30 rounded-xl">
                    <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* ═══ LEFT SIDEBAR — Desktop ═══ */}
          <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 fixed inset-y-0 top-16 bg-gray-800 border-r border-gray-700 z-20">
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link key={item.name} href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-red-900/50 text-red-300' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-red-400' : 'text-gray-500'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 space-y-2 border-t border-gray-700">
              {/* Platform links */}
              <a
                href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:3000'}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-400 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
              >
                Back to Platform
              </a>
              <button onClick={logout}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/30 rounded-xl transition-colors"
              >
                <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>

          {/* ═══ MAIN CONTENT ═══ */}
          <main className="flex-1 lg:ml-64 pb-6">
            <div className="p-3 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

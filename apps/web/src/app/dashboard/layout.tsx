'use client';

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
  PlusCircleIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  ChevronRightIcon,
  StarIcon,
  ShieldCheckIcon,
  ArrowUpRightIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/auth';

const studentNav = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'My Proposals', href: '/dashboard/proposals', icon: DocumentTextIcon },
  { name: 'Active Contracts', href: '/dashboard/contracts', icon: BriefcaseIcon },
  { name: 'My Portfolio', href: '/dashboard/showcase', icon: RectangleStackIcon },
  { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Earnings', href: '/dashboard/earnings', icon: CurrencyDollarIcon },
  { name: 'My Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

const employerNav = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'My Gigs', href: '/dashboard/gigs', icon: BriefcaseIcon },
  { name: 'Proposals', href: '/dashboard/proposals', icon: DocumentTextIcon },
  { name: 'Contracts', href: '/dashboard/contracts', icon: BriefcaseIcon },
  { name: 'Showcase', href: '/showcase', icon: RectangleStackIcon },
  { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon },
  { name: 'Find Talent', href: '/dashboard/talent', icon: MagnifyingGlassIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const role: 'student' | 'employer' = user?.role === 'EMPLOYER' ? 'employer' : 'student';
  const nav = role === 'student' ? studentNav : employerNav;

  const displayName = user?.studentProfile
    ? `${(user.studentProfile as Record<string, string>).firstName || ''} ${(user.studentProfile as Record<string, string>).lastName || ''}`.trim()
    : user?.employerProfile
      ? (user.employerProfile as Record<string, string>).contactPerson || (user.employerProfile as Record<string, string>).businessName || ''
      : user?.email?.split('@')[0] || '';

  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* ═══ LEFT SIDEBAR — Navigation ═══ */}
        <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 fixed inset-y-0 top-16 bg-white border-r border-gray-100 z-20">
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {nav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-primary-600' : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick action */}
          <div className="p-4 border-t border-gray-100">
            {role === 'student' ? (
              <Link
                href="/gigs"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-xl hover:bg-primary-100 transition-colors"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Find Gigs
              </Link>
            ) : (
              <Link
                href="/post-gig"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                <PlusCircleIcon className="w-4 h-4" />
                Post a Gig
              </Link>
            )}
          </div>
        </aside>

        {/* Mobile bottom navigation — app-like */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-gray-200 safe-bottom animate-slide-up-nav">
          <div className="flex items-stretch justify-around px-1 py-1">
            {nav.slice(0, 5).map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-400 active:text-gray-600'
                  }`}
                >
                  <item.icon className={`w-6 h-6 ${isActive ? 'text-primary-600' : ''}`} />
                  <span className={`text-[10px] font-semibold ${isActive ? 'text-primary-600' : ''}`}>{item.name.replace('Active ', '').replace('My ', '')}</span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-primary-600 mt-0.5" />
                  )}
                </Link>
              );
            })}
            {/* More button for remaining nav items */}
            <Link
              href="/dashboard/settings"
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-colors ${
                pathname.startsWith('/dashboard/settings') || pathname.startsWith('/dashboard/profile') || pathname.startsWith('/dashboard/earnings')
                  ? 'text-primary-600'
                  : 'text-gray-400 active:text-gray-600'
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
            {/* Center content */}
            <div className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8">
              {children}
            </div>

            {/* ═══ RIGHT SIDEBAR — Profile & Connects ═══ */}
            <aside className="hidden xl:block w-80 shrink-0 border-l border-gray-100 bg-white sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="p-5 space-y-5">
                {/* Profile Card */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-lg font-bold text-primary-600">{initials}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mt-3">{displayName || 'User'}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {role === 'student' ? (user?.studentProfile as Record<string, string>)?.headline || 'Student' : 'Employer'}
                  </p>
                  {/* Profile completeness */}
                  <div className="mt-3 px-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-500">Profile completeness</span>
                      <span className="font-semibold text-primary-600">75%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: '75%' }} />
                    </div>
                    <Link href="/dashboard/profile" className="text-xs text-primary-600 font-medium mt-2 inline-block hover:underline">
                      Complete your profile →
                    </Link>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Connects */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Connects</h4>
                    <Link href="/pricing" className="text-xs text-primary-600 font-medium hover:underline">
                      Get more
                    </Link>
                  </div>
                  <div className="bg-primary-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <BoltIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary-700">18</p>
                        <p className="text-xs text-primary-500">Available connects</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-primary-100 grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900">5</p>
                        <p className="text-[10px] text-gray-400">Used this month</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">10</p>
                        <p className="text-[10px] text-gray-400">Free monthly</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Quick Stats */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Stats</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total earned</span>
                      <span className="text-sm font-bold text-gray-900">GH₵2,450</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Jobs completed</span>
                      <span className="text-sm font-bold text-gray-900">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success rate</span>
                      <span className="text-sm font-bold text-green-600">94%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg. rating</span>
                      <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                        <StarIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        4.9
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Verification Status */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Verification</h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Email verified</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Student ID verified</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <ShieldCheckIcon className="w-4 h-4 text-gray-300" />
                      <span className="text-sm text-gray-400">Phone not verified</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Membership */}
                <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white">
                  <p className="text-xs font-medium text-gray-300">Current Plan</p>
                  <p className="text-lg font-bold mt-0.5">Free Plan</p>
                  <p className="text-xs text-gray-400 mt-1">
                    10 free connects per month
                  </p>
                  <Link
                    href="/pricing"
                    className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-white/10 hover:bg-white/20 text-sm font-medium rounded-lg transition-colors"
                  >
                    Upgrade Plan
                    <ArrowUpRightIcon className="w-3.5 h-3.5" />
                  </Link>
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

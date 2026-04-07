'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  BoltIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ClockIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  StarIcon,
  LockClosedIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

/* ─── Platform cards data ─── */
const platforms = [
  {
    id: 'android-apk',
    name: 'Android (Direct Download)',
    status: 'available' as const,
    statusLabel: 'Available Now',
    statusColor: 'bg-green-500',
    icon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor">
        <path d="M17.523 2.23a.667.667 0 0 0-.913.243l-1.138 1.974A8.42 8.42 0 0 0 12 3.75a8.42 8.42 0 0 0-3.472.697L7.39 2.473a.667.667 0 1 0-1.156.67l1.08 1.872A8.32 8.32 0 0 0 3.75 12v.75h16.5V12a8.32 8.32 0 0 0-3.564-6.985l1.08-1.872a.667.667 0 0 0-.243-.913ZM8.25 9.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm7.5 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM3.75 14.25v5.25a1.5 1.5 0 0 0 1.5 1.5h1.5v2.25a.75.75 0 0 0 1.5 0V21h3v2.25a.75.75 0 0 0 1.5 0V21h3v2.25a.75.75 0 0 0 1.5 0V21h1.5a1.5 1.5 0 0 0 1.5-1.5v-5.25H3.75Zm-2.25 0a.75.75 0 0 0-.75.75V19a.75.75 0 0 0 1.5 0v-4a.75.75 0 0 0-.75-.75Zm21 0a.75.75 0 0 0-.75.75V19a.75.75 0 0 0 1.5 0v-4a.75.75 0 0 0-.75-.75Z" />
      </svg>
    ),
    description:
      'Get the Intemso app right now on your Android phone. Download the APK directly from our website and install it in under a minute. No app store required.',
    action: (
      <a
        href="/downloads/intemso-v1.0.0.apk"
        className="inline-flex items-center justify-center gap-2.5 w-full bg-green-600 hover:bg-green-700 text-white font-bold text-base px-6 py-3.5 rounded-xl transition-colors shadow-sm"
      >
        <ArrowDownTrayIcon className="w-5 h-5" />
        Download APK (v1.0.0)
      </a>
    ),
    details: 'Version 1.0.0  |  ~25 MB  |  Android 8.0+',
  },
  {
    id: 'google-play',
    name: 'Google Play Store',
    status: 'coming-soon' as const,
    statusLabel: 'Coming Soon',
    statusColor: 'bg-amber-500',
    icon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor">
        <path d="M3.61 1.814A1.82 1.82 0 0 0 3 3.18v17.64a1.82 1.82 0 0 0 .61 1.366L3.68 22.25l9.54-9.54v-.42L3.68 2.75l-.07.064ZM16.56 15.63l-3.34-3.34v-.42l3.34-3.34.074.043 3.96 2.25c1.13.642 1.13 1.694 0 2.336l-3.96 2.25-.074.043v.182ZM3.68 22.25l9.54-9.54 3.34 3.34-12.14 6.9a1.42 1.42 0 0 1-.74.3ZM3.68 1.75l12.14 6.9-3.34 3.34L3.68 2.75l-.07.064.07-.064Z" />
      </svg>
    ),
    description:
      'We are actively working on publishing the Intemso app to the Google Play Store. Once listed, you will be able to download and update the app directly from Play Store with automatic updates.',
    action: (
      <button
        disabled
        className="inline-flex items-center justify-center gap-2.5 w-full bg-gray-100 text-gray-400 font-bold text-base px-6 py-3.5 rounded-xl cursor-not-allowed"
      >
        <ClockIcon className="w-5 h-5" />
        Coming Soon
      </button>
    ),
    details: 'Expected to be available in the coming weeks',
  },
  {
    id: 'ios-huawei',
    name: 'Apple App Store & Huawei AppGallery',
    status: 'coming-soon' as const,
    statusLabel: 'Coming Soon',
    statusColor: 'bg-amber-500',
    icon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83ZM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z" />
      </svg>
    ),
    description:
      'Intemso for iPhone and Huawei devices is in development. Apple requires apps to go through a review process before listing on the App Store, and we are preparing for Huawei AppGallery as well. Stay tuned.',
    action: (
      <button
        disabled
        className="inline-flex items-center justify-center gap-2.5 w-full bg-gray-100 text-gray-400 font-bold text-base px-6 py-3.5 rounded-xl cursor-not-allowed"
      >
        <ClockIcon className="w-5 h-5" />
        In Development
      </button>
    ),
    details: 'iOS and Huawei apps currently under development',
  },
];

/* ─── Features ─── */
const features = [
  {
    icon: BriefcaseIcon,
    title: 'Browse & Apply to Gigs',
    desc: 'Search thousands of flexible gigs posted by employers and apply instantly with Easy Apply using just 1 connect.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Real-Time Messaging',
    desc: 'Chat directly with employers or students. Discuss gig details, send updates, and keep all communication in one place.',
  },
  {
    icon: BellIcon,
    title: 'Instant Notifications',
    desc: 'Never miss an opportunity. Get alerts for new applications, status updates, messages, and payment releases.',
  },
  {
    icon: BoltIcon,
    title: 'Easy Apply with One Tap',
    desc: 'Found a gig you like? Apply in seconds with an optional note. No long proposals, no cover letters.',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Wallet & Earnings',
    desc: 'Track your wallet balance, view payment history, and manage your earnings right from your phone.',
  },
  {
    icon: LockClosedIcon,
    title: 'Secure by Design',
    desc: 'Your login credentials are stored in encrypted device storage. All data is transmitted over HTTPS with token rotation.',
  },
];

/* ─── Install steps ─── */
const installSteps = [
  {
    num: '1',
    title: 'Tap "Download APK"',
    desc: 'Tap the green download button above. Your browser will begin downloading the Intemso APK file.',
  },
  {
    num: '2',
    title: 'Allow Installation',
    desc: 'Android will ask you to allow installing from this source. Go to Settings when prompted and enable "Install unknown apps" for your browser. This is a one-time step.',
  },
  {
    num: '3',
    title: 'Install & Sign In',
    desc: 'Open the downloaded file, tap Install, and launch Intemso. Sign in with your existing account or create a new one.',
  },
];

/* ─── FAQ ─── */
const faqs = [
  {
    q: 'Is the APK safe to install?',
    a: 'Yes. The APK is built from our official source code, signed with our developer certificate, and served securely over HTTPS from intemso.com. We do not distribute the APK through any third-party channels.',
  },
  {
    q: 'Why is the app not on the Google Play Store yet?',
    a: 'Publishing to the Play Store requires going through Google\'s review process. We are actively working on this and expect the app to be listed soon. In the meantime, you can safely download and install the APK directly from here.',
  },
  {
    q: 'When will the iPhone app be available?',
    a: 'We are building the iOS version now. Apple requires all apps to pass their review process before being listed on the App Store. We will update this page as soon as it is available. iPhone users can use intemso.com in their browser in the meantime.',
  },
  {
    q: 'What about Huawei phones?',
    a: 'Huawei phones that support Google Play Services can install the APK directly. For phones using only Huawei Mobile Services, we are working on listing the app in Huawei AppGallery.',
  },
  {
    q: 'What Android version do I need?',
    a: 'Android 8.0 (Oreo) or newer. This covers the vast majority of Android phones in use today.',
  },
  {
    q: 'How do I update the app?',
    a: 'When a new version is released, you will see an update notice in the app. Come back to this page to download the latest version. Installing the new APK over the existing one preserves your data and login.',
  },
  {
    q: 'Do I need a separate account for the app?',
    a: 'No. Use the same email (or Ghana Card number) and password you use on intemso.com. Your gigs, messages, and wallet are all synced.',
  },
  {
    q: 'Can I do everything the website can do?',
    a: 'The mobile app covers the core experience: browsing gigs, applying, messaging, notifications, and managing your profile and wallet. Advanced features like posting gigs (for employers) and the community forum are best used on the full website at intemso.com.',
  },
];

export default function DownloadPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden bg-linear-to-br from-gray-950 via-blue-950 to-blue-900">
        {/* Decorative blurs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-20 w-125 h-125 bg-blue-600/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 right-0 w-150 h-150 bg-indigo-500/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-blue-500/5 rounded-full blur-[80px]" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\'%3E%3Cpath d=\'M0 0h1v40H0zM39 0h1v40h-1zM0 0h40v1H0zM0 39h40v1H0z\'/%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-sm text-green-300 font-medium">Android app is live</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                Get Intemso<br />
                <span className="bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  on your phone
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-blue-100/80 leading-relaxed mb-10 max-w-xl">
                Browse gigs, apply with one tap, message employers, and track your earnings. The full Intemso marketplace, right in your pocket.
              </p>

              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
                <a
                  href="/downloads/intemso-v1.0.0.apk"
                  className="group inline-flex items-center gap-3 bg-white text-gray-900 font-bold text-lg px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-0.5"
                >
                  <span className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <ArrowDownTrayIcon className="w-5 h-5 text-green-700" />
                  </span>
                  <span>
                    <span className="block text-base leading-tight">Download for Android</span>
                    <span className="block text-xs font-medium text-gray-500 mt-0.5">APK v1.0.0  ·  ~25 MB  ·  Android 8.0+</span>
                  </span>
                </a>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-200/70">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircleSolid className="w-4 h-4 text-green-400" />
                  Official build
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircleSolid className="w-4 h-4 text-green-400" />
                  HTTPS secured
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircleSolid className="w-4 h-4 text-green-400" />
                  No registration required to browse
                </span>
              </div>
            </div>

            {/* Right — Phone mockup */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                {/* Glow behind phone */}
                <div className="absolute -inset-8 bg-blue-500/10 rounded-[4rem] blur-2xl" />

                <div className="relative w-75 h-155 bg-gray-900 rounded-[3.5rem] border-[3px] border-gray-700/80 shadow-2xl overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-gray-900 rounded-b-2xl z-10" />

                  {/* Screen */}
                  <div className="h-full bg-white pt-10 px-5 overflow-hidden">
                    {/* App header */}
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="text-base font-bold text-gray-900">Good morning 👋</div>
                        <div className="text-xs text-gray-500 mt-0.5">Find your next gig</div>
                      </div>
                      <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">JM</div>
                    </div>

                    {/* Search bar */}
                    <div className="h-11 bg-gray-100 rounded-xl mb-5 flex items-center px-4 gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                      <div className="text-xs text-gray-400">Search gigs, skills...</div>
                    </div>

                    {/* Category chips */}
                    <div className="flex gap-2 mb-5 overflow-hidden">
                      <div className="px-3 py-1.5 bg-blue-600 rounded-full text-[10px] font-semibold text-white whitespace-nowrap">All</div>
                      <div className="px-3 py-1.5 bg-gray-100 rounded-full text-[10px] font-medium text-gray-600 whitespace-nowrap">Design</div>
                      <div className="px-3 py-1.5 bg-gray-100 rounded-full text-[10px] font-medium text-gray-600 whitespace-nowrap">Dev</div>
                      <div className="px-3 py-1.5 bg-gray-100 rounded-full text-[10px] font-medium text-gray-600 whitespace-nowrap">Writing</div>
                    </div>

                    {/* Gig cards */}
                    {[
                      { title: 'Logo Design for Startup', company: 'TechVentures GH', budget: 'GH₵200', type: 'Fixed', skills: ['Figma', 'Logo'] },
                      { title: 'Social Media Content', company: 'CampusBites', budget: 'GH₵30/hr', type: 'Hourly', skills: ['Canva', 'Copy'] },
                      { title: 'Data Entry Assistant', company: 'AccraPay Ltd', budget: 'GH₵150', type: 'Fixed', skills: ['Excel', 'Fast'] },
                    ].map((gig, i) => (
                      <div key={i} className="mb-3 p-3.5 border border-gray-100 rounded-2xl">
                        <div className="flex justify-between items-start mb-1.5">
                          <div className="text-[11px] text-blue-600 font-medium">{gig.company}</div>
                          <div className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{gig.budget}</div>
                        </div>
                        <div className="text-sm font-bold text-gray-900 mb-1.5 leading-tight">{gig.title}</div>
                        <div className="flex gap-1.5">
                          {gig.skills.map((s) => (
                            <div key={s} className="px-2 py-0.5 bg-gray-50 rounded text-[9px] text-gray-500 font-medium">{s}</div>
                          ))}
                          <div className="px-2 py-0.5 bg-blue-50 rounded text-[9px] text-blue-600 font-medium">{gig.type}</div>
                        </div>
                      </div>
                    ))}

                    {/* Bottom tab bar */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-around items-center px-6 py-3 bg-white border-t border-gray-100">
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-5 h-5 bg-blue-600 rounded-md" />
                        <div className="text-[8px] font-semibold text-blue-600">Home</div>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-5 h-5 bg-gray-200 rounded-md" />
                        <div className="text-[8px] text-gray-400">Search</div>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 relative">
                        <div className="w-5 h-5 bg-gray-200 rounded-md" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                        <div className="text-[8px] text-gray-400">Chat</div>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-5 h-5 bg-gray-200 rounded-md" />
                        <div className="text-[8px] text-gray-400">Alerts</div>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-5 h-5 bg-gray-200 rounded-md" />
                        <div className="text-[8px] text-gray-400">Profile</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ PLATFORM AVAILABILITY ═══════════════ */}
      <section className="py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 mb-5">
              <GlobeAltIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-semibold">Platform Availability</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Available on Android. More platforms coming.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We are rolling out the Intemso mobile app across all major platforms. Here is where things stand today.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className={`relative rounded-2xl border-2 p-6 lg:p-8 transition-shadow ${
                  platform.status === 'available'
                    ? 'bg-white border-green-200 shadow-lg shadow-green-500/5 ring-1 ring-green-100'
                    : 'bg-white border-gray-150 opacity-90'
                }`}
              >
                {/* Status badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`text-blue-600`}>
                    {platform.icon}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full text-white ${platform.statusColor}`}
                  >
                    {platform.status === 'available' && <CheckCircleSolid className="w-3.5 h-3.5" />}
                    {platform.status === 'coming-soon' && <ClockIcon className="w-3.5 h-3.5" />}
                    {platform.statusLabel}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{platform.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {platform.description}
                </p>

                {platform.action}

                <p className="text-xs text-gray-400 text-center mt-3">{platform.details}</p>
              </div>
            ))}
          </div>

          {/* Notify prompt */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Want to know when new platforms launch?{' '}
              <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                Create a free account
              </Link>{' '}
              and we will notify you.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Everything you need, on the go
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The Intemso mobile app gives you the full marketplace experience from your phone.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
              >
                <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <f.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW TO INSTALL ═══════════════ */}
      <section className="py-20 lg:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              How to install the Android app
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps. Takes less than a minute.
            </p>
          </div>

          <div className="space-y-1">
            {installSteps.map((step, i) => (
              <div key={step.num} className="relative flex gap-6">
                {/* Connector line */}
                {i < installSteps.length - 1 && (
                  <div className="absolute left-6 top-14 w-0.5 h-[calc(100%-20px)] bg-blue-100" />
                )}
                <div className="relative z-10 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 shadow-md shadow-blue-600/20">
                  {step.num}
                </div>
                <div className="pb-10">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Security note */}
          <div className="mt-8 bg-white border border-green-200 rounded-2xl p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Safe and secure</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The Intemso APK is built and signed by the Intemso team. Your data is encrypted
                  in transit and your credentials are stored securely using Android&apos;s
                  encrypted storage. The app only requests the permissions it needs: internet access
                  for the marketplace, and camera access for profile photos (optional).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section className="py-20 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-gray-600">
              Everything you need to know about the Intemso mobile app.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl overflow-hidden transition-colors hover:border-gray-300"
              >
                <button
                  className="flex items-center justify-between w-full text-left px-6 py-4 gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 -mt-1">
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ BOTTOM CTA ═══════════════ */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-900 via-blue-800 to-indigo-900 py-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Your next opportunity is one tap away
          </h2>
          <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of students already finding flexible work on Intemso. Download the app and get started today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="/downloads/intemso-v1.0.0.apk"
              className="inline-flex items-center gap-3 bg-white text-gray-900 font-bold text-lg px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-xl hover:-translate-y-0.5"
            >
              <ArrowDownTrayIcon className="w-6 h-6 text-green-600" />
              Download for Android
            </a>
            <Link
              href="/gigs"
              className="inline-flex items-center gap-2 text-white font-semibold text-lg px-8 py-4 rounded-2xl border-2 border-white/20 hover:bg-white/10 transition-colors"
            >
              Browse Gigs Online
            </Link>
          </div>

          <p className="text-blue-300 text-sm">
            New to Intemso?{' '}
            <Link href="/register" className="text-white font-semibold hover:underline">
              Create your free account
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

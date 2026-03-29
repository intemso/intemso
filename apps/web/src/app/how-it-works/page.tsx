import Link from 'next/link';
import { PUBLIC_UNIVERSITIES, TECHNICAL_UNIVERSITIES, PROFESSIONAL_INSTITUTIONS, TOTAL_UNIVERSITIES } from '@intemso/shared';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  DocumentCheckIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CheckIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  LockClosedIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ═══════════════════════════════════════════
          HERO — Full-bleed dark, statement typography
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-[80vh] flex items-center bg-gray-950 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--tw-gradient-stops))] from-primary-600/20 via-transparent to-transparent" />
          <div className="absolute top-0 left-0 w-200 h-200 bg-primary-500/6 rounded-full blur-[150px] -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute top-20 right-24 w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
          <div className="absolute top-48 left-32 w-1.5 h-1.5 bg-primary-300/50 rounded-full animate-pulse" />
          <div className="absolute bottom-32 right-1/3 w-1 h-1 bg-white/20 rounded-full animate-pulse" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-0 w-full">
          <div className="max-w-4xl">
            <p className="text-primary-400 text-sm font-mono tracking-wider mb-8">
              // how it works
            </p>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight">
              Sign up.
              <br />
              Find a gig.
              <br />
              <span className="bg-linear-to-r from-primary-400 via-primary-300 to-blue-400 bg-clip-text text-transparent">
                Get paid.
              </span>
            </h1>

            <p className="mt-10 text-gray-500 text-lg sm:text-xl max-w-xl leading-relaxed">
              A simple, secure process connecting students with employers who need tasks done — no special skills required. No gatekeeping. No waiting.
            </p>

            <div className="mt-12 flex items-center gap-3 text-gray-600 text-xs font-mono">
              <div className="w-px h-8 bg-gray-700" />
              Scroll to see how
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOR STUDENTS — Timeline Steps
          ═══════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">For Students</h2>
              <p className="text-gray-400 mt-1">Start earning while you study. Here&apos;s how to get your first gig.</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="hidden lg:block absolute left-[calc(50%-1px)] top-0 bottom-0 w-0.5 bg-gray-100" />

            {[
              {
                num: '01',
                title: 'Create Your Profile',
                desc: 'Sign up with your university email, verify your student status, and set up your profile. Add what you\'re good at or just say you\'re available for tasks — no portfolio needed. No CV. No links. Under 2 minutes.',
                icon: UserGroupIcon,
                color: 'bg-primary-500',
                details: ['University email verification', 'Set your interests & availability', 'No portfolio or experience required'],
              },
              {
                num: '02',
                title: 'Browse & Apply',
                desc: 'Browse gigs like typing, ushering, app testing, campus errands, and more. Use connects to submit proposals with your bid and a short message. Filter by category, budget, or location.',
                icon: MagnifyingGlassIcon,
                color: 'bg-blue-500',
                details: ['Search by category, budget, location', 'Submit proposals with connects', 'Stand out with a short message'],
              },
              {
                num: '03',
                title: 'Get Hired & Start Working',
                desc: 'Once accepted, work through milestones with secure escrow payment protection. Communicate directly with your employer through our real-time messaging system. Track your progress and submit deliverables.',
                icon: DocumentCheckIcon,
                color: 'bg-purple-500',
                details: ['Milestone-based workflow', 'Real-time messaging with employer', 'Submit work through the platform'],
              },
              {
                num: '04',
                title: 'Get Paid Securely',
                desc: 'Receive payments via Paystack when milestones are approved. Withdraw to your Ghanaian bank account or mobile money. Build your reputation with reviews and unlock more opportunities.',
                icon: CurrencyDollarIcon,
                color: 'bg-success-500',
                details: ['Escrow-protected payments via Paystack', 'Withdraw to bank or mobile money', 'Earn reviews & build reputation'],
              },
            ].map((step, idx) => (
              <div key={step.num} className={`relative grid lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-20 last:mb-0 ${idx % 2 === 1 ? 'lg:direction-rtl' : ''}`}>
                {/* Timeline dot */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-gray-100 items-center justify-center z-10">
                  <span className="text-xs font-black text-gray-400">{step.num}</span>
                </div>

                {/* Content side */}
                <div className={`${idx % 2 === 1 ? 'lg:col-start-2 lg:text-left lg:direction-ltr' : ''}`}>
                  <div className="flex items-start gap-4 lg:hidden mb-4">
                    <span className="text-5xl font-black text-primary-100 leading-none">{step.num}</span>
                  </div>
                  <span className="hidden lg:inline-block text-7xl font-black text-gray-100 leading-none mb-4">{step.num}</span>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                </div>

                {/* Card side */}
                <div className={`${idx % 2 === 1 ? 'lg:col-start-1 lg:row-start-1 lg:direction-ltr' : ''}`}>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center mb-5`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-3">
                      {step.details.map((detail) => (
                        <div key={detail} className="flex items-start gap-3">
                          <CheckIcon className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600 font-medium">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/auth/register?role=student"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all duration-300 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-500/30"
            >
              Get Started as Student
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOR EMPLOYERS — Clean numbered cards
          ═══════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <BriefcaseIcon className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-black">For Employers</h2>
              <p className="text-gray-500 mt-1">Need something done? Post it and let students handle the rest.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                title: 'Post Your Gig',
                desc: 'Describe your task, set a budget and timeline, and specify what you need. Ushers for an event? 100 pages typed? An app tested? Just post it.',
              },
              {
                num: '02',
                title: 'Review Proposals',
                desc: 'Get proposals from motivated students. Browse profiles, ratings, and availability to find the right person for your task.',
              },
              {
                num: '03',
                title: 'Collaborate & Track',
                desc: 'Work through milestones. Use real-time messaging, file sharing, and progress tracking. Stay in control of every step.',
              },
              {
                num: '04',
                title: 'Approve & Pay',
                desc: 'Review submitted work, approve milestones, and release escrow payments securely via Paystack. Leave a review to help the community.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/5 hover:border-amber-500/20 transition-all duration-300"
              >
                <span className="text-5xl font-black text-amber-500/20 group-hover:text-amber-500/30 transition-colors leading-none block mb-6">
                  {step.num}
                </span>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/post-gig"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-bold text-gray-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20"
            >
              Post Your First Gig
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TRUST & SAFETY — Bento grid
          ═══════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-4">// trust & safety</p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              Every transaction is protected.
              <br />
              <span className="text-gray-300">Every student is verified.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Hero trust card */}
            <div className="lg:col-span-2 bg-linear-to-br from-primary-600 to-primary-800 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <ShieldCheckIcon className="w-10 h-10 text-white/80 mb-6" />
                <h3 className="text-2xl font-black mb-3">Escrow Payment Protection</h3>
                <p className="text-primary-100 leading-relaxed max-w-lg">
                  Every payment is held securely in escrow via Paystack until the work is approved. Students always get paid for completed work. Employers only pay for quality results.
                </p>
              </div>
            </div>

            {/* Verified students */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <AcademicCapIcon className="w-10 h-10 text-primary-600 mb-6" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verified Students</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Every student is verified through their university email. You know exactly who you&apos;re working with.
              </p>
            </div>

            {/* Real-time messaging */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <ChatBubbleLeftRightIcon className="w-10 h-10 text-purple-600 mb-6" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Real-Time Messaging</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Communicate directly within the platform. Share files, discuss requirements, and stay aligned throughout the gig.
              </p>
            </div>

            {/* Dispute resolution */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <LockClosedIcon className="w-10 h-10 text-amber-600 mb-6" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Dispute Resolution</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Something not right? Our dispute resolution team is always available to mediate and ensure fair outcomes for both sides.
              </p>
            </div>

            {/* Reviews */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <SparklesIcon className="w-10 h-10 text-blue-600 mb-6" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Rating & Reviews</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Both students and employers leave reviews after every gig. Build trust through transparency and a real track record.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/trust"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Learn more about Trust & Safety
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          UNIVERSITY MARQUEE
          ═══════════════════════════════════════════ */}
      <section className="py-10 border-y border-gray-100 overflow-hidden">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
          Open to students from {TOTAL_UNIVERSITIES}+ Ghanaian universities
        </p>

        {(() => {
          const marqueeUnis = [...PUBLIC_UNIVERSITIES, ...TECHNICAL_UNIVERSITIES, ...PROFESSIONAL_INSTITUTIONS];
          const remaining = TOTAL_UNIVERSITIES - marqueeUnis.length;
          return (
            <>
              <div className="relative w-full">
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />

                <div className="flex animate-marquee hover:[animation-play-state:paused]">
                  {[0, 1].map((copy) => (
                    <div key={copy} className="flex shrink-0 items-center gap-10 px-5" aria-hidden={copy === 1}>
                      {marqueeUnis.map((uni) => (
                        <span
                          key={`${copy}-${uni.abbreviation}`}
                          className="text-sm font-bold text-gray-300 whitespace-nowrap tracking-wider hover:text-gray-500 transition-colors"
                        >
                          {uni.abbreviation}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs font-medium text-primary-400 mt-4">
                +{remaining} more private &amp; chartered universities
              </p>
            </>
          );
        })()}
      </section>

      {/* ═══════════════════════════════════════════
          CTA — Full-impact dark
          ═══════════════════════════════════════════ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gray-950 rounded-4xl overflow-hidden">
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative px-8 py-20 sm:px-16 sm:py-28 text-center">
              <p className="text-primary-400 text-sm font-mono mb-6">// ready?</p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] max-w-3xl mx-auto">
                Stop waiting.
                <br />
                <span className="bg-linear-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                  Start earning.
                </span>
              </h2>
              <p className="mt-6 text-gray-500 text-lg max-w-md mx-auto">
                Create your free account in under 2 minutes. Your first gig could be today.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register?role=student"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all duration-200 shadow-lg shadow-primary-600/25"
                >
                  <AcademicCapIcon className="w-5 h-5" />
                  Sign Up as Student
                </Link>
                <Link
                  href="/auth/register?role=employer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white border border-white/15 hover:bg-white/5 rounded-xl transition-all duration-200"
                >
                  <BriefcaseIcon className="w-5 h-5" />
                  Hire Students
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

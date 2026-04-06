import Link from 'next/link';
import Image from 'next/image';
import { GIG_CATEGORIES, PUBLIC_UNIVERSITIES, TECHNICAL_UNIVERSITIES, PROFESSIONAL_INSTITUTIONS, TOTAL_UNIVERSITIES } from '@intemso/shared';
import {
  AcademicCapIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  UserGroupIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentCheckIcon,
  SparklesIcon,
  StarIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import {
  RevealOnScroll,
  AnimatedCounter,
  RotatingText,
  TabSwitcher,
} from '@/components/landing/Animations';

/* ═══════════════════════════════════════════════════
   HERO — Immersive image + text blend
   ═══════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative min-h-svh flex flex-col overflow-hidden">
      {/* Full-bleed hero image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-main.png"
          alt="Ghanaian university students earning through campus gigs — ushering events, typing assignments, cleaning, and working on laptops"
          fill
          priority
          className="object-cover object-top"
        />
        {/* Cinematic overlay — stronger on mobile for text readability */}
        <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-950/80 sm:via-gray-950/70 to-gray-950/30 sm:to-gray-950/20" />
        {/* Subtle brand tint */}
        <div className="absolute inset-0 bg-primary-950/20 mix-blend-multiply" />
      </div>

      {/* Content — anchored to bottom over the gradient */}
      <div className="relative mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-20 lg:pb-24 pt-48 sm:pt-72">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-full text-[11px] sm:text-xs font-bold text-white/90 mb-5 sm:mb-7 animate-fade-in">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-400" />
              </span>
              Ghana&apos;s #1 student gig marketplace
            </div>

            <h1 className="text-[2.5rem] sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.92] tracking-tight animate-slide-up">
              Earn money.
              <br />
              <RotatingText
                words={['Between lectures.', 'After class.', 'On campus.', 'On your terms.']}
                className="text-primary-300"
              />
            </h1>

            <p className="mt-5 sm:mt-7 text-white/60 text-base sm:text-xl max-w-xl leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
              Simple, flexible gigs designed for university students.
              Ushering, typing, app testing, campus errands —{' '}
              <span className="text-white font-semibold">no skills needed.</span>
            </p>

            <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link
                href="/auth/register"
                className="group inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-primary-600 hover:bg-primary-500 active:bg-primary-700 rounded-2xl sm:rounded-xl transition-all duration-200 shadow-lg shadow-primary-600/30"
              >
                Get Started — It&apos;s Free
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/gigs"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/20 active:bg-white/25 rounded-2xl sm:rounded-xl transition-all duration-200"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Browse Gigs
              </Link>
            </div>

            {/* Trust signals — horizontal scroll on mobile */}
            <div className="mt-8 sm:mt-10 flex items-center gap-x-4 sm:gap-x-6 gap-y-2 text-[13px] sm:text-sm text-white/40 animate-fade-in overflow-x-auto pb-2 -mx-1 px-1" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <ShieldCheckIcon className="w-4 h-4 text-primary-400 shrink-0" />
                <span>Secure escrow</span>
              </div>
              <div className="w-px h-3 bg-white/15 shrink-0" />
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <BoltIcon className="w-4 h-4 text-primary-400 shrink-0" />
                <span>2-minute signup</span>
              </div>
              <div className="w-px h-3 bg-white/15 shrink-0" />
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <CurrencyDollarIcon className="w-4 h-4 text-primary-400 shrink-0" />
                <span>No upfront costs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   STATS BAR — Clean, minimal
   ═══════════════════════════════════════════════════ */
function StatsBar() {
  const stats = [
    { value: 50, suffix: '+', label: 'Universities', icon: AcademicCapIcon },
    { value: 15, suffix: '+', label: 'Gig Categories', icon: BriefcaseIcon },
    { value: 100, suffix: '%', label: 'Secure Payments', icon: ShieldCheckIcon },
    { value: 2, suffix: ' min', label: 'To Sign Up', icon: BoltIcon },
  ];

  return (
    <section className="py-6 md:py-10 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2 sm:gap-6 md:gap-4 lg:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-xl sm:rounded-xl bg-primary-50 mb-1.5 sm:mb-2 lg:mb-3">
                <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 text-primary-600" />
              </div>
              <div className="text-xl sm:text-2xl md:text-2xl lg:text-4xl font-black text-gray-900">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-gray-400 text-[10px] sm:text-xs md:text-xs lg:text-sm font-medium mt-0.5 sm:mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   UNIVERSITY MARQUEE — Light, brand-colored
   ═══════════════════════════════════════════════════ */
function UniversityMarquee() {
  const marqueeUnis = [...PUBLIC_UNIVERSITIES, ...TECHNICAL_UNIVERSITIES, ...PROFESSIONAL_INSTITUTIONS];
  const remaining = TOTAL_UNIVERSITIES - marqueeUnis.length;

  return (
    <section className="py-8 md:py-8 lg:py-12 bg-gray-50 overflow-hidden border-y border-gray-100">
      <p className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-400 mb-4 sm:mb-6 lg:mb-8 px-4">
        Open to students from {TOTAL_UNIVERSITIES}+ Ghanaian universities
      </p>

      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-linear-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-linear-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-2.5 sm:gap-6 px-1.5 sm:px-3" aria-hidden={copy === 1}>
              {marqueeUnis.map((uni) => (
                <span
                  key={`${copy}-${uni.abbreviation}`}
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-2.5 md:py-1 lg:px-4 lg:py-2 bg-white rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-xs lg:text-sm font-bold text-gray-400 whitespace-nowrap border border-gray-100 hover:border-primary-200 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 cursor-default shadow-sm"
                >
                  {uni.abbreviation}
                </span>
              ))}
            </div>
          ))}
        </div>

      <p className="text-center text-[11px] sm:text-xs font-medium text-primary-500 mt-4 sm:mt-6">
        +{remaining} more private &amp; chartered universities
      </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   HOW IT WORKS — Tabbed, clean, with connected steps
   ═══════════════════════════════════════════════════ */
function HowItWorks() {
  const studentSteps = [
    { num: '01', title: 'Create Your Profile', desc: 'Sign up with your university email, set your interests, and you\'re in. No portfolio. No CV. Under 2 minutes.', icon: UserGroupIcon, color: 'from-primary-500 to-blue-500' },
    { num: '02', title: 'Browse & Apply', desc: 'Browse gigs like typing, ushering, app testing, campus errands. Apply with one click and an optional short note.', icon: MagnifyingGlassIcon, color: 'from-violet-500 to-purple-500' },
    { num: '03', title: 'Get Hired & Work', desc: 'Once accepted, work through milestones with secure escrow protection. Communicate directly with your employer.', icon: DocumentCheckIcon, color: 'from-amber-500 to-orange-500' },
    { num: '04', title: 'Get Paid Securely', desc: 'Receive payments via Paystack. Withdraw to your bank account or mobile money. Build your reputation with reviews.', icon: CurrencyDollarIcon, color: 'from-green-500 to-emerald-500' },
  ];

  const employerSteps = [
    { num: '01', title: 'Post a Gig', desc: 'Describe what you need — ushers, typists, testers, errand runners. Set your budget and timeline.', icon: BriefcaseIcon, color: 'from-amber-500 to-orange-500' },
    { num: '02', title: 'Review Applications', desc: 'Get applications from eager students. Review profiles, ratings, and pick the best match for your task.', icon: UserGroupIcon, color: 'from-primary-500 to-blue-500' },
    { num: '03', title: 'Track & Approve', desc: 'Monitor progress through milestones. Approve deliverables and release escrow payments securely.', icon: ShieldCheckIcon, color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-primary-50 rounded-full text-xs font-bold text-primary-600 mb-3 sm:mb-4 md:mb-6">
              <RocketLaunchIcon className="w-3.5 h-3.5" />
              HOW IT WORKS
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
              From signup to payday
            </h2>
            <p className="mt-3 sm:mt-4 text-gray-400 text-sm sm:text-base md:text-lg max-w-lg mx-auto">
              Whether you&apos;re earning or hiring — it&apos;s incredibly simple.
            </p>
          </div>
        </RevealOnScroll>

        <TabSwitcher
          tabs={[
            { label: 'For Students', icon: <AcademicCapIcon className="w-4 h-4" /> },
            { label: 'For Employers', icon: <BriefcaseIcon className="w-4 h-4" /> },
          ]}
        >
          {/* Students tab */}
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-3 lg:gap-6">
              {studentSteps.map((step, i) => (
                <RevealOnScroll key={step.num} delay={i * 100}>
                  <div className="group relative h-full">
                    <div className="relative bg-white rounded-2xl md:rounded-xl lg:rounded-3xl p-4 sm:p-5 md:p-4 lg:p-7 border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 h-full overflow-hidden">
                      {/* Gradient bg on hover */}
                      <div className={`absolute inset-0 bg-linear-to-br ${step.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 rounded-2xl md:rounded-xl lg:rounded-3xl`} />
                      <div className="relative">
                        <span className="text-2xl sm:text-4xl md:text-3xl lg:text-5xl font-black bg-linear-to-b from-gray-100 to-white bg-clip-text text-transparent leading-none block">
                          {step.num}
                        </span>
                        <div className={`mt-1.5 sm:mt-2 md:mt-1.5 lg:mt-3 w-9 h-9 sm:w-10 sm:h-10 md:w-8 md:h-8 lg:w-12 lg:h-12 rounded-xl md:rounded-lg lg:rounded-2xl bg-linear-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300`}>
                          <step.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <h4 className="text-sm sm:text-base md:text-sm lg:text-lg font-bold text-gray-900 mt-2 sm:mt-3 md:mt-2 lg:mt-5 mb-1 md:mb-1 lg:mb-2">{step.title}</h4>
                        <p className="text-xs sm:text-sm md:text-xs lg:text-sm text-gray-500 leading-relaxed line-clamp-3 sm:line-clamp-none">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll delay={400}>
              <div className="mt-6 sm:mt-8 lg:mt-10 text-center">
                <Link
                  href="/auth/register?role=student"
                  className="group inline-flex items-center gap-2 w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-linear-to-r from-primary-600 to-violet-600 hover:from-primary-500 hover:to-violet-500 active:from-primary-700 active:to-violet-700 rounded-2xl transition-all duration-300 shadow-lg shadow-primary-500/20 hover:shadow-xl hover:-translate-y-0.5 justify-center"
                >
                  Get Started as Student
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>

          {/* Employers tab */}
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-3 lg:gap-6 max-w-4xl mx-auto">
              {employerSteps.map((step, i) => (
                <RevealOnScroll key={step.num} delay={i * 100}>
                  <div className="group relative h-full">
                    <div className="relative bg-white rounded-2xl md:rounded-xl lg:rounded-3xl p-4 sm:p-5 md:p-4 lg:p-7 border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 h-full overflow-hidden">
                      <div className={`absolute inset-0 bg-linear-to-br ${step.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 rounded-2xl md:rounded-xl lg:rounded-3xl`} />
                      <div className="relative">
                        <span className="text-2xl sm:text-4xl md:text-3xl lg:text-5xl font-black bg-linear-to-b from-gray-100 to-white bg-clip-text text-transparent leading-none block">
                          {step.num}
                        </span>
                        <div className={`mt-1.5 sm:mt-2 md:mt-1.5 lg:mt-3 w-9 h-9 sm:w-10 sm:h-10 md:w-8 md:h-8 lg:w-12 lg:h-12 rounded-xl md:rounded-lg lg:rounded-2xl bg-linear-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300`}>
                          <step.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <h4 className="text-sm sm:text-base md:text-sm lg:text-lg font-bold text-gray-900 mt-2 sm:mt-3 md:mt-2 lg:mt-5 mb-1 md:mb-1 lg:mb-2">{step.title}</h4>
                        <p className="text-xs sm:text-sm md:text-xs lg:text-sm text-gray-500 leading-relaxed line-clamp-3 sm:line-clamp-none">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>

            <RevealOnScroll delay={300}>
              <div className="mt-6 sm:mt-10 text-center">
                <Link
                  href="/post-gig"
                  className="group inline-flex items-center gap-2 w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:from-amber-600 active:to-orange-600 rounded-2xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:-translate-y-0.5 justify-center"
                >
                  Post a Gig
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </TabSwitcher>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   CATEGORIES — Vibrant cards with color on hover
   ═══════════════════════════════════════════════════ */
function Categories() {
  const categories = GIG_CATEGORIES.filter((c) => c.slug !== 'other').slice(0, 12);

  const colors = [
    'hover:bg-primary-50 hover:border-primary-200',
    'hover:bg-violet-50 hover:border-violet-200',
    'hover:bg-amber-50 hover:border-amber-200',
    'hover:bg-green-50 hover:border-green-200',
    'hover:bg-rose-50 hover:border-rose-200',
    'hover:bg-blue-50 hover:border-blue-200',
    'hover:bg-purple-50 hover:border-purple-200',
    'hover:bg-orange-50 hover:border-orange-200',
    'hover:bg-teal-50 hover:border-teal-200',
    'hover:bg-pink-50 hover:border-pink-200',
    'hover:bg-cyan-50 hover:border-cyan-200',
    'hover:bg-indigo-50 hover:border-indigo-200',
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 sm:mb-10 md:mb-10 lg:mb-14 gap-3 sm:gap-4 md:gap-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-violet-50 rounded-full text-xs font-bold text-violet-600 mb-3 sm:mb-4">
                <SparklesIcon className="w-3.5 h-3.5" />
                EXPLORE
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900">
                What kind of gigs?
              </h2>
              <p className="mt-2 sm:mt-3 text-gray-400 text-sm sm:text-base max-w-md">
                From ushering events to testing apps — there&apos;s always something you can do.
              </p>
            </div>
            <Link
              href="/gigs"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-sm font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 active:bg-primary-200 rounded-xl transition-colors self-start md:self-auto"
            >
              View all
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-2.5 lg:gap-4">
          {categories.map((cat, i) => (
            <RevealOnScroll key={cat.slug} delay={i * 50} direction="scale">
              <Link
                href={`/gigs?category=${encodeURIComponent(cat.name)}`}
                className={`group relative bg-white rounded-xl sm:rounded-xl md:rounded-lg lg:rounded-2xl p-3 sm:p-4 md:p-3 lg:p-6 border-2 border-gray-100 ${colors[i % colors.length]} transition-all duration-300 block hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]`}
              >
                <span className="text-2xl sm:text-3xl md:text-2xl lg:text-4xl inline-block mb-1 sm:mb-2 md:mb-1.5 lg:mb-4 group-hover:scale-125 group-hover:-rotate-6 transition-all duration-300">
                  {cat.emoji}
                </span>
                <p className="text-[11px] sm:text-sm md:text-xs lg:text-sm font-bold text-gray-900 leading-tight">
                  {cat.name}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 md:mt-0.5 lg:mt-1 hidden sm:block">{cat.subTypes.length} gig types</p>
                <ArrowRightIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-3 md:h-3 lg:w-4 lg:h-4 text-gray-300 group-hover:text-primary-500 absolute top-3 right-3 sm:top-4 sm:right-4 md:top-3 md:right-3 lg:top-6 lg:right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5" />
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   WHY INTEMSO — Colorful bento grid on bright bg
   ═══════════════════════════════════════════════════ */
function WhyIntemso() {
  const features = [
    {
      title: 'Zero Requirements',
      description: 'No portfolio, no CV, no years of experience. If you\'re a university student in Ghana, you\'re in.',
      icon: SparklesIcon,
      gradient: 'from-primary-500 to-violet-600',
      big: true,
    },
    {
      title: 'Escrow Payments',
      description: 'Every cedi is protected by Paystack escrow. Your money is safe until the work is done.',
      icon: ShieldCheckIcon,
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Flexible Hours',
      description: 'Hourly or fixed-price. Pick gigs that fit around your lectures and exams.',
      icon: ClockIcon,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Real-Time Chat',
      description: 'Message employers directly. Discuss requirements, share updates, get clarity — all inside the platform.',
      icon: ChatBubbleLeftRightIcon,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Build Your Rep',
      description: 'Complete gigs, earn reviews, unlock badges. The more you do, the more opportunities find you.',
      icon: StarIcon,
      gradient: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-8 sm:mb-10 md:mb-10 lg:mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-green-50 rounded-full text-xs font-bold text-green-600 mb-3 sm:mb-4">
              <BoltIcon className="w-3.5 h-3.5" />
              WHY INTEMSO
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
              Built different.
              <br />
              <span className="bg-linear-to-r from-primary-500 to-violet-500 bg-clip-text text-transparent">Built for students.</span>
            </h2>
          </div>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-3 lg:gap-5">
          {/* Hero card — spans 2 cols, 2 rows */}
          <RevealOnScroll className="md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2" direction="left">
            <div className={`relative overflow-hidden rounded-2xl md:rounded-xl lg:rounded-3xl p-5 sm:p-6 md:p-6 lg:p-10 bg-linear-to-br ${features[0].gradient} h-full min-h-44 sm:min-h-52 md:min-h-56 lg:min-h-80 group`}>
              <div className="absolute top-0 right-0 w-36 sm:w-48 md:w-40 lg:w-64 h-36 sm:h-48 md:h-40 lg:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-24 sm:w-32 md:w-28 lg:w-48 h-24 sm:h-32 md:h-28 lg:h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
              <div className="relative h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-10 md:h-10 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-lg lg:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 md:mb-3 lg:mb-6 group-hover:rotate-6 transition-transform duration-300">
                    <SparklesIcon className="w-5 h-5 md:w-5 md:h-5 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-lg lg:text-3xl font-black text-white leading-snug max-w-sm">
                    {features[0].title}
                  </h3>
                </div>
                <p className="text-white/80 text-xs sm:text-sm md:text-xs lg:text-base leading-relaxed max-w-sm mt-3 sm:mt-4 md:mt-3 lg:mt-6">
                  {features[0].description}
                </p>
              </div>
            </div>
          </RevealOnScroll>

          {/* Remaining cards */}
          {features.slice(1).map((f, i) => (
            <RevealOnScroll key={f.title} delay={i * 100} direction="right">
              <div className="bg-gray-50 rounded-2xl md:rounded-xl lg:rounded-3xl p-4 sm:p-5 md:p-4 lg:p-7 border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-500 group h-full hover:-translate-y-1 active:scale-[0.98]">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 md:w-8 md:h-8 lg:w-12 lg:h-12 rounded-xl md:rounded-lg lg:rounded-2xl bg-linear-to-br ${f.gradient} flex items-center justify-center mb-2.5 sm:mb-3 md:mb-2.5 lg:mb-5 shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                  <f.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 lg:w-6 lg:h-6 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm md:text-xs lg:text-base font-bold text-gray-900 mb-1 md:mb-1 lg:mb-2">{f.title}</h3>
                <p className="text-[11px] sm:text-xs md:text-xs lg:text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   THE DIFFERENCE — Old Way vs Intemso Way
   ═══════════════════════════════════════════════════ */
function TheDifference() {
  const oldWay = [
    'Need a portfolio to get started',
    'Competing with professionals worldwide',
    'Payment delays or informal cash handoffs',
    'Minimum payout thresholds you can\'t reach',
    'Built for freelancers, not students',
  ];

  const intemsoWay = [
    'Zero requirements — just be a uni student',
    'Compete only with students at your level',
    'Escrow payments via Paystack — always secure',
    'Withdraw any amount to bank or mobile money',
    'Built from day one for the campus experience',
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="text-center mb-8 sm:mb-10 md:mb-10 lg:mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-amber-50 rounded-full text-xs font-bold text-amber-600 mb-3 md:mb-4">
              <BoltIcon className="w-3.5 h-3.5" />
              THE DIFFERENCE
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900">
              Why students choose Intemso
            </h2>
            <p className="mt-2 sm:mt-3 text-gray-400 text-base sm:text-lg">Over everything else.</p>
          </div>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-3 lg:gap-6 max-w-5xl mx-auto">
          {/* Old Way */}
          <RevealOnScroll direction="left">
            <div className="bg-white rounded-2xl md:rounded-xl lg:rounded-3xl p-5 sm:p-6 md:p-5 lg:p-10 border-2 border-gray-100 h-full">
              <div className="inline-flex items-center gap-2 px-3 py-1 md:px-3 md:py-1 lg:px-3.5 lg:py-1.5 bg-red-50 text-red-500 rounded-full text-xs font-bold mb-4 sm:mb-5 md:mb-4 lg:mb-8">
                <XMarkIcon className="w-3.5 h-3.5" />
                The Old Way
              </div>
              <div className="space-y-2.5 sm:space-y-3 md:space-y-2.5 lg:space-y-5">
                {oldWay.map((item, i) => (
                  <RevealOnScroll key={item} delay={i * 80}>
                    <div className="flex items-start gap-2 sm:gap-2.5 md:gap-2 lg:gap-3">
                      <div className="w-5 h-5 md:w-4 md:h-4 lg:w-6 lg:h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                        <XMarkIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-2.5 md:h-2.5 lg:w-3.5 lg:h-3.5 text-red-500" />
                      </div>
                      <span className="text-gray-500 text-xs sm:text-sm md:text-xs lg:text-sm">{item}</span>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          {/* Intemso Way */}
          <RevealOnScroll direction="right">
            <div className="bg-linear-to-br from-primary-50 to-violet-50 rounded-2xl md:rounded-xl lg:rounded-3xl p-5 sm:p-6 md:p-5 lg:p-10 border-2 border-primary-100 ring-2 ring-primary-100/50 h-full relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 sm:w-32 md:w-28 lg:w-40 h-24 sm:h-32 md:h-28 lg:h-40 bg-primary-100/30 rounded-full blur-2xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 md:px-3 md:py-1 lg:px-3.5 lg:py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-bold mb-4 sm:mb-5 md:mb-4 lg:mb-8">
                  <CheckIcon className="w-3.5 h-3.5" />
                  The Intemso Way
                </div>
                <div className="space-y-2.5 sm:space-y-3 md:space-y-2.5 lg:space-y-5">
                  {intemsoWay.map((item, i) => (
                    <RevealOnScroll key={item} delay={i * 80 + 200}>
                      <div className="flex items-start gap-2 sm:gap-2.5 md:gap-2 lg:gap-3">
                        <div className="w-5 h-5 md:w-4 md:h-4 lg:w-6 lg:h-6 rounded-full bg-linear-to-br from-primary-500 to-violet-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-primary-500/20">
                          <CheckIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-2.5 md:h-2.5 lg:w-3.5 lg:h-3.5 text-white" />
                        </div>
                        <span className="text-gray-700 text-xs sm:text-sm md:text-xs lg:text-sm font-medium">{item}</span>
                      </div>
                    </RevealOnScroll>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   FEATURED SHOWCASE
   ═══════════════════════════════════════════════════ */
function FeaturedShowcase() {
  const projects = [
    { title: 'E-commerce Dashboard', skill: 'React', color: 'from-blue-400 to-indigo-600' },
    { title: 'FinTech Mobile App', skill: 'Flutter', color: 'from-purple-400 to-pink-600' },
    { title: 'Brand Identity Design', skill: 'Illustrator', color: 'from-amber-400 to-orange-600' },
    { title: 'Agricultural Data Platform', skill: 'Python', color: 'from-green-400 to-emerald-600' },
    { title: 'University Event Portal', skill: 'Next.js', color: 'from-primary-400 to-blue-600' },
    { title: 'Documentary Film Edit', skill: 'Premiere Pro', color: 'from-rose-400 to-red-600' },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 sm:mb-10 md:mb-10 lg:mb-14 gap-3 sm:gap-4 md:gap-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-rose-50 rounded-full text-xs font-bold text-rose-600 mb-3 md:mb-4">
                <StarIcon className="w-3.5 h-3.5" />
                TALENT SHOWCASE
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900">
                Work that speaks for itself
              </h2>
              <p className="mt-2 sm:mt-3 text-gray-400 text-sm sm:text-base max-w-md">
                Discover incredible projects by Ghana&apos;s top student talent — from mobile apps to brand identities.
              </p>
            </div>
            <Link
              href="/showcase"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-sm font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 active:bg-primary-200 rounded-xl transition-colors self-start md:self-auto"
            >
              Browse all projects
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 md:gap-3 lg:gap-6">
          {projects.map((item, i) => (
            <RevealOnScroll key={item.title} delay={i * 80} direction="scale">
              <Link
                href="/showcase"
                className="group relative rounded-2xl md:rounded-xl lg:rounded-3xl overflow-hidden aspect-4/3 md:aspect-5/4 lg:aspect-4/3 bg-gray-100 block"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${item.color} opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500`} />
                <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-5 md:p-4 lg:p-7">
                  <span className="px-2 py-0.5 sm:px-2.5 md:px-2 lg:px-3 lg:py-1 bg-white/20 text-white text-[10px] sm:text-xs font-bold rounded-full w-fit mb-1 sm:mb-2 md:mb-1.5 lg:mb-3 backdrop-blur-sm border border-white/20">
                    {item.skill}
                  </span>
                  <h3 className="text-white text-sm sm:text-lg md:text-sm lg:text-xl font-bold group-hover:translate-x-1 transition-transform leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-white/60 text-[10px] sm:text-xs md:text-xs lg:text-sm mt-0.5 md:mt-0.5 lg:mt-1 hidden sm:block">by Student Creator</p>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
              </Link>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={400}>
          <div className="text-center mt-8 sm:mt-12">
            <Link
              href="/showcase"
              className="inline-flex items-center gap-2 w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 active:bg-gray-950 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 justify-center"
            >
              Explore the Talent Showcase
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   CTA — Vibrant gradient, full-impact
   ═══════════════════════════════════════════════════ */
function CtaSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="relative bg-gray-900 rounded-2xl md:rounded-xl lg:rounded-3xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-40 sm:w-80 h-40 sm:h-80 bg-violet-500/10 rounded-full translate-y-1/2 -translate-x-1/4" />
            </div>

            <div className="relative px-5 py-10 sm:px-12 sm:py-16 md:px-10 md:py-14 lg:px-16 lg:py-24 text-center">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-[1.05] max-w-3xl mx-auto">
                Your next gig is
                <br />
                waiting for you.
              </h2>
              <p className="mt-4 sm:mt-6 text-white/70 text-base sm:text-lg max-w-md mx-auto">
                Create your free account in under 2 minutes. No CV. No portfolio. Just you and the work.
              </p>

              <div className="mt-7 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link
                  href="/auth/register?role=student"
                  className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-sm font-bold text-gray-900 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-all duration-200 shadow-lg"
                >
                  <AcademicCapIcon className="w-5 h-5" />
                  Sign Up as Student
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/auth/register?role=employer"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-sm font-bold text-white border border-white/20 hover:bg-white/10 active:bg-white/20 rounded-xl transition-all duration-200"
                >
                  <BriefcaseIcon className="w-5 h-5" />
                  Hire Students
                </Link>
              </div>

              {/* Bottom trust row */}
              <div className="mt-10 sm:mt-14 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-3 text-xs sm:text-sm text-white/50">
                {[
                  'No upfront costs',
                  'Secure escrow',
                  'Bank & mobile money',
                  'Verified employers',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-white/60" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */
export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <UniversityMarquee />
      <HowItWorks />
      <Categories />
      <WhyIntemso />
      <TheDifference />
      <FeaturedShowcase />
      <CtaSection />
    </>
  );
}

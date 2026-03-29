import Link from 'next/link';
import Image from 'next/image';
import { PUBLIC_UNIVERSITIES, TECHNICAL_UNIVERSITIES, PROFESSIONAL_INSTITUTIONS, TOTAL_UNIVERSITIES } from '@intemso/shared';
import {
  AcademicCapIcon,
  ShieldCheckIcon,
  BoltIcon,
  CurrencyDollarIcon,
  HeartIcon,
  HandRaisedIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ═══════════════════════════════════════════
          HERO — Full-bleed campus image + text blend
          ═══════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-end overflow-hidden">
        {/* Full-bleed background image */}
        <div className="absolute inset-0">
          <Image
            src="/about-im.png"
            alt="Ghanaian university students on campus — walking, carrying event equipment, working on laptops"
            fill
            priority
            className="object-cover"
          />
          {/* Cinematic gradient — dark at bottom-left for text, transparent at top-right to show image */}
          <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-950/70 to-gray-950/10" />
          <div className="absolute inset-0 bg-linear-to-r from-gray-950/60 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24 pt-60 sm:pt-72 w-full">
          <div className="max-w-3xl">
            <p className="text-primary-400 text-sm font-mono tracking-wider mb-8">
              // about intemso
            </p>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight">
              We don&apos;t do
              <br />
              <span className="bg-linear-to-r from-primary-400 via-primary-300 to-blue-400 bg-clip-text text-transparent">
                job boards.
              </span>
              <br />
              <span className="text-white/40">We do campus</span>
              <br />
              hustle.
            </h1>

            <p className="mt-10 text-white/50 text-lg sm:text-xl max-w-xl leading-relaxed">
              A gig marketplace built from scratch for university students in Ghana.
              No CV. No portfolio. No gatekeeping. Just work and get paid.
            </p>

            <div className="mt-16 flex items-center gap-3 text-white/30 text-xs font-mono">
              <div className="w-px h-8 bg-white/20" />
              Scroll to explore
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MANIFESTO — Big bold statement
          ═══════════════════════════════════════════ */}
      <section className="py-24 lg:py-36 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-8">Our belief</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.15] max-w-4xl">
            Every university student deserves a way to earn money —{' '}
            <span className="text-gray-300">
              not after graduation, not after building a portfolio, not after proving themselves.
            </span>{' '}
            Right now. Today.
          </h2>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          STORY — Magazine-style asymmetric
          ═══════════════════════════════════════════ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-3 lg:sticky lg:top-32 lg:self-start">
              <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 uppercase tracking-wider">
                Origin Story
              </div>
              <div className="mt-4 w-12 h-0.5 bg-primary-500" />
            </div>

            <div className="lg:col-span-9 space-y-8">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
                It started with a question nobody was answering:
                why is there no Uber for campus tasks?
              </p>
              <div className="grid sm:grid-cols-2 gap-8 text-gray-600 leading-relaxed">
                <div className="space-y-4">
                  <p>
                    Students across Ghana want to earn. But the gig economy wasn&apos;t built for them.
                    Upwork needs a portfolio. Fiverr needs specialized skills. Traditional jobs need
                    you to commit 9-to-5. None of that works when you have lectures at 7am.
                  </p>
                  <p>
                    Meanwhile, simple tasks pile up — someone needs ushers for a wedding, another needs
                    50 pages typed, a startup needs people to test their app. These aren&apos;t complex jobs.
                    They&apos;re tasks any student can do.
                  </p>
                </div>
                <div className="space-y-4">
                  <p>
                    So we built the bridge. A platform where the only requirement is being a university
                    student in Ghana. No interview, no portfolio review, no &ldquo;3 years of experience&rdquo;
                    nonsense.
                  </p>
                  <p className="text-gray-900 font-semibold text-lg border-l-2 border-primary-500 pl-4">
                    Sign up. Find a gig. Show up. Get paid. That&apos;s it.
                    That&apos;s Intemso.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          OLD WAY vs INTEMSO WAY
          ═══════════════════════════════════════════ */}
      <section className="py-24 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-primary-400 text-sm font-mono tracking-wider mb-4">// the difference</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-16">
            The old way vs. the Intemso way
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Old Way */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-white/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-bold mb-8">
                The Old Way
              </div>
              <div className="space-y-5">
                {[
                  'Need a portfolio to get started',
                  'Competing with professionals worldwide',
                  'Payment delays or informal cash handoffs',
                  'Minimum payout thresholds you can\'t reach',
                  'Built for freelancers, not students',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <XMarkIcon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-gray-400 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Intemso Way */}
            <div className="bg-primary-600/10 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-primary-500/20 ring-1 ring-primary-400/10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-bold mb-8">
                The Intemso Way
              </div>
              <div className="space-y-5">
                {[
                  'Zero requirements — just be a uni student',
                  'Compete only with students at your level',
                  'Escrow payments via Paystack — always secure',
                  'Withdraw any amount to bank or mobile money',
                  'Built from day one for the campus experience',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          VALUES — Bento grid
          ═══════════════════════════════════════════ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">What drives us</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 max-w-md">
                Six values. Zero compromise.
              </h2>
            </div>
            <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
              These aren&apos;t corporate buzzwords on a wall. They&apos;re the rules we build by — every feature, every decision.
            </p>
          </div>

          {/* Bento layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1 — Large hero card */}
            <div className="lg:row-span-2 bg-linear-to-br from-primary-600 to-primary-700 text-white rounded-3xl p-8 lg:p-10 flex flex-col justify-between min-h-80">
              <HeartIcon className="w-8 h-8 text-primary-200" />
              <div>
                <h3 className="text-xl font-bold mb-2">Student-First. Always.</h3>
                <p className="text-primary-100 text-sm leading-relaxed">
                  Every decision starts with one question: does this help the student?
                  From zero upfront costs to flexible schedules to the way we handle disputes —
                  students come first.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-green-50 rounded-3xl p-8 group hover:bg-green-100/80 transition-colors">
              <ShieldCheckIcon className="w-7 h-7 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold text-gray-900 mb-1">Trust &amp; Safety</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Verified uni emails. Escrow-protected payments. Dispute resolution that actually works.
                We built trust into every layer.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-amber-50 rounded-3xl p-8 group hover:bg-amber-100/80 transition-colors">
              <CurrencyDollarIcon className="w-7 h-7 text-amber-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold text-gray-900 mb-1">Fair for Everyone</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Transparent sliding fees that go down the more you work.
                No hidden charges. Students keep more as they grow.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-purple-50 rounded-3xl p-8 group hover:bg-purple-100/80 transition-colors">
              <HandRaisedIcon className="w-7 h-7 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-base font-bold text-gray-900 mb-1">No Gatekeeping</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                No portfolios, no years of experience, no fancy CVs.
                If you&apos;re a university student in Ghana ready to work — you&apos;re in.
              </p>
            </div>

            {/* Card 5 — Wide dark card */}
            <div className="lg:col-span-2 bg-gray-950 text-white rounded-3xl p-8 lg:p-10 flex flex-col sm:flex-row gap-6 items-start">
              <BoltIcon className="w-8 h-8 text-primary-400 shrink-0" />
              <div>
                <h3 className="text-lg font-bold mb-2">Move Fast. Stay Reliable.</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                  We ship features quickly and fix problems faster. Speed matters when a student needs
                  rent money this week and an employer needs ushers by Saturday. We don&apos;t
                  move slow and we don&apos;t leave things broken.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — Timeline style
          ═══════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">The process</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Stupid simple. By design.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Students */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                  <AcademicCapIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">For Students</h3>
              </div>

              <div className="relative pl-8 border-l-2 border-primary-200 space-y-10">
                {[
                  { num: '01', title: 'Sign up free', desc: 'University email + basic info. That\'s it. Under 2 minutes. No CV, no links, no uploads.' },
                  { num: '02', title: 'Find gigs that fit', desc: 'Browse by category, location, budget. Ushering this weekend? Typing tonight? App testing tomorrow? Pick what works.' },
                  { num: '03', title: 'Apply & get hired', desc: 'Send a quick proposal. Employers review profiles and hire — often within hours, sometimes minutes.' },
                  { num: '04', title: 'Work. Get paid.', desc: 'Do the task. Submit through the platform. Money hits your wallet. Withdraw to any Ghanaian bank or MoMo.' },
                ].map((step) => (
                  <div key={step.num} className="relative">
                    <div className="absolute -left-5.25 top-1 w-3 h-3 bg-primary-500 rounded-full ring-4 ring-white" />
                    <p className="text-primary-500 text-xs font-mono font-bold mb-1">{step.num}</p>
                    <h4 className="text-base font-bold text-gray-900 mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Employers */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
                  <BriefcaseIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">For Employers</h3>
              </div>

              <div className="relative pl-8 border-l-2 border-amber-200 space-y-10">
                {[
                  { num: '01', title: 'Post your gig', desc: 'Describe the task, set a budget, pick a category. Takes about 2 minutes. One-time gig or ongoing — your call.' },
                  { num: '02', title: 'Review students', desc: 'See profiles, past ratings, completed gigs. No guesswork. Pick the person who fits best.' },
                  { num: '03', title: 'Escrow protects you', desc: 'Payment is held securely by Paystack. You don\'t release funds until the work is done and approved.' },
                  { num: '04', title: 'Rate & rehire', desc: 'Leave a review. Save top performers. Next time you need help, your go-to students are one tap away.' },
                ].map((step) => (
                  <div key={step.num} className="relative">
                    <div className="absolute -left-5.25 top-1 w-3 h-3 bg-amber-500 rounded-full ring-4 ring-gray-50" />
                    <p className="text-amber-600 text-xs font-mono font-bold mb-1">{step.num}</p>
                    <h4 className="text-base font-bold text-gray-900 mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WHO IT'S FOR — Editorial cards
          ═══════════════════════════════════════════ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">Who it&apos;s for</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-16 max-w-lg">
            If this sounds like you, you&apos;re in the right place.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                emoji: '🎓',
                label: 'The Freshman',
                text: 'Just got to campus, need pocket money, zero work experience. Perfect — most gigs don\'t need any.',
                bg: 'bg-primary-50 hover:bg-primary-100/60',
              },
              {
                emoji: '⏰',
                label: 'The Busy One',
                text: 'Packed schedule, only free on weekends or evenings. Take gigs when it works, ghost when exams hit.',
                bg: 'bg-amber-50 hover:bg-amber-100/60',
              },
              {
                emoji: '📈',
                label: 'The Builder',
                text: 'Using gigs to stack reviews, build a reputation, and grow into higher-paying opportunities.',
                bg: 'bg-green-50 hover:bg-green-100/60',
              },
              {
                emoji: '🏢',
                label: 'The Employer',
                text: 'Event planner, small business, campus org, or startup that needs reliable student help fast.',
                bg: 'bg-purple-50 hover:bg-purple-100/60',
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`${card.bg} rounded-3xl p-7 transition-colors group cursor-default`}
              >
                <span className="text-4xl block mb-5 group-hover:scale-110 transition-transform">{card.emoji}</span>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{card.label}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          UNIVERSITIES
          ═══════════════════════════════════════════ */}
      <section className="py-16 border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">
            Open to students from {TOTAL_UNIVERSITIES}+ Ghanaian universities
          </p>
        </div>

        {/* Marquee slider — public traditional + technical + professional */}
        {(() => {
          const marqueeUnis = [...PUBLIC_UNIVERSITIES, ...TECHNICAL_UNIVERSITIES, ...PROFESSIONAL_INSTITUTIONS];
          const remaining = TOTAL_UNIVERSITIES - marqueeUnis.length;
          return (
            <>
              <div className="relative w-full">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-white to-transparent z-10 pointer-events-none" />

                <div className="flex animate-marquee hover:[animation-play-state:paused]">
                  {[0, 1].map((copy) => (
                    <div key={copy} className="flex shrink-0 items-center gap-10 px-5" aria-hidden={copy === 1}>
                      {marqueeUnis.map((uni) => (
                        <span
                          key={`${copy}-${uni.abbreviation}`}
                          className="text-sm font-bold text-gray-300 whitespace-nowrap hover:text-gray-500 transition-colors"
                        >
                          {uni.abbreviation}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-center text-sm font-bold text-primary-400 mt-6">
                +{remaining} more private &amp; chartered universities
              </p>
            </>
          );
        })()}
      </section>

      {/* ═══════════════════════════════════════════
          CTA — Full-impact
          ═══════════════════════════════════════════ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gray-950 rounded-4xl overflow-hidden">
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative px-8 py-20 sm:px-16 sm:py-28 text-center">
              <p className="text-primary-400 text-sm font-mono mb-6">// let&apos;s go</p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] max-w-3xl mx-auto">
                Your next gig is
                <br />
                <span className="bg-linear-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                  waiting for you.
                </span>
              </h2>
              <p className="mt-6 text-gray-500 text-lg max-w-md mx-auto">
                Free to join. No credit card. Takes under 2 minutes.
                What are you waiting for?
              </p>

              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/register?role=student"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <AcademicCapIcon className="w-4 h-4" />
                  Join as Student
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <Link
                  href="/auth/register?role=employer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white border-2 border-white/15 hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  <BriefcaseIcon className="w-4 h-4" />
                  Post a Gig
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

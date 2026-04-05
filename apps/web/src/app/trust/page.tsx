'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  CreditCardIcon,
  ScaleIcon,
  FingerPrintIcon,
  ClockIcon,
  DocumentCheckIcon,
  BuildingLibraryIcon,
  BellAlertIcon,
  ChatBubbleLeftRightIcon,
  FlagIcon,
  NoSymbolIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  BanknotesIcon,
  GlobeAltIcon,
  ServerIcon,
  KeyIcon,
  HandRaisedIcon,
  StarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  ShieldCheckIcon as ShieldCheckSolid,
  LockClosedIcon as LockClosedSolid,
  CheckCircleIcon as CheckCircleSolid,
} from '@heroicons/react/24/solid';

/* ─── Animated Counter Hook ─── */
function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [started, setStarted] = useState(false);

  if (typeof window !== 'undefined' && ref && !started) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
          const startTime = performance.now();
          const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref);
  }

  return { count, ref: setRef };
}

/* ─── FAQ Accordion Item ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-primary-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-base font-semibold text-gray-900 pr-4">{q}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-125' : 'max-h-0'}`}
      >
        <p className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ─── Escrow Step Component ─── */
function EscrowStep({
  step,
  title,
  desc,
  icon: Icon,
  isLast,
}: {
  step: number;
  title: string;
  desc: string;
  icon: React.ElementType;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-primary-200">
          {step}
        </div>
        {!isLast && <div className="w-0.5 h-full bg-primary-200 mt-2" />}
      </div>
      <div className={`pb-8 ${isLast ? '' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-5 h-5 text-primary-600" />
          <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ─── Protection Card ─── */
function ProtectionCard({
  icon: Icon,
  title,
  items,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  items: string[];
  accent: string;
}) {
  const accents: Record<string, { bg: string; icon: string; border: string; badge: string }> = {
    blue: { bg: 'bg-primary-50', icon: 'text-primary-600', border: 'border-primary-100', badge: 'bg-primary-100 text-primary-700' },
    green: { bg: 'bg-success-50', icon: 'text-success-600', border: 'border-success-100', badge: 'bg-success-100 text-success-700' },
    amber: { bg: 'bg-warning-50', icon: 'text-warning-600', border: 'border-warning-100', badge: 'bg-warning-100 text-warning-700' },
    red: { bg: 'bg-error-50', icon: 'text-error-600', border: 'border-error-100', badge: 'bg-error-100 text-error-700' },
  };
  const c = accents[accent] || accents.blue;

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-6 hover:shadow-card transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-11 h-11 rounded-xl ${c.badge} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${c.icon}`} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <CheckCircleSolid className={`w-5 h-5 ${c.icon} mt-0.5 shrink-0`} />
            <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Trust Stats ─── */
function TrustStat({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
        {count}{suffix}
      </div>
      <div className="text-primary-200 text-sm font-medium">{label}</div>
    </div>
  );
}

export default function TrustPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'students' | 'employers'>('all');

  const protections = [
    {
      icon: FingerPrintIcon,
      title: 'Identity Verification',
      accent: 'blue',
      audience: 'all',
      items: [
        'University email verification required for all students — 18+ public email providers blocked',
        'Ghana Card (GHA-XXXXXXXXX-X) accepted as alternative identity proof',
        'Enrollment verification through National Accreditation Board recognized institutions',
        'Employer payment and identity verification before posting gigs',
        'Talent badges (Rising Talent, Top Rated, Top Rated Plus) earned through verified performance',
      ],
    },
    {
      icon: LockClosedIcon,
      title: 'Secure Escrow System',
      accent: 'green',
      audience: 'all',
      items: [
        'All milestone payments held securely until work is approved by employer',
        'Funds visible to both parties but only releasable upon approval',
        '14-day automatic release window protects students from unresponsive employers',
        'Maximum 2 revision rounds per milestone to prevent endless loops',
        'Paystack-backed payment processing — Bank of Ghana licensed',
      ],
    },
    {
      icon: ScaleIcon,
      title: 'Fair Dispute Resolution',
      accent: 'amber',
      audience: 'all',
      items: [
        '3-stage resolution: Direct (7 days) → Intemso Mediation (14 days) → Ghana ADR',
        'Dispute acknowledged within 2 business days by our support team',
        '5 outcome options: full release, full refund, split payment, revision required, mutual cancellation',
        'All decisions binding on escrowed funds with transparent reasoning',
        'Ghana Alternative Dispute Resolution Act 2010 (Act 798) compliance for escalation',
      ],
    },
    {
      icon: ExclamationTriangleIcon,
      title: 'Fraud Prevention',
      accent: 'red',
      audience: 'all',
      items: [
        'Login rate limiting: 5 failed attempts trigger 15-minute account lockout',
        'Webhook signature verification using HMAC SHA-512 with timing-safe comparison',
        'Double-verification of all payment transactions through Paystack API',
        'Idempotent webhook processing prevents duplicate charges or payouts',
        'Comprehensive audit logging of all admin and financial operations with IP tracking',
      ],
    },
    {
      icon: KeyIcon,
      title: 'Account Security',
      accent: 'blue',
      audience: 'students',
      items: [
        'Bcrypt password hashing with 12 rounds of salting — industry-leading strength',
        'Access tokens expire every 15 minutes with automatic refresh',
        'Token rotation and reuse detection with instant blacklisting',
        'SHA-256 hashed token comparison prevents timing attacks',
        'Suspended accounts immediately blocked from all platform access',
      ],
    },
    {
      icon: CreditCardIcon,
      title: 'Payment Protection',
      accent: 'green',
      audience: 'employers',
      items: [
        'Credit card numbers never stored — Paystack handles all card data (PCI compliant)',
        'Multiple payment methods: Visa/Mastercard, MTN MoMo, Vodafone Cash, AirtelTigo, Bank Transfer',
        'Dynamic fee tiers reward loyalty: 15% → 10% → 5% as relationship grows',
        'Automated weekly billing for hourly contracts with saved payment authorization',
        'Full transaction history with detailed audit trail for every GH₵ spent',
      ],
    },
    {
      icon: BanknotesIcon,
      title: 'Earnings Protection',
      accent: 'green',
      audience: 'students',
      items: [
        'Guaranteed payment for all approved milestones — no employer can withhold',
        'Two payout models: direct instant transfer or wallet accumulation',
        'Auto-withdraw option for automatic payouts when earnings reach threshold',
        'Daily withdrawal limits protect against unauthorized access',
        'Failed transfers automatically re-credited to your wallet',
      ],
    },
    {
      icon: FlagIcon,
      title: 'Content Moderation',
      accent: 'amber',
      audience: 'all',
      items: [
        'Report system covers users, gigs, reviews, community posts, and comments',
        'Every report tracked with unique status: pending → reviewed → action taken or dismissed',
        'Admin moderation queue with full context for informed decisions',
        'Community posts support pinning, editing (24-hour window), and removal',
        'Zero tolerance for harassment, discrimination, and threatening behavior',
      ],
    },
    {
      icon: NoSymbolIcon,
      title: 'User Blocking & Safety',
      accent: 'red',
      audience: 'all',
      items: [
        'Block any user to prevent messaging, profile viewing, and interaction',
        'Blocked users automatically filtered from your community feed',
        'Profile standards enforced: real name, genuine photo, accurate credentials',
        'Review integrity: first-hand experience only, no compensation for reviews',
        'Anti-circumvention: no sharing external contact info to bypass platform protections',
      ],
    },
  ];

  const filteredProtections =
    activeTab === 'all'
      ? protections
      : protections.filter((p) => p.audience === activeTab || p.audience === 'all');

  const escrowSteps = [
    { icon: DocumentCheckIcon, title: 'Employer Creates Milestones', desc: 'Project is broken into clear milestones with defined deliverables, deadlines, and payment amounts before work begins.' },
    { icon: CreditCardIcon, title: 'Funds Deposited to Escrow', desc: 'Employer funds each milestone via Paystack (card, mobile money, or bank transfer). Money is securely held — not in anyone\'s account.' },
    { icon: ArrowPathIcon, title: 'Student Completes & Submits', desc: 'Student works on the milestone and submits deliverables. Up to 2 revision rounds allowed if adjustments are needed.' },
    { icon: EyeIcon, title: 'Employer Reviews Work', desc: 'Employer has 14 days to review and approve. If no action is taken, funds automatically release to protect the student.' },
    { icon: CheckBadgeIcon, title: 'Payment Released', desc: 'Upon approval, the platform fee is deducted and earnings are instantly available in the student\'s wallet for withdrawal.' },
    { icon: ShieldCheckIcon, title: 'Dispute Protection Active', desc: 'If any issues arise, either party can open a dispute. Funds remain in escrow until the 3-stage resolution process concludes.' },
  ];

  const faqs = [
    { q: 'How does Intemso verify student identity?', a: 'Every student must register with a verified university email address from an institution recognized by Ghana\'s National Accreditation Board. We block 18+ public email providers (Gmail, Outlook, Yahoo, etc.) to prevent fake accounts. Students can also verify with their Ghana Card (GHA-XXXXXXXXX-X format). We reserve the right to request additional enrollment documentation at any time.' },
    { q: 'What happens if an employer doesn\'t approve my work?', a: 'You\'re protected by our 14-day automatic release policy. If an employer doesn\'t respond within 14 days of your submission, funds are automatically released to your wallet. Employers can request a maximum of 2 revision rounds per milestone — they cannot create endless revision loops. If there\'s a genuine dispute, our 3-stage resolution process ensures fair outcomes.' },
    { q: 'Is my payment information safe?', a: 'Absolutely. We never store your credit card numbers. All payment processing is handled by Paystack, which is licensed by the Bank of Ghana and fully PCI DSS compliant. Webhook communications are verified using HMAC SHA-512 signatures with timing-safe comparison. Every transaction is double-verified through Paystack\'s API to prevent fraud.' },
    { q: 'How does the dispute resolution process work?', a: 'We use a 3-stage process. Stage 1: Direct resolution between parties via platform messaging (7 days). Stage 2: Intemso mediation — our team acknowledges within 2 business days, the other party has 5 days to respond, and we decide within 14 calendar days. Stage 3: If still unsatisfied, escalate to Ghana\'s Alternative Dispute Resolution under Act 798. Possible outcomes include full payment release, full refund, split payment, revision required, or mutual cancellation.' },
    { q: 'What is your zero-tolerance policy?', a: 'We have zero tolerance for harassment (threatening messages, sustained unwanted contact, doxxing, sexually suggestive content), discrimination (based on race, ethnicity, religion, gender, sexual orientation, age, disability, or university), and fraud (fake accounts, fabricated credentials, review manipulation). Violations result in immediate account suspension and potential permanent ban.' },
    { q: 'How is my personal data protected?', a: 'We comply fully with Ghana\'s Data Protection Act 2012 (Act 843) under oversight of the Data Protection Commission. Your data is encrypted in transit (TLS) and at rest, passwords are bcrypt-hashed with 12 rounds, and we employ role-based access controls, firewalls, and intrusion detection. We never sell your data to third parties. You have full rights to access, rectify, erase, and port your data.' },
    { q: 'What protections exist for hourly contracts?', a: 'Hourly contracts are billed automatically every Monday. Employers must have a saved payment authorization on file. The same escrow protections apply — funds are held securely until work is verified. Our fee tiers (15% → 10% → 5%) reward long-term working relationships, and all time entries are tracked transparently for both parties.' },
    { q: 'Can I block someone who is bothering me?', a: 'Yes. You can block any user instantly. Blocked users cannot message you, view your profile, or interact with you in any way. They are automatically filtered from your community feed and comment sections. If the behavior constitutes harassment, please also file a report — our moderation team reviews all reports and takes appropriate action.' },
    { q: 'What happens to escrowed funds during a dispute?', a: 'Funds remain safely held in escrow throughout the entire dispute resolution process. No money moves until a resolution is reached. The admin can decide to release funds fully to the student, refund fully to the employer, split payment with a custom percentage (1–99%), require a final revision, or facilitate a mutual cancellation with no reputation penalty.' },
    { q: 'How do talent badges work?', a: 'Badges are earned through verified performance. Rising Talent requires 1 completed gig, a Job Success Score of 100+, and identity verification. Top Rated requires 10 completed gigs, 90+ JSS, 12+ active weeks, and GH₵50,000+ lifetime earnings. Top Rated Plus is invitation-only for students with GH₵200,000+ lifetime earnings. Badges cannot be purchased — they reflect genuine track records.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Hero ─── */}
      <section className="relative bg-linear-to-br from-primary-700 via-primary-800 to-primary-900 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 border border-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 border border-white/5 rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
              <ShieldCheckSolid className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-primary-100">Your safety is our foundation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Trust & Safety at{' '}
              <span className="bg-linear-to-r from-primary-200 to-white bg-clip-text text-transparent">
                Intemso
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-primary-200 max-w-3xl mx-auto mb-12 leading-relaxed">
              Every gig, every payment, every interaction — protected by multiple layers of security.
              We&apos;ve built trust into every corner of the platform so you can focus on what matters: great work.
            </p>

            {/* Trust Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <TrustStat value={6} label="Security Layers" suffix="+" />
              <TrustStat value={14} label="Day Auto-Release" />
              <TrustStat value={3} label="Dispute Stages" />
              <TrustStat value={12} label="Bcrypt Rounds" />
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ─── Trust Pillars ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Built on Five Pillars of Trust
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From the moment you sign up to the day you get paid, every step is designed to keep you safe.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { icon: FingerPrintIcon, title: 'Verified Users', desc: 'University email & Ghana Card identity verification for every account', color: 'from-primary-500 to-primary-700' },
            { icon: LockClosedSolid, title: 'Secure Escrow', desc: 'Funds held safely until work is approved — guaranteed payment for quality work', color: 'from-green-500 to-green-700' },
            { icon: ScaleIcon, title: 'Fair Disputes', desc: '3-stage resolution backed by Ghana\'s Alternative Dispute Resolution Act', color: 'from-amber-500 to-amber-700' },
            { icon: ServerIcon, title: 'Data Security', desc: 'Ghana DPA 2012 compliant with encrypted storage and secure SDLC', color: 'from-indigo-500 to-indigo-700' },
            { icon: HandRaisedIcon, title: 'Zero Tolerance', desc: 'Immediate action against harassment, discrimination, and fraud', color: 'from-red-500 to-red-700' },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className="group relative rounded-2xl bg-white border border-gray-100 p-6 text-center hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${pillar.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <pillar.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{pillar.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How Escrow Works ─── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-success-100 text-success-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <LockClosedSolid className="w-4 h-4" />
                Payment Protection
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                How Escrow Protects Every Payment
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our escrow system ensures students always get paid for approved work and employers only
                pay for work they&apos;re satisfied with. No exceptions.
              </p>

              {/* Key guarantees */}
              <div className="space-y-4">
                {[
                  { label: 'For Students', items: ['Guaranteed payment for approved milestones', '14-day auto-release if employer is unresponsive', 'Max 2 revision rounds — no endless loops', 'Failed transfers automatically re-credited'] },
                  { label: 'For Employers', items: ['Review work before releasing payment', 'Full refund available through dispute resolution', 'Credit card data never stored on our servers', 'Transparent fee breakdown on every transaction'] },
                ].map((group) => (
                  <div key={group.label} className="bg-white rounded-xl border border-gray-200 p-5">
                    <h4 className="font-semibold text-gray-900 mb-3">{group.label}</h4>
                    <ul className="space-y-2">
                      {group.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircleSolid className="w-5 h-5 text-success-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Escrow Flow Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-card">
              <h3 className="text-xl font-bold text-gray-900 mb-6">The Escrow Flow</h3>
              <div>
                {escrowSteps.map((step, i) => (
                  <EscrowStep
                    key={i}
                    step={i + 1}
                    title={step.title}
                    desc={step.desc}
                    icon={step.icon}
                    isLast={i === escrowSteps.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Protection Grid ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Protection
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Every aspect of the platform is designed with security in mind. Filter by what matters to you.
          </p>

          {/* Filter tabs */}
          <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
            {[
              { key: 'all' as const, label: 'All Protections', count: protections.length },
              { key: 'students' as const, label: 'For Students', count: protections.filter((p) => p.audience === 'students' || p.audience === 'all').length },
              { key: 'employers' as const, label: 'For Employers', count: protections.filter((p) => p.audience === 'employers' || p.audience === 'all').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-primary-400' : 'text-gray-400'}`}>
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProtections.map((p) => (
            <ProtectionCard key={p.title} icon={p.icon} title={p.title} items={p.items} accent={p.accent} />
          ))}
        </div>
      </section>

      {/* ─── Dispute Resolution Process ─── */}
      <section className="bg-linear-to-br from-amber-50 to-orange-50 border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <ScaleIcon className="w-4 h-4" />
              Dispute Resolution
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Three Stages. Always Fair.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              If something goes wrong, our structured resolution process ensures both parties are heard and treated fairly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                stage: '1',
                title: 'Direct Resolution',
                timeline: '7 Days',
                icon: ChatBubbleLeftRightIcon,
                desc: 'Both parties communicate directly through platform messaging to resolve the issue in good faith.',
                details: ['Platform messaging required', 'Good faith effort expected', 'Document all communications', 'Most issues resolved here'],
              },
              {
                stage: '2',
                title: 'Intemso Mediation',
                timeline: '14 Days',
                icon: BuildingLibraryIcon,
                desc: 'Our support team steps in to mediate. We review evidence, hear both sides, and make a binding decision on escrowed funds.',
                details: ['Acknowledged within 2 business days', '5-day response window for other party', 'Evidence review & assessment', '5 possible outcomes including split payment'],
              },
              {
                stage: '3',
                title: 'Ghana ADR',
                timeline: 'As Needed',
                icon: GlobeAltIcon,
                desc: 'If either party is unsatisfied with our decision, they can escalate to formal mediation or arbitration under Ghana law.',
                details: ['Alternative Dispute Resolution Act 2010', 'Qualified mediator or arbitrator', 'Proceedings in Accra, Ghana', 'Legally binding outcome'],
              },
            ].map((stage) => (
              <div key={stage.stage} className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm hover:shadow-card transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-amber-400 to-orange-400" />
                <div className="flex items-center gap-3 mb-4 mt-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                    {stage.stage}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{stage.title}</h3>
                    <span className="text-xs text-amber-600 font-medium">{stage.timeline}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{stage.desc}</p>
                <ul className="space-y-2">
                  {stage.details.map((d, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-xs text-gray-500">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Dispute outcomes */}
          <div className="mt-10 bg-white rounded-2xl border border-amber-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Possible Dispute Outcomes</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { icon: BanknotesIcon, label: 'Full Release', desc: 'Student receives full payment', color: 'text-green-600 bg-green-50' },
                { icon: ArrowPathIcon, label: 'Full Refund', desc: 'Employer fully refunded', color: 'text-blue-600 bg-blue-50' },
                { icon: ScaleIcon, label: 'Split Payment', desc: 'Custom 1–99% split', color: 'text-amber-600 bg-amber-50' },
                { icon: DocumentCheckIcon, label: 'Revision Required', desc: 'Final revision within 14 days', color: 'text-purple-600 bg-purple-50' },
                { icon: HandRaisedIcon, label: 'Mutual Cancel', desc: 'No reputation penalty', color: 'text-gray-600 bg-gray-50' },
              ].map((outcome) => (
                <div key={outcome.label} className={`rounded-xl p-4 text-center ${outcome.color.split(' ')[1]}`}>
                  <outcome.icon className={`w-6 h-6 ${outcome.color.split(' ')[0]} mx-auto mb-2`} />
                  <div className="font-semibold text-gray-900 text-sm mb-1">{outcome.label}</div>
                  <div className="text-xs text-gray-500">{outcome.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Data & Privacy Security ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <ServerIcon className="w-4 h-4" />
              Data Protection
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Your Data, Protected by Law
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We comply with Ghana&apos;s Data Protection Act 2012 (Act 843) and operate under the oversight
              of the Data Protection Commission. Your data is never sold to third parties.
            </p>

            <div className="space-y-4">
              {[
                { title: 'Encryption Everywhere', desc: 'TLS encryption in transit, strong encryption at rest, bcrypt-hashed passwords (12 rounds)' },
                { title: 'Minimal Data Collection', desc: 'We only collect data necessary for platform operations. Card numbers are never stored — Paystack handles all payment data' },
                { title: 'Your Rights', desc: 'Access, rectify, erase, and port your data at any time. Object to processing or lodge complaints with the Data Protection Commission' },
                { title: 'Retention Limits', desc: 'Account data: 5 years post-termination. Financials: 7 years (tax/AML). Communications: 3 years. Usage data: 2 years then anonymized' },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <CheckCircleSolid className="w-5 h-5 text-indigo-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: BuildingLibraryIcon, law: 'Data Protection Act 2012', ref: 'Act 843', desc: 'Primary data protection framework', color: 'border-indigo-200 bg-indigo-50' },
              { icon: ShieldCheckIcon, law: 'Cybersecurity Act 2020', ref: 'Act 1038', desc: 'Security requirements compliance', color: 'border-blue-200 bg-blue-50' },
              { icon: BanknotesIcon, law: 'Anti Money Laundering Act', ref: 'Act 1044', desc: 'Financial transaction monitoring', color: 'border-green-200 bg-green-50' },
              { icon: DocumentCheckIcon, law: 'Income Tax Act 2015', ref: 'Act 896', desc: '7-year financial record retention', color: 'border-amber-200 bg-amber-50' },
              { icon: ScaleIcon, law: 'ADR Act 2010', ref: 'Act 798', desc: 'Dispute resolution framework', color: 'border-orange-200 bg-orange-50' },
              { icon: AcademicCapIcon, law: 'National Accreditation Board', ref: 'University Verification', desc: 'Institutional recognition validation', color: 'border-purple-200 bg-purple-50' },
            ].map((law) => (
              <div key={law.ref} className={`rounded-xl border ${law.color} p-4 hover:shadow-sm transition-all duration-200`}>
                <law.icon className="w-6 h-6 text-gray-700 mb-2" />
                <h4 className="font-semibold text-gray-900 text-sm mb-0.5">{law.law}</h4>
                <p className="text-xs text-primary-600 font-medium mb-1">{law.ref}</p>
                <p className="text-xs text-gray-500">{law.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Community Standards Banner ─── */}
      <section className="bg-linear-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Our Community Standards
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                We maintain a professional, inclusive environment built on five core values.
                Violations are taken seriously and may result in account suspension or permanent ban.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: HandRaisedIcon, label: 'Respect' },
                  { icon: StarIcon, label: 'Professionalism' },
                  { icon: SparklesIcon, label: 'Integrity' },
                  { icon: UserGroupIcon, label: 'Collaboration' },
                  { icon: GlobeAltIcon, label: 'Inclusivity' },
                ].map((value) => (
                  <div key={value.label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2.5">
                    <value.icon className="w-5 h-5 text-primary-300" />
                    <span className="text-sm font-medium text-white">{value.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-5">Zero Tolerance Policies</h3>
              <div className="space-y-4">
                {[
                  { title: 'Harassment', desc: 'Threatening, intimidating, or menacing messages. Sustained unwanted contact, doxxing, or sexually suggestive content.' },
                  { title: 'Discrimination', desc: 'Any distinction based on race, ethnicity, religion, gender, sexual orientation, age, disability, or university affiliation.' },
                  { title: 'Academic Dishonesty', desc: 'Content promoting plagiarism, exam cheating, or violation of academic integrity policies.' },
                  { title: 'Platform Circumvention', desc: 'Sharing external contact info to bypass platform protections, fees, or escrow.' },
                ].map((policy) => (
                  <div key={policy.title} className="flex gap-3">
                    <NoSymbolIcon className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-sm">{policy.title}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">{policy.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/community-guidelines"
                className="inline-flex items-center gap-2 text-primary-300 hover:text-primary-200 text-sm font-medium mt-6 transition-colors"
              >
                Read full Community Guidelines <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Security Comparison Table ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How We Protect Each Side
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Both students and employers benefit from comprehensive, balanced protections.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left py-4 px-6 bg-gray-50 rounded-tl-xl font-semibold text-gray-900">Protection</th>
                <th className="text-center py-4 px-6 bg-primary-50 font-semibold text-primary-800">
                  <div className="flex items-center justify-center gap-2">
                    <AcademicCapIcon className="w-5 h-5" />
                    Students
                  </div>
                </th>
                <th className="text-center py-4 px-6 bg-amber-50 rounded-tr-xl font-semibold text-amber-800">
                  <div className="flex items-center justify-center gap-2">
                    <BuildingLibraryIcon className="w-5 h-5" />
                    Employers
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { feature: 'Escrow Payment Protection', student: true, employer: true },
                { feature: 'Identity Verification', student: true, employer: true },
                { feature: '14-Day Auto-Release', student: true, employer: false },
                { feature: 'Max 2 Revision Rounds', student: true, employer: false },
                { feature: 'Work Review Before Release', student: false, employer: true },
                { feature: 'Dispute Resolution (3 Stages)', student: true, employer: true },
                { feature: 'Fraud Detection & Prevention', student: true, employer: true },
                { feature: 'User Blocking', student: true, employer: true },
                { feature: 'Content Reporting', student: true, employer: true },
                { feature: 'Talent Badge Verification', student: true, employer: false },
                { feature: 'Payment Method Security (PCI)', student: false, employer: true },
                { feature: 'Auto-Withdraw Protection', student: true, employer: false },
                { feature: 'Failed Transfer Re-credit', student: true, employer: false },
                { feature: 'Hourly Contract Safeguards', student: true, employer: true },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-6 text-sm font-medium text-gray-700">{row.feature}</td>
                  <td className="py-3.5 px-6 text-center">
                    {row.student ? (
                      <CheckCircleSolid className="w-5 h-5 text-primary-500 mx-auto" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    {row.employer ? (
                      <CheckCircleSolid className="w-5 h-5 text-amber-500 mx-auto" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── Report Something Section ─── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-error-100 text-error-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <BellAlertIcon className="w-4 h-4" />
              See Something? Say Something.
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Report a Safety Concern
            </h2>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              If you encounter any violation of our policies, suspicious activity, or feel unsafe,
              we want to hear from you. Reports can be filed against users, gigs, reviews, posts, or comments.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {[
                { icon: FlagIcon, title: 'Flag Content', desc: 'Use the report button on any profile, gig, review, or community post' },
                { icon: ClockIcon, title: 'Quick Response', desc: 'Our moderation team reviews reports and takes action promptly' },
                { icon: ShieldCheckIcon, title: 'Confidential', desc: 'Your identity is protected. Reports are tracked privately in our system' },
              ].map((step) => (
                <div key={step.title} className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                  <step.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
            >
              Contact Safety Team
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Common questions about how we keep the platform safe.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="bg-linear-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <ShieldCheckSolid className="w-14 h-14 text-primary-200 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Work with Confidence
          </h2>
          <p className="text-lg text-primary-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of students and employers who trust Intemso to keep their
            work, payments, and data safe. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto bg-white text-primary-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              href="/community-guidelines"
              className="w-full sm:w-auto border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Read Our Guidelines
            </Link>
          </div>

          {/* Trust badges row */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-primary-200">
            {[
              { icon: LockClosedSolid, label: 'Paystack Secured' },
              { icon: ShieldCheckSolid, label: 'Ghana DPA Compliant' },
              { icon: CheckCircleSolid, label: 'University Verified' },
              { icon: ScaleIcon, label: 'ADR Act 798 Backed' },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-1.5">
                <badge.icon className="w-4 h-4" />
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

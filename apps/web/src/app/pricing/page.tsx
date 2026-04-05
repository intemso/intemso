'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  CheckIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  StarIcon,
  UserGroupIcon,
  ClockIcon,
  DocumentCheckIcon,
  BanknotesIcon,
  GiftIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  HandThumbUpIcon,
  ArrowPathIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon as CheckIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { paymentsApi } from '@/lib/api';
import { useAuth } from '@/context/auth';

/* ─── Data ─── */

const CONNECT_PACKS = [
  {
    connects: 10,
    price: 5,
    perConnect: '0.50',
    popular: false,
    savings: null,
    color: 'from-slate-500 to-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: null,
  },
  {
    connects: 20,
    price: 9,
    perConnect: '0.45',
    popular: true,
    savings: '10%',
    color: 'from-primary-500 to-primary-700',
    bg: 'bg-primary-50',
    border: 'border-primary-300',
    badge: 'Most Popular',
  },
  {
    connects: 40,
    price: 16,
    perConnect: '0.40',
    popular: false,
    savings: '20%',
    color: 'from-amber-500 to-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'Best Value',
  },
];

const FEE_TIERS = [
  { min: 0, max: 500, rate: 20, label: 'GH\u20B50 \u2013 GH\u20B5500' },
  { min: 500, max: 2000, rate: 10, label: 'GH\u20B5500 \u2013 GH\u20B52,000' },
  { min: 2000, max: Infinity, rate: 5, label: 'Above GH\u20B52,000' },
];

const HOW_IT_WORKS_STUDENT = [
  {
    step: 1,
    icon: AcademicCapIcon,
    title: 'Create Your Profile',
    desc: 'Sign up for free and build your student profile. You get 15 free connects every month to start.',
  },
  {
    step: 2,
    icon: BoltIcon,
    title: 'Submit Proposals',
    desc: 'Use connects to submit proposals on gigs that match your skills. Each proposal costs 2 connects.',
  },
  {
    step: 3,
    icon: DocumentCheckIcon,
    title: 'Get Hired & Deliver',
    desc: 'Once an employer accepts your proposal, a contract is created. Complete the work and submit deliverables.',
  },
  {
    step: 4,
    icon: BanknotesIcon,
    title: 'Get Paid Securely',
    desc: 'Funds are held in escrow until you deliver. After approval, money goes to your wallet. Withdraw anytime.',
  },
];

const HOW_IT_WORKS_EMPLOYER = [
  {
    step: 1,
    icon: BriefcaseIcon,
    title: 'Post a Gig for Free',
    desc: 'Describe what you need. Posting gigs costs nothing. Reach hundreds of talented students instantly.',
  },
  {
    step: 2,
    icon: UserGroupIcon,
    title: 'Review Proposals',
    desc: 'Browse proposals from qualified students. Check profiles, ratings, reviews, and talent badges.',
  },
  {
    step: 3,
    icon: ShieldCheckIcon,
    title: 'Fund Escrow',
    desc: 'Pay securely via Paystack. Your money is held safely in escrow until the student delivers quality work.',
  },
  {
    step: 4,
    icon: CheckCircleIcon,
    title: 'Approve & Release',
    desc: 'Review deliverables, request revisions if needed, and approve when satisfied. Fair and transparent.',
  },
];

const EARNED_CONNECTS = [
  { icon: CheckCircleIcon, label: 'Complete a gig', value: '+5', color: 'text-green-600 bg-green-50' },
  { icon: StarIconSolid, label: 'Leave a review', value: '+1', color: 'text-amber-600 bg-amber-50' },
  { icon: SparklesIcon, label: 'Receive a 5 star review', value: '+3', color: 'text-purple-600 bg-purple-50' },
  { icon: AcademicCapIcon, label: 'Complete your profile', value: '+10', color: 'text-primary-600 bg-primary-50' },
  { icon: HandThumbUpIcon, label: 'Daily login bonus', value: '+1', color: 'text-teal-600 bg-teal-50' },
];

const FAQS = [
  {
    q: 'What are connects?',
    a: 'Connects are credits that students use to submit proposals on gigs. Each proposal costs 2 connects. You receive 15 free connects every month, and unused connects roll over up to a maximum of 80. You can also earn connects by completing gigs, getting reviews, and more.',
  },
  {
    q: 'Do I need to pay to post a gig?',
    a: 'No. Posting gigs on Intemso is completely free for employers. You only pay the agreed budget when you hire a student, and that money is held securely in escrow until the work is delivered and approved.',
  },
  {
    q: 'How does the sliding service fee work?',
    a: 'Service fees are calculated based on the total lifetime billings between a student and a specific employer. The more you earn with the same client, the lower your fee rate drops. Fees start at 20% for the first GH\u20B5500, drop to 10% between GH\u20B5500 and GH\u20B52,000, and reduce to just 5% for all earnings above GH\u20B52,000 with that client.',
  },
  {
    q: 'How does escrow protect me?',
    a: 'When an employer hires a student, the agreed payment is deposited into a secure escrow account. The money is only released to the student after the employer approves the delivered work. If the employer does not respond within 14 days, the payment is automatically released. This protects both parties.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'We accept payments through Paystack, which supports mobile money (MTN, Vodafone, AirtelTigo), Visa and Mastercard debit and credit cards, and bank transfers. All transactions are processed in Ghana Cedis (GH\u20B5).',
  },
  {
    q: 'When can I withdraw my earnings?',
    a: 'You can withdraw your available wallet balance at any time. Withdrawals are sent to your mobile money wallet or bank account. There is no minimum withdrawal amount and processing typically takes one to two business days.',
  },
  {
    q: 'What happens if connects are not used?',
    a: 'Free monthly connects roll over to the next month, up to a maximum of 80 total rollover connects. Purchased connects never expire. If your proposal is declined by an employer, the connects spent on that proposal are refunded to you automatically.',
  },
  {
    q: 'Are there any hidden fees?',
    a: 'No. Intemso has a transparent pricing structure. Employers pay nothing beyond the agreed gig budget. Students pay only the sliding service fee on earnings. Connect prices are clearly listed. There are no subscription fees, no setup fees, and no hidden charges.',
  },
];

/* ─── Animated counter hook ─── */
function useCountUp(target: number, duration = 1500, trigger = true) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!trigger || started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, trigger]);
  return val;
}

/* ─── Intersection observer hook ─── */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── FAQ Accordion Item ─── */
function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-1 text-left group"
      >
        <span className="text-base font-medium text-gray-900 group-hover:text-primary-600 transition-colors pr-4">
          {q}
        </span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-600' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}
      >
        <p className="text-gray-600 text-sm leading-relaxed px-1">{a}</p>
      </div>
    </div>
  );
}

/* ─── Fee calculator ─── */
function FeeCalculator() {
  const [amount, setAmount] = useState(1000);
  const [lifetime, setLifetime] = useState(0);

  const calculateFee = (amt: number, life: number) => {
    let remaining = amt;
    let totalFee = 0;
    let current = life;

    for (const tier of FEE_TIERS) {
      if (remaining <= 0) break;
      if (current >= tier.max) continue;
      const start = Math.max(current, tier.min);
      const end = Math.min(current + remaining, tier.max);
      const taxable = end - start;
      if (taxable > 0) {
        totalFee += taxable * (tier.rate / 100);
        remaining -= taxable;
        current += taxable;
      }
    }
    return totalFee;
  };

  const fee = calculateFee(amount, lifetime);
  const net = amount - fee;
  const effectiveRate = amount > 0 ? ((fee / amount) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-card">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <CurrencyDollarIcon className="w-5 h-5 text-primary-600" />
        Fee Calculator
      </h3>

      <div className="space-y-6">
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Payment Amount</span>
            <span className="text-primary-600 font-bold">GH&#x20B5;{amount.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min={50}
            max={5000}
            step={50}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>GH&#x20B5;50</span>
            <span>GH&#x20B5;5,000</span>
          </div>
        </div>

        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Lifetime Earnings with Client</span>
            <span className="text-gray-500">GH&#x20B5;{lifetime.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={lifetime}
            onChange={(e) => setLifetime(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>New Client</span>
            <span>GH&#x20B5;5,000+</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment Amount</span>
            <span className="font-medium text-gray-900">GH&#x20B5;{amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Service Fee ({effectiveRate}%)</span>
            <span className="font-medium text-red-500">&minus; GH&#x20B5;{fee.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="font-semibold text-gray-900">You Receive</span>
            <span className="text-xl font-bold text-green-600">GH&#x20B5;{net.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Escrow flow step ─── */
function EscrowStep({ step, title, desc, icon: Icon, isLast }: {
  step: number;
  title: string;
  desc: string;
  icon: React.ElementType;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        {!isLast && <div className="w-0.5 h-full bg-primary-100 mt-2" />}
      </div>
      <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-0.5">Step {step}</p>
        <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════ */

export default function PricingPage() {
  const { user } = useAuth();
  const [buying, setBuying] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'student' | 'employer'>('student');

  const statsRef = useInView(0.3);
  const stat1 = useCountUp(240, 1200, statsRef.inView);
  const stat2 = useCountUp(15, 800, statsRef.inView);
  const stat3 = useCountUp(5, 1000, statsRef.inView);

  const handleBuy = async (packSize: number) => {
    if (!user) {
      window.location.href = '/auth/login?redirect=/pricing';
      return;
    }
    setBuying(packSize);
    setError('');
    try {
      const { authorizationUrl } = await paymentsApi.initialize({
        purpose: 'connects_purchase',
        packSize,
        callbackUrl: window.location.origin + '/pricing?payment=success',
      });
      window.location.href = authorizationUrl;
    } catch (err: any) {
      setError(err?.message || 'Payment initialization failed');
      setBuying(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-125 h-125 bg-primary-400/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-white/5 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <SparklesIcon className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-medium text-primary-100">No subscriptions. No hidden fees.</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6">
              Simple, Transparent
              <span className="block bg-linear-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="text-base sm:text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed mb-10">
              Employers hire for free. Students pay only a small service fee on earnings. Buy connects only when you need them. That&apos;s it.
            </p>

            {/* Stats bar */}
            <div ref={statsRef.ref} className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <p className="text-2xl sm:text-3xl font-bold">{stat1}+</p>
                <p className="text-xs sm:text-sm text-primary-200">Gig Categories</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <p className="text-2xl sm:text-3xl font-bold">{stat2}</p>
                <p className="text-xs sm:text-sm text-primary-200">Free Connects/Mo</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <p className="text-2xl sm:text-3xl font-bold">{stat3}%</p>
                <p className="text-xs sm:text-sm text-primary-200">Lowest Fee Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V40C240 0 480 0 720 40C960 80 1200 80 1440 40V80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS TAB SECTION
          ════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Whether you&apos;re a student looking to earn or an employer seeking talent, getting started is simple.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('student')}
                className={`px-5 sm:px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'student'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <AcademicCapIcon className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                I&apos;m a Student
              </button>
              <button
                onClick={() => setActiveTab('employer')}
                className={`px-5 sm:px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'employer'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BriefcaseIcon className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                I&apos;m an Employer
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {(activeTab === 'student' ? HOW_IT_WORKS_STUDENT : HOW_IT_WORKS_EMPLOYER).map((item, i) => (
              <div
                key={item.step}
                className="relative bg-white rounded-2xl border border-gray-100 p-6 text-center group hover:border-primary-200 hover:shadow-card-hover transition-all duration-300"
              >
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold">
                    {item.step}
                  </span>
                </div>
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 lg:-right-4 w-8 h-0.5 bg-gray-200" />
                )}
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CONNECTS PRICING SECTION
          ════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-4">
              <BoltIcon className="w-4 h-4" />
              For Students
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">Connects</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Connects are the credits you use to submit proposals on gigs. Each proposal costs <span className="font-semibold text-gray-900">2 connects</span>.
              You get <span className="font-semibold text-primary-600">15 free connects every month</span>, and unused ones roll over (up to 80 total).
            </p>
          </div>

          {/* Free connects highlight */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                <GiftIcon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-0.5">15 Free Connects Every Month</h3>
                <p className="text-sm text-green-700">
                  Every student receives 15 free connects on the 1st of each month. That&apos;s enough to submit up to 7 proposals without spending a single pesewa. Unused free connects roll over to the next month, up to a maximum of 80.
                </p>
              </div>
              <div className="text-3xl font-extrabold text-green-600 shrink-0">FREE</div>
            </div>
          </div>

          {error && (
            <div className="max-w-3xl mx-auto mb-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <XMarkIcon className="w-5 h-5 shrink-0" />
                {error}
              </div>
            </div>
          )}

          {/* Connect pack cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {CONNECT_PACKS.map((pack) => (
              <div
                key={pack.connects}
                className={`relative bg-white rounded-2xl border-2 ${pack.popular ? 'border-primary-400 shadow-lg shadow-primary-100' : 'border-gray-100'} overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1`}
              >
                {/* Top gradient bar */}
                <div className={`h-1.5 bg-linear-to-r ${pack.color}`} />

                {pack.badge && (
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      pack.popular ? 'bg-primary-100 text-primary-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {pack.badge}
                    </span>
                  </div>
                )}

                <div className="p-6 sm:p-8 text-center">
                  {/* Connect count visual */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${pack.bg} mb-4`}>
                    <div>
                      <p className={`text-3xl font-extrabold bg-linear-to-br ${pack.color} bg-clip-text text-transparent`}>
                        {pack.connects}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Connects</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-3xl font-extrabold text-gray-900">
                      GH&#x20B5;{pack.price}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">GH&#x20B5;{pack.perConnect} per connect</p>
                    {pack.savings && (
                      <p className="text-xs font-semibold text-green-600 mt-1">Save {pack.savings}</p>
                    )}
                  </div>

                  {/* Per proposal cost */}
                  <div className="bg-gray-50 rounded-lg px-3 py-2 mb-6">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{Math.floor(pack.connects / 2)} proposals</span> per pack
                    </p>
                    <p className="text-xs text-gray-400">
                      GH&#x20B5;{(pack.price / Math.floor(pack.connects / 2)).toFixed(2)} per proposal
                    </p>
                  </div>

                  <button
                    onClick={() => handleBuy(pack.connects)}
                    disabled={buying !== null}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 ${
                      pack.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {buying === pack.connects ? (
                      <span className="flex items-center justify-center gap-2">
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Redirecting...
                      </span>
                    ) : (
                      'Buy Now'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment methods */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
              <LockClosedIcon className="w-3.5 h-3.5" />
              Secure payment via Paystack. Supports mobile money, Visa, Mastercard, and bank transfer.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          EARN FREE CONNECTS
          ════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium mb-4">
                  <GiftIcon className="w-4 h-4" />
                  Rewards
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Earn Free Connects</h2>
                <p className="text-gray-500 mb-8">
                  Beyond your monthly free connects, you can earn additional connects by being active on the platform.
                  Complete gigs, leave reviews, and keep your profile updated to unlock bonus connects.
                </p>
              </div>

              <div className="space-y-3">
                {EARNED_CONNECTS.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">{item.value}</span>
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-2 pl-1">
                  Daily login bonus is capped at 5 connects per week. Profile completion bonus is one time only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SERVICE FEES SECTION
          ════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium mb-4">
              <CurrencyDollarIcon className="w-4 h-4" />
              Sliding Scale
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">Service Fees</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our fee structure rewards loyalty. The more you earn with the same employer, the lower your service fee drops. Fees are deducted automatically when payments are released from escrow.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="lg:grid lg:grid-cols-2 lg:gap-10">
              {/* Fee tiers visual */}
              <div className="mb-10 lg:mb-0">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-card">
                  {/* Tier cards */}
                  <div className="divide-y divide-gray-100">
                    {FEE_TIERS.map((tier, i) => {
                      const barWidth = tier.rate === 20 ? 'w-full' : tier.rate === 10 ? 'w-1/2' : 'w-1/4';
                      const barColor = tier.rate === 20 ? 'bg-red-400' : tier.rate === 10 ? 'bg-amber-400' : 'bg-green-400';
                      const badgeColor = tier.rate === 20 ? 'bg-red-50 text-red-700' : tier.rate === 10 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700';
                      return (
                        <div key={i} className="p-5 sm:p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm font-bold text-gray-900">{tier.label}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {tier.rate === 20 && 'Starting rate for new client relationships'}
                                {tier.rate === 10 && 'Reduced rate as you build trust'}
                                {tier.rate === 5 && 'Lowest rate for established partnerships'}
                              </p>
                            </div>
                            <span className={`text-lg font-extrabold px-3 py-1 rounded-lg ${badgeColor}`}>
                              {tier.rate}%
                            </span>
                          </div>
                          {/* Visual bar */}
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`${barColor} h-2 rounded-full ${barWidth} transition-all duration-700`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Blended fee note */}
                  <div className="bg-primary-50 px-5 sm:px-6 py-4 border-t border-primary-100">
                    <p className="text-xs text-primary-800 leading-relaxed">
                      <strong>Blended fees apply.</strong> When a single payment crosses tier boundaries, each portion is charged at the applicable tier rate. For example, if you have earned GH&#x20B5;400 with a client and receive a GH&#x20B5;200 payment, the first GH&#x20B5;100 is charged at 20% and the remaining GH&#x20B5;100 at 10%, resulting in an effective rate of 15%.
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive calculator */}
              <FeeCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          ESCROW & PAYMENT SECURITY
          ════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-4">
              <ShieldCheckIcon className="w-4 h-4" />
              Payment Protection
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">Secure Escrow Payments</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Every payment on Intemso is protected by our escrow system. Money is held securely until work is delivered and approved, so both students and employers are protected.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
              {/* Escrow flow */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-card mb-10 lg:mb-0">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ArrowRightIcon className="w-5 h-5 text-primary-600" />
                  Payment Flow
                </h3>
                <div className="space-y-0">
                  <EscrowStep
                    step={1}
                    icon={BriefcaseIcon}
                    title="Employer Posts Gig"
                    desc="Employer creates a gig listing with a clear budget and scope."
                    isLast={false}
                  />
                  <EscrowStep
                    step={2}
                    icon={DocumentCheckIcon}
                    title="Student Gets Hired"
                    desc="Student submits a proposal, employer accepts, and a contract is created."
                    isLast={false}
                  />
                  <EscrowStep
                    step={3}
                    icon={LockClosedIcon}
                    title="Funds Enter Escrow"
                    desc="Employer pays via Paystack and funds are locked securely in escrow."
                    isLast={false}
                  />
                  <EscrowStep
                    step={4}
                    icon={AcademicCapIcon}
                    title="Student Delivers Work"
                    desc="Student completes the work and submits deliverables through the platform."
                    isLast={false}
                  />
                  <EscrowStep
                    step={5}
                    icon={CheckCircleIcon}
                    title="Employer Reviews"
                    desc="Employer reviews and approves the work. Up to 2 revision requests are allowed."
                    isLast={false}
                  />
                  <EscrowStep
                    step={6}
                    icon={BanknotesIcon}
                    title="Payment Released"
                    desc="Service fee is deducted and the net amount goes to the student&apos;s wallet. Auto releases in 14 days if no response."
                    isLast={true}
                  />
                </div>
              </div>

              {/* Protection features */}
              <div className="space-y-4">
                {[
                  {
                    icon: ShieldCheckIcon,
                    title: 'Funds Held Securely',
                    desc: 'All payments are processed through Paystack and held in a secure escrow account. Neither party can access the funds until conditions are met.',
                    color: 'bg-green-50 text-green-600',
                  },
                  {
                    icon: ClockIcon,
                    title: '14 Day Auto Release',
                    desc: 'If an employer does not review delivered work within 14 days, the payment is automatically released to the student. No work goes unpaid.',
                    color: 'bg-blue-50 text-blue-600',
                  },
                  {
                    icon: ArrowPathIcon,
                    title: 'Up to 2 Revisions',
                    desc: 'Employers can request up to 2 revisions per milestone before approving. This ensures quality while preventing unlimited revision requests.',
                    color: 'bg-amber-50 text-amber-600',
                  },
                  {
                    icon: ChatBubbleLeftRightIcon,
                    title: 'Dispute Resolution',
                    desc: 'If issues arise, our three stage dispute resolution process ensures fair outcomes. Direct resolution, mediation, and formal escalation options available.',
                    color: 'bg-purple-50 text-purple-600',
                  },
                  {
                    icon: CurrencyDollarIcon,
                    title: 'Multiple Payout Options',
                    desc: 'Students can withdraw earnings via mobile money or bank transfer at any time. No minimum withdrawal amount. Processing takes one to two business days.',
                    color: 'bg-teal-50 text-teal-600',
                  },
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${feature.color}`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FREE FOR EMPLOYERS
          ════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-linear-to-br from-primary-700 via-primary-600 to-primary-800 rounded-3xl overflow-hidden">
              {/* Decorations */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
              </div>

              <div className="relative p-8 sm:p-12 lg:p-16">
                <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                  <div className="text-white mb-8 lg:mb-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-medium mb-4">
                      <BriefcaseIcon className="w-4 h-4" />
                      For Employers
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                      Completely Free
                      <span className="block text-primary-200">for Employers</span>
                    </h2>
                    <p className="text-primary-100 leading-relaxed mb-6">
                      Posting gigs, browsing talent, reviewing proposals, and hiring students costs absolutely nothing. You only pay the agreed budget to the student, secured safely in escrow.
                    </p>
                    <Link
                      href="/auth/register?role=employer"
                      className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors"
                    >
                      Start Hiring for Free
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: CheckIconSolid, text: 'Post unlimited gigs' },
                      { icon: CheckIconSolid, text: 'Browse all talent profiles' },
                      { icon: CheckIconSolid, text: 'Secure escrow payments' },
                      { icon: CheckIconSolid, text: 'Review and rate students' },
                      { icon: CheckIconSolid, text: 'Milestone based payments' },
                      { icon: CheckIconSolid, text: 'Dispute resolution support' },
                      { icon: CheckIconSolid, text: 'No subscription fees' },
                      { icon: CheckIconSolid, text: 'No hidden charges' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2.5">
                        <item.icon className="w-4 h-4 text-green-300 shrink-0" />
                        <span className="text-xs sm:text-sm text-white font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          COMPARISON TABLE
          ════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">Students vs Employers</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A clear breakdown of what each side pays and gets.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-card">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 sm:px-6 py-4 text-sm font-semibold text-gray-900">Feature</th>
                    <th className="text-center px-4 sm:px-6 py-4 text-sm font-semibold text-primary-700">
                      <AcademicCapIcon className="w-4 h-4 mx-auto mb-1" />
                      Student
                    </th>
                    <th className="text-center px-4 sm:px-6 py-4 text-sm font-semibold text-primary-700">
                      <BriefcaseIcon className="w-4 h-4 mx-auto mb-1" />
                      Employer
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { feature: 'Account creation', student: 'Free', employer: 'Free' },
                    { feature: 'Monthly subscription', student: 'None', employer: 'None' },
                    { feature: 'Free monthly connects', student: '15/month', employer: 'N/A' },
                    { feature: 'Cost per proposal', student: '2 connects', employer: 'N/A' },
                    { feature: 'Post gigs', student: 'N/A', employer: 'Free & unlimited' },
                    { feature: 'Service fee on earnings', student: '5% to 20%', employer: 'None' },
                    { feature: 'Escrow protection', student: true, employer: true },
                    { feature: 'Wallet & withdrawals', student: true, employer: 'N/A' },
                    { feature: 'Dispute resolution', student: true, employer: true },
                    { feature: 'Reviews & ratings', student: true, employer: true },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-4 sm:px-6 py-3 text-sm text-gray-700 font-medium">{row.feature}</td>
                      <td className="px-4 sm:px-6 py-3 text-center text-sm">
                        {typeof row.student === 'boolean' ? (
                          <CheckIconSolid className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className={row.student === 'N/A' ? 'text-gray-300' : 'text-gray-900 font-medium'}>
                            {row.student}
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-center text-sm">
                        {typeof row.employer === 'boolean' ? (
                          <CheckIconSolid className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className={row.employer === 'N/A' ? 'text-gray-300' : 'text-gray-900 font-medium'}>
                            {row.employer}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FAQ SECTION
          ════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Everything you need to know about pricing, fees, connects, and payments.
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-card px-6 sm:px-8">
            {FAQS.map((faq, i) => (
              <FAQItem
                key={i}
                q={faq.q}
                a={faq.a}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BOTTOM CTA
          ════════════════════════════════════════ */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-500 mb-8">
              Join thousands of students earning real income and employers finding talented help. No subscriptions, no hidden fees, just opportunities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/register?role=student"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-700 transition-colors"
              >
                <AcademicCapIcon className="w-5 h-5" />
                Join as Student
              </Link>
              <Link
                href="/auth/register?role=employer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold px-8 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <BriefcaseIcon className="w-5 h-5" />
                Hire Students
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              By signing up you agree to our{' '}
              <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

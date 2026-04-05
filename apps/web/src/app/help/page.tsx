'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  UserCircleIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  StarIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  PhotoIcon,
  BookmarkIcon,
  UserGroupIcon,
  ScaleIcon,
  ArrowPathIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon,
  LifebuoyIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolid,
  ShieldCheckIcon as ShieldCheckSolid,
} from '@heroicons/react/24/solid';

/* ─── Types ─── */
interface HelpArticle {
  id: string;
  q: string;
  a: string;
  tags: string[];
}

interface HelpCategory {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  audience: 'all' | 'students' | 'employers';
  color: string;
  articles: HelpArticle[];
}

/* ─── Accordion ─── */
function Article({ article, isOpen, toggle }: { article: HelpArticle; isOpen: boolean; toggle: () => void }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-primary-200">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900 pr-4">{article.q}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-250' : 'max-h-0'}`}>
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{article.a}</div>
      </div>
    </div>
  );
}

/* ─── Quick Link Card ─── */
function QuickLink({ icon: Icon, title, desc, href, color }: { icon: React.ElementType; title: string; desc: string; href: string; color: string }) {
  return (
    <Link href={href} className="group flex gap-4 items-start bg-white rounded-xl border border-gray-100 p-5 hover:shadow-card hover:border-primary-100 transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}

/* ─── HELP DATA ─── */
const CATEGORIES: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    desc: 'Account creation, verification, and first steps',
    icon: SparklesIcon,
    audience: 'all',
    color: 'bg-primary-500',
    articles: [
      {
        id: 'gs-1',
        q: 'How do I create a student account?',
        a: `To create a student account on Intemso:

1. Go to the registration page and select "Student"
2. Enter your university email address — we require a verified institutional email (Gmail, Outlook, Yahoo, and 18+ other public email providers are blocked)
3. Create a strong password (8–72 characters, must include uppercase, lowercase, and a digit)
4. Complete your basic profile information

After registering, you'll receive 15 free connects to start submitting proposals. Complete your profile (name, university, bio, and at least 1 skill) to earn an additional 10 bonus connects.`,
        tags: ['register', 'signup', 'student', 'account', 'create'],
      },
      {
        id: 'gs-2',
        q: 'How do I create an employer account?',
        a: `To create an employer account:

1. Go to the registration page and select "Employer"
2. Enter your email address and create a password
3. Fill in your business name and basic company details
4. Start posting gigs immediately — posting gigs is completely free

You'll get access to the employer portal at hire.intemso.com where you can manage gigs, review proposals, track contracts, and handle payments.`,
        tags: ['register', 'signup', 'employer', 'account', 'business'],
      },
      {
        id: 'gs-3',
        q: 'Why can\'t I use my Gmail/Yahoo/Outlook email as a student?',
        a: `Student accounts must use a verified university email address. This is a core trust & safety measure to ensure every student on the platform is genuinely enrolled at a recognized institution.

We block 18+ public email providers including Gmail, Outlook, Yahoo, AOL, iCloud, ProtonMail, Zoho, Yandex, and others.

Alternative: If your university doesn't use a standard email domain, you can register using your Ghana Card number (format: GHA-XXXXXXXXX-X) as an alternative form of identity verification. Only one account is allowed per Ghana Card.`,
        tags: ['email', 'gmail', 'university', 'verification', 'blocked'],
      },
      {
        id: 'gs-4',
        q: 'How do I complete my profile?',
        a: `A complete profile helps you win gigs and builds trust with employers.

For Students, make sure to fill in:
• First and last name (from your official ID)
• University name
• A professional bio describing your skills and experience
• At least 1 relevant skill from your expertise
• Professional title (e.g., "Web Developer", "Graphic Designer")
• Hourly rate (optional but recommended)
• Profile photo (real, professional, face clearly visible)

Completing all core fields (name, university, bio, and skills) earns you a one-time bonus of 10 connects.

For Employers:
• Business name (required)
• Business description and website
• Contact person name
• Company logo`,
        tags: ['profile', 'complete', 'setup', 'bio', 'skills', 'photo'],
      },
      {
        id: 'gs-5',
        q: 'What are the different user portals?',
        a: `Intemso uses separate portals for each user type:

• intemso.com — The public website for browsing gigs, talent, and showcases
• jobs.intemso.com — Student portal for managing your gigs, proposals, contracts, and earnings
• hire.intemso.com — Employer portal for posting gigs, managing contracts, and handling payments
• admin.intemso.com — Admin control panel (admin access only)

After logging in at intemso.com, you'll be automatically redirected to your role-specific portal. Each portal has its own dashboard, sidebar navigation, and role-specific features.`,
        tags: ['portal', 'dashboard', 'login', 'redirect', 'student', 'employer'],
      },
      {
        id: 'gs-6',
        q: 'How do I upload a profile photo?',
        a: `To upload a profile photo:

1. Go to your profile settings in your portal dashboard
2. Click the avatar area to upload a new photo
3. Select an image file (JPEG, PNG, WebP, or GIF)
4. Maximum file size: 2 MB
5. Your photo will be automatically cropped to 256×256 pixels and optimized

Requirements: Use a genuine, recent, professional photo with your face clearly visible. No logos, cartoons, group photos, or blank images. Photos are stored securely via Cloudinary with automatic WebP conversion and multiple size variants.`,
        tags: ['avatar', 'photo', 'upload', 'image', 'picture'],
      },
    ],
  },
  {
    id: 'connects',
    title: 'Connects & Proposals',
    desc: 'How connects work, earning, buying, and submitting proposals',
    icon: SparklesIcon,
    audience: 'students',
    color: 'bg-indigo-500',
    articles: [
      {
        id: 'cn-1',
        q: 'What are connects and how do they work?',
        a: `Connects are the currency students use to submit proposals on gigs. Each proposal costs a certain number of connects (default: 2 per proposal, but employers can set a custom amount per gig).

When you submit a proposal, connects are deducted in this priority order:
1. Free connects (from monthly grant)
2. Rollover connects (unused from previous months)
3. Purchased connects

You cannot submit a proposal if you don't have enough connects. This system ensures proposals are thoughtful and intentional, reducing spam for employers.`,
        tags: ['connects', 'proposals', 'cost', 'deduction', 'submit'],
      },
      {
        id: 'cn-2',
        q: 'How many free connects do I get?',
        a: `Every student receives 15 free connects on the 1st of each month automatically.

Unused free connects roll over to the next month (up to a maximum of 80 rollover connects). So if you use only 5 connects in a month, 10 will roll over. Combined with your next month's 15 free, you'd have 25 available.

Additionally, when you first complete your profile (name, university, bio, and at least 1 skill), you recieve a one-time bonus of 10 connects.`,
        tags: ['free', 'monthly', 'connects', 'rollover', 'grant'],
      },
      {
        id: 'cn-3',
        q: 'How can I earn extra connects for free?',
        a: `You can earn connects through platform activity:

• Complete a gig: +5 connects (one-time per contract)
• Leave a review: +1 connect per review
• Receive a 5-star review: +3 connects
• Complete your profile: +10 connects (one-time)
• Daily login: +1 connect per day (maximum 5 per week)

All rewards are tracked to prevent duplicates. You can see your connect history in your dashboard, including every earn, spend, and refund transaction.`,
        tags: ['earn', 'free', 'connects', 'reward', 'bonus', 'login'],
      },
      {
        id: 'cn-4',
        q: 'How much do connect packs cost?',
        a: `You can purchase additional connects at any time:

• 10 connects — GH₵5.00 (GH₵0.50 each)
• 20 connects — GH₵9.00 (GH₵0.45 each — 10% savings)
• 40 connects — GH₵16.00 (GH₵0.40 each — 20% savings)

Payments are processed securely via Paystack. You can pay with Visa/Mastercard, MTN Mobile Money, Vodafone Cash, AirtelTigo Money, or bank transfer. Purchased connects never expire and are used only after your free and rollover connects are depleted.`,
        tags: ['buy', 'purchase', 'price', 'cost', 'packs', 'connects'],
      },
      {
        id: 'cn-5',
        q: 'Do I get connects back if my proposal is declined?',
        a: `Yes — if an employer declines your proposal, the full number of connects you spent on that proposal are automatically refunded to your free connects balance.

However, if you withdraw your own proposal, no refund is given. This policy discourages submitting proposals carelessly and then withdrawing them.

Connect refunds appear in your transaction history with the type "proposal_refund".`,
        tags: ['refund', 'declined', 'withdraw', 'connects', 'proposal'],
      },
      {
        id: 'cn-6',
        q: 'How do I submit a winning proposal?',
        a: `When you find a gig you want to work on:

1. Click "Submit Proposal" on the gig detail page
2. Write a personalized cover letter explaining why you're a great fit
3. Set your proposed rate (fixed price or hourly)
4. Provide an estimated duration for the project
5. Answer any screening questions the employer has set
6. Optionally break down the work into proposed milestones
7. Submit — the required connects will be deducted

Tips for winning proposals:
• Address the employer's specific needs mentioned in the gig description
• Highlight relevant experience and portfolio items
• Be realistic about timelines and pricing
• Answer screening questions thoroughly — employers use these to filter candidates
• Only submit to gigs you're genuinely qualified for

Your proposal starts with "submitted" status. The employer can then view, shortlist, or hire you. You'll be notified at each status change.`,
        tags: ['proposal', 'submit', 'cover letter', 'rate', 'screening', 'milestones'],
      },
      {
        id: 'cn-7',
        q: 'What happens when I get hired from a proposal?',
        a: `When an employer hires you from your proposal:

1. A contract is automatically created with your agreed rate and the gig details
2. The gig status changes to "hired" (no more proposals accepted)
3. You receive a notification about being hired
4. The contract appears in your dashboard under active contracts
5. The employer begins creating milestones with funding

You can then start working on the first funded milestone. Your contract type will be "fixed" by default when hired through a proposal.`,
        tags: ['hired', 'contract', 'proposal', 'notification'],
      },
    ],
  },
  {
    id: 'gigs',
    title: 'Finding & Managing Gigs',
    desc: 'Browsing, posting, and working on gigs',
    icon: BriefcaseIcon,
    audience: 'all',
    color: 'bg-green-500',
    articles: [
      {
        id: 'gig-1',
        q: 'How do I browse and find gigs?',
        a: `Visit the Find Work section to browse all available gigs. You can:

• Search by keywords (searches title and description)
• Filter by category (240+ categories available)
• Filter by budget type (fixed price or hourly)
• Filter by location type (remote, on-site, or hybrid)
• Filter by experience level (entry, intermediate, expert)

Results show 20 gigs per page by default. Only gigs with "open" status are shown — meaning they're actively accepting proposals. Each gig listing shows the title, budget range, required skills, experience level, number of proposals received, and the employer's rating.

You can also save gigs to review later using the bookmark feature.`,
        tags: ['browse', 'search', 'filter', 'find', 'gigs', 'category'],
      },
      {
        id: 'gig-2',
        q: 'How do I post a gig as an employer?',
        a: `Posting a gig on Intemso is completely free. Here's how:

1. Go to "Post a Gig" from your employer dashboard
2. Enter a clear, descriptive title
3. Write a detailed description of the work needed
4. Select the relevant category
5. Add required skills (tags that students can match against)
6. Set your budget type:
   • Fixed: Set a budget range (min–max in GH₵)
   • Hourly: Set an hourly rate range
7. Choose location type: remote, on-site, or hybrid
8. Set experience level: entry, intermediate, or expert
9. Set project scope, urgency, and expected duration
10. Add screening questions (optional but recommended)
11. Set how many connects the proposal costs (default: 2)
12. Set max proposals to accept (default: 50)
13. Choose visibility: public or invite-only
14. Add any attachments (briefs, specs, mockups)

You can save as draft first and publish when ready. Once published, your gig status becomes "open" and students can start submitting proposals.`,
        tags: ['post', 'create', 'gig', 'employer', 'listing', 'draft'],
      },
      {
        id: 'gig-3',
        q: 'How do I evaluate and hire from proposals?',
        a: `When proposals come in on your gig:

1. Go to your gig's detail page → Proposals tab
2. Review each proposal's cover letter, proposed rate, and screening answers
3. Click into a student's profile to see their portfolio, ratings, and work history
4. Use these status actions:
   • Shortlist — Mark promising candidates for review
   • Decline — Reject the proposal (connects are refunded to the student)
   • Hire — Select this student for the job

When you hire a student:
• A contract is automatically created
• The gig status changes to "hired" (no more proposals accepted)
• The student is notified immediately
• You'll be directed to set up milestones and fund the first payment

You can also view proposal screening answers to compare candidates objectively.`,
        tags: ['proposals', 'review', 'shortlist', 'hire', 'evaluate'],
      },
      {
        id: 'gig-4',
        q: 'What is the gig lifecycle?',
        a: `Every gig follows this status progression:

1. Draft — Saved but not yet published publicly
2. Open — Published and accepting proposals from students
3. Hired — A student has been selected (proposals closed)
4. In Progress — Active work happening on the contract
5. Completed — All milestones delivered and contract finished

Additional statuses:
• Closed — Employer manually closes the gig
• Cancelled — Gig cancelled before completion

You can manage your gig status from the employer dashboard. Once a gig reaches "hired" status, no more proposals can be submitted.`,
        tags: ['status', 'lifecycle', 'draft', 'open', 'hired', 'completed'],
      },
      {
        id: 'gig-5',
        q: 'Can I save gigs to apply later?',
        a: `Yes! As a student, you can save any gig to your saved list:

1. Click the bookmark icon on any gig listing or detail page
2. Access your saved gigs from your student dashboard
3. Each saved gig shows its current status, budget, and proposal count
4. You can unsave a gig at any time

This is useful for gigs you want to research before committing connects to a proposal. Saved gigs are tied to your account and persist across sessions.`,
        tags: ['save', 'bookmark', 'gig', 'later', 'saved'],
      },
    ],
  },
  {
    id: 'contracts',
    title: 'Contracts & Milestones',
    desc: 'Working on contracts, milestones, deliverables, and revisions',
    icon: DocumentTextIcon,
    audience: 'all',
    color: 'bg-orange-500',
    articles: [
      {
        id: 'ct-1',
        q: 'How do contracts work?',
        a: `A contract is created when an employer hires a student. There are two types:

Fixed-Price Contracts:
• Work is divided into milestones with specific deliverables
• Each milestone has its own budget, deadline, and scope
• Payment is released per milestone upon approval

Hourly Contracts:
• Student logs time entries for work performed
• Billing happens weekly (every Monday at midnight)
• Employer must have a saved payment authorization on file
• Weekly invoices are generated automatically

Contract statuses:
• Active — Work is in progress
• Paused — Temporarily on hold
• Completed — All work finished and paid
• Disputed — A dispute has been opened
• Cancelled — Contract terminated before completion

Both parties can view contract details, milestones, payments, and communication history from their respective dashboards.`,
        tags: ['contract', 'fixed', 'hourly', 'types', 'status'],
      },
      {
        id: 'ct-2',
        q: 'How do milestones work?',
        a: `Milestones are the payment units of fixed-price contracts. Here's the complete lifecycle:

1. Pending — Milestone created with title, description, amount, and due date
2. Funded — Employer deposits payment into escrow via Paystack
3. In Progress — Student begins working on the deliverables
4. Submitted — Student submits completed work with deliverables
5. Approved — Employer reviews and approves the work
6. Paid — Payment is released from escrow to the student's wallet

Important protections:
• If the employer doesn't respond within 14 days of submission, payment auto-releases to the student
• Maximum 2 revision rounds per milestone — employers cannot create endless revision loops
• Either party can add milestones to an active contract
• Each milestone has its own escrow — funds are secured before work begins`,
        tags: ['milestone', 'lifecycle', 'funded', 'submitted', 'approved', 'paid'],
      },
      {
        id: 'ct-3',
        q: 'How do I submit deliverables?',
        a: `When your milestone work is complete:

1. Go to the milestone in your contract dashboard
2. Click "Submit Deliverable"
3. Upload your work files:
   • Supported: Images (JPEG, PNG, WebP, GIF), Documents (PDF, DOCX, XLSX, TXT, CSV), Archives (ZIP, GZIP)
   • Maximum file size: 10 MB per file
   • Up to 10 files per delivery
4. Add any notes explaining what you've delivered
5. Submit — the milestone status changes to "submitted"

The employer receives a notification and has 14 days to review. They can either:
• Approve — Triggering payment release to your wallet
• Request Revision — With specific feedback (max 2 rounds of revisions)

If the employer takes no action within 14 days, the system automatically approves and releases payment.`,
        tags: ['submit', 'deliverable', 'upload', 'files', 'work'],
      },
      {
        id: 'ct-4',
        q: 'How do revisions work?',
        a: `If an employer requests a revision on your submitted milestone:

1. You'll receive a notification with the employer's feedback
2. The milestone status changes to "revision_requested"
3. Review the feedback and make the required changes
4. Resubmit your updated deliverables
5. The milestone goes back to "submitted" status

Important rules:
• Maximum of 2 revision rounds per milestone
• After 2 revisions, the employer must either approve the work or open a formal dispute
• Each resubmission resets the 14-day auto-approval countdown
• Revisions should address the specific feedback provided

If you believe the revision request is unreasonable or outside the original scope, you can open a dispute. Valid reasons include SCOPE_CHANGE and UNREASONABLE_REVISION.`,
        tags: ['revision', 'feedback', 'resubmit', 'changes', 'limit'],
      },
      {
        id: 'ct-5',
        q: 'What is the 14-day auto-approval?',
        a: `The 14-day auto-approval is a critical protection for students:

When you submit a milestone deliverable, a 14-day countdown begins. If the employer does not take any action (neither approves nor requests revision) within 14 days, the system automatically:

1. Approves the milestone
2. Releases the escrowed payment to your wallet
3. Updates the milestone status to "paid"

This prevents employers from indefinitely holding funds by ignoring submissions. The auto-approval is checked hourly by our system. If 72 hours pass beyond the 14-day deadline with no action, the system forces the release.

Note: Each time you resubmit after a revision request, the 14-day clock resets.`,
        tags: ['auto-approval', '14 days', 'protection', 'auto-release', 'timeout'],
      },
      {
        id: 'ct-6',
        q: 'How does hourly contract billing work?',
        a: `Hourly contracts use a weekly billing cycle:

1. Student logs time entries during the week
2. Every Monday at midnight (00:00 GMT), the system processes weekly billing
3. A weekly invoice is generated with:
   • Total hours worked
   • Agreed hourly rate
   • Subtotal (hours × rate)
   • Platform fee (deducted from student's earnings)
4. The employer is charged automatically using their saved payment authorization
5. Student's earnings are credited to their wallet

For this to work, the employer must have a saved Paystack authorization (card on file) which allows recurring charges. The same fee tiers apply to hourly contracts as fixed-price ones.`,
        tags: ['hourly', 'billing', 'weekly', 'invoice', 'time', 'entries'],
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & Escrow',
    desc: 'How escrow works, fees, funding, and payment methods',
    icon: CreditCardIcon,
    audience: 'all',
    color: 'bg-emerald-500',
    articles: [
      {
        id: 'pay-1',
        q: 'How does the escrow system work?',
        a: `Intemso's escrow system protects both students and employers:

1. Employer funds a milestone → Money goes to Intemso's Paystack merchant balance
2. Student works and submits deliverables
3. Employer reviews and approves (or requests revision)
4. Upon approval → Platform fee is deducted and student's wallet is credited
5. If disputed → Funds remain in escrow until resolution

Key protections:
• Money is held securely — not in anyone's personal account
• Students are guaranteed payment for approved work
• Employers only pay for work they approve
• 14-day auto-release if employer doesn't respond
• All transactions verified through Paystack's API

The escrow is the single source of truth — our internal database tracks every payment, and Paystack serves as the payment rail. Every webhook is verified with HMAC SHA-512 signatures.`,
        tags: ['escrow', 'payment', 'protection', 'funds', 'secure'],
      },
      {
        id: 'pay-2',
        q: 'What are the platform service fees?',
        a: `Intemso uses a sliding-scale fee system that rewards loyalty. Fees are deducted from the student's earnings (not charged to the employer):

Tier 1: First GH₵0–500 of lifetime billings with a client → 20% fee
Tier 2: GH₵500–2,000 of lifetime billings → 10% fee
Tier 3: GH₵2,000+ of lifetime billings → 5% fee

Example: If you earn GH₵1,000 from a client:
• First GH₵500 → 20% fee = GH₵100
• Next GH₵500 → 10% fee = GH₵50
• Total fee = GH₵150 (blended rate: 15%)

Fees are calculated per client relationship, so if you work with multiple employers, each relationship has its own tier progression. The fee tier is snapshotted at contract creation.

Employers have no service fees — posting gigs, reviewing proposals, and hiring are all free.`,
        tags: ['fees', 'service', 'percentage', 'tiers', 'sliding', 'cost'],
      },
      {
        id: 'pay-3',
        q: 'What payment methods are supported?',
        a: `Intemso supports all major Ghanaian payment methods via Paystack (Bank of Ghana licensed):

For Funding (Employers):
• Visa and Mastercard debit/credit cards
• MTN Mobile Money
• Vodafone Cash
• AirtelTigo Money
• Bank Transfer (Ghana banks)

Settlement timing:
• Cards: T+1 (next business day)
• Mobile Money: Instant to T+1

All payments are in Ghana Cedis (GH₵). Credit card numbers are never stored on our servers — Paystack handles all card data directly (PCI DSS compliant). Recurring payments for hourly contracts use tokenized authorization codes.`,
        tags: ['payment', 'methods', 'mobile money', 'card', 'visa', 'mtn', 'paystack'],
      },
      {
        id: 'pay-4',
        q: 'How do I fund a milestone as an employer?',
        a: `To secure work with escrow funding:

1. Go to your active contract in the employer dashboard
2. Find the milestone you want to fund (status must be "pending")
3. Click "Fund Milestone"
4. Choose your payment method (card, mobile money, or bank transfer)
5. Complete the payment through Paystack's secure checkout
6. Once successful, the milestone status changes to "funded"

The student is notified that the milestone is funded and can begin work. The money is held securely in escrow until you approve the deliverables.

You can fund milestones one at a time, or fund multiple milestones upfront if you prefer. Each milestone is funded independently.`,
        tags: ['fund', 'milestone', 'employer', 'escrow', 'deposit'],
      },
      {
        id: 'pay-5',
        q: 'Can I send a bonus to a student?',
        a: `Yes! Employers can send bonus payments to reward exceptional work:

1. Go to the contract in your dashboard
2. Select "Send Bonus"
3. Enter the bonus amount in GH₵
4. Complete payment via Paystack

The bonus goes directly to the student's wallet without milestone approval steps. This is great for tipping, rewarding ahead-of-schedule delivery, or compensating for scope additions.`,
        tags: ['bonus', 'tip', 'extra', 'payment', 'reward'],
      },
    ],
  },
  {
    id: 'wallet',
    title: 'Wallet & Withdrawals',
    desc: 'Managing earnings, withdrawals, and payout methods',
    icon: BanknotesIcon,
    audience: 'students',
    color: 'bg-teal-500',
    articles: [
      {
        id: 'wal-1',
        q: 'How does my wallet work?',
        a: `Your wallet is where all your Intemso earnings accumulate. It has two balance types:

Available Balance — Money you can withdraw at any time. This includes released milestone payments and bonuses (minus platform fees).

Pending Balance — Money currently held in escrow for active milestones. This money becomes available when the employer approves your work.

Your wallet is automatically created when you join and uses GH₵ (Ghana Cedis). You can view your complete transaction history, including every payment received, fee deducted, and withdrawal made.`,
        tags: ['wallet', 'balance', 'available', 'pending', 'earnings'],
      },
      {
        id: 'wal-2',
        q: 'How do I withdraw my earnings?',
        a: `To withdraw money from your wallet:

1. First, add a transfer recipient (see next question)
2. Go to Wallet → Withdraw in your dashboard
3. Enter the amount (minimum GH₵1, maximum: your available balance)
4. Select your payout method
5. Confirm the withdrawal

The process:
• Your wallet is debited immediately
• A Paystack transfer is initiated to your bank/mobile money account
• Status: pending → processing → completed
• If the transfer fails, the amount is automatically re-credited to your wallet

Daily withdrawal limit: GH₵10,000 (resets daily). Your daily withdrawn amount is tracked to prevent unauthorized bulk withdrawals.`,
        tags: ['withdraw', 'payout', 'transfer', 'cashout', 'money'],
      },
      {
        id: 'wal-3',
        q: 'How do I add a payout method?',
        a: `You need a transfer recipient to withdraw earnings:

1. Go to Wallet → Payout Methods in your dashboard
2. Click "Add Payout Method"
3. Choose your type:
   • Mobile Money — MTN, Vodafone, AirtelTigo
   • Bank Transfer (GHIPSS) — Any Ghana bank
4. Enter your account details
5. For bank accounts: we validate through Paystack's API to confirm ownership
6. Your first recipient is automatically set as default

You can:
• Add multiple payout methods
• Set any as your default
• Deactivate methods you no longer use (not permanently deleted)

All recipient codes are stored securely and linked to your Paystack account for fast, verified transfers.`,
        tags: ['payout', 'bank', 'mobile money', 'recipient', 'add', 'method'],
      },
      {
        id: 'wal-4',
        q: 'What is auto-withdraw?',
        a: `Auto-withdraw is an optional feature that automatically transfers your earnings to your default payout method when your wallet balance reaches a threshold you set.

To enable:
1. Go to Wallet → Settings
2. Toggle "Auto-Withdraw" on
3. Set your threshold amount (minimum GH₵1)

When your available balance reaches or exceeds your threshold, the system will automatically initiate a transfer to your default payout method. This runs every 2 hours.

This is ideal if you prefer immediate payouts without manually requesting withdrawals each time.`,
        tags: ['auto-withdraw', 'automatic', 'payout', 'threshold'],
      },
      {
        id: 'wal-5',
        q: 'What if my withdrawal fails?',
        a: `If a Paystack transfer fails (wrong account details, network issue, etc.):

1. You'll be notified of the failure with details
2. The withdrawal amount is automatically re-credited to your wallet
3. The withdrawal status changes to "failed"
4. An admin is also notified for review

Failed transfer retries are handled automatically by the system hourly. You can check the failure reason in your withdrawal history and update your payout details if needed.

The system also has daily reconciliation (runs at 3 AM) to catch any discrepancies between our records and Paystack's balance.`,
        tags: ['failed', 'withdrawal', 'error', 'refund', 'retry'],
      },
    ],
  },
  {
    id: 'services',
    title: 'Services & Showcase',
    desc: 'Offering services and building your portfolio',
    icon: PhotoIcon,
    audience: 'students',
    color: 'bg-purple-500',
    articles: [
      {
        id: 'svc-1',
        q: 'How do service listings work?',
        a: `Service listings let students offer predefined services with set pricing:

Creating a service:
1. Go to Services in your dashboard
2. Click "Create Service"
3. Add title, detailed description, and category
4. Define service tiers (different pricing levels with varying deliverables)
5. Set delivery timeframe in days
6. Add relevant tags and FAQs
7. Save as draft or publish immediately

Statuses:
• Draft — Not visible to employers
• Active — Listed publicly and accepting orders
• Paused — Temporarily hidden from search

Employers browse your services and can place orders directly. Unlike gigs where employers post and students apply, services are student-initiated offerings where employers come to you.`,
        tags: ['service', 'listing', 'create', 'offer', 'tiers'],
      },
      {
        id: 'svc-2',
        q: 'How do service orders work?',
        a: `When an employer orders your service:

1. They select a tier and place the order
2. Order status: "pending" — you review the request
3. You accept → status: "active" → delivery deadline set (today + your delivery days)
4. Complete the work and submit delivery
5. Employer reviews and approves → payment released
6. Or employer requests revision → you revise and resubmit

Delivery timeline:
• Deadline = order date + your specified delivery days
• Late delivery: 3-day grace period before employer can request cancellation
• Same auto-approval rules as milestones (14 days)

Payment uses the same escrow system — employer pays upfront, funds held until work is approved.`,
        tags: ['service', 'order', 'delivery', 'accept', 'employer'],
      },
      {
        id: 'svc-3',
        q: 'How does the Showcase portfolio work?',
        a: `Showcase is your portfolio gallery where you display your best work:

Creating portfolio items:
1. Go to Showcase in your dashboard
2. Click "Add Item"
3. Fill in the details:
   • Title and description
   • Category and skills used
   • Upload images (up to 10 MB each, auto-optimized)
   • Add project URL (if applicable)
   • Client name (optional)
   • Completion date
4. Save as draft or publish

Your published items appear in the public Showcase gallery (Dribbble-style). Employers can browse, search by skill or category, and discover your work. Each item tracks view count, and admins can feature outstanding pieces on the homepage.

This is a powerful way to attract employers — much better than just a resume.`,
        tags: ['showcase', 'portfolio', 'gallery', 'work', 'samples'],
      },
    ],
  },
  {
    id: 'reviews',
    title: 'Reviews & Reputation',
    desc: 'Ratings, reviews, talent badges, and building your reputation',
    icon: StarIcon,
    audience: 'all',
    color: 'bg-yellow-500',
    articles: [
      {
        id: 'rev-1',
        q: 'How does the review system work?',
        a: `After a contract is completed, both parties can leave reviews:

Requirements:
• Contract must have "completed" status
• You must be a party to the contract (student or employer)
• Review must be submitted within 14 days of contract completion
• Only one review per party per contract

Review content:
• Rating: 1 to 5 stars
• Comment: Optional text feedback
• Reviews cannot be edited after submission

Impact on reputation:
• Your rating average and count are recalculated with every new review
• Only visible, unflagged reviews count toward your average
• Ratings are displayed on your public profile

Rewards:
• Leaving a review earns you +1 connect
• Receiving a 5-star review earns you +3 connects`,
        tags: ['review', 'rating', 'stars', 'feedback', 'reputation'],
      },
      {
        id: 'rev-2',
        q: 'What are talent badges and how do I earn them?',
        a: `Talent badges are earned through verified performance — they cannot be purchased:

🏅 Rising Talent
• Requirements: 1+ completed gig, Job Success Score of 100+, identity verified
• Shows employers you're a proven, reliable student

⭐ Top Rated
• Requirements: 10+ completed gigs, JSS of 90+, 12+ active weeks, GH₵50,000+ lifetime earnings
• Prestigious badge showing consistent excellence

💎 Top Rated Plus
• Requirements: GH₵200,000+ lifetime earnings
• Invitation only — the highest tier for top performers

Your Job Success Score (JSS) is calculated from:
• On-time delivery rate
• Contract completion rate
• Dispute history
• Client satisfaction (re-hire rate)

Badges appear on your profile, in search results, and on proposals to help you stand out.`,
        tags: ['badge', 'talent', 'rising', 'top rated', 'jss', 'score'],
      },
      {
        id: 'rev-3',
        q: 'Can I flag an unfair review?',
        a: `If you believe a review violates community guidelines:

1. Go to the review on your profile
2. Click the "Flag" button
3. Provide your reason for flagging

What happens:
• The review is marked as "flagged" and sent to admin review
• Flagged reviews are excluded from your rating average calculation
• The admin team will examine the review against our standards

Valid reasons to flag:
• Personal attacks or discriminatory language
• False claims or fabricated information
• Review left as leverage or threat
• Reviewer has no genuine first-hand experience

Invalid reasons (will be dismissed):
• You simply disagree with the rating
• The review is negative but honest
• The feedback is critical but constructive`,
        tags: ['flag', 'unfair', 'review', 'report', 'dispute'],
      },
      {
        id: 'rev-4',
        q: 'How does the community reputation score work?',
        a: `Your reputation score reflects your overall community engagement:

Scoring formula:
• Posts created: 5 points each
• Likes received: 2 points each
• Comments posted: 3 points each
• Post views received: 0.1 points each

Reputation tiers:
• Newcomer — Starting out
• Active — Regular participant
• Contributor — Consistent, valuable contributions
• Expert — Highly engaged and respected
• Leader — Top-tier community member

Your reputation is recalculated automatically whenever you create posts, receive likes, or post comments. It appears as a badge on your profile and community posts.`,
        tags: ['reputation', 'score', 'community', 'tier', 'level'],
      },
    ],
  },
  {
    id: 'messaging',
    title: 'Messaging & Notifications',
    desc: 'Communicating with clients, real-time chat, and notifications',
    icon: ChatBubbleLeftIcon,
    audience: 'all',
    color: 'bg-sky-500',
    articles: [
      {
        id: 'msg-1',
        q: 'How does messaging work?',
        a: `Intemso provides real-time messaging for all platform communications:

Starting a conversation:
• Click "Message" on any user's profile or from a contract page
• You cannot message yourself
• If a conversation already exists between you and that user, it reopens instead of creating a new one
• Conversations can optionally be linked to specific gigs

Features:
• Real-time delivery via WebSocket (instant, no page refresh needed)
• File attachments (up to 10 MB — images, documents, archives)
• Unread message counts per conversation
• Messages automatically marked as read when you view the conversation
• Conversations sorted by most recent message

All communication should happen through the platform messaging system. Sharing external contact information to bypass the platform is a violation of community guidelines.`,
        tags: ['message', 'chat', 'conversation', 'real-time', 'communicate'],
      },
      {
        id: 'msg-2',
        q: 'What notifications will I receive?',
        a: `Intemso sends in-app notifications for important events:

Proposal notifications:
• proposal_received — When a student submits a proposal on your gig
• proposal_shortlisted — When your proposal is shortlisted
• proposal_hired — When you're hired from a proposal
• proposal_declined — When your proposal is declined

Contract & milestone notifications:
• milestone_submitted — Student submitted deliverables
• milestone_approved — Employer approved the milestone
• milestone_revision — Revision requested
• payment_released — Payment released from escrow
• contract_status_changed — Contract status update

Communication notifications:
• new_message — New message received

Community notifications:
• community_comment — Someone commented on your post
• community_reply — Someone replied to your comment
• user_followed — Someone followed you

System notifications:
• connects_low — Running low on connects
• connects_refreshed — Monthly connects granted
• dispute_opened — A dispute has been filed
• dispute_response — The other party responded to your dispute
• review_received — You received a new review

You can view all notifications from the bell icon in the navbar, and mark them as read individually or all at once.`,
        tags: ['notification', 'alert', 'bell', 'update', 'event'],
      },
    ],
  },
  {
    id: 'community',
    title: 'Community & Social',
    desc: 'Forum posts, following, @mentions, and community features',
    icon: UserGroupIcon,
    audience: 'all',
    color: 'bg-pink-500',
    articles: [
      {
        id: 'com-1',
        q: 'How does the community forum work?',
        a: `The Intemso community is a social feed where students and employers can connect:

Creating posts:
• Write a post with text content
• Choose a type: discussion, question, tip, achievement, or event
• Add images and tags for discoverability
• @mention other users to notify them
• Optionally link to a gig

Feed types:
• For You — All public posts from the community
• Following — Only posts from people you follow
• Saved — Posts you've bookmarked

Post features:
• Like and comment on posts
• Threaded replies on comments
• Edit your posts within 24 hours (shows "edited" badge)
• Save posts to read later
• Share gig completion achievements automatically

Content is sanitized (HTML tags stripped) and cached for performance. The anonymous feed refreshes every 30 seconds. Live feed updates via WebSocket show new posts in real-time.`,
        tags: ['community', 'forum', 'post', 'feed', 'social'],
      },
      {
        id: 'com-2',
        q: 'How do I follow other users?',
        a: `Following other users customizes your feed:

1. Visit any user's profile
2. Click the "Follow" button
3. Their posts will now appear in your "Following" feed tab

You'll also receive a notification when someone follows you. Your followers and following counts are visible on your profile.

The system also suggests connections based on:
• Shared university (+3 points)
• Overlapping skills (+1 point per shared skill)
• Community activity level (+0.1 per post, max +2)

Suggestions appear in the community sidebar, showing the top 6 recommended connections. These exclude anyone you've blocked.`,
        tags: ['follow', 'unfollow', 'connections', 'suggestions', 'feed'],
      },
      {
        id: 'com-3',
        q: 'How do @mentions work?',
        a: `You can mention other users in your posts and comments:

1. Type @ followed by the user's name
2. An autocomplete dropdown will appear with matching users
3. Select the user you want to mention
4. The mention will be highlighted in the published post

When you mention someone:
• They receive a notification
• The mention is visually highlighted in the content
• They can click the mention to view the commenter's profile

This is great for asking specific people questions, crediting collaborators, or drawing attention to relevant content.`,
        tags: ['mention', 'tag', 'user', 'notify', 'autocomplete'],
      },
    ],
  },
  {
    id: 'disputes',
    title: 'Disputes & Resolution',
    desc: 'Opening disputes, evidence submission, and resolution outcomes',
    icon: ScaleIcon,
    audience: 'all',
    color: 'bg-amber-500',
    articles: [
      {
        id: 'dis-1',
        q: 'When should I open a dispute?',
        a: `You should open a dispute when you cannot resolve an issue directly with the other party. Valid reasons include:

• QUALITY_ISSUE — Deliverables don't meet agreed specifications
• SCOPE_CHANGE — The other party is requesting work outside the original agreement
• NON_DELIVERY — Work was not delivered by the deadline
• UNRESPONSIVE_PARTY — The other party is not responding to messages
• UNREASONABLE_REVISION — The employer is requesting excessive or unreasonable changes
• BREACH_OF_CONTRACT — A clear violation of agreed contract terms

Before opening a dispute:
• Try resolving directly through messaging first (Stage 1: 7 days)
• Document all communications and agreements
• Gather evidence (screenshots, files, messages)

You can only open one dispute per milestone or service order at a time. Both the student and employer on the contract can open disputes.`,
        tags: ['dispute', 'when', 'reason', 'quality', 'scope', 'delivery'],
      },
      {
        id: 'dis-2',
        q: 'How does the dispute process work?',
        a: `Disputes follow a structured 3-stage process:

Stage 1 — Direct Resolution (7 Days):
Both parties attempt to resolve through platform messaging. Most issues get resolved here.

Stage 2 — Intemso Mediation (Up to 14 Days):
If direct resolution fails, file a dispute through the platform:
1. Select the reason and provide a description
2. Upload evidence (files, screenshots)
3. Specify your desired resolution
4. The other party has 72 hours to respond with their side
5. Our team acknowledges within 2 business days
6. Decision made within 14 calendar days

Stage 3 — Ghana ADR (If Needed):
If either party is dissatisfied with the mediation outcome, they can escalate to formal mediation or arbitration under Ghana's Alternative Dispute Resolution Act 2010 (Act 798) with a qualified mediator in Accra.

During a dispute:
• The contract status changes to "disputed"
• The relevant milestone/order is paused
• Auto-approval is suspended
• All escrowed funds remain frozen until resolution`,
        tags: ['dispute', 'process', 'mediation', 'stages', 'resolution'],
      },
      {
        id: 'dis-3',
        q: 'What are the possible dispute outcomes?',
        a: `The admin team can resolve disputes with these outcomes:

1. Full Payment Release — Student receives the full payment minus platform fee. Used when the student delivered as agreed.

2. Full Refund — Employer receives a full refund. Used when work was not delivered or significantly below agreement.

3. Split Payment — The amount is split between student and employer by a custom percentage (1–99%). Used for partial delivery or shared responsibility.

4. Revision Required — The student must submit a final revision within 14 days. Used when work needs minor fixes.

5. Mutual Cancellation — Both parties agree to cancel. No reputation penalty applied to either side.

The admin records detailed notes, the resolution type, and any refund/release amounts. All dispute resolutions are binding on the escrowed funds. The resolution is logged in the audit trail with the admin's ID and timestamp.`,
        tags: ['outcome', 'resolution', 'refund', 'payment', 'split', 'cancel'],
      },
    ],
  },
  {
    id: 'safety',
    title: 'Safety & Reporting',
    desc: 'Reporting issues, blocking users, and staying safe',
    icon: ShieldCheckIcon,
    audience: 'all',
    color: 'bg-red-500',
    articles: [
      {
        id: 'saf-1',
        q: 'How do I report a user, gig, or content?',
        a: `You can report anything that violates our community guidelines:

Reportable content types:
• Users — Fake profiles, suspicious behavior, harassment
• Gigs — Fraudulent listings, inappropriate content, scams
• Reviews — False reviews, personal attacks, manipulation
• Community Posts — Spam, offensive content, misinformation
• Community Comments — Harassment, threats, inappropriate language

How to report:
1. Click the "Report" button on the item
2. Provide a detailed reason for your report
3. Submit — your report is recorded with your ID and the item details

Report lifecycle:
• Pending — Submitted, awaiting admin review
• Reviewed — Admin has examined the report
• Action Taken — Admin has taken enforcement action (e.g., content removed, user suspended)
• Dismissed — Report found to be unfounded

You can only submit one report per item. Your identity is kept confidential from the reported party.`,
        tags: ['report', 'flag', 'abuse', 'violation', 'safety'],
      },
      {
        id: 'saf-2',
        q: 'How do I block someone?',
        a: `If someone is making you uncomfortable, you can block them instantly:

1. Go to the user's profile
2. Click the menu icon and select "Block"
3. Confirmation — the user is immediately blocked

What blocking does:
• They cannot message you or start new conversations
• They cannot see your profile or interact with your content
• They are filtered from your community feed
• They cannot comment on your posts
• They cannot view your reviews or ratings

You can unblock a user at any time. Blocking is mutual — they won't know they've been blocked, but they won't be able to find or interact with you.

If the behavior constitutes harassment or a safety threat, please also file a formal report so our moderation team can take platform-wide action.`,
        tags: ['block', 'safety', 'harassment', 'prevent', 'mute'],
      },
      {
        id: 'saf-3',
        q: 'How do I protect myself from scams?',
        a: `Stay safe on Intemso with these practices:

Red flags to watch for:
• Gigs offering disproportionately high pay for simple tasks
• Requests to share passwords, financial info, or ID documents via messages
• Pressure to make or receive payments outside the platform
• Users who push you to act quickly without time to review
• Requests to communicate off-platform (WhatsApp, email) before a contract is established

Protection measures:
• Always use Intemso's escrow for payments — never pay or accept payment directly
• Keep all communication on-platform (messages are evidence in disputes)
• Verify employer profiles before submitting proposals
• Don't share personal contact info before a contract is in place
• Report suspicious activity immediately

If your account is compromised, your password is hashed with 12 rounds of bcrypt, session tokens expire every 15 minutes, and we support full token revocation. Contact support immediately if you suspect unauthorized access.`,
        tags: ['scam', 'fraud', 'protect', 'safety', 'red flags'],
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & Security',
    desc: 'Password, login, sessions, and account management',
    icon: LockClosedIcon,
    audience: 'all',
    color: 'bg-gray-600',
    articles: [
      {
        id: 'acc-1',
        q: 'How do I reset my password?',
        a: `If you've forgotten your password:

1. Go to the login page and click "Forgot Password"
2. Enter your registered email address
3. We'll send a password reset link (valid for 1 hour)
4. Click the link and enter your new password
5. Requirements: 8–72 characters, at least 1 uppercase, 1 lowercase, and 1 digit

Security note: The reset email is sent even if the account doesn't exist — this prevents attackers from probing which email addresses are registered on the platform. Your new password is hashed with bcrypt (12 rounds) before storage.

If you registered with a Ghana Card instead of email, contact support for password reset assistance.`,
        tags: ['password', 'reset', 'forgot', 'change', 'login'],
      },
      {
        id: 'acc-2',
        q: 'Why was my account locked?',
        a: `Accounts can be locked or suspended for several reasons:

Login lockout (temporary):
• 5 failed login attempts within a short period trigger a 15-minute lockout
• This protects against brute-force password attacks
• Wait 15 minutes and try again with the correct password

Account suspension (admin action):
• Violation of community guidelines
• Fraudulent activity detected
• Multiple valid reports against your account
• Circumventing platform protections

If suspended:
• You cannot log in or access any portal
• Your gigs, contracts, and wallet remain frozen
• Contact support to understand the reason and appeal

Account deactivation:
• If your account is marked as "inactive," it may have been deactivated by an admin
• Different from suspension — inactive accounts are treated as soft-deleted`,
        tags: ['locked', 'suspended', 'blocked', 'access', 'deactivated'],
      },
      {
        id: 'acc-3',
        q: 'How do login sessions and tokens work?',
        a: `Intemso uses a secure JWT-based authentication system:

Access Token:
• Expires every 15 minutes
• Used for all API requests
• Automatically refreshed using your refresh token

Refresh Token:
• Valid for 7 days
• Stored securely and rotated on each refresh
• Old refresh tokens are blacklisted instantly via Redis

Security features:
• Token reuse detection — if someone tries to use an old refresh token, all your sessions are immediately invalidated (emergency protocol)
• SHA-256 hashing for timing-safe token comparison
• Logout blacklists your refresh token for the remainder of its TTL
• Session state managed via Redis for fast revocation

If you suspect unauthorized access, logging out invalidates your session immediately. You can also contact support to force-revoke all active sessions.`,
        tags: ['session', 'token', 'jwt', 'login', 'security', 'refresh'],
      },
      {
        id: 'acc-4',
        q: 'How is my personal data protected?',
        a: `Intemso complies with Ghana's Data Protection Act 2012 (Act 843):

Data security:
• TLS encryption for all data in transit
• Strong encryption for data at rest
• Passwords hashed with bcrypt (12 rounds of salting)
• Role-based access controls (students, employers, admins)
• Regular security scans and code reviews

What we never store:
• Full credit card numbers (Paystack handles all card data)
• Plain-text passwords

Your rights under Act 843:
• Access — Request a copy of all your personal data
• Rectification — Correct any inaccurate information
• Erasure — Request deletion of your personal data
• Portability — Export your data in a standard format
• Object — Opt out of processing for marketing/analytics
• Complaint — Lodge complaints with the Data Protection Commission of Ghana

Data retention: Account data kept 5 years post-termination, financial records 7 years (tax/AML), communications 3 years, usage data 2 years then anonymized.

We never sell your data to third parties.`,
        tags: ['data', 'privacy', 'protection', 'gdpr', 'ghana', 'security'],
      },
    ],
  },
];

/* ─── Main Component ─── */
export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openArticles, setOpenArticles] = useState<Set<string>>(new Set());
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'students' | 'employers'>('all');

  const toggleArticle = (id: string) => {
    setOpenArticles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* Search logic */
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results: { category: HelpCategory; article: HelpArticle }[] = [];
    CATEGORIES.forEach((cat) => {
      cat.articles.forEach((article) => {
        if (
          article.q.toLowerCase().includes(q) ||
          article.a.toLowerCase().includes(q) ||
          article.tags.some((t) => t.includes(q))
        ) {
          results.push({ category: cat, article });
        }
      });
    });
    return results;
  }, [searchQuery]);

  /* Filtered categories */
  const filteredCategories = CATEGORIES.filter(
    (c) => audienceFilter === 'all' || c.audience === audienceFilter || c.audience === 'all'
  );

  /* Total article count */
  const totalArticles = CATEGORIES.reduce((sum, c) => sum + c.articles.length, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Hero ─── */}
      <section className="relative bg-linear-to-br from-primary-700 via-primary-800 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6">
            <LifebuoyIcon className="w-5 h-5 text-primary-200" />
            <span className="text-sm font-medium text-primary-100">Help Center</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            How can we help you?
          </h1>
          <p className="text-lg text-primary-200 max-w-2xl mx-auto mb-10">
            {totalArticles} detailed answers covering every feature of the Intemso platform.
            Search below or browse by category.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto relative">
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers... (e.g., &quot;escrow&quot;, &quot;connects&quot;, &quot;withdraw&quot;)"
              className="w-full pl-13 pr-5 py-4 rounded-2xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-300 text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {searchResults && (
            <p className="mt-4 text-sm text-primary-200">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found for &quot;{searchQuery}&quot;
            </p>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" className="w-full">
            <path d="M0 48V24C240 0 480 0 720 24C960 48 1200 48 1440 24V48H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ─── Search Results ─── */}
      {searchResults && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {searchResults.length === 0 ? (
            <div className="text-center py-12">
              <QuestionMarkCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 mb-6">Try different keywords or browse the categories below.</p>
              <button onClick={() => setSearchQuery('')} className="text-primary-600 font-medium hover:text-primary-700">
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map(({ category, article }) => (
                <div key={article.id}>
                  <span className="text-xs font-medium text-primary-600 mb-1 inline-block">{category.title}</span>
                  <Article article={article} isOpen={openArticles.has(article.id)} toggle={() => toggleArticle(article.id)} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ─── Quick Links ─── */}
      {!searchResults && (
        <>
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">Quick Links</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickLink icon={SparklesIcon} title="Getting Started Guide" desc="New to Intemso? Start here" href="/resources" color="bg-primary-500" />
              <QuickLink icon={CreditCardIcon} title="Pricing & Fees" desc="Connects, fee tiers, and costs" href="/pricing" color="bg-emerald-500" />
              <QuickLink icon={ShieldCheckIcon} title="Trust & Safety" desc="How we protect you" href="/trust" color="bg-blue-500" />
              <QuickLink icon={ChatBubbleLeftRightIcon} title="Contact Support" desc="Reach our team directly" href="/contact" color="bg-purple-500" />
            </div>
          </section>

          {/* ─── Audience Filter ─── */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse Help Topics</h2>
              <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
                {[
                  { key: 'all' as const, label: 'All Topics', icon: GlobeAltIcon },
                  { key: 'students' as const, label: 'Students', icon: AcademicCapIcon },
                  { key: 'employers' as const, label: 'Employers', icon: BuildingOffice2Icon },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { setAudienceFilter(tab.key); setActiveCategory(null); }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      audienceFilter === tab.key
                        ? 'bg-white text-primary-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ─── Category Grid ─── */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className={`text-left rounded-2xl border p-5 transition-all duration-300 ${
                    activeCategory === cat.id
                      ? 'border-primary-300 bg-primary-50 shadow-card ring-1 ring-primary-200'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl ${cat.color} flex items-center justify-center shrink-0`}>
                      <cat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{cat.title}</h3>
                      <span className="text-xs text-gray-400">{cat.articles.length} articles</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{cat.desc}</p>
                  {cat.audience !== 'all' && (
                    <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                      cat.audience === 'students' ? 'bg-primary-100 text-primary-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {cat.audience === 'students' ? 'For Students' : 'For Employers'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* ─── Active Category Articles ─── */}
          {activeCategory && (
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              {(() => {
                const cat = CATEGORIES.find((c) => c.id === activeCategory);
                if (!cat) return null;
                return (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center`}>
                        <cat.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{cat.title}</h3>
                        <p className="text-sm text-gray-500">{cat.articles.length} articles</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {cat.articles.map((article) => (
                        <Article
                          key={article.id}
                          article={article}
                          isOpen={openArticles.has(article.id)}
                          toggle={() => toggleArticle(article.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </section>
          )}

          {/* ─── All articles when no category selected ─── */}
          {!activeCategory && (
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              {filteredCategories.map((cat) => (
                <div key={cat.id} className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-9 h-9 rounded-xl ${cat.color} flex items-center justify-center`}>
                      <cat.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{cat.title}</h3>
                    {cat.audience !== 'all' && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        cat.audience === 'students' ? 'bg-primary-100 text-primary-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {cat.audience === 'students' ? 'Students' : 'Employers'}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    {cat.articles.map((article) => (
                      <Article
                        key={article.id}
                        article={article}
                        isOpen={openArticles.has(article.id)}
                        toggle={() => toggleArticle(article.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}
        </>
      )}

      {/* ─── Popular Topics Quick Access ─── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Most Common Questions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              { icon: CurrencyDollarIcon, q: 'How do service fees work?', id: 'pay-2' },
              { icon: LockClosedIcon, q: 'How does escrow protect me?', id: 'pay-1' },
              { icon: SparklesIcon, q: 'How do I earn free connects?', id: 'cn-3' },
              { icon: ClockIcon, q: 'What is 14-day auto-approval?', id: 'ct-5' },
              { icon: ScaleIcon, q: 'How do disputes work?', id: 'dis-2' },
              { icon: BanknotesIcon, q: 'How do I withdraw earnings?', id: 'wal-2' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory(null);
                  setOpenArticles(new Set([item.id]));
                  const cat = CATEGORIES.find((c) => c.articles.some((a) => a.id === item.id));
                  if (cat) setActiveCategory(cat.id);
                  setTimeout(() => {
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                }}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-card hover:border-primary-200 transition-all duration-300 text-left"
              >
                <item.icon className="w-6 h-6 text-primary-500 shrink-0" />
                <span className="text-sm font-medium text-gray-700">{item.q}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Platform Links ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Helpful Resources</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { icon: DocumentTextIcon, title: 'Terms of Service', href: '/terms', desc: 'Platform rules and agreements' },
            { icon: ShieldCheckIcon, title: 'Privacy Policy', href: '/privacy', desc: 'How we handle your data' },
            { icon: ScaleIcon, title: 'Dispute Resolution', href: '/dispute-resolution', desc: 'Full dispute process details' },
            { icon: CreditCardIcon, title: 'Escrow & Payments', href: '/escrow-terms', desc: 'Payment protection terms' },
            { icon: UserGroupIcon, title: 'Community Guidelines', href: '/community-guidelines', desc: 'Code of conduct' },
            { icon: ExclamationTriangleIcon, title: 'Acceptable Use', href: '/acceptable-use', desc: 'What you can and cannot do' },
            { icon: WrenchScrewdriverIcon, title: 'Intellectual Property', href: '/intellectual-property', desc: 'Ownership and licensing' },
            { icon: ArrowPathIcon, title: 'Refund Policy', href: '/refund-policy', desc: 'When and how refunds work' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start gap-3 rounded-xl border border-gray-100 p-4 hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-200"
            >
              <link.icon className="w-5 h-5 text-gray-400 group-hover:text-primary-500 mt-0.5 shrink-0 transition-colors" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{link.title}</h3>
                <p className="text-xs text-gray-500">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Still Need Help CTA ─── */}
      <section className="bg-linear-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <ChatBubbleLeftRightIcon className="w-14 h-14 text-primary-200 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-lg text-primary-200 max-w-xl mx-auto mb-10 leading-relaxed">
            Can&apos;t find what you&apos;re looking for? Our support team is ready to assist you
            with any questions about the platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto bg-white text-primary-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg"
            >
              Contact Support
            </Link>
            <Link
              href="/community"
              className="w-full sm:w-auto border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Ask in Community
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

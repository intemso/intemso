'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  AcademicCapIcon,
  BriefcaseIcon,
  BoltIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  SparklesIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  BanknotesIcon,
  LockClosedIcon,
  PencilSquareIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  HandThumbUpIcon,
  GiftIcon,
  PresentationChartBarIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  CheckIcon as CheckIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';

/* ─── Types ─── */

interface GuideSection {
  title: string;
  content: React.ReactNode;
}

interface Guide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  audience: 'Student' | 'Employer' | 'Both';
  icon: React.ElementType;
  color: string;
  badgeColor: string;
  readTime: string;
  sections: GuideSection[];
}

/* ─── Reusable components ─── */

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 my-4">
      <LightBulbIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="text-sm text-amber-800 leading-relaxed">{children}</div>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 my-4">
      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      <div className="text-sm text-red-700 leading-relaxed">{children}</div>
    </div>
  );
}

function StepList({ steps }: { steps: { title: string; desc: string }[] }) {
  return (
    <div className="space-y-4 my-4">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
              {i + 1}
            </span>
            {i < steps.length - 1 && <div className="w-0.5 flex-1 bg-primary-100 mt-1" />}
          </div>
          <div className="pb-4">
            <p className="text-sm font-semibold text-gray-900">{step.title}</p>
            <p className="text-sm text-gray-600 leading-relaxed mt-0.5">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 my-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <CheckIconSolid className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-2.5 font-semibold text-gray-900 border-b border-gray-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-gray-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Guide content ─── */

const GUIDES: Guide[] = [
  {
    id: 'hiring-guide',
    title: 'The Complete Hiring Guide',
    subtitle: 'For Employers',
    description: 'Everything you need to know about posting gigs, evaluating talent, managing contracts, and getting great results on Intemso.',
    audience: 'Employer',
    icon: BriefcaseIcon,
    color: 'bg-blue-50 text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700',
    readTime: '12 min read',
    sections: [
      {
        title: 'Getting Started as an Employer',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">Creating an employer account on Intemso is completely free and takes about two minutes. You can register using your email address or Ghana Card number. Once registered, you can immediately start posting gigs and browsing student profiles.</p>
            <StepList steps={[
              { title: 'Create your free account', desc: 'Visit the registration page and choose the Employer role. Provide your name, email or Ghana Card number, password, and company name.' },
              { title: 'Set up your profile', desc: 'Add your company logo, description, and industry. A complete profile helps students trust your gig listings and increases proposal quality.' },
              { title: 'Post your first gig', desc: 'Describe the work you need, set your budget, timeline, and any screening questions. Posting is completely free with no limits.' },
              { title: 'Review proposals and hire', desc: 'Browse incoming proposals, check student profiles, ratings, and badges. Chat with candidates before making your hiring decision.' },
            ]} />
            <Tip>Complete your company profile before posting gigs. Students are more likely to submit proposals to employers with a verified, professional looking profile.</Tip>
          </>
        ),
      },
      {
        title: 'Writing Effective Gig Listings',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">A well written gig listing attracts better proposals and helps you find the right student faster. Here is what makes a listing stand out.</p>
            <CheckList items={[
              'Use a clear, specific title. Instead of "Need help", write "Data Entry for 200 Product Listings into Google Sheets".',
              'Describe the scope of work in detail. Include what needs to be done, expected deliverables, and any specific tools or skills required.',
              'Set a realistic budget. Research comparable gigs on the platform to understand fair market rates.',
              'Define your timeline clearly. State when you need the work started and completed.',
              'Add screening questions. These help filter out generic proposals and identify students who truly understand the task.',
              'Specify the experience level you need: entry level, intermediate, or expert.',
              'Choose the right budget type: fixed price for defined scope, or hourly for ongoing work.',
              'Indicate your preferred location type: remote, on site, or hybrid.',
            ]} />
            <Warning>Avoid vague descriptions like "I will explain later" or "Message me for details". These result in low quality proposals and waste both your time and the students&apos; connects.</Warning>
          </>
        ),
      },
      {
        title: 'Evaluating Student Proposals',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">Each proposal from a student costs them 2 connects, so most students put genuine effort into their submissions. Here is how to evaluate them effectively.</p>
            <p className="text-sm text-gray-700 leading-relaxed mt-2 font-medium">What to look for in a strong proposal:</p>
            <CheckList items={[
              'A personalized cover letter that references your specific gig, not a generic template.',
              'Relevant experience or skills that match your requirements.',
              'A reasonable proposed rate that aligns with the complexity of the work.',
              'Clear understanding of the deliverables and timeline.',
              'Thoughtful answers to your screening questions.',
              'A complete student profile with portfolio work, reviews, and skill tags.',
            ]} />
            <p className="text-sm text-gray-700 leading-relaxed mt-3 font-medium">Understanding Talent Badges:</p>
            <InfoTable
              headers={['Badge', 'Requirements', 'What It Means']}
              rows={[
                ['Rising Talent', 'At least 1 gig completed, verified', 'New but promising student with a successful delivery'],
                ['Top Rated', '10+ gigs, 12+ weeks active, GH\u20B550,000+ earned', 'Consistently excellent work over an extended period'],
                ['Top Rated Plus', 'GH\u20B5200,000+ earned, invitation only', 'Elite talent with exceptional track record on the platform'],
              ]}
            />
            <Tip>Don&apos;t rely solely on badges. A new student without a badge may be an excellent fit for your gig. Read their cover letter and portfolio carefully.</Tip>
          </>
        ),
      },
      {
        title: 'Managing Contracts and Milestones',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">Once you hire a student, a contract is created. You can structure payments using milestones, which break the project into manageable phases.</p>
            <StepList steps={[
              { title: 'Fund the first milestone', desc: 'Deposit the agreed amount into the secure escrow account. The student cannot start work until funding is confirmed.' },
              { title: 'Student works on the milestone', desc: 'The student completes the work and submits deliverables through the platform. You will receive a notification when the submission is ready.' },
              { title: 'Review and respond', desc: 'You have three options: approve (releases payment), request a revision (up to 2 per milestone), or raise a dispute if deliverables do not meet specifications.' },
              { title: 'Move to the next milestone', desc: 'Once satisfied, fund the next milestone. Repeat until the project is complete.' },
            ]} />
            <Warning>If you do not respond to a deliverable submission within 14 days, the payment will automatically release to the student. Set reminders to review work promptly.</Warning>
          </>
        ),
      },
      {
        title: 'Payment and Escrow for Employers',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">As an employer, you never pay any service fees, subscriptions, or hidden charges. You only pay the agreed budget for the gig, which is held securely in escrow.</p>
            <p className="text-sm text-gray-700 leading-relaxed mt-2 font-medium">Supported payment methods:</p>
            <CheckList items={[
              'Mobile money: MTN, Vodafone, AirtelTigo.',
              'Debit and credit cards: Visa and Mastercard.',
              'Bank transfer.',
            ]} />
            <p className="text-sm text-gray-700 leading-relaxed mt-3">All payments are processed through Paystack, a Bank of Ghana licensed payment processor. Your money is held in a secure escrow account and only released to the student when you approve their delivered work. If you are not satisfied, you can request up to 2 revisions per milestone or initiate a dispute.</p>
            <Tip>You can send bonus payments to a student directly from an active contract at any time. Bonuses go straight to the student&apos;s wallet with no minimum amount.</Tip>
          </>
        ),
      },
    ],
  },
  {
    id: 'winning-proposals',
    title: 'Writing Winning Proposals',
    subtitle: 'For Students',
    description: 'Learn how to craft proposals that stand out, get noticed, and win gigs consistently on the platform.',
    audience: 'Student',
    icon: PencilSquareIcon,
    color: 'bg-green-50 text-green-600',
    badgeColor: 'bg-green-100 text-green-700',
    readTime: '10 min read',
    sections: [
      {
        title: 'Understanding the Proposal System',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">On Intemso, submitting a proposal costs 2 connects. You receive 15 free connects every month, which means you can submit up to 7 proposals per month at no cost. Unused connects roll over to the next month, up to a maximum of 80.</p>
            <p className="text-sm text-gray-700 leading-relaxed mt-2">Because each proposal has a cost, it is important to be strategic. Do not spray generic proposals across dozens of gigs. Instead, focus on gigs that match your skills and write thoughtful, customized proposals.</p>
            <InfoTable
              headers={['Connect Source', 'Amount', 'Details']}
              rows={[
                ['Monthly free connects', '15/month', 'Refreshed on the 1st, rollover up to 80'],
                ['10 Pack', 'GH\u20B55', 'GH\u20B50.50 per connect'],
                ['20 Pack (Most Popular)', 'GH\u20B59', 'GH\u20B50.45 per connect, 10% savings'],
                ['40 Pack (Best Value)', 'GH\u20B516', 'GH\u20B50.40 per connect, 20% savings'],
              ]}
            />
            <Tip>If an employer declines your proposal, the connects you spent are automatically refunded. You only lose connects when your proposal is ignored or when you withdraw it yourself.</Tip>
          </>
        ),
      },
      {
        title: 'Anatomy of a Winning Cover Letter',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">Your cover letter is the single most important part of your proposal. It is the first thing an employer reads. Here is the structure of a cover letter that consistently wins gigs.</p>
            <StepList steps={[
              { title: 'Open with a hook', desc: 'Reference the specific gig and show you understand what the employer needs. For example: "I noticed you need 200 product listings entered into Google Sheets. I have done similar data entry projects for three other clients on Intemso and can deliver this in two days."' },
              { title: 'Demonstrate relevant experience', desc: 'Mention specific past work, skills, or coursework that directly relate to the gig. Use concrete numbers: "I typed 5,000 entries for a previous client with 99.8% accuracy."' },
              { title: 'Explain your approach', desc: 'Briefly outline how you would tackle the project. This shows you have thought about the work and are not just copy pasting a template.' },
              { title: 'State your proposed rate and timeline', desc: 'Be specific: "I can complete this within 3 days at GH\u20B5150 for the entire project." This gives the employer clarity and confidence.' },
              { title: 'End with a call to action', desc: 'Invite them to discuss further: "I am available to start immediately and would be happy to discuss any details over chat."' },
            ]} />
            <Warning>Never copy paste the same cover letter for every gig. Employers can tell instantly when a proposal is generic, and it will almost always be skipped.</Warning>
          </>
        ),
      },
      {
        title: 'Screening Questions Strategy',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">Many employers include screening questions with their gig listings. These are designed to filter out students who did not read the gig description. Answering them thoughtfully can immediately put you ahead of the competition.</p>
            <CheckList items={[
              'Read each question carefully before answering. Do not rush through them.',
              'Give specific, detailed answers. "Yes I can do this" is not enough. Explain how and why.',
              'If a question asks about your experience, give a concrete example with results.',
              'If you do not have direct experience, be honest and explain transferable skills you can bring.',
              'Match the tone of the gig listing. Professional gigs need professional answers.',
            ]} />
            <Tip>Screening questions are your secret weapon. Many students skip them or answer carelessly. Putting effort into these answers dramatically increases your chances of getting hired.</Tip>
          </>
        ),
      },
      {
        title: 'Pricing Your Proposals',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">Setting the right rate is crucial. Price too high and employers will skip you. Price too low and you undervalue your work. Here is how to find the sweet spot.</p>
            <CheckList items={[
              'Research similar gigs on the platform to understand the going rate for your type of work.',
              'Factor in your experience level. If you are new, consider pricing slightly below market to build your reputation.',
              'Account for the service fee. Remember that 20% is deducted from your first GH\u20B5500 with a new client, 10% for the next GH\u20B51,500, and 5% after GH\u20B52,000.',
              'For fixed price gigs, estimate the total hours needed and calculate a fair hourly equivalent.',
              'For hourly gigs, track your time honestly. Employers can see your logged hours and descriptions.',
              'Do not race to the bottom. Quality employers are willing to pay fair rates for reliable work.',
            ]} />
            <InfoTable
              headers={['Lifetime with Client', 'Fee Rate', 'You Keep (on GH\u20B5100)']}
              rows={[
                ['First GH\u20B5500', '20%', 'GH\u20B580'],
                ['GH\u20B5500 to GH\u20B52,000', '10%', 'GH\u20B590'],
                ['Above GH\u20B52,000', '5%', 'GH\u20B595'],
              ]}
            />
            <Tip>Building long term relationships with the same employer is financially smart. Your service fee drops from 20% to just 5% as you earn more with the same client.</Tip>
          </>
        ),
      },
    ],
  },
  {
    id: 'setting-rates',
    title: 'Setting Your Rates',
    subtitle: 'For Students',
    description: 'A comprehensive guide to pricing your services competitively, understanding the fee structure, and maximizing your earnings.',
    audience: 'Student',
    icon: CurrencyDollarIcon,
    color: 'bg-purple-50 text-purple-600',
    badgeColor: 'bg-purple-100 text-purple-700',
    readTime: '8 min read',
    sections: [
      {
        title: 'Understanding Market Rates',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">Pricing your services on Intemso depends on several factors: the type of work, the complexity, your experience level, and the market demand. Here is a general framework for common gig categories.</p>
            <InfoTable
              headers={['Gig Category', 'Entry Level', 'Intermediate', 'Expert']}
              rows={[
                ['Errands & Delivery', 'GH\u20B520 to 40', 'GH\u20B540 to 80', 'GH\u20B580 to 150'],
                ['Typing & Data Entry', 'GH\u20B530 to 60', 'GH\u20B560 to 120', 'GH\u20B5120 to 250'],
                ['Tutoring & Academic Help', 'GH\u20B540 to 80', 'GH\u20B580 to 150', 'GH\u20B5150 to 300'],
                ['Social Media & Content', 'GH\u20B550 to 100', 'GH\u20B5100 to 200', 'GH\u20B5200 to 500'],
                ['Photography & Video', 'GH\u20B580 to 150', 'GH\u20B5150 to 300', 'GH\u20B5300 to 800'],
                ['Web & App Development', 'GH\u20B5100 to 250', 'GH\u20B5250 to 600', 'GH\u20B5600 to 2,000'],
                ['Writing & Translation', 'GH\u20B540 to 80', 'GH\u20B580 to 200', 'GH\u20B5200 to 500'],
                ['Creative & Design', 'GH\u20B560 to 120', 'GH\u20B5120 to 300', 'GH\u20B5300 to 800'],
              ]}
            />
            <p className="text-xs text-gray-400 mt-1">These are approximate ranges per project. Actual rates vary based on scope, urgency, and complexity.</p>
            <Tip>When you are just starting, consider pricing at the lower end of your category to build reviews and earn your first talent badge. Once you have a few positive reviews, you can gradually increase your rates.</Tip>
          </>
        ),
      },
      {
        title: 'The Service Fee in Detail',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">Intemso uses a sliding scale fee structure that rewards loyalty. The more you earn with the same employer, the lower your fee drops. This is calculated per employer, not across all your clients.</p>
            <StepList steps={[
              { title: 'New client relationship: 20%', desc: 'On your first GH\u20B5500 earned with a specific employer, the service fee is 20%. On a GH\u20B5100 payment, you receive GH\u20B580.' },
              { title: 'Growing relationship: 10%', desc: 'Once your lifetime earnings with that employer pass GH\u20B5500, the fee drops to 10%. On a GH\u20B5100 payment, you receive GH\u20B590.' },
              { title: 'Established partnership: 5%', desc: 'After GH\u20B52,000 in lifetime earnings with the same employer, you keep 95% of every payment.' },
            ]} />
            <p className="text-sm text-gray-700 leading-relaxed mt-2">Blended fees apply when a payment crosses tier boundaries. For example, if you have earned GH\u20B5400 with a client and receive a GH\u20B5200 payment, the first GH\u20B5100 is charged at 20% and the remaining GH\u20B5100 at 10%.</p>
            <Tip>You can see your current fee tier for each employer in your contract dashboard. Plan to build long term relationships with employers you enjoy working with.</Tip>
          </>
        ),
      },
      {
        title: 'Fixed Price vs Hourly',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">Intemso supports both fixed price and hourly billing. Choosing the right model affects your earnings and how employers perceive your value.</p>
            <InfoTable
              headers={['', 'Fixed Price', 'Hourly']}
              rows={[
                ['Best for', 'Well defined projects with clear scope', 'Ongoing work or tasks with uncertain scope'],
                ['Payment trigger', 'On milestone completion and approval', 'Weekly billing cycle (every Monday)'],
                ['Risk to you', 'Scope creep if not defined clearly', 'Lower if hours are tracked honestly'],
                ['Employer preference', 'Preferred for one off tasks', 'Preferred for long term or evolving work'],
                ['Your advantage', 'Earn more if you work efficiently', 'Guaranteed pay for every hour worked'],
              ]}
            />
            <CheckList items={[
              'For fixed price gigs, break the work into milestones so you get paid in phases rather than all at the end.',
              'For hourly gigs, log your time entries daily with clear descriptions of what you worked on.',
              'If a fixed price gig has unclear scope, ask the employer to clarify before you accept. This prevents disputes later.',
            ]} />
          </>
        ),
      },
      {
        title: 'Strategies to Maximize Earnings',
        content: (
          <>
            <CheckList items={[
              'Focus on repeat clients. Your service fee drops from 20% to 5% as you build history with the same employer.',
              'Upsell your services. Once you complete a gig well, offer to handle related tasks for the same client.',
              'Invest in your profile. A complete profile with portfolio pieces, certifications, and a professional photo earns 10 bonus connects and attracts better paying gigs.',
              'Earn bonus connects by completing gigs (+5), leaving reviews (+1), receiving 5 star reviews (+3), and logging in daily (+1).',
              'Do not undercut yourself. Competing on price alone attracts low quality clients. Compete on value and quality instead.',
              'Ask for reviews. A strong review history significantly increases your visibility and the rates employers are willing to pay.',
              'Specialize. Students who focus on a specific niche (for example, academic research assistance or social media management) tend to charge higher rates than generalists.',
            ]} />
          </>
        ),
      },
    ],
  },
  {
    id: 'managing-milestones',
    title: 'Managing Milestones',
    subtitle: 'For Students & Employers',
    description: 'A comprehensive guide to structuring projects into milestones, managing deliverables, and ensuring smooth project completion.',
    audience: 'Both',
    icon: PresentationChartBarIcon,
    color: 'bg-amber-50 text-amber-600',
    badgeColor: 'bg-amber-100 text-amber-700',
    readTime: '9 min read',
    sections: [
      {
        title: 'What Are Milestones?',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">Milestones break a project into smaller, manageable phases. Each milestone has its own deliverables, budget, and timeline. When a milestone is funded, the money enters escrow. When the student delivers and the employer approves, the payment is released.</p>
            <p className="text-sm text-gray-700 leading-relaxed mt-2">This structure protects both parties. Employers pay only for completed work. Students get paid in phases instead of waiting until the entire project is finished.</p>
            <StepList steps={[
              { title: 'Define milestones during contract setup', desc: 'When creating a contract, break the project into logical phases. Each milestone should have a clear title, description, amount, and expected completion date.' },
              { title: 'Fund the first milestone', desc: 'The employer deposits the milestone amount into escrow before work begins. No work should start before funding is confirmed.' },
              { title: 'Submit deliverables', desc: 'The student uploads completed work through the platform when the milestone is done. Include all required files and a summary of what was delivered.' },
              { title: 'Review and approve', desc: 'The employer reviews the submission. They can approve (releasing payment), request a revision (up to 2 times), or raise a dispute.' },
              { title: 'Repeat for subsequent milestones', desc: 'Once approved, the employer funds the next milestone and the cycle continues until the project is complete.' },
            ]} />
          </>
        ),
      },
      {
        title: 'How to Structure Milestones Effectively',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">For Employers:</p>
            <CheckList items={[
              'Each milestone should represent a meaningful, reviewable piece of work.',
              'Avoid milestones that are too large. Break a GH\u20B51,000 project into four GH\u20B5250 milestones rather than two GH\u20B5500 milestones.',
              'Define clear acceptance criteria for each milestone. What specifically will you check to decide if the work is satisfactory?',
              'Front load smaller milestones. Start with a smaller first milestone to evaluate the student&apos;s work quality before committing to larger payments.',
              'Include a buffer milestone at the end for final revisions and polish.',
            ]} />
            <p className="text-sm text-gray-700 leading-relaxed font-medium mt-4">For Students:</p>
            <CheckList items={[
              'Propose milestones in your proposal if the employer has not defined them. This shows professionalism and planning.',
              'Make each milestone deliverable something tangible and demonstrable.',
              'Do not start work on a milestone until funding is confirmed in escrow.',
              'Submit your work through the platform, not through external channels. This protects you if a dispute arises.',
              'Write a clear summary of what you delivered with each submission. Do not just upload files without context.',
            ]} />
          </>
        ),
      },
      {
        title: 'Revisions and the 14 Day Rule',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">After a student submits deliverables, the employer has three options: approve, request a revision, or raise a dispute. Here are the rules.</p>
            <InfoTable
              headers={['Rule', 'Detail']}
              rows={[
                ['Maximum revisions per milestone', '2 rounds. After 2 revision requests, the employer must either approve or dispute.'],
                ['Revision requests', 'Must include specific, written instructions about what needs to change. Vague requests like "make it better" are not acceptable.'],
                ['Auto approval period', '14 days. If the employer does not respond within 14 days of submission, the payment automatically releases to the student.'],
                ['Scope changes', 'Neither party can unilaterally change a funded milestone&apos;s scope or payment amount. Changes require mutual agreement and may need additional funding.'],
              ]}
            />
            <Warning>Students: never agree to scope changes outside the platform. If an employer asks for additional work beyond the milestone, request that a new milestone be created and funded before you begin.</Warning>
          </>
        ),
      },
      {
        title: 'Common Milestone Mistakes to Avoid',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">Employer mistakes:</p>
            <CheckList items={[
              'Setting milestones that are too vague ("Phase 1: Do stuff"). Each milestone needs specific, measurable deliverables.',
              'Forgetting to review submissions promptly. Set calendar reminders so you do not trigger the 14 day auto release accidentally.',
              'Using the revision system to add new work. Revisions are for fixing what was agreed, not for expanding the scope.',
            ]} />
            <p className="text-sm text-gray-700 leading-relaxed font-medium mt-4">Student mistakes:</p>
            <CheckList items={[
              'Starting work before the milestone is funded. Always wait for escrow confirmation.',
              'Submitting incomplete work to "beat the clock". Rushed submissions lead to revision requests and hurt your rating.',
              'Not reading the milestone requirements carefully. Reread the requirements before submitting to catch oversights.',
            ]} />
          </>
        ),
      },
    ],
  },
  {
    id: 'building-portfolio',
    title: 'Building Your Portfolio',
    subtitle: 'For Students',
    description: 'Learn how to showcase your best work, build a compelling profile, and attract more clients on Intemso.',
    audience: 'Student',
    icon: PhotoIcon,
    color: 'bg-pink-50 text-pink-600',
    badgeColor: 'bg-pink-100 text-pink-700',
    readTime: '7 min read',
    sections: [
      {
        title: 'Why Your Profile Matters',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">Your profile is your storefront on Intemso. When an employer receives your proposal, the first thing they do is click on your profile to evaluate you. A strong profile can be the difference between getting hired and getting ignored.</p>
            <p className="text-sm text-gray-700 leading-relaxed mt-2">A complete profile also earns you 10 bonus connects, which is enough for 5 additional proposals.</p>
            <p className="text-sm text-gray-700 leading-relaxed mt-3 font-medium">Profile completeness checklist:</p>
            <CheckList items={[
              'Professional profile photo (clear headshot, not a group or landscape photo).',
              'Professional title that describes what you do (for example, "Graphic Designer & Social Media Manager").',
              'A compelling bio that highlights your skills, experience, and what employers can expect from working with you.',
              'University and expected graduation date.',
              'Relevant skills tags (at least 5, up to 15).',
              'An honest hourly rate or rate range.',
              'At least one portfolio piece showcasing your work.',
            ]} />
          </>
        ),
      },
      {
        title: 'Creating Showcase Pieces',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">The Intemso Showcase feature lets you display your best work publicly. Think of it as your digital portfolio. Each showcase piece should demonstrate a specific skill or an outcome you delivered.</p>
            <StepList steps={[
              { title: 'Choose your best work', desc: 'Select projects that demonstrate tangible results. Before and after screenshots, completed deliverables, or case studies work well.' },
              { title: 'Write a compelling description', desc: 'Explain the challenge you faced, the approach you took, and the result you achieved. Use specific numbers where possible.' },
              { title: 'Upload high quality visuals', desc: 'Use clear images, screenshots, or PDFs. Low quality or blurry uploads reflect poorly on your professionalism.' },
              { title: 'Tag relevant skills', desc: 'Add skill tags so your showcase pieces appear when employers search for those skills.' },
            ]} />
            <Tip>You do not need paid client work to build a portfolio. Create sample projects, volunteer work, university assignments, or personal projects. What matters is demonstrating your capability, not who paid you for it.</Tip>
          </>
        ),
      },
      {
        title: 'Reviews and Reputation',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">Reviews are the most powerful trust signal on Intemso. Employers rely heavily on reviews when making hiring decisions. Here is how to build a strong review history.</p>
            <CheckList items={[
              'Deliver quality work on time. This is the foundation of good reviews.',
              'Communicate proactively. Update your employer on progress without being asked.',
              'Be responsive to messages. Employers value students who reply within a few hours.',
              'Ask for a review after successfully completing a gig. A polite message thanking them and requesting a review is appropriate.',
              'Leave reviews for your employers too. You earn 1 bonus connect for each review you write.',
              'Handle negative feedback professionally. If an employer raises concerns, address them constructively rather than defensively.',
            ]} />
            <InfoTable
              headers={['Review Metric', 'Impact']}
              rows={[
                ['Overall rating (1 to 5 stars)', 'Primary factor in search ranking and employer decisions'],
                ['Number of reviews', 'More reviews increase trust and credibility'],
                ['Review recency', 'Recent reviews carry more weight than old ones'],
                ['Written feedback', 'Detailed comments help future employers understand your strengths'],
              ]}
            />
            <Tip>Receiving a 5 star review earns you 3 bonus connects. Consistently delivering great work creates a virtuous cycle: better reviews lead to better gigs, which lead to more reviews and higher earnings.</Tip>
          </>
        ),
      },
      {
        title: 'Earning Talent Badges',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">Talent badges are displayed on your profile and in search results. They signal to employers that you have been vetted by the platform and have a proven track record.</p>
            <InfoTable
              headers={['Badge', 'How to Earn It']}
              rows={[
                ['Rising Talent', 'Complete at least 1 gig, maintain a high Job Success Score, and verify your identity'],
                ['Top Rated', 'Complete 10+ gigs, stay active for 12+ weeks, earn GH\u20B550,000+ lifetime, and maintain a 90+ Job Success Score'],
                ['Top Rated Plus', 'Earn GH\u20B5200,000+ lifetime. This badge is by invitation only and reserved for the very best on the platform'],
              ]}
            />
            <p className="text-sm text-gray-700 leading-relaxed mt-2">Focus on earning the Rising Talent badge first. Complete your first gig with a great rating and verify your account. This badge appears on your profile and proposals, significantly increasing employer confidence.</p>
          </>
        ),
      },
    ],
  },
  {
    id: 'escrow-payments',
    title: 'Escrow & Payments Explained',
    subtitle: 'For Students & Employers',
    description: 'Understand how the escrow system works, how payments flow, withdrawal options, and how both parties are protected.',
    audience: 'Both',
    icon: ShieldCheckIcon,
    color: 'bg-teal-50 text-teal-600',
    badgeColor: 'bg-teal-100 text-teal-700',
    readTime: '11 min read',
    sections: [
      {
        title: 'How Escrow Works',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">Escrow is the backbone of payment security on Intemso. It ensures that employers only pay for work that meets their expectations, and students are guaranteed payment for approved deliverables.</p>
            <StepList steps={[
              { title: 'Employer funds escrow', desc: 'When a contract is created, the employer deposits the agreed amount (or first milestone amount) via Paystack. The money is held in a secure escrow account, accessible to neither party.' },
              { title: 'Student performs work', desc: 'With funding confirmed, the student begins work on the agreed deliverables. The escrowed funds cannot be withdrawn by either party during this phase.' },
              { title: 'Student submits deliverables', desc: 'The student uploads all completed work through the platform, including files, descriptions, and any required documentation.' },
              { title: 'Employer reviews submission', desc: 'The employer receives a notification and reviews the deliverables. They can approve, request a revision (up to 2 times), or raise a dispute.' },
              { title: 'Payment releases', desc: 'Upon approval, the service fee is deducted and the net amount is credited to the student&apos;s wallet. If the employer does not respond within 14 days, funds automatically release.' },
              { title: 'Student withdraws earnings', desc: 'The student can withdraw their wallet balance at any time via mobile money or bank transfer. No minimum withdrawal amount.' },
            ]} />
          </>
        ),
      },
      {
        title: 'For Employers: What You Pay',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">As an employer on Intemso, you pay zero platform fees. There is no subscription, no listing fee, and no percentage charged on your payments. You only pay the agreed project amount.</p>
            <InfoTable
              headers={['Item', 'Cost']}
              rows={[
                ['Account creation', 'Free'],
                ['Posting gigs', 'Free (unlimited)'],
                ['Browsing talent', 'Free'],
                ['Hiring students', 'Free'],
                ['Project payment', 'The agreed budget amount only'],
                ['Service fees', 'None (students pay the service fee)'],
                ['Bonus payments', 'The bonus amount you choose (GH\u20B51 minimum)'],
              ]}
            />
            <p className="text-sm text-gray-700 leading-relaxed mt-2 font-medium">Supported payment methods:</p>
            <CheckList items={[
              'Mobile money: MTN, Vodafone Cash, AirtelTigo Money.',
              'Debit and credit cards: Visa and Mastercard.',
              'Bank transfers.',
            ]} />
            <p className="text-sm text-gray-700 leading-relaxed mt-2">All transactions are processed in Ghana Cedis (GH\u20B5) through Paystack, a Bank of Ghana licensed payment processor.</p>
          </>
        ),
      },
      {
        title: 'For Students: Earnings and Withdrawals',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">When an employer approves your work, the payment enters your Intemso wallet after the service fee is deducted. Your wallet has two balances.</p>
            <InfoTable
              headers={['Balance Type', 'What It Means']}
              rows={[
                ['Available balance', 'Money you can withdraw immediately'],
                ['Pending balance', 'Funds currently in escrow, awaiting milestone approval or auto release'],
              ]}
            />
            <p className="text-sm text-gray-700 leading-relaxed mt-3 font-medium">Withdrawal options:</p>
            <CheckList items={[
              'Mobile money wallet (MTN, Vodafone, AirtelTigo). Typical processing: same day to one business day.',
              'Bank account transfer. Typical processing: one to two business days.',
              'No minimum withdrawal amount.',
              'Daily withdrawal limit: GH\u20B510,000.',
              'Auto withdraw option available for hands free payouts.',
            ]} />
            <Tip>You can set up auto withdrawal in your dashboard settings. When enabled, your available balance is automatically transferred to your preferred payout method at regular intervals.</Tip>
          </>
        ),
      },
      {
        title: 'Dispute Resolution Process',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">If a disagreement arises during a contract, Intemso provides a structured dispute resolution process designed to reach fair outcomes.</p>
            <StepList steps={[
              { title: 'Stage 1: Direct Resolution (7 days)', desc: 'Both parties attempt to resolve the issue directly through the platform messaging system. Most disputes are resolved at this stage.' },
              { title: 'Stage 2: Intemso Mediation (up to 14 days)', desc: 'If direct resolution fails, Intemso reviews the case. Possible outcomes include full payment release, full refund, partial split, revision required, or mutual cancellation.' },
              { title: 'Stage 3: Formal Escalation', desc: 'If mediation does not resolve the issue, the dispute can be escalated under the Alternative Dispute Resolution Act 2010 (Act 798) or to the courts of Ghana.' },
            ]} />
            <p className="text-sm text-gray-700 leading-relaxed mt-2">During a dispute, escrowed funds are frozen and accessible to neither party until the dispute is resolved. The 14 day auto release timer pauses during active disputes.</p>
            <Warning>Disputes must be filed within 30 days of the triggering event. Frivolous or bad faith disputes may result in penalties, including account restrictions.</Warning>
          </>
        ),
      },
      {
        title: 'Hourly Contract Billing',
        content: (
          <>
            <p className="text-sm text-gray-700 leading-relaxed">For hourly contracts, billing works on a weekly cycle. Students log time entries throughout the week, and employers are charged automatically every Monday at midnight GMT.</p>
            <InfoTable
              headers={['Aspect', 'Detail']}
              rows={[
                ['Billing cycle', 'Weekly, every Monday at 00:00 GMT'],
                ['Time entries', 'Student logs hours with description and date worked'],
                ['Charge method', 'Employer&apos;s saved payment method is charged automatically'],
                ['Fee calculation', 'Subtotal (hours times rate) minus sliding scale service fee'],
                ['Dispute window', 'Employers can review and dispute time entries before billing'],
              ]}
            />
            <Tip>Students: log your time daily rather than in bulk at the end of the week. Detailed daily entries are easier for employers to verify and lead to fewer billing disputes.</Tip>
          </>
        ),
      },
    ],
  },
];

/* ─── Category filter tabs ─── */

const AUDIENCE_FILTERS = [
  { label: 'All Guides', value: 'all', icon: BookOpenIcon },
  { label: 'For Students', value: 'Student', icon: AcademicCapIcon },
  { label: 'For Employers', value: 'Employer', icon: BriefcaseIcon },
  { label: 'For Both', value: 'Both', icon: UserGroupIcon },
];

/* ─── Reading progress hook ─── */
function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handler = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min((scrolled / total) * 100, 100) : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return progress;
}

/* ═══════════════════════════════
   MAIN PAGE
   ═══════════════════════════════ */

export default function ResourcesPage() {
  const [filter, setFilter] = useState('all');
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const readingProgress = useReadingProgress();

  const filteredGuides = filter === 'all' ? GUIDES : GUIDES.filter((g) => g.audience === filter);

  const toggleSection = (guideId: string, sectionIndex: number) => {
    const key = `${guideId}-${sectionIndex}`;
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAllSections = (guideId: string, sectionCount: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      const allExpanded = Array.from({ length: sectionCount }, (_, i) => `${guideId}-${i}`).every((k) => next.has(k));
      if (allExpanded) {
        for (let i = 0; i < sectionCount; i++) next.delete(`${guideId}-${i}`);
      } else {
        for (let i = 0; i < sectionCount; i++) next.add(`${guideId}-${i}`);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Reading progress bar */}
      {expandedGuide && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-100">
          <div
            className="h-full bg-primary-600 transition-all duration-150"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-400/15 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-20 sm:pb-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <BookOpenIcon className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-medium text-primary-100">Learn &amp; Grow</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Resource Center
            </h1>
            <p className="text-base sm:text-lg text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Comprehensive guides, practical tips, and detailed walkthroughs for students and employers. Everything you need to succeed on Intemso.
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mt-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/10">
                <p className="text-xl sm:text-2xl font-bold">{GUIDES.length}</p>
                <p className="text-xs text-primary-200">Guides</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/10">
                <p className="text-xl sm:text-2xl font-bold">{GUIDES.reduce((a, g) => a + g.sections.length, 0)}</p>
                <p className="text-xs text-primary-200">Sections</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/10">
                <p className="text-xl sm:text-2xl font-bold">Free</p>
                <p className="text-xs text-primary-200">Always</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V30C360 0 720 0 1080 30C1260 45 1350 55 1440 30V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══ FILTER TABS ═══ */}
      <section className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {AUDIENCE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setExpandedGuide(null); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f.value
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <f.icon className="w-4 h-4" />
                {f.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">
              {filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </section>

      {/* ═══ GUIDE CARDS or EXPANDED GUIDE ═══ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!expandedGuide ? (
            /* ── Card Grid ── */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => {
                    setExpandedGuide(guide.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 text-left group hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 relative overflow-hidden"
                >
                  {/* Top accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${
                    guide.audience === 'Student' ? 'from-green-400 to-emerald-500' :
                    guide.audience === 'Employer' ? 'from-blue-400 to-indigo-500' :
                    'from-amber-400 to-orange-500'
                  }`} />

                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${guide.color}`}>
                      <guide.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${guide.badgeColor}`}>
                      {guide.audience === 'Both' ? 'Students & Employers' : guide.audience}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{guide.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {guide.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <DocumentTextIcon className="w-3.5 h-3.5" />
                        {guide.sections.length} sections
                      </span>
                    </div>
                    <span className="text-primary-600 group-hover:translate-x-1 transition-transform">
                      <ArrowRightIcon className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* ── Expanded Guide View ── */
            (() => {
              const guide = GUIDES.find((g) => g.id === expandedGuide);
              if (!guide) return null;
              const allExpanded = guide.sections.every((_, i) => expandedSections.has(`${guide.id}-${i}`));

              return (
                <div className="max-w-3xl mx-auto">
                  {/* Back button */}
                  <button
                    onClick={() => setExpandedGuide(null)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors"
                  >
                    <ChevronRightIcon className="w-4 h-4 rotate-180" />
                    Back to all guides
                  </button>

                  {/* Guide header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${guide.color}`}>
                        <guide.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${guide.badgeColor}`}>
                          {guide.subtitle}
                        </span>
                      </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{guide.title}</h1>
                    <p className="text-gray-500 leading-relaxed">{guide.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {guide.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <DocumentTextIcon className="w-4 h-4" />
                        {guide.sections.length} sections
                      </span>
                    </div>
                  </div>

                  {/* Table of contents */}
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-900">Table of Contents</h3>
                      <button
                        onClick={() => expandAllSections(guide.id, guide.sections.length)}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {allExpanded ? 'Collapse all' : 'Expand all'}
                      </button>
                    </div>
                    <ol className="space-y-1.5">
                      {guide.sections.map((section, i) => (
                        <li key={i}>
                          <button
                            onClick={() => toggleSection(guide.id, i)}
                            className="text-sm text-gray-600 hover:text-primary-600 text-left flex items-center gap-2 transition-colors"
                          >
                            <span className="text-xs text-gray-400 font-mono w-4">{i + 1}.</span>
                            {section.title}
                          </button>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Sections */}
                  <div className="space-y-3">
                    {guide.sections.map((section, i) => {
                      const sectionKey = `${guide.id}-${i}`;
                      const isOpen = expandedSections.has(sectionKey);

                      return (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleSection(guide.id, i)}
                            className="w-full flex items-center justify-between p-5 text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
                                {i + 1}
                              </span>
                              <h2 className="text-base font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                                {section.title}
                              </h2>
                            </div>
                            <ChevronDownIcon className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-600' : ''}`} />
                          </button>
                          <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-1250' : 'max-h-0'}`}>
                            <div className="px-5 pb-6 border-t border-gray-100 pt-4">
                              {section.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom navigation */}
                  <div className="mt-10 pt-8 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <button
                        onClick={() => {
                          setExpandedGuide(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1.5 transition-colors"
                      >
                        <ChevronRightIcon className="w-4 h-4 rotate-180" />
                        Back to all guides
                      </button>
                      {(() => {
                        const idx = GUIDES.findIndex((g) => g.id === guide.id);
                        const next = GUIDES[idx + 1];
                        if (!next) return null;
                        return (
                          <button
                            onClick={() => {
                              setExpandedGuide(next.id);
                              setExpandedSections(new Set());
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5 transition-colors"
                          >
                            Next: {next.title}
                            <ArrowRightIcon className="w-4 h-4" />
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      {!expandedGuide && (
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Ready to Put These Tips into Action?
              </h2>
              <p className="text-gray-500 mb-8">
                Join Intemso today and start earning as a student or hiring talented university students for your projects.
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
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

import Link from 'next/link';
import { MagnifyingGlassIcon, ChatBubbleLeftRightIcon, BookOpenIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const CATEGORIES = [
  { title: 'Getting Started', items: ['Creating your account', 'Verifying your university email', 'Building your profile', 'Submitting your first proposal'] },
  { title: 'Payments & Billing', items: ['How escrow works', 'Withdrawal methods', 'Understanding service fees', 'Buying connects'] },
  { title: 'Managing Gigs', items: ['Working with milestones', 'Communicating with clients', 'Submitting deliverables', 'Handling revisions'] },
  { title: 'Account & Security', items: ['Changing your password', 'Two-factor authentication', 'Privacy settings', 'Deleting your account'] },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-linear-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            Find answers to common questions or reach out to our support team.
          </p>
          <div className="max-w-xl mx-auto relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search for help..." className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {CATEGORIES.map((cat) => (
            <div key={cat.title} className="border border-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{cat.title}</h3>
              <ul className="space-y-2">
                {cat.items.map((item) => (
                  <li key={item}>
                    <span className="text-sm text-primary-600 hover:underline cursor-pointer">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Still need help?</h2>
          <p className="text-gray-600 mb-6">Our support team is available 24/7 to assist you.</p>
          <Link href="/contact" className="btn-primary">Contact Support</Link>
        </div>
      </section>
    </div>
  );
}

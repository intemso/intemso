import Link from 'next/link';
import { CurrencyDollarIcon, ChartBarIcon, UserGroupIcon, GiftIcon } from '@heroicons/react/24/outline';

export default function AffiliatesPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-linear-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Affiliate Program</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Earn money by referring students and employers to Intemso.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            {[
              { icon: UserGroupIcon, title: 'Share Your Referral Link', desc: 'Get a unique referral link to share with your network. Every signup through your link is tracked.' },
              { icon: GiftIcon, title: 'Earn Commissions', desc: 'Earn GH₵50 for every student and GH₵100 for every employer who signs up and completes their first gig.' },
              { icon: CurrencyDollarIcon, title: 'Get Paid Monthly', desc: 'Earnings are credited to your Intemso wallet monthly. Withdraw anytime to your bank account.' },
              { icon: ChartBarIcon, title: 'Track Your Performance', desc: 'Monitor clicks, signups, and earnings in real-time through your affiliate dashboard.' },
            ].map((step, idx) => (
              <div key={step.title} className="flex gap-4">
                <div className="shrink-0 w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/register" className="btn-primary">Join the Affiliate Program</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

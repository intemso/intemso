'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/outline';
import { paymentsApi, connectsApi, type ConnectBalance } from '@/lib/api';
import { useAuth } from '@/context/auth';

const CONNECT_PACKS = [
  { connects: 10, price: 'GH₵5', perConnect: 'GH₵0.50', popular: false },
  { connects: 20, price: 'GH₵9', perConnect: 'GH₵0.45', popular: true },
  { connects: 40, price: 'GH₵16', perConnect: 'GH₵0.40', popular: false },
];

const FEES = [
  { tier: 'First GH₵500', rate: '20%', description: 'On the first GH₵500 billed per client' },
  { tier: 'GH₵501 – GH₵2,000', rate: '10%', description: 'Earnings between GH₵500-2,000 per client' },
  { tier: 'Above GH₵2,000', rate: '5%', description: 'All earnings above GH₵2,000 per client' },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [buying, setBuying] = useState<number | null>(null);
  const [error, setError] = useState('');

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
      <section className="bg-linear-to-br from-primary-600 to-primary-800 text-white py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Simple, Transparent Pricing</h1>
          <p className="text-base sm:text-xl text-primary-100 max-w-2xl mx-auto">
            No subscriptions. No hidden fees. Pay only for what you use.
          </p>
        </div>
      </section>

      {/* For Students - Connects */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-900 text-center mb-2">Connects</h2>
        <p className="text-sm sm:text-base text-gray-500 text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          Students use connects to submit proposals. You get <span className="font-semibold text-gray-900">10 free connects every month</span>.
          Need more? Buy packs below.
        </p>

        {error && (
          <p className="text-sm text-red-500 text-center mb-4">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
          {CONNECT_PACKS.map((pack) => (
            <div
              key={pack.connects}
              className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center relative ${
                pack.popular ? 'border-primary-500 shadow-lg' : 'border-gray-200'
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-full">
                  Most Popular
                </span>
              )}
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">{pack.connects}</p>
              <p className="text-sm text-gray-500 mb-4">Connects</p>
              <p className="text-2xl font-bold text-primary-600 mb-1">{pack.price}</p>
              <p className="text-xs text-gray-400 mb-6">{pack.perConnect} per connect</p>
              <button
                onClick={() => handleBuy(pack.connects)}
                disabled={buying !== null}
                className={`${pack.popular ? 'btn-primary' : 'btn-secondary'} w-full disabled:opacity-50`}
              >
                {buying === pack.connects ? 'Redirecting...' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Service Fees */}
      <section className="bg-gray-50 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 text-center mb-2">Service Fees</h2>
          <p className="text-sm sm:text-base text-gray-500 text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            Our sliding fee structure rewards long-term client relationships. The more you earn with a client, the less you pay.
          </p>
          <div className="max-w-2xl mx-auto bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900">Billing Tier</th>
                  <th className="text-center px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900">Fee Rate</th>
                </tr>
              </thead>
              <tbody>
                {FEES.map((fee) => (
                  <tr key={fee.tier} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{fee.tier}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">{fee.description}</p>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                      <span className="text-base sm:text-lg font-bold text-primary-600">{fee.rate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* For Employers */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Free for Employers</h2>
          <p className="text-gray-600 mb-6">
            Posting gigs and hiring talent is completely free. You only pay the agreed budget to the student.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Post unlimited gigs', 'Browse all talent', 'Secure escrow payments', 'Dedicated support'].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-sm text-gray-700">
                <CheckIcon className="w-4 h-4 text-green-500" />
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/auth/register?role=employer" className="btn-primary">
              Start Hiring for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

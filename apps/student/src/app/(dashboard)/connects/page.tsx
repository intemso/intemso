'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BoltIcon,
  ArrowPathIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  GiftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { connectsApi, paymentsApi } from '@/lib/api';
import type { ConnectBalance, ConnectTransactionItem } from '@/lib/api';

const CONNECT_PACKS = [
  { size: 10, price: 5, label: 'Starter', perConnect: '0.50' },
  { size: 20, price: 9, label: 'Popular', perConnect: '0.45', popular: true },
  { size: 40, price: 16, label: 'Best Value', perConnect: '0.40' },
];

function getTransactionIcon(type: string) {
  switch (type) {
    case 'proposal_spent':
      return <ArrowDownIcon className="w-4 h-4 text-red-500" />;
    case 'proposal_refund':
      return <ArrowUpIcon className="w-4 h-4 text-green-500" />;
    case 'purchase':
      return <ShoppingCartIcon className="w-4 h-4 text-primary-500" />;
    case 'monthly_grant':
      return <GiftIcon className="w-4 h-4 text-primary-500" />;
    case 'rollover':
      return <ArrowPathIcon className="w-4 h-4 text-blue-500" />;
    default:
      return <SparklesIcon className="w-4 h-4 text-amber-500" />;
  }
}

function formatType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function ConnectsPage() {
  const [balance, setBalance] = useState<ConnectBalance | null>(null);
  const [transactions, setTransactions] = useState<ConnectTransactionItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<number | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    load();
  }, [page]);

  async function load() {
    setLoading(true);
    try {
      const [bal, txns] = await Promise.all([
        connectsApi.getBalance(),
        connectsApi.getTransactions({ page, limit: 15 }),
      ]);
      setBalance(bal);
      setTransactions(txns.data);
      setTotalPages(txns.meta.totalPages);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function buyPack(packSize: number) {
    setBuying(packSize);
    setPurchaseSuccess(false);
    try {
      const res = await paymentsApi.initialize({
        purpose: 'connects_purchase',
        packSize,
        callbackUrl: window.location.href,
      });
      if (res.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      }
    } catch {
      alert('Failed to initialize payment. Please try again.');
    } finally {
      setBuying(null);
    }
  }

  // Check if we returned from a payment callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference') || params.get('trxref');
    if (ref) {
      (async () => {
        try {
          await paymentsApi.verify(ref);
          setPurchaseSuccess(true);
          // Clean the URL
          window.history.replaceState({}, '', window.location.pathname);
          // Reload balance
          const bal = await connectsApi.getBalance();
          setBalance(bal);
          const txns = await connectsApi.getTransactions({ page: 1, limit: 15 });
          setTransactions(txns.data);
          setTotalPages(txns.meta.totalPages);
          setPage(1);
        } catch {}
      })();
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Connects</h1>
        <p className="text-gray-500 mt-1">
          Connects are used to apply for gigs. You get 15 free connects every month.
        </p>
      </div>

      {purchaseSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircleIcon className="w-6 h-6 text-green-500 shrink-0" />
          <div>
            <p className="text-green-800 font-semibold">Purchase successful!</p>
            <p className="text-green-600 text-sm">Your connects have been added to your balance.</p>
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-primary-50 rounded-xl p-5 text-center">
          <BoltIcon className="w-8 h-8 text-primary-500 mx-auto" />
          <p className="text-3xl font-bold text-primary-700 mt-2">{balance?.total ?? '—'}</p>
          <p className="text-xs text-primary-500 font-medium mt-1">Total Available</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <GiftIcon className="w-6 h-6 text-gray-400 mx-auto" />
          <p className="text-2xl font-bold text-gray-900 mt-2">{balance?.free ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Free (Monthly)</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <ArrowPathIcon className="w-6 h-6 text-gray-400 mx-auto" />
          <p className="text-2xl font-bold text-gray-900 mt-2">{balance?.rollover ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Rollover</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <ShoppingCartIcon className="w-6 h-6 text-gray-400 mx-auto" />
          <p className="text-2xl font-bold text-gray-900 mt-2">{balance?.purchased ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Purchased</p>
        </div>
      </div>

      {/* How Connects Work */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">How Connects Work</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            You receive <strong>15 free connects</strong> at the start of each month.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            Unused free connects <strong>roll over</strong> to the next month (max 80 rollover).
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            Purchased connects <strong>never expire</strong>.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            Free connects are used first, then rollover, then purchased.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            Connects are <strong>refunded</strong> if your application is declined or you withdraw.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            Earn bonus connects: complete gigs (+5), leave reviews (+1), get 5-star reviews (+3).
          </li>
        </ul>
      </div>

      {/* Buy Connects */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Buy Connects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CONNECT_PACKS.map((pack) => (
            <div
              key={pack.size}
              className={`relative rounded-xl border-2 p-6 text-center transition-all ${
                pack.popular
                  ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
                  : 'border-gray-200 bg-white hover:border-primary-300'
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{pack.label}</p>
              <p className="text-4xl font-bold text-gray-900">{pack.size}</p>
              <p className="text-sm text-gray-500 mb-1">connects</p>
              <p className="text-2xl font-bold text-primary-600 mt-3">GH₵{pack.price}</p>
              <p className="text-xs text-gray-400">GH₵{pack.perConnect} per connect</p>
              <button
                onClick={() => buyPack(pack.size)}
                disabled={buying !== null}
                className={`w-full mt-5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  pack.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300'
                    : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300'
                }`}
              >
                {buying === pack.size ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Transaction History</h2>
        {loading && transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <BoltIcon className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-3">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-1">Your connect transactions will appear here.</p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center shrink-0">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tx.description || formatType(tx.type)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </p>
                    <p className="text-[10px] text-gray-400">bal: {tx.balanceAfter}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

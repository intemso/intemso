'use client';

import { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  BanknotesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  walletApi,
  type WalletBalance,
  type WalletTransaction,
  type WithdrawalItem,
} from '@/lib/api';

export default function EarningsPage() {
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal modal
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [provider, setProvider] = useState('mtn_momo');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  useEffect(() => {
    Promise.all([
      walletApi.getBalance().catch(() => null),
      walletApi.getTransactions({ limit: 20 }).catch(() => ({ data: [] })),
      walletApi.getWithdrawals({ limit: 10 }).catch(() => ({ data: [] })),
    ]).then(([w, tx, wd]) => {
      if (w) setWallet(w);
      setTransactions(tx.data);
      setWithdrawals(wd.data);
      setLoading(false);
    });
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawAmount || !accountNumber || !accountName) return;
    setWithdrawing(true);
    setWithdrawError('');
    try {
      const withdrawal = await walletApi.withdraw({
        amount: parseFloat(withdrawAmount),
        provider,
        accountNumber,
        accountName,
      });
      setWithdrawals((prev) => [withdrawal, ...prev]);
      // Refresh wallet balance
      const fresh = await walletApi.getBalance().catch(() => null);
      if (fresh) setWallet(fresh);
      setShowWithdraw(false);
      setWithdrawAmount('');
      setAccountNumber('');
      setAccountName('');
    } catch (err: any) {
      setWithdrawError(err?.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const balance = wallet ? parseFloat(wallet.balance) : 0;
  const pending = wallet ? parseFloat(wallet.pendingBalance) : 0;
  const totalWithdrawn = withdrawals
    .filter((w) => w.status === 'completed')
    .reduce((sum, w) => sum + parseFloat(w.amount), 0);
  const totalEarned = balance + pending + totalWithdrawn;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl flex justify-center py-16">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-sm text-gray-500 mt-1">Track your income and withdrawals</p>
        </div>
        <button
          onClick={() => setShowWithdraw(true)}
          className="btn-primary flex items-center gap-2"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Withdraw
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Earned', value: `GH₵${totalEarned.toFixed(0)}`, icon: CurrencyDollarIcon, color: 'bg-green-50 text-green-600' },
          { label: 'Available Balance', value: `GH₵${balance.toFixed(0)}`, icon: BanknotesIcon, color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending', value: `GH₵${pending.toFixed(0)}`, icon: ClockIcon, color: 'bg-amber-50 text-amber-600' },
          { label: 'Withdrawn', value: `GH₵${totalWithdrawn.toFixed(0)}`, icon: ArrowDownTrayIcon, color: 'bg-purple-50 text-purple-600' },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-100 rounded-xl p-5">
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No transactions yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'credit' || tx.type === 'bonus' || tx.type === 'refund';
              return (
                <div key={tx.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCredit
                          ? 'bg-green-50'
                          : tx.type === 'withdrawal'
                            ? 'bg-blue-50'
                            : 'bg-red-50'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                      ) : tx.type === 'withdrawal' ? (
                        <ArrowDownTrayIcon className="w-4 h-4 text-blue-600" />
                      ) : (
                        <CurrencyDollarIcon className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {tx.description || tx.type}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${isCredit ? 'text-green-600' : 'text-gray-900'}`}
                  >
                    {isCredit ? '+' : '-'}GH₵{Math.abs(parseFloat(tx.amount)).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Withdraw Funds</h2>
              <button
                onClick={() => setShowWithdraw(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Available: <span className="font-semibold text-gray-900">GH₵{balance.toFixed(2)}</span>
            </p>

            {withdrawError && (
              <p className="text-sm text-red-500 mb-3">{withdrawError}</p>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="input-field"
                >
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="vodafone_cash">Vodafone Cash</option>
                  <option value="airteltigo_money">AirtelTigo Money</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 024XXXXXXX"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Name on account"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Amount (GH₵)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  max={balance}
                  className="input-field"
                />
              </div>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing || !accountNumber || !accountName || !withdrawAmount}
                className="btn-primary w-full disabled:opacity-50"
              >
                {withdrawing ? 'Processing...' : 'Request Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

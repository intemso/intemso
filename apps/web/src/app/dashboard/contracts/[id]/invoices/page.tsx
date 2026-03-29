'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { contractsApi, WeeklyInvoice } from '@/lib/api';
import { ClockIcon, ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  disputed: 'bg-red-100 text-red-800',
};

export default function ContractInvoicesPage() {
  const { id } = useParams<{ id: string }>();
  const [invoices, setInvoices] = useState<WeeklyInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    contractsApi
      .getInvoices(id)
      .then((res) => setInvoices(res.invoices))
      .catch((e) => setError(e.message || 'Failed to load invoices'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-0 sm:px-4">
      <Link
        href={`/dashboard/contracts/${id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 sm:mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Contract
      </Link>

      <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-8">
        <DocumentTextIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Weekly Invoices</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">{error}</div>
      )}

      {invoices.length === 0 && !error ? (
        <div className="text-center py-16">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">No invoices generated yet.</p>
          <p className="text-sm text-gray-400">
            Invoices are created automatically at the end of each billing week.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          {invoices.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white border rounded-lg p-2.5 sm:p-4 text-center">
                <p className="text-[10px] sm:text-sm text-gray-500">Total Invoices</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{invoices.length}</p>
              </div>
              <div className="bg-white border rounded-lg p-2.5 sm:p-4 text-center">
                <p className="text-[10px] sm:text-sm text-gray-500">Total Hours</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {invoices.reduce((sum, inv) => sum + Number(inv.totalHours), 0).toFixed(1)}
                </p>
              </div>
              <div className="bg-white border rounded-lg p-2.5 sm:p-4 text-center">
                <p className="text-[10px] sm:text-sm text-gray-500">Total Billed</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  GH₵{invoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Invoice table */}
          <div className="bg-white border rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                    Billing Week
                  </th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                    Hours
                  </th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                    Rate
                  </th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                    Subtotal
                  </th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                    Fee
                  </th>
                  <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                      {new Date(inv.billingWeek).toLocaleDateString('en-GH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 text-right">
                      {Number(inv.totalHours).toFixed(1)}h
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-700 text-right">
                      GH₵{Number(inv.hourlyRate).toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 text-right">
                      GH₵{Number(inv.subtotal).toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-500 text-right">
                      GH₵{Number(inv.platformFee).toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[inv.status] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

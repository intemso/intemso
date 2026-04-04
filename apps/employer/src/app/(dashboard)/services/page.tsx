'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  ClockIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { servicesApi, type ServiceListItem } from '@/lib/api';
import { useAuth } from '@/context/auth';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-50 text-gray-600',
  active: 'bg-green-50 text-green-700',
  paused: 'bg-amber-50 text-amber-700',
  removed: 'bg-red-50 text-red-700',
};

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  active: 'bg-blue-50 text-blue-700',
  delivered: 'bg-purple-50 text-purple-700',
  revision_requested: 'bg-orange-50 text-orange-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-50 text-gray-600',
  disputed: 'bg-red-50 text-red-700',
};

export default function DashboardServicesPage() {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';

  const [tab, setTab] = useState<'listings' | 'orders'>(isStudent ? 'listings' : 'orders');
  const [listings, setListings] = useState<ServiceListItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formDeliveryDays, setFormDeliveryDays] = useState('7');
  const [formBasicPrice, setFormBasicPrice] = useState('');
  const [formStandardPrice, setFormStandardPrice] = useState('');
  const [formPremiumPrice, setFormPremiumPrice] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      const res = await servicesApi.mine();
      setListings(res);
    } catch { /* ignore */ }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await servicesApi.listMyOrders({ page: ordersPage, limit: 10 });
      setOrders(res.data || []);
      setOrdersTotalPages(res.meta?.totalPages || 1);
    } catch { /* ignore */ }
  }, [ordersPage]);

  useEffect(() => {
    setLoading(true);
    const promises: Promise<void>[] = [];
    if (isStudent) promises.push(fetchListings());
    promises.push(fetchOrders());
    Promise.all(promises).finally(() => setLoading(false));
  }, [isStudent, fetchListings, fetchOrders]);

  const handleCreate = async () => {
    if (!formTitle.trim() || !formDeliveryDays) return;
    setCreating(true);
    try {
      const tiers: Record<string, { name: string; price: number }> = {};
      if (formBasicPrice) tiers.basic = { name: 'Basic', price: Number(formBasicPrice) };
      if (formStandardPrice) tiers.standard = { name: 'Standard', price: Number(formStandardPrice) };
      if (formPremiumPrice) tiers.premium = { name: 'Premium', price: Number(formPremiumPrice) };

      await servicesApi.create({
        title: formTitle.trim(),
        description: formDesc.trim(),
        tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
        deliveryDays: Number(formDeliveryDays),
        tiers: Object.keys(tiers).length > 0 ? tiers : undefined,
      });
      setShowCreate(false);
      setFormTitle('');
      setFormDesc('');
      setFormTags('');
      setFormDeliveryDays('7');
      setFormBasicPrice('');
      setFormStandardPrice('');
      setFormPremiumPrice('');
      fetchListings();
    } catch { /* ignore */ }
    finally { setCreating(false); }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await servicesApi.update(id, { status: newStatus });
      fetchListings();
    } catch { /* ignore */ }
  };

  const handleOrderAction = async (orderId: string, status: string) => {
    try {
      await servicesApi.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch { /* ignore */ }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            {isStudent ? 'Manage your service listings and orders' : 'Track your service orders'}
          </p>
        </div>
        {isStudent && (
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            New Service
          </button>
        )}
      </div>

      {/* Tabs */}
      {isStudent && (
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4 sm:mb-6 w-full sm:w-fit">
          <button
            onClick={() => setTab('listings')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
              tab === 'listings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => setTab('orders')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
              tab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Orders
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : tab === 'listings' && isStudent ? (
        /* Listings Tab */
        listings.length > 0 ? (
          <div className="space-y-4">
            {listings.map((s) => {
              const minPrice = s.tiers && typeof s.tiers === 'object'
                ? Math.min(...Object.values(s.tiers as Record<string, { price?: number }>).map((t) => t.price || 0).filter(Boolean))
                : null;
              return (
                <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 hover:shadow-md transition-all active:scale-[0.99]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/services/${s.id}`}
                          className="text-sm sm:text-base font-semibold text-gray-900 hover:text-primary-600"
                        >
                          {s.title}
                        </Link>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${STATUS_STYLES[s.status] || 'bg-gray-50 text-gray-600'}`}>
                          {s.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">{s.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                          {Number(s.ratingAvg).toFixed(1)} ({s.ratingCount})
                        </span>
                        <span>{s.ordersCount} orders</span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3.5 h-3.5" />
                          {s.deliveryDays}d delivery
                        </span>
                        {minPrice && <span>From GH₵{minPrice}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleStatus(s.id, s.status)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        {s.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p>You haven&apos;t created any services yet.</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-3 text-sm">
              Create Your First Service
            </button>
          </div>
        )
      ) : (
        /* Orders Tab */
        orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                        {order.service?.title || 'Service Order'}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${ORDER_STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-600'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="capitalize">{order.tierSelected}</span> tier · GH₵{Number(order.amount)}
                      {order.deliveryDeadline && (
                        <span> · Due {new Date(order.deliveryDeadline).toLocaleDateString()}</span>
                      )}
                    </div>
                    {order.requirements && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{order.requirements}</p>
                    )}
                  </div>

                  {/* Actions based on status and role */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isStudent && order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleOrderAction(order.id, 'active')}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleOrderAction(order.id, 'cancelled')}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {isStudent && (order.status === 'active' || order.status === 'revision_requested') && (
                      <button
                        onClick={() => handleOrderAction(order.id, 'delivered')}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {!isStudent && order.status === 'pending' && (
                      <button
                        onClick={() => handleOrderAction(order.id, 'cancelled')}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    )}
                    {!isStudent && order.status === 'delivered' && (
                      <>
                        <button
                          onClick={() => handleOrderAction(order.id, 'completed')}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleOrderAction(order.id, 'revision_requested')}
                          className="px-3 py-1.5 text-xs font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50"
                        >
                          Request Revision
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {ordersTotalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button
                  onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                  disabled={ordersPage === 1}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-500">
                  Page {ordersPage} of {ordersTotalPages}
                </span>
                <button
                  onClick={() => setOrdersPage((p) => Math.min(ordersTotalPages, p + 1))}
                  disabled={ordersPage === ordersTotalPages}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p>{isStudent ? 'No orders yet' : 'You haven\'t ordered any services yet'}</p>
            {!isStudent && (
              <Link href="/services" className="btn-primary mt-3 text-sm inline-block">
                Browse Services
              </Link>
            )}
          </div>
        )
      )}

      {/* Create Service Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Service Listing</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g., I will type your documents fast and accurately"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="input-field"
                  placeholder="Describe what you offer..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="input-field"
                  placeholder="e.g., typing, data entry, fast delivery"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Days *</label>
                <input
                  type="number"
                  min="1"
                  value={formDeliveryDays}
                  onChange={(e) => setFormDeliveryDays(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Tiers (GH₵)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Basic</label>
                    <input
                      type="number"
                      min="1"
                      value={formBasicPrice}
                      onChange={(e) => setFormBasicPrice(e.target.value)}
                      className="input-field"
                      placeholder="20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Standard</label>
                    <input
                      type="number"
                      min="1"
                      value={formStandardPrice}
                      onChange={(e) => setFormStandardPrice(e.target.value)}
                      className="input-field"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Premium</label>
                    <input
                      type="number"
                      min="1"
                      value={formPremiumPrice}
                      onChange={(e) => setFormPremiumPrice(e.target.value)}
                      className="input-field"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !formTitle.trim() || !formDeliveryDays}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

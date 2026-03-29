'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ClockIcon,
  CheckBadgeIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { servicesApi, type ServiceListItem } from '@/lib/api';
import { useAuth } from '@/context/auth';

type ServiceDetail = ServiceListItem & { _count: { orders: number }; faq?: { q: string; a: string }[] };

interface Tier {
  name: string;
  price: number;
  description?: string;
  deliveryDays?: number;
  features?: string[];
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const serviceId = params.id as string;

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [requirements, setRequirements] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (!serviceId) return;
    setLoading(true);
    servicesApi.getById(serviceId)
      .then((data) => {
        setService(data as ServiceDetail);
        // Default select first tier
        if (data.tiers && typeof data.tiers === 'object') {
          const keys = Object.keys(data.tiers as Record<string, Tier>);
          if (keys.length > 0) setSelectedTier(keys[0]);
        }
      })
      .catch(() => setError('Service not found'))
      .finally(() => setLoading(false));
  }, [serviceId]);

  const tiers: Record<string, Tier> = (service?.tiers && typeof service.tiers === 'object') ? service.tiers as Record<string, Tier> : {};
  const tierKeys = Object.keys(tiers);
  const currentTier = tiers[selectedTier];

  const handleOrder = async () => {
    if (!currentTier || !selectedTier) return;
    setOrdering(true);
    try {
      await servicesApi.order(serviceId, {
        tierSelected: selectedTier,
        amount: currentTier.price,
        requirements: requirements.trim() || undefined,
      });
      setOrderSuccess(true);
    } catch {
      /* ignore */
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center py-16">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-16">
        <p className="text-sm text-red-500 mb-2">{error || 'Not found'}</p>
        <Link href="/services" className="text-primary-600 text-sm font-medium hover:underline">
          Back to Services
        </Link>
      </div>
    );
  }

  const studentName = `${service.student.firstName} ${service.student.lastName}`;
  const initials = `${service.student.firstName[0]}${service.student.lastName[0]}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{service.title}</h1>

              <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap text-xs sm:text-sm">
                <Link
                  href={`/talent/${service.student.id}`}
                  className="flex items-center gap-2 hover:text-primary-600"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-600">{initials}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{studentName}</span>
                  {service.student.isVerified && (
                    <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                  )}
                </Link>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <StarIcon className="w-4 h-4 text-amber-400" />
                  {Number(service.ratingAvg).toFixed(1)} ({service.ratingCount})
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">{service.ordersCount} orders</span>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {service.description}
              </p>

              {service.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {service.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tiers Comparison */}
            {tierKeys.length > 1 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Pricing Tiers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {tierKeys.map((key) => {
                    const tier = tiers[key];
                    const isSelected = key === selectedTier;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedTier(key)}
                        className={`text-left p-4 rounded-xl border-2 transition-colors ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <h3 className="text-sm font-bold text-gray-900 capitalize">{tier.name || key}</h3>
                        <p className="text-xl font-bold text-primary-600 mt-1">GH₵{tier.price}</p>
                        {tier.description && (
                          <p className="text-xs text-gray-500 mt-1">{tier.description}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                          <ClockIcon className="w-3.5 h-3.5" />
                          {tier.deliveryDays || service.deliveryDays} days
                        </div>
                        {tier.features && tier.features.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {tier.features.map((f, i) => (
                              <li key={i} className="text-xs text-gray-600">✓ {f}</li>
                            ))}
                          </ul>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FAQ */}
            {service.faq && Array.isArray(service.faq) && service.faq.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">FAQ</h2>
                <div className="space-y-4">
                  {service.faq.map((item, idx) => (
                    <div key={idx}>
                      <h3 className="text-sm font-semibold text-gray-800">{item.q}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — Order */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 sticky top-20 sm:top-24">
              {orderSuccess ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingCartIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Order Placed!</h3>
                  <p className="text-sm text-gray-500 mb-4">The student will be notified of your order.</p>
                  <Link
                    href="/dashboard/services"
                    className="btn-primary w-full text-center block"
                  >
                    View My Orders
                  </Link>
                </div>
              ) : (
                <>
                  {currentTier ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-900 capitalize">
                          {currentTier.name || selectedTier}
                        </h3>
                        <span className="text-2xl font-bold text-gray-900">
                          GH₵{currentTier.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                        <ClockIcon className="w-4 h-4" />
                        {currentTier.deliveryDays || service.deliveryDays} day delivery
                      </div>
                      {currentTier.features && currentTier.features.length > 0 && (
                        <ul className="space-y-1.5 mb-4">
                          {currentTier.features.map((f, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                              <span className="text-green-500">✓</span>{f}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <div className="mb-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <ClockIcon className="w-4 h-4" />
                        {service.deliveryDays} day delivery
                      </div>
                    </div>
                  )}

                  {user?.role === 'EMPLOYER' && (
                    <>
                      <textarea
                        rows={3}
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        placeholder="Describe your requirements (optional)..."
                        className="input-field text-sm mb-4"
                      />
                      <button
                        onClick={handleOrder}
                        disabled={ordering || !currentTier}
                        className="btn-primary w-full disabled:opacity-50"
                      >
                        {ordering ? 'Placing Order...' : `Order — GH₵${currentTier?.price || 0}`}
                      </button>
                    </>
                  )}

                  {!user && (
                    <Link href="/auth/login" className="btn-primary w-full text-center block">
                      Log in to Order
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">About the Seller</h3>
              <Link
                href={`/talent/${service.student.id}`}
                className="flex items-center gap-3 hover:bg-gray-50 -m-2 p-2 rounded-lg"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-600">{initials}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-gray-900">{studentName}</span>
                    {service.student.isVerified && (
                      <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {service.student.professionalTitle || 'Student'}
                  </p>
                </div>
              </Link>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <StarIcon className="w-4 h-4 text-amber-400" />
                {Number(service.student.ratingAvg).toFixed(1)} ({service.student.ratingCount} reviews)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

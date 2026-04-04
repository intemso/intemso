'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/auth';

const ADMIN_PORTAL_URL = process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL || 'https://admin.intemso.com';

export default function AdminRedirect() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user || user.role !== 'admin') {
      window.location.href = '/auth/login';
      return;
    }

    window.location.href = ADMIN_PORTAL_URL;
  }, [user, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Redirecting to admin portal...</p>
      </div>
    </div>
  );
}

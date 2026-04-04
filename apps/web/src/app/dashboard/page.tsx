'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/auth';

const PORTAL_URLS: Record<string, string> = {
  STUDENT: process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL || 'https://jobs.intemso.com',
  EMPLOYER: process.env.NEXT_PUBLIC_EMPLOYER_PORTAL_URL || 'https://hire.intemso.com',
  ADMIN: process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL || 'https://admin.intemso.com',
};

export default function DashboardRedirect() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      window.location.href = '/auth/login';
      return;
    }

    const portalUrl = PORTAL_URLS[user.role] || PORTAL_URLS.STUDENT;
    window.location.href = portalUrl;
  }, [user, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Redirecting to your portal...</p>
      </div>
    </div>
  );
}

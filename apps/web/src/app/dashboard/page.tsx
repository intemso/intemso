'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { getAccessToken, getRefreshToken } from '@/lib/api';

const PORTAL_URLS: Record<string, string> = {
  student: process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL || 'https://jobs.intemso.com',
  employer: process.env.NEXT_PUBLIC_EMPLOYER_PORTAL_URL || 'https://hire.intemso.com',
  admin: process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL || 'https://admin.intemso.com',
};

export default function DashboardRedirect() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      window.location.href = '/auth/login';
      return;
    }

    const portalUrl = PORTAL_URLS[user.role] || PORTAL_URLS.student;

    // Pass auth tokens via URL hash so the portal can pick them up
    // Hash fragments are NOT sent to the server, keeping tokens safe
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    if (accessToken && refreshToken) {
      window.location.href = `${portalUrl}#access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}`;
    } else {
      window.location.href = portalUrl;
    }
  }, [user, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Redirecting to your portal...</p>
      </div>
    </div>
  );
}

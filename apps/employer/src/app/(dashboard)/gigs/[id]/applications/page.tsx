'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { applicationsApi, gigsApi, type ApplicationListItem, type GigListItem } from '@/lib/api';

const statusStyles: Record<string, string> = {
  applied: 'bg-blue-50 text-blue-700',
  reviewed: 'bg-amber-50 text-amber-700',
  hired: 'bg-green-100 text-green-800',
  declined: 'bg-red-50 text-red-600',
  withdrawn: 'bg-gray-100 text-gray-500',
};

const statusLabels: Record<string, string> = {
  applied: 'New',
  reviewed: 'Reviewed',
  hired: 'Hired',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function GigApplicationsPage() {
  const params = useParams();
  const gigId = params.id as string;

  const [gig, setGig] = useState<GigListItem | null>(null);
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!gigId) return;
    setLoading(true);
    Promise.all([
      gigsApi.getById(gigId),
      applicationsApi.listByGig(gigId),
    ])
      .then(([gigData, appsData]) => {
        setGig(gigData);
        setApplications(appsData.data);
      })
      .catch(() => setError('Failed to load applications'))
      .finally(() => setLoading(false));
  }, [gigId]);

  const handleAction = async (applicationId: string, status: string) => {
    setActionLoading(applicationId);
    try {
      await applicationsApi.updateStatus(applicationId, { status });
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status } : a)),
      );
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl flex justify-center py-16">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl text-center py-16">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <Link
        href="/gigs"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to My Gigs
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        {gig && (
          <p className="text-sm text-gray-500 mt-1">
            {applications.length} application{applications.length !== 1 ? 's' : ''} for &ldquo;{gig.title}&rdquo;
          </p>
        )}
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16">
          <UserIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No applications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all"
            >
              {/* Student info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-600">
                      {(application.student?.firstName?.[0] || '') + (application.student?.lastName?.[0] || '')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {application.student?.firstName} {application.student?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {application.student?.professionalTitle || application.student?.university}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusStyles[application.status] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {statusLabels[application.status] || application.status}
                  </span>
                </div>
              </div>

              {/* Student stats */}
              {application.student && (
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  {Number(application.student.ratingAvg) > 0 && (
                    <span className="flex items-center gap-0.5">
                      <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                      {parseFloat(application.student.ratingAvg).toFixed(1)} ({application.student.ratingCount})
                    </span>
                  )}
                  <span>{application.student.gigsCompleted} gigs completed</span>
                  {application.student.hourlyRate && (
                    <span>GH&#8373;{parseFloat(application.student.hourlyRate)}/hr</span>
                  )}
                </div>
              )}

              {/* Note */}
              {application.note && (
                <p className="text-sm text-gray-600 mb-4">{application.note}</p>
              )}

              {/* Rate & time */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                {application.suggestedRate && (
                  <span>
                    Suggested Rate: <span className="font-semibold text-green-600">GH&#8373;{parseFloat(application.suggestedRate).toFixed(0)}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5" />
                  {timeAgo(application.createdAt)}
                </span>
              </div>

              {/* Skills */}
              {application.student?.skills && application.student.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {application.student.skills.slice(0, 6).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              {application.status !== 'hired' && application.status !== 'declined' && application.status !== 'withdrawn' && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                  {application.status === 'applied' && (
                    <button
                      onClick={() => handleAction(application.id, 'reviewed')}
                      disabled={actionLoading === application.id}
                      className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
                    >
                      Mark Reviewed
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(application.id, 'hired')}
                    disabled={actionLoading === application.id}
                    className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Hire
                  </button>
                  <button
                    onClick={() => handleAction(application.id, 'declined')}
                    disabled={actionLoading === application.id}
                    className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <XCircleIcon className="w-3.5 h-3.5" />
                    Decline
                  </button>
                </div>
              )}
              {application.status === 'hired' && (
                <div className="pt-3 border-t border-gray-50">
                  <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4" />
                    Hired &#8212; Contract created
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

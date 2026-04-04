'use client';

import { useState } from 'react';
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  LockClosedIcon,
  GlobeAltIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/auth';

const TABS = ['Profile', 'Notifications', 'Security', 'Payments', 'Privacy'] as const;

export default function SettingsPage() {
  const { user } = useAuth();
  const profile = user?.studentProfile ?? user?.employerProfile ?? {} as Record<string, unknown>;
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your account preferences</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-gray-100 overflow-x-auto">
        {TABS.map((tab) => {
          const icons: Record<string, React.ElementType> = {
            Profile: UserCircleIcon,
            Notifications: BellIcon,
            Security: ShieldCheckIcon,
            Payments: CreditCardIcon,
            Privacy: LockClosedIcon,
          };
          const Icon = icons[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab}
            </button>
          );
        })}
      </div>

      {/* Profile Settings */}
      {activeTab === 'Profile' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" defaultValue={(profile?.firstName as string) ?? ''} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" defaultValue={(profile?.lastName as string) ?? ''} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" defaultValue={user?.email ?? ''} className="input-field" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" defaultValue={(profile?.phone as string) ?? ''} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea rows={3} className="input-field" defaultValue={(profile?.bio as string) ?? ''} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">University Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <input type="text" defaultValue={(profile?.university as string) ?? ''} className="input-field" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <input type="text" defaultValue={(profile?.major as string) ?? ''} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input type="text" defaultValue={(profile?.yearOfStudy as string) ?? ''} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Graduation</label>
                <input type="text" defaultValue={(profile?.graduationYear as string) ?? ''} className="input-field" />
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary">
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'Notifications' && (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { label: 'New gig matches', description: 'Get notified when gigs match your skills', defaultChecked: true },
              { label: 'Proposal updates', description: 'When employers view or respond to your proposals', defaultChecked: true },
              { label: 'Messages', description: 'New messages from employers', defaultChecked: true },
              { label: 'Payment notifications', description: 'Milestone payments and withdrawals', defaultChecked: true },
              { label: 'Marketing emails', description: 'Tips, promotions, and platform updates', defaultChecked: false },
              { label: 'Weekly digest', description: 'Summary of your activity and new opportunities', defaultChecked: true },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <input type="checkbox" defaultChecked={item.defaultChecked} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Security */}
      {activeTab === 'Security' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" className="input-field" />
              </div>
              <button className="btn-primary">Update Password</button>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Two-Factor Authentication</h2>
            <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account</p>
            <button className="btn-secondary">Enable 2FA</button>
          </div>
        </div>
      )}

      {/* Payments */}
      {activeTab === 'Payments' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal Methods</h2>
            <div className="border border-gray-100 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">No withdrawal method added</p>
                  <p className="text-xs text-gray-500">Add a bank account or mobile money</p>
                </div>
              </div>
              <button className="text-sm text-primary-600 font-medium hover:underline">Edit</button>
            </div>
            <button className="mt-4 text-sm text-primary-600 font-medium hover:underline">
              + Add new withdrawal method
            </button>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Connects</h2>
            <p className="text-sm text-gray-500 mb-4">Manage your connects balance from your dashboard</p>
            <button className="btn-secondary">Buy More Connects</button>
          </div>
        </div>
      )}

      {/* Privacy */}
      {activeTab === 'Privacy' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Visibility</h2>
            <div className="space-y-4">
              {[
                { label: 'Public profile', description: 'Allow employers to find you in search', defaultChecked: true },
                { label: 'Show earnings', description: 'Display total earnings on your profile', defaultChecked: false },
                { label: 'Show online status', description: 'Let others see when you are online', defaultChecked: true },
              ].map((item) => (
                <label key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <input type="checkbox" defaultChecked={item.defaultChecked} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                </label>
              ))}
            </div>
          </div>
          <div className="bg-white border border-red-100 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all associated data</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors">
              <TrashIcon className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

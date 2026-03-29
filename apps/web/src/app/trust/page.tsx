import { ShieldCheckIcon, LockClosedIcon, EyeIcon, UserGroupIcon, ExclamationTriangleIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

export default function TrustPage() {
  const features = [
    { icon: CheckBadgeIcon, title: 'Verified Students', description: 'Every student verifies their identity with a university email address. We confirm enrollment status to ensure only genuine students access the platform.' },
    { icon: LockClosedIcon, title: 'Secure Escrow Payments', description: 'All payments are held in escrow until work is approved. Students are guaranteed payment for completed milestones, and employers only pay for approved work.' },
    { icon: ShieldCheckIcon, title: 'Dispute Resolution', description: 'Our dedicated support team mediates any disagreements between students and employers. Fair, transparent resolution within 48 hours.' },
    { icon: EyeIcon, title: 'Profile Transparency', description: 'Job Success Scores, ratings, reviews, and work history are publicly visible. Make informed decisions based on verified track records.' },
    { icon: ExclamationTriangleIcon, title: 'Fraud Prevention', description: 'Advanced systems detect and prevent fraudulent accounts, fake reviews, and suspicious activity. We actively monitor the platform 24/7.' },
    { icon: UserGroupIcon, title: 'Community Standards', description: 'Clear terms of service and community guidelines ensure a professional, respectful environment for all users.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-linear-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Trust & Safety</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Your security is our priority. Here&apos;s how we keep Intemso safe for everyone.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title}>
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

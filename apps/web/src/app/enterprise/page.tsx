import Link from 'next/link';
import { BuildingOffice2Icon, UserGroupIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/react/24/outline';

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-linear-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Intemso for Enterprise</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Scale your team with verified university talent. Dedicated support, custom workflows, and enterprise-grade security.
          </p>
          <Link href="/contact" className="btn-primary text-lg px-8 py-3">
            Contact Sales
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: UserGroupIcon, title: 'Curated Talent Pool', desc: 'Access pre-vetted, top-rated students matched to your industry needs.' },
            { icon: ShieldCheckIcon, title: 'Enterprise Security', desc: 'NDA support, IP protection, and dedicated account management.' },
            { icon: BoltIcon, title: 'Fast Matching', desc: 'Get matched with qualified talent within 24 hours of posting.' },
            { icon: BuildingOffice2Icon, title: 'Custom Workflows', desc: 'Tailored onboarding, billing, and reporting for your organization.' },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-8">Book a demo with our enterprise team to discuss your needs.</p>
          <Link href="/contact" className="btn-primary">Schedule a Demo</Link>
        </div>
      </section>
    </div>
  );
}

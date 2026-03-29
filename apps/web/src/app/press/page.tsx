import Link from 'next/link';

export default function PressPage() {
  const pressReleases = [
    { title: 'Intemso Launches to Connect Ghanaian University Students with Freelance Opportunities', date: 'Mar 1, 2026', excerpt: 'The platform aims to bridge the gap between education and employment by providing flexible work for students.' },
    { title: 'Intemso Reaches GH₵250M+ in Student Earnings', date: 'Feb 15, 2026', excerpt: 'A milestone marking the growing impact of the platform on student livelihoods across 25+ universities.' },
    { title: 'Intemso Partners with Top Ghanaian Universities', date: 'Jan 20, 2026', excerpt: 'University of Ghana, KNUST, and UCC among the institutions supporting student freelancing through Intemso.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-linear-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Press</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Latest news and media resources from Intemso.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Press Releases</h2>
        <div className="space-y-6">
          {pressReleases.map((pr) => (
            <div key={pr.title} className="border-b border-gray-100 pb-6">
              <p className="text-sm text-gray-400 mb-1">{pr.date}</p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{pr.title}</h3>
              <p className="text-gray-600">{pr.excerpt}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Media Inquiries</h2>
          <p className="text-gray-600 mb-4">For press inquiries, interviews, or media kits, please contact our communications team.</p>
          <Link href="/contact" className="btn-secondary">Contact Press Team</Link>
        </div>
      </section>
    </div>
  );
}

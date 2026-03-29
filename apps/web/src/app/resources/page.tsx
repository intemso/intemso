import Link from 'next/link';

export default function ResourcesPage() {
  const resources = [
    { title: 'Hiring Guide', description: 'Best practices for posting gigs and evaluating student talent.', href: '#', category: 'Employer' },
    { title: 'Writing Winning Proposals', description: 'Tips for students to craft proposals that stand out.', href: '#', category: 'Student' },
    { title: 'Setting Your Rates', description: 'How to price your services competitively on Intemso.', href: '#', category: 'Student' },
    { title: 'Managing Milestones', description: 'A guide to breaking projects into clear, manageable milestones.', href: '#', category: 'Both' },
    { title: 'Building Your Portfolio', description: 'Showcase your best work to attract more clients.', href: '#', category: 'Student' },
    { title: 'Escrow & Payments', description: 'Understanding how payments and escrow work on Intemso.', href: '#', category: 'Both' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-linear-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Hiring Resources</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Guides, tips, and best practices for students and employers.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <div key={r.title} className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all">
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">{r.category}</span>
              <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-2">{r.title}</h3>
              <p className="text-sm text-gray-600">{r.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

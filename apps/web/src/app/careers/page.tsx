import Link from 'next/link';

export default function CareersPage() {
  const openings = [
    { title: 'Senior Full-Stack Engineer', team: 'Engineering', location: 'Accra / Remote', type: 'Full-time' },
    { title: 'Product Designer', team: 'Design', location: 'Accra / Remote', type: 'Full-time' },
    { title: 'Community Manager', team: 'Operations', location: 'Accra', type: 'Full-time' },
    { title: 'Growth Marketing Lead', team: 'Marketing', location: 'Remote', type: 'Full-time' },
    { title: 'Customer Support Specialist', team: 'Support', location: 'Accra', type: 'Part-time' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-linear-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Help us build the future of student work in Ghana and beyond.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Open Positions</h2>
        <div className="space-y-4">
          {openings.map((job) => (
            <div key={job.title} className="border border-gray-100 rounded-xl p-6 flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span>{job.team}</span>
                  <span>·</span>
                  <span>{job.location}</span>
                  <span>·</span>
                  <span>{job.type}</span>
                </div>
              </div>
              <Link href="/contact" className="btn-secondary text-sm">Apply</Link>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Don&apos;t see your role?</h2>
          <p className="text-gray-600 mb-6">We&apos;re always looking for talented people. Send us your CV.</p>
          <Link href="/contact" className="btn-primary">Get in Touch</Link>
        </div>
      </section>
    </div>
  );
}

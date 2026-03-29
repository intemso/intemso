import { CodeBracketIcon, KeyIcon, ServerIcon, BookOpenIcon } from '@heroicons/react/24/outline';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-linear-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Integrate Intemso into your applications with our REST API.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: KeyIcon, title: 'Authentication', desc: 'OAuth 2.0 and API key authentication for secure access.' },
            { icon: ServerIcon, title: 'REST API', desc: 'RESTful endpoints for gigs, users, proposals, and payments.' },
            { icon: CodeBracketIcon, title: 'Webhooks', desc: 'Real-time event notifications for your integrations.' },
            { icon: BookOpenIcon, title: 'SDKs', desc: 'Official libraries for Node.js, Python, and more.' },
          ].map((item) => (
            <div key={item.title} className="border border-gray-100 rounded-xl p-6">
              <item.icon className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start</h2>
          <div className="bg-gray-900 rounded-xl p-6 text-sm font-mono text-gray-300 overflow-x-auto">
            <p className="text-gray-500"># Install the SDK</p>
            <p>npm install @intemso/sdk</p>
            <br />
            <p className="text-gray-500"># Initialize</p>
            <p className="text-green-400">{'import { IntemsoClient } from \'@intemso/sdk\';'}</p>
            <br />
            <p>{'const client = new IntemsoClient({'}</p>
            <p>{'  apiKey: process.env.INTEMSO_API_KEY,'}</p>
            <p>{'});'}</p>
            <br />
            <p className="text-gray-500"># List gigs</p>
            <p>{'const gigs = await client.gigs.list({ status: \'open\' });'}</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">Full API reference coming soon. Contact us for early access.</p>
        </div>
      </section>
    </div>
  );
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-50 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cookie Policy</h1>
          <p className="text-gray-500 mt-2">Last updated: March 1, 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">What Are Cookies</h2>
        <p className="text-gray-600 mb-4">
          Cookies are small text files stored on your device when you visit a website. They help us provide you with a better experience by remembering your preferences and understanding how you use our Platform.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Cookies We Use</h2>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Cookie</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Purpose</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700">session_id</td>
                <td className="px-4 py-3 text-sm text-gray-500">Essential</td>
                <td className="px-4 py-3 text-sm text-gray-500">Keeps you logged in</td>
                <td className="px-4 py-3 text-sm text-gray-500">Session</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700">csrf_token</td>
                <td className="px-4 py-3 text-sm text-gray-500">Essential</td>
                <td className="px-4 py-3 text-sm text-gray-500">Security protection</td>
                <td className="px-4 py-3 text-sm text-gray-500">Session</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700">preferences</td>
                <td className="px-4 py-3 text-sm text-gray-500">Functional</td>
                <td className="px-4 py-3 text-sm text-gray-500">Remembers your settings</td>
                <td className="px-4 py-3 text-sm text-gray-500">1 year</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-700">_analytics</td>
                <td className="px-4 py-3 text-sm text-gray-500">Analytics</td>
                <td className="px-4 py-3 text-sm text-gray-500">Usage statistics</td>
                <td className="px-4 py-3 text-sm text-gray-500">2 years</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Managing Cookies</h2>
        <p className="text-gray-600 mb-4">
          You can control cookies through your browser settings. Most browsers allow you to refuse cookies or delete existing cookies. Note that disabling essential cookies may prevent you from using certain Platform features.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Third-Party Cookies</h2>
        <p className="text-gray-600 mb-4">
          We use Paystack for payment processing, which may set its own cookies during transactions. These cookies are governed by Paystack&apos;s own privacy and cookie policies.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
        <p className="text-gray-600 mb-4">
          If you have questions about our use of cookies, contact us at privacy@intemso.com.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Governing Law</h2>
        <p className="text-gray-600 mb-4">
          This Cookie Policy is governed by the laws of the Republic of Ghana, including the Data Protection Act, 2012 (Act 843). Any disputes shall be subject to the exclusive jurisdiction of the courts of Ghana.
        </p>
      </section>
    </div>
  );
}

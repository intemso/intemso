export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-500 mt-2">Last updated: March 1, 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-gray">
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
        <p className="text-gray-600 mb-4">
          In accordance with the Ghana Data Protection Act, 2012 (Act 843), we collect information you provide directly: name, email address, university details, phone number, skills, and payment information. We also collect usage data including IP addresses, browser type, pages visited, and interaction data.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
        <p className="text-gray-600 mb-4">
          We use your information to: provide and improve the Platform, process payments, match students with gigs, communicate updates and notifications, prevent fraud, and comply with legal obligations.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
        <p className="text-gray-600 mb-4">
          We share information with: employers (your profile, proposals), payment processors (Paystack), and service providers who assist in Platform operations. We do not sell your personal data to third parties.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
        <p className="text-gray-600 mb-4">
          We implement industry-standard security measures including encryption in transit (TLS), secure password hashing, and regular security audits. However, no system is completely secure, and we cannot guarantee absolute security.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Data Retention</h2>
        <p className="text-gray-600 mb-4">
          We retain your data for as long as your account is active. After account deletion, we retain certain data for legal compliance purposes for up to 5 years. Transaction records may be retained for accounting requirements.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Your Rights</h2>
        <p className="text-gray-600 mb-4">
          Under the Ghana Data Protection Act, 2012 (Act 843), you have the right to: access your personal data held by us, correct inaccurate data, request deletion of your account and data, export your data in a portable format, and opt out of marketing communications. Contact us at privacy@intemso.com to exercise these rights.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Cookies</h2>
        <p className="text-gray-600 mb-4">
          We use cookies for authentication, preferences, and analytics. See our Cookie Policy for details on the cookies we use and how to manage them.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Changes to This Policy</h2>
        <p className="text-gray-600 mb-4">
          We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on the Platform.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
        <p className="text-gray-600 mb-4">
          For privacy-related questions, contact our Data Protection Officer at privacy@intemso.com or write to us at Accra, Ghana.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">10. Governing Law</h2>
        <p className="text-gray-600 mb-4">
          This Privacy Policy is governed by the laws of the Republic of Ghana, including the Data Protection Act, 2012 (Act 843) and the Electronic Transactions Act, 2008 (Act 772). Any disputes arising from this policy shall be subject to the exclusive jurisdiction of the courts of Ghana.
        </p>
      </section>
    </div>
  );
}

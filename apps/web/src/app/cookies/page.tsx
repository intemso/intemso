import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy | Intemso',
  description: 'Cookie Policy for the Intemso platform.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
          <p className="text-gray-500 mt-2">Effective Date: 1 April 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none">

          <p className="text-gray-600 mb-6">
            This Cookie Policy (hereinafter referred to as &quot;Policy&quot;) explains how Intemso (hereinafter referred to as &quot;Intemso,&quot; &quot;the Company,&quot; &quot;we,&quot; &quot;us&quot; or &quot;our&quot;) uses cookies and similar tracking technologies on the Intemso platform, including the website at intemso.com, all associated subdomains (including but not limited to jobs.intemso.com and hire.intemso.com), and any related services (collectively referred to as the &quot;Platform&quot;). This Policy describes the types of cookies we use, the purposes for which we use them, and the choices available to you regarding cookies.
          </p>
          <p className="text-gray-600 mb-8">
            This Policy is issued in compliance with the Data Protection Act, 2012 (Act 843), the Electronic Transactions Act, 2008 (Act 772), and the Cybersecurity Act, 2020 (Act 1038) of the Republic of Ghana. This Policy should be read in conjunction with our <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">Privacy Policy</Link> and <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link>.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">1. What Are Cookies</h2>
          <p className="text-gray-600 mb-4">
            Cookies are small text files that are placed on your device (computer, tablet, smartphone, or other internet enabled device) when you visit a website. Cookies are widely used by website operators to make websites function, to improve efficiency and user experience, and to provide reporting and analytical information. Cookies may be set by the website you are visiting (known as &quot;first party cookies&quot;) or by third party services that have content embedded on the website (known as &quot;third party cookies&quot;). Cookies may remain on your device for the duration of your browsing session (known as &quot;session cookies&quot;) or may persist after your browser is closed (known as &quot;persistent cookies&quot;).
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. Types of Cookies We Use</h2>
          <p className="text-gray-600 mb-4">
            Intemso uses the following categories of cookies:
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.1 Strictly Necessary Cookies</h3>
          <p className="text-gray-600 mb-4">
            These cookies are essential for the operation of the Platform and enable core functionalities such as security, authentication, session management, and accessibility. Without these cookies, the Platform cannot function properly. These cookies do not require your consent as they are necessary for the provision of the services you have requested.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Cookie Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Purpose</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">intemso_session</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Maintains your authenticated session and enables secure access to your Account.</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Session</td>
                  <td className="px-4 py-3 text-sm text-gray-500">First party</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">intemso_csrf</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Protects against cross site request forgery attacks by validating form submissions and state changing requests.</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Session</td>
                  <td className="px-4 py-3 text-sm text-gray-500">First party</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">intemso_auth</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Stores your JSON Web Token for stateless authentication across Platform services.</td>
                  <td className="px-4 py-3 text-sm text-gray-500">7 days</td>
                  <td className="px-4 py-3 text-sm text-gray-500">First party</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">intemso_refresh</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Stores the refresh token used to renew your authentication session without requiring you to log in again.</td>
                  <td className="px-4 py-3 text-sm text-gray-500">30 days</td>
                  <td className="px-4 py-3 text-sm text-gray-500">First party</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">cookie_consent</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Records your cookie consent preferences to ensure we respect your choices on subsequent visits.</td>
                  <td className="px-4 py-3 text-sm text-gray-500">365 days</td>
                  <td className="px-4 py-3 text-sm text-gray-500">First party</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.2 Functional Cookies</h3>
          <p className="text-gray-600 mb-4">
            These cookies enable enhanced functionality and personalization, such as remembering your preferences, language settings, and display options. They may be set by Intemso or by third party providers whose services we have integrated into the Platform. If you do not allow these cookies, some or all of these features may not function properly.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Cookie Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Purpose</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">intemso_theme</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Remembers your preferred display theme (light or dark mode).</td>
                  <td className="px-4 py-3 text-sm text-gray-500">365 days</td>
                  <td className="px-4 py-3 text-sm text-gray-500">First party</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">intemso_locale</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Stores your language and regional preferences for a localized experience.</td>
                  <td className="px-4 py-3 text-sm text-gray-500">365 days</td>
                  <td className="px-4 py-3 text-sm text-gray-500">First party</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">intemso_sidebar</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Remembers the state of the navigation sidebar (expanded or collapsed).</td>
                  <td className="px-4 py-3 text-sm text-gray-500">365 days</td>
                  <td className="px-4 py-3 text-sm text-gray-500">First party</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">intemso_notifications</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Stores your notification display preferences and tracks which notifications have been read.</td>
                  <td className="px-4 py-3 text-sm text-gray-500">30 days</td>
                  <td className="px-4 py-3 text-sm text-gray-500">First party</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.3 Analytics and Performance Cookies</h3>
          <p className="text-gray-600 mb-4">
            These cookies collect information about how you use the Platform, including which pages you visit, how long you spend on each page, errors you encounter, and general usage patterns. The information collected is aggregated and anonymized and is used to improve the performance and user experience of the Platform.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Cookie Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Purpose</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">_ga</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Google Analytics cookie used to distinguish unique users by assigning a randomly generated identifier.</td>
                  <td className="px-4 py-3 text-sm text-gray-500">2 years</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Third party</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">_ga_*</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Google Analytics 4 cookie used to persist session state and track usage across sessions.</td>
                  <td className="px-4 py-3 text-sm text-gray-500">2 years</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Third party</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">_gid</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Google Analytics cookie used to distinguish users and throttle request rate.</td>
                  <td className="px-4 py-3 text-sm text-gray-500">24 hours</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Third party</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">intemso_perf</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Collects anonymized performance metrics including page load times and error rates to help us optimize Platform speed.</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Session</td>
                  <td className="px-4 py-3 text-sm text-gray-500">First party</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.4 Marketing and Advertising Cookies</h3>
          <p className="text-gray-600 mb-4">
            At this time, Intemso does not use marketing or advertising cookies to track Users across websites for advertising purposes. Should we introduce marketing cookies in the future, we will update this Policy accordingly and obtain your consent before placing such cookies on your device.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. Other Tracking Technologies</h2>
          <p className="text-gray-600 mb-4">
            In addition to cookies, Intemso may use the following tracking technologies:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
            <li><strong>Local Storage and Session Storage:</strong> Web storage mechanisms used to store data locally on your device. Unlike cookies, this data is not automatically sent with each HTTP request. We use local storage to cache certain application data to improve performance and to store non sensitive user preferences.</li>
            <li><strong>Pixel Tags (Web Beacons):</strong> Small transparent image files embedded in web pages or emails that allow us to track whether a page has been viewed or an email has been opened. These are used in conjunction with analytics cookies to measure Platform usage.</li>
            <li><strong>JavaScript Tags:</strong> Code snippets used to collect usage data and deliver certain Platform features dynamically.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">4. Your Cookie Choices</h2>
          <p className="text-gray-600 mb-4">
            You have the following options for managing cookies:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
            <li><strong>Cookie Consent Banner:</strong> When you first visit the Platform, a cookie consent banner will be displayed, allowing you to accept or decline non essential cookies. You may update your cookie preferences at any time through the cookie settings accessible in the footer of the Platform.</li>
            <li><strong>Browser Settings:</strong> Most web browsers allow you to control cookies through their settings. You can configure your browser to block all cookies, block only third party cookies, or delete cookies when you close your browser. Please note that blocking all cookies may impair the functionality of the Platform, particularly the strictly necessary cookies required for authentication and session management.</li>
            <li><strong>Google Analytics Opt Out:</strong> You can opt out of Google Analytics tracking by installing the Google Analytics Opt Out Browser Add On, which is freely available from Google.</li>
          </ul>
          <p className="text-gray-600 mb-4">
            Please note that if you choose to disable or delete cookies, certain features of the Platform may not function as intended, and your user experience may be affected. Strictly necessary cookies cannot be disabled as they are essential for the operation of the Platform.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">5. Cookie Retention Periods</h2>
          <p className="text-gray-600 mb-4">
            Session cookies are automatically deleted when you close your browser. Persistent cookies remain on your device until they expire or until you delete them manually. The retention periods for each cookie are specified in the tables above. We review our cookie usage periodically and remove cookies that are no longer necessary.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">6. Data Collected Through Cookies</h2>
          <p className="text-gray-600 mb-4">
            Personal data collected through cookies is processed in accordance with our <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">Privacy Policy</Link>. Analytics data is aggregated and anonymized before being used for reporting purposes. Where cookies collect personal data, the legal basis for such processing is either your consent (for non essential cookies) or the legitimate interests of Intemso (for strictly necessary and functional cookies), as described in the Privacy Policy.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">7. Third Party Cookies</h2>
          <p className="text-gray-600 mb-4">
            Certain cookies on the Platform are set by third party services that Intemso has integrated, including Google Analytics and Paystack. These third party services operate their own cookie and privacy policies, which are separate from this Policy. Intemso does not control the cookies set by third parties and is not responsible for their data processing practices. We encourage you to review the privacy policies of these third party services for more information about how they handle your data.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">8. Changes to This Policy</h2>
          <p className="text-gray-600 mb-4">
            Intemso reserves the right to update or modify this Cookie Policy at any time. When we make material changes to the types of cookies we use or the purposes for which we use them, we will update this Policy and display a new cookie consent banner so that you can review and update your preferences. The updated Policy will specify the effective date of the changes. Your continued use of the Platform after the effective date constitutes your acceptance of the changes.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">9. Contact Information</h2>
          <p className="text-gray-600 mb-4">
            For questions or concerns regarding this Cookie Policy or our use of cookies, please contact Intemso through the contact form available on the Platform or through any other official communication channel provided by Intemso.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              This Cookie Policy was last updated on 1 April 2026.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}

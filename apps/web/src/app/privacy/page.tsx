import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Intemso',
  description: 'Privacy Policy for the Intemso platform.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-500 mt-2">Effective Date: 1 April 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none">

          <p className="text-gray-600 mb-6">
            This Privacy Policy (hereinafter referred to as &quot;Policy&quot;) describes how Intemso (hereinafter referred to as &quot;Intemso,&quot; &quot;the Company,&quot; &quot;we,&quot; &quot;us&quot; or &quot;our&quot;), a company incorporated and operating under the laws of the Republic of Ghana, collects, uses, stores, shares, protects, and otherwise processes personal data and information from users (hereinafter referred to as &quot;Users,&quot; &quot;you&quot; or &quot;your&quot;) of the Intemso platform, including the website at intemso.com, all associated subdomains (including but not limited to jobs.intemso.com and hire.intemso.com), mobile applications, application programming interfaces, and any related services (collectively referred to as the &quot;Platform&quot;).
          </p>
          <p className="text-gray-600 mb-6">
            This Policy is issued and maintained in compliance with the Data Protection Act, 2012 (Act 843) of the Republic of Ghana, the Cybersecurity Act, 2020 (Act 1038), and all applicable data protection regulations and guidelines issued by the Data Protection Commission of Ghana. By accessing or using the Platform, you acknowledge that you have read, understood, and agree to the collection and processing of your personal data as described in this Policy. If you do not agree to this Policy, you must immediately cease all use of the Platform.
          </p>
          <p className="text-gray-600 mb-8">
            This Policy should be read in conjunction with our <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link>, <Link href="/cookies" className="text-primary-600 hover:text-primary-700 underline">Cookie Policy</Link>, and all other policies referenced therein.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">1. Data Controller</h2>
          <p className="text-gray-600 mb-4">
            For the purposes of the Data Protection Act, 2012 (Act 843), Intemso is the data controller responsible for processing your personal data. As the data controller, Intemso determines the purposes and means of processing personal data collected through the Platform and is accountable for ensuring that such processing complies with the requirements of the Data Protection Act, 2012 (Act 843) and all applicable regulations and guidelines issued by the Data Protection Commission of Ghana.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. Personal Data We Collect</h2>
          <p className="text-gray-600 mb-4">
            Intemso collects and processes the following categories of personal data:
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.1 Information You Provide Directly</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
            <li><strong>Account Registration Data:</strong> Full name, university email address, personal email address (where applicable), Ghana Card number, phone number, date of birth, gender, university name, course of study, year of study, and password (stored in encrypted form).</li>
            <li><strong>Profile Information:</strong> Professional title, biography, profile photograph, skills, hourly rate, availability status, languages spoken, location, and links to external portfolios or social media profiles.</li>
            <li><strong>Identity Verification Data:</strong> Ghana Card number, university identification number, university email address, and any additional documentation submitted for identity or enrollment verification purposes.</li>
            <li><strong>Financial and Payment Data:</strong> Mobile money account details (including provider and phone number), bank account details (including bank name and account number), transaction history, earnings history, withdrawal history, and Connects purchase history. We do not store full credit or debit card numbers; these are processed directly by our Payment Processor, Paystack.</li>
            <li><strong>Gig and Contract Data:</strong> Gig postings, applications, contract details, milestone details, deliverables, work history, ratings, reviews, and completion records.</li>
            <li><strong>Communication Data:</strong> Messages exchanged between Users through the Platform&apos;s messaging system, support requests, dispute communications, and feedback submissions.</li>
            <li><strong>Portfolio and Showcase Data:</strong> Portfolio items, case studies, work samples, images, documents, and other creative materials uploaded to the Platform.</li>
            <li><strong>Community Data:</strong> Community forum posts, comments, replies, reactions, and participation history.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.2 Information Collected Automatically</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
            <li><strong>Device and Technical Data:</strong> IP address, device type, operating system and version, browser type and version, screen resolution, device identifiers, referring URLs, and language preferences.</li>
            <li><strong>Usage Data:</strong> Pages viewed, features used, actions taken, search queries, time spent on pages, click patterns, navigation paths, login and logout timestamps, and session duration.</li>
            <li><strong>Cookie Data:</strong> Information collected through cookies and similar tracking technologies, as described in our <Link href="/cookies" className="text-primary-600 hover:text-primary-700 underline">Cookie Policy</Link>.</li>
            <li><strong>Location Data:</strong> Approximate geographical location derived from your IP address. We do not collect precise GPS location data unless you explicitly grant permission.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.3 Information from Third Parties</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
            <li><strong>Payment Processor Data:</strong> Transaction status, payment confirmations, refund status, and chargeback information received from Paystack.</li>
            <li><strong>University Verification Data:</strong> Enrollment status confirmations received from universities or educational institutions, where applicable.</li>
            <li><strong>Authentication Providers:</strong> If you choose to register or sign in using a third party authentication provider (such as Google), we may receive your name, email address, and profile image from that provider.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. Legal Basis for Processing</h2>
          <p className="text-gray-600 mb-4">
            In accordance with the Data Protection Act, 2012 (Act 843), we process your personal data on the following legal bases:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
            <li><strong>Consent:</strong> Where you have given clear and informed consent for the processing of your personal data for specific purposes, such as receiving marketing communications or participating in optional surveys. You may withdraw your consent at any time through your Account settings or by contacting us through the Platform.</li>
            <li><strong>Performance of Contract:</strong> Where the processing is necessary for the performance of a contract to which you are a party, or in order to take steps at your request prior to entering into a contract. This includes processing necessary to provide the Platform&apos;s services, facilitate gig postings, applications, contracts, payments, and communications between Users.</li>
            <li><strong>Legitimate Interest:</strong> Where the processing is necessary for the legitimate interests pursued by Intemso or a third party, provided that such interests are not overridden by your fundamental rights and freedoms. Our legitimate interests include operating and improving the Platform, preventing fraud, ensuring the security of the Platform, conducting analytics, and enforcing our Terms of Service.</li>
            <li><strong>Legal Obligation:</strong> Where the processing is necessary for compliance with a legal obligation to which Intemso is subject, including obligations under the Data Protection Act, 2012 (Act 843), the Anti Money Laundering Act, 2020 (Act 1044), the Income Tax Act, 2015 (Act 896), and other applicable laws and regulations of the Republic of Ghana.</li>
            <li><strong>Protection of Vital Interests:</strong> Where the processing is necessary to protect the vital interests of the data subject or another natural person.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">4. How We Use Your Personal Data</h2>
          <p className="text-gray-600 mb-4">
            We use your personal data for the following purposes:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
            <li><strong>Account Creation and Management:</strong> To create, maintain, and administer your Account; to verify your identity and eligibility; and to authenticate your access to the Platform.</li>
            <li><strong>Platform Services:</strong> To facilitate gig posting, application submission, contract formation, milestone management, payment processing, and communication between Users.</li>
            <li><strong>Payment Processing:</strong> To process payments, manage escrow funds, distribute earnings, process Connects purchases, and maintain financial records, in conjunction with our Payment Processor.</li>
            <li><strong>Communication:</strong> To send you transactional notifications (such as contract updates, payment confirmations, and milestone status changes), security alerts, and platform announcements. To facilitate messaging between Users.</li>
            <li><strong>Platform Improvement:</strong> To analyze usage patterns, conduct research, and improve the functionality, design, features, and overall user experience of the Platform.</li>
            <li><strong>Safety and Security:</strong> To detect, prevent, and address fraud, abuse, security incidents, and technical issues; to enforce our Terms of Service and other policies; and to protect the safety and rights of Users and Intemso.</li>
            <li><strong>Dispute Resolution:</strong> To facilitate the resolution of disputes between Users, including by reviewing communications, contract details, and submitted evidence.</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, and governmental requests, including those relating to taxation, anti money laundering, and data protection.</li>
            <li><strong>Marketing and Promotional Communications:</strong> With your consent, to send you information about new features, promotions, events, and opportunities on the Platform. You may opt out of marketing communications at any time through your Account settings.</li>
            <li><strong>Analytics and Reporting:</strong> To generate aggregated, anonymized statistics and reports about Platform usage, user demographics, marketplace trends, and business performance.</li>
            <li><strong>Talent Matching and Recommendations:</strong> To recommend gigs to Students based on their skills, preferences, and history; and to recommend Students to Employers based on the requirements of their posted gigs.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">5. Data Sharing and Disclosure</h2>
          <p className="text-gray-600 mb-4">
            Intemso does not sell your personal data to third parties. We may share your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
            <li><strong>Between Users:</strong> When you engage with other Users on the Platform, certain information from your profile (such as your name, profile photograph, university, skills, ratings, reviews, and Job Success Score) is visible to other Users. When you enter into a Contract, the other party may see additional information necessary for the performance of the Contract.</li>
            <li><strong>Payment Processor:</strong> We share payment related data with our Payment Processor, Paystack, to facilitate transactions. Paystack processes this data in accordance with its own privacy policy and applicable data protection laws.</li>
            <li><strong>Service Providers:</strong> We may share your personal data with trusted third party service providers who assist us in operating the Platform, including cloud hosting providers, analytics services, email delivery services, and customer support tools. These service providers are contractually obligated to process your data only on our instructions and in compliance with the Data Protection Act, 2012 (Act 843).</li>
            <li><strong>Legal Requirements:</strong> We may disclose your personal data if required to do so by law, regulation, court order, subpoena, or other legal process, or if we believe in good faith that such disclosure is necessary to: (a) comply with a legal obligation; (b) protect and defend the rights, property, or safety of Intemso, its Users, or the public; (c) prevent or investigate possible wrongdoing in connection with the Platform; or (d) cooperate with law enforcement or regulatory authorities.</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, corporate reorganization, sale of assets, or similar transaction involving Intemso, your personal data may be transferred to the acquiring entity or successor, subject to the same data protection obligations as described in this Policy.</li>
            <li><strong>With Your Consent:</strong> We may share your personal data with third parties when you have given your explicit consent for such sharing.</li>
            <li><strong>Aggregated and Anonymized Data:</strong> We may share aggregated, anonymized, or de identified data that cannot reasonably be used to identify you, for research, statistical, analytical, or business purposes.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">6. Data Retention</h2>
          <p className="text-gray-600 mb-4">
            We retain your personal data for as long as is necessary to fulfil the purposes for which it was collected, as outlined in this Policy, and to comply with our legal, regulatory, and contractual obligations. The specific retention periods are as follows:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
            <li><strong>Account Data:</strong> Retained for the duration of your Account and for a period of five (5) years following Account termination or deletion, to comply with legal, regulatory, and audit requirements.</li>
            <li><strong>Transaction and Financial Data:</strong> Retained for a minimum of seven (7) years following the date of the transaction, in accordance with the Income Tax Act, 2015 (Act 896) and the Anti Money Laundering Act, 2020 (Act 1044).</li>
            <li><strong>Communication Data:</strong> Messages and support communications are retained for the duration of your Account and for a period of three (3) years following Account termination.</li>
            <li><strong>Usage and Technical Data:</strong> Retained for a period of two (2) years from the date of collection, after which it is aggregated and anonymized.</li>
            <li><strong>Identity Verification Data:</strong> Retained for the duration of your Account and for a period of five (5) years following Account termination.</li>
          </ul>
          <p className="text-gray-600 mb-4">
            Upon expiration of the relevant retention period, personal data will be securely deleted, anonymized, or destroyed in accordance with industry best practices and the requirements of the Data Protection Act, 2012 (Act 843). Where personal data is retained for legal compliance purposes, it will be stored securely and access will be restricted to authorized personnel only.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">7. Data Security</h2>
          <p className="text-gray-600 mb-4">
            Intemso implements appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, destruction, loss, and misuse, in compliance with the Data Protection Act, 2012 (Act 843) and the Cybersecurity Act, 2020 (Act 1038). These measures include, but are not limited to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
            <li>Encryption of data in transit using industry standard TLS (Transport Layer Security) protocols.</li>
            <li>Encryption of sensitive data at rest using strong encryption algorithms.</li>
            <li>Secure password hashing using bcrypt or equivalent cryptographic hashing algorithms.</li>
            <li>Access controls and role based permissions to restrict access to personal data to authorized personnel only.</li>
            <li>Regular security assessments, vulnerability scans, and penetration testing.</li>
            <li>Firewalls, intrusion detection systems, and other network security measures.</li>
            <li>Regular backup procedures with encrypted storage.</li>
            <li>Secure development practices, including code reviews and security testing during the software development life cycle.</li>
            <li>Incident response procedures for the timely detection, investigation, and remediation of data security incidents.</li>
          </ul>
          <p className="text-gray-600 mb-4">
            While Intemso takes reasonable measures to protect your personal data, no method of transmission over the internet or electronic storage is completely secure. Intemso cannot guarantee absolute security and shall not be liable for unauthorized access or data breaches attributable to factors beyond its reasonable control.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">8. Your Rights Under the Data Protection Act, 2012 (Act 843)</h2>
          <p className="text-gray-600 mb-4">
            As a data subject under the Data Protection Act, 2012 (Act 843), you have the following rights with respect to your personal data:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
            <li><strong>Right of Access:</strong> You have the right to request confirmation of whether Intemso processes your personal data and to obtain a copy of the personal data we hold about you. We will respond to your request within thirty (30) calendar days.</li>
            <li><strong>Right to Rectification:</strong> You have the right to request the correction of inaccurate or incomplete personal data. You may update most of your personal data directly through your Account settings.</li>
            <li><strong>Right to Erasure:</strong> You have the right to request the deletion of your personal data, subject to our legal obligation to retain certain data as described in Section 6. Where deletion is not possible due to legal requirements, we will restrict the processing of your data and inform you of the applicable retention period.</li>
            <li><strong>Right to Restriction of Processing:</strong> You have the right to request the restriction of processing of your personal data in certain circumstances, including where you contest the accuracy of the data, where the processing is unlawful, or where you have objected to the processing pending verification of the legitimate grounds.</li>
            <li><strong>Right to Object:</strong> You have the right to object to the processing of your personal data where the processing is based on our legitimate interests or for direct marketing purposes. Where you object to direct marketing, we will cease such processing without delay.</li>
            <li><strong>Right to Data Portability:</strong> You have the right to receive the personal data you have provided to us in a structured, commonly used, and machine readable format, and to request the transmission of that data to another data controller, where technically feasible.</li>
            <li><strong>Right to Withdraw Consent:</strong> Where the processing of your personal data is based on your consent, you have the right to withdraw your consent at any time. The withdrawal of consent shall not affect the lawfulness of processing carried out prior to the withdrawal.</li>
            <li><strong>Right to Lodge a Complaint:</strong> If you believe that Intemso has processed your personal data in violation of the Data Protection Act, 2012 (Act 843), you have the right to lodge a complaint with the Data Protection Commission of Ghana.</li>
          </ul>
          <p className="text-gray-600 mb-4">
            To exercise any of the above rights, please contact us through the official contact channels provided on the Platform. We may require you to verify your identity before processing your request. We will respond to all valid data subject requests within thirty (30) calendar days, or within such longer period as may be permitted under applicable law, provided we notify you of the extension and the reasons therefor.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">9. Children&apos;s Privacy</h2>
          <p className="text-gray-600 mb-4">
            The Platform is not directed at and is not intended for use by individuals under the age of eighteen (18). Intemso does not knowingly collect personal data from individuals under the age of eighteen (18). If we become aware that we have collected personal data from an individual under the age of eighteen (18) without valid parental or guardian consent, we will take steps to delete such data as soon as reasonably practicable. If you believe that we have inadvertently collected personal data from a minor, please contact us through the official contact channels on the Platform.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">10. International Data Transfers</h2>
          <p className="text-gray-600 mb-4">
            The Platform is primarily operated from the Republic of Ghana, and your personal data is stored and processed within the Republic of Ghana. In certain circumstances, your personal data may be transferred to, stored, or processed in countries outside the Republic of Ghana, for example, where our service providers operate data centres or processing facilities in other jurisdictions. Where such international transfers occur, Intemso will ensure that appropriate safeguards are in place to protect your personal data in compliance with the Data Protection Act, 2012 (Act 843), including but not limited to: (a) ensuring that the receiving country provides an adequate level of data protection; (b) entering into data processing agreements with appropriate contractual clauses; or (c) obtaining your explicit consent for the transfer. Intemso will not transfer your personal data to any country that does not provide adequate data protection without implementing appropriate safeguards as required by the Data Protection Act, 2012 (Act 843).
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">11. Data Breach Notification</h2>
          <p className="text-gray-600 mb-4">
            In the event of a personal data breach that is likely to result in a risk to your rights and freedoms, Intemso will: (a) notify the Data Protection Commission of Ghana within seventy two (72) hours of becoming aware of the breach, in accordance with the Data Protection Act, 2012 (Act 843); (b) notify affected Users without undue delay where the breach is likely to result in a high risk to their rights and freedoms; and (c) document all personal data breaches, including the facts relating to the breach, its effects, and the remedial actions taken. The notification to affected Users shall describe the nature of the breach, the categories and approximate number of data subjects affected, the likely consequences of the breach, and the measures taken or proposed to be taken to address the breach and mitigate its adverse effects.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">12. Automated Decision Making</h2>
          <p className="text-gray-600 mb-4">
            Intemso may use automated processing, including algorithms and machine learning, to provide certain features on the Platform, including: talent matching and gig recommendations, calculation of Job Success Scores, fraud detection and prevention, and content moderation. Where automated processing produces a decision that significantly affects you, you have the right to request human review of that decision. You may exercise this right by contacting us through the official contact channels on the Platform.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">13. Third Party Links</h2>
          <p className="text-gray-600 mb-4">
            The Platform may contain links to third party websites, services, or applications that are not operated or controlled by Intemso. This Policy does not apply to third party websites or services. We encourage you to review the privacy policies of any third party website you visit. Intemso is not responsible for the privacy practices or content of third party websites, and the inclusion of a link on the Platform does not imply endorsement by Intemso.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">14. Changes to This Policy</h2>
          <p className="text-gray-600 mb-4">
            Intemso reserves the right to update or modify this Policy at any time. When we make material changes, we will provide reasonable notice to Users through the Platform, including by displaying a prominent notice or sending a notification through the Platform. The updated Policy will specify the effective date. Your continued use of the Platform after the effective date of any modification constitutes your acceptance of the modified Policy. If you do not agree with the modified Policy, you must stop using the Platform and may terminate your Account. We encourage you to review this Policy periodically.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">15. Contact Information</h2>
          <p className="text-gray-600 mb-4">
            For questions, concerns, or requests relating to this Privacy Policy or the processing of your personal data, please contact Intemso through the contact form available on the Platform or through any other official communication channel provided by Intemso. If you are not satisfied with our response, you have the right to lodge a complaint with the Data Protection Commission of Ghana.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              This Privacy Policy was last updated on 1 April 2026.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}

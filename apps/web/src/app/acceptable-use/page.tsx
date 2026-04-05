import Link from 'next/link';

export const metadata = {
  title: 'Acceptable Use Policy | Intemso',
  description: 'Acceptable Use Policy for the Intemso platform.',
};

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Acceptable Use Policy</h1>
          <p className="text-gray-500 mt-2">Effective Date: 1 April 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none">

          <p className="text-gray-600 mb-6">
            This Acceptable Use Policy (hereinafter referred to as &quot;Policy&quot;) sets out the rules and standards of conduct that apply to all users (hereinafter referred to as &quot;Users,&quot; &quot;you&quot; or &quot;your&quot;) of the Intemso platform, including the website at intemso.com, all associated subdomains, mobile applications, and any related services (collectively referred to as the &quot;Platform&quot;). This Policy supplements and forms part of the <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link> and is incorporated therein by reference.
          </p>
          <p className="text-gray-600 mb-8">
            By accessing or using the Platform, you agree to comply with this Policy in its entirety. Violations of this Policy may result in warnings, temporary suspension, permanent termination of your Account, forfeiture of funds, or referral to law enforcement authorities, as determined by Intemso in its sole discretion.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">1. Permitted Use</h2>
          <p className="text-gray-600 mb-4">
            The Platform is intended to be used solely for lawful purposes in accordance with the <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link>. You may use the Platform to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Create and maintain a User profile that accurately represents your identity, skills, and qualifications.</li>
            <li>Post gigs for legitimate tasks and projects (as an Employer).</li>
            <li>Submit proposals and perform work in accordance with agreed Contracts (as a Student).</li>
            <li>Communicate with other Users through the Platform&apos;s messaging system for purposes related to gig work.</li>
            <li>Process payments and manage financial transactions through the Platform&apos;s payment and escrow system.</li>
            <li>Participate in the Community forums in a constructive and respectful manner.</li>
            <li>Build and display a portfolio of professional work through the Showcase feature.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. Prohibited Content</h2>
          <p className="text-gray-600 mb-4">
            Users may not upload, post, transmit, share, or otherwise make available on the Platform any content that:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Is defamatory, libellous, slanderous, or constitutes an unjustified attack on the reputation of any individual, organization, or entity.</li>
            <li>Is obscene, pornographic, sexually explicit, or contains nudity, unless such content is integral to a legitimate creative or artistic project and is properly classified.</li>
            <li>Promotes, incites, or glorifies violence, terrorism, self harm, or physical harm against any individual or group.</li>
            <li>Constitutes hate speech, discrimination, or harassment on the basis of race, ethnicity, national origin, religion, gender, gender identity, sexual orientation, age, disability, or any other protected characteristic under the laws of the Republic of Ghana.</li>
            <li>Contains or promotes illegal activities, including but not limited to drug trafficking, money laundering, fraud, theft, or any activity that contravenes the Criminal Offences Act, 1960 (Act 29) or any other applicable legislation of the Republic of Ghana.</li>
            <li>Infringes upon or violates any intellectual property rights of any third party, including copyrights, trademarks, trade secrets, patents, or moral rights, in contravention of the Copyright Act, 2005 (Act 690) or other applicable intellectual property legislation.</li>
            <li>Contains malware, viruses, trojan horses, ransomware, spyware, worms, or any other malicious software or code intended to damage, disrupt, or gain unauthorized access to computer systems or data, in contravention of the Cybersecurity Act, 2020 (Act 1038).</li>
            <li>Contains personal data of third parties without their consent, including but not limited to private addresses, phone numbers, financial information, identification numbers, or photographs, in violation of the Data Protection Act, 2012 (Act 843).</li>
            <li>Contains spam, unsolicited advertisements, promotional materials, chain letters, pyramid schemes, or other forms of commercial solicitation.</li>
            <li>Is misleading, deceptive, or fraudulent, including but not limited to fake reviews, false claims of qualifications or experience, impersonation, or misrepresentation of identity.</li>
            <li>Constitutes or facilitates academic dishonesty, including but not limited to offering to write academic papers, complete coursework, sit examinations, or otherwise cheat on behalf of another individual enrolled at an educational institution.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. Prohibited Conduct</h2>
          <p className="text-gray-600 mb-4">
            Users may not engage in the following conduct on or through the Platform:
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.1 Account and Identity Violations</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Creating or maintaining multiple Accounts for the same individual or entity.</li>
            <li>Using another person&apos;s Account or identity without their express authorization.</li>
            <li>Impersonating any person, entity, University, institution, or organization, or falsely claiming an affiliation that does not exist.</li>
            <li>Providing false, misleading, or inaccurate information during registration or at any time during the use of the Platform.</li>
            <li>Selling, transferring, lending, or otherwise sharing your Account credentials with any third party.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.2 Financial and Payment Violations</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Circumventing or attempting to circumvent the Platform&apos;s payment system by arranging for direct payments outside the Platform for work initiated, discovered, or facilitated through the Platform, in violation of Section 6 of the <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link>.</li>
            <li>Using the Platform for money laundering, financing of terrorism, or any financial crime prohibited by the Anti Money Laundering Act, 2020 (Act 1044).</li>
            <li>Using stolen, forged, or unauthorized payment methods to fund Contracts, purchase Connects, or conduct any financial transaction on the Platform.</li>
            <li>Filing fraudulent chargebacks, disputes, or payment reversals with payment providers for transactions that were legitimately completed on the Platform.</li>
            <li>Artificially inflating earnings, creating fake Contracts, or engaging in sham transactions to manipulate financial metrics or reputation scores.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.3 Platform Integrity Violations</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Interfering with, disrupting, or attempting to gain unauthorized access to the Platform&apos;s systems, servers, databases, networks, or infrastructure.</li>
            <li>Conducting or facilitating denial of service attacks, brute force attacks, SQL injection, cross site scripting, or any other form of cyberattack against the Platform, in violation of the Cybersecurity Act, 2020 (Act 1038).</li>
            <li>Scraping, crawling, harvesting, or extracting data from the Platform through automated means (including bots, spiders, scrapers, or APIs) without the express prior written consent of Intemso.</li>
            <li>Reverse engineering, decompiling, disassembling, or attempting to derive the source code of the Platform or any of its components.</li>
            <li>Circumventing, disabling, or interfering with any security features, access controls, or digital rights management measures of the Platform.</li>
            <li>Using the Platform in any manner that could damage, disable, overburden, or impair the Platform&apos;s servers, networks, or infrastructure.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.4 Communication and Interaction Violations</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Harassing, bullying, threatening, intimidating, stalking, or menacing any other User, whether through the Platform&apos;s messaging system, community forums, reviews, or any other feature.</li>
            <li>Sending unsolicited bulk messages, spam, or promotional communications to other Users.</li>
            <li>Using the Platform&apos;s messaging system for purposes unrelated to gig work or Platform activities, including personal solicitations, religious proselytizing, political campaigning, or commercial advertisements for services or products unrelated to the Platform.</li>
            <li>Sharing external contact information (including phone numbers, personal email addresses, social media handles, or messaging application identifiers) for the purpose of conducting transactions or work outside the Platform to circumvent Service Fees.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.5 Review and Reputation Manipulation</h3>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Submitting fake, fabricated, or misleading reviews or ratings.</li>
            <li>Soliciting, purchasing, or exchanging reviews or ratings for compensation, Connects, or other incentives.</li>
            <li>Threatening negative reviews as a form of coercion, blackmail, or leverage during contract negotiations or disputes.</li>
            <li>Coordinating with other Users to artificially inflate or deflate reputation scores.</li>
            <li>Using multiple Accounts to submit multiple reviews on a single Contract or User profile.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">4. Gig Specific Restrictions</h2>
          <p className="text-gray-600 mb-4">
            The following types of gigs are strictly prohibited on the Platform:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Gigs that require work that is illegal under the laws of the Republic of Ghana or any other applicable jurisdiction.</li>
            <li>Gigs that involve the creation of content designed to deceive, defraud, or mislead third parties, including but not limited to fake reviews for third party platforms, fraudulent documents, phishing content, or counterfeit materials.</li>
            <li>Gigs that involve academic dishonesty, including writing essays, theses, dissertations, or coursework for students at educational institutions who will submit such work as their own.</li>
            <li>Gigs that require the creation of malware, hacking tools, exploits, or any other software designed for unauthorized access to computer systems or data.</li>
            <li>Gigs that involve gambling, lottery schemes, or games of chance, unless specifically authorized under the Gaming Act, 2006 (Act 721) of the Republic of Ghana.</li>
            <li>Gigs that involve the sale or promotion of controlled substances, counterfeit goods, weapons, or any other items or services that are prohibited or restricted under the laws of the Republic of Ghana.</li>
            <li>Gigs that involve the creation or distribution of non consensual intimate imagery or exploitative content.</li>
            <li>Gigs that require the Student to provide personal financial information, such as bank account access, cryptocurrency wallet keys, or personal identification documents, to the Employer.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">5. Reporting Violations</h2>
          <p className="text-gray-600 mb-4">
            If you become aware of any User or content that violates this Policy, you are encouraged to report it to Intemso through the reporting features available on the Platform, including the &quot;Report&quot; button available on profiles, gig listings, messages, community posts, and reviews. You may also report violations through the contact channels available on the Platform. All reports will be reviewed by Intemso&apos;s moderation team. Intemso will endeavour to investigate reports promptly and take appropriate action in accordance with this Policy and the <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link>. Users who submit reports in good faith will not be penalized for doing so; however, knowingly filing false or malicious reports is itself a violation of this Policy.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">6. Enforcement and Consequences</h2>
          <p className="text-gray-600 mb-4">
            Intemso reserves the right to take any of the following actions in response to violations of this Policy, in its sole discretion and without prior notice:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li><strong>Warning:</strong> Issuing a formal written warning to the offending User.</li>
            <li><strong>Content Removal:</strong> Removing, editing, or restricting access to content that violates this Policy.</li>
            <li><strong>Feature Restriction:</strong> Temporarily restricting the offending User&apos;s access to certain features of the Platform, such as messaging, proposal submission, or community participation.</li>
            <li><strong>Temporary Suspension:</strong> Temporarily suspending the offending User&apos;s Account for a specified period.</li>
            <li><strong>Permanent Termination:</strong> Permanently terminating the offending User&apos;s Account and revoking all access to the Platform.</li>
            <li><strong>Financial Penalties:</strong> Withholding or forfeiting pending payments, earnings, or Connects associated with the violation.</li>
            <li><strong>Legal Action:</strong> Pursuing civil or criminal legal remedies against the offending User under the laws of the Republic of Ghana.</li>
            <li><strong>Law Enforcement Referral:</strong> Reporting the violation to the Ghana Police Service, the Cybersecurity Authority, the Financial Intelligence Centre, or any other relevant law enforcement or regulatory authority.</li>
          </ul>
          <p className="text-gray-600 mb-4">
            The severity of the enforcement action will depend on the nature, frequency, and impact of the violation. Intemso may apply progressive disciplinary measures or may take immediate action (including permanent termination) for serious violations, as determined in its sole discretion. Users whose Accounts are terminated for violations of this Policy are prohibited from creating new Accounts.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">7. Appeals</h2>
          <p className="text-gray-600 mb-4">
            Users who believe that enforcement action has been taken against them in error may submit an appeal through the Platform&apos;s support channels within fourteen (14) calendar days of the enforcement action. The appeal must include a detailed explanation of the grounds for the appeal and any supporting evidence. Intemso will review the appeal and issue a final decision within thirty (30) calendar days. The decision of Intemso on appeals is final and binding for all non permanent actions. For permanent Account terminations, Users may pursue additional remedies as provided under the <Link href="/dispute-resolution" className="text-primary-600 hover:text-primary-700 underline">Dispute Resolution Policy</Link> or applicable law.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">8. Changes to This Policy</h2>
          <p className="text-gray-600 mb-4">
            Intemso reserves the right to update or modify this Acceptable Use Policy at any time. When we make material changes, we will provide reasonable notice to Users through the Platform. The updated Policy will specify the effective date. Your continued use of the Platform after the effective date constitutes your acceptance of the modified Policy.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">9. Contact Information</h2>
          <p className="text-gray-600 mb-4">
            For questions or concerns regarding this Acceptable Use Policy, please contact Intemso through the contact form available on the Platform or through any other official communication channel provided by Intemso.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              This Acceptable Use Policy was last updated on 1 April 2026.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}

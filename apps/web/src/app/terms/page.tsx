import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Intemso',
  description: 'Terms of Service governing the use of the Intemso platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-500 mt-2">Effective Date: 1 April 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none">

          <p className="text-gray-600 mb-6">
            These Terms of Service (hereinafter referred to as &quot;Terms&quot;) constitute a legally binding agreement between you, the user (hereinafter referred to as &quot;User,&quot; &quot;you&quot; or &quot;your&quot;), and Intemso (hereinafter referred to as &quot;Intemso,&quot; &quot;the Company,&quot; &quot;we,&quot; &quot;us&quot; or &quot;our&quot;), a company incorporated and operating under the laws of the Republic of Ghana. By accessing, browsing, registering on, or using the Intemso platform in any capacity, including the website located at intemso.com, all associated subdomains (including but not limited to jobs.intemso.com and hire.intemso.com), mobile applications, application programming interfaces, and any related services (collectively referred to as the &quot;Platform&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms in their entirety. If you do not agree to these Terms, you must immediately cease all use of the Platform.
          </p>

          <p className="text-gray-600 mb-8">
            These Terms should be read in conjunction with our <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">Privacy Policy</Link>, <Link href="/cookies" className="text-primary-600 hover:text-primary-700 underline">Cookie Policy</Link>, <Link href="/acceptable-use" className="text-primary-600 hover:text-primary-700 underline">Acceptable Use Policy</Link>, <Link href="/escrow-terms" className="text-primary-600 hover:text-primary-700 underline">Escrow and Payment Terms</Link>, <Link href="/dispute-resolution" className="text-primary-600 hover:text-primary-700 underline">Dispute Resolution Policy</Link>, <Link href="/intellectual-property" className="text-primary-600 hover:text-primary-700 underline">Intellectual Property Policy</Link>, <Link href="/refund-policy" className="text-primary-600 hover:text-primary-700 underline">Refund and Cancellation Policy</Link>, and <Link href="/community-guidelines" className="text-primary-600 hover:text-primary-700 underline">Community Guidelines</Link>, all of which are incorporated into these Terms by reference and form an integral part of the agreement between you and Intemso.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">1. Definitions and Interpretation</h2>
          <p className="text-gray-600 mb-4">
            In these Terms, unless the context otherwise requires, the following words and expressions shall have the meanings ascribed to them below:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
            <li><strong>&quot;Account&quot;</strong> means the registered account created by a User on the Platform, which provides access to the Platform&apos;s services and features.</li>
            <li><strong>&quot;Client&quot; or &quot;Employer&quot;</strong> means any individual, business entity, organization, or institution that posts gigs, hires students, or engages talent through the Platform.</li>
            <li><strong>&quot;Connects&quot;</strong> means the virtual credits used by Students to apply to available gigs on the Platform.</li>
            <li><strong>&quot;Contract&quot;</strong> means the binding work agreement formed between a Student and an Employer when the Employer accepts a Student&apos;s application or directly hires a Student for a gig through the Platform.</li>
            <li><strong>&quot;Deliverables&quot;</strong> means any work product, materials, outputs, files, documents, designs, code, or other tangible or intangible items produced by a Student in the performance of a Contract.</li>
            <li><strong>&quot;Escrow&quot;</strong> means the secure holding arrangement facilitated by the Platform through which funds paid by an Employer are retained by a licensed third party payment processor until conditions for release have been satisfied.</li>
            <li><strong>&quot;Gig&quot;</strong> means a task, project, job, assignment, or scope of work posted by an Employer on the Platform for which a Student may apply.</li>
            <li><strong>&quot;Ghana Card&quot;</strong> means the national identification card issued by the National Identification Authority of the Republic of Ghana under the National Identity Register Act, 2008 (Act 750).</li>
            <li><strong>&quot;Milestone&quot;</strong> means a defined checkpoint or deliverable stage within a Contract, against which partial payment may be funded, submitted, reviewed, and released.</li>
            <li><strong>&quot;Payment Processor&quot;</strong> means the third party financial services provider engaged by Intemso to facilitate payment processing, currently Paystack, which is licensed and regulated under the Payment Systems and Services Act, 2019 (Act 987) of the Republic of Ghana.</li>
            <li><strong>&quot;Platform&quot;</strong> means the Intemso website, subdomains, mobile applications, APIs, and all associated services operated by Intemso.</li>
            <li><strong>&quot;Application&quot;</strong> means a formal submission by a Student to an Employer in response to a posted gig, which may include an optional note, suggested rate, and any supporting materials.</li>
            <li><strong>&quot;Service Fee&quot;</strong> means the commission or percentage fee charged by Intemso on earnings generated by Students through the Platform, as detailed in Section 8 of these Terms.</li>
            <li><strong>&quot;Student&quot; or &quot;Talent&quot;</strong> means any individual registered on the Platform as a student user who offers services, performs work, or completes gigs for Employers through the Platform.</li>
            <li><strong>&quot;User&quot;</strong> means any individual or entity that accesses or uses the Platform in any capacity, including Students, Employers, and visitors.</li>
            <li><strong>&quot;User Content&quot;</strong> means any text, images, files, videos, audio, data, reviews, ratings, profile information, portfolio items, community posts, messages, or other materials uploaded, submitted, posted, or transmitted by Users on or through the Platform.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. Eligibility and Registration</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.1 General Eligibility</h3>
          <p className="text-gray-600 mb-4">
            To use the Platform, you must be at least eighteen (18) years of age. By registering on the Platform, you represent and warrant that you are at least eighteen (18) years old and have the legal capacity to enter into binding agreements under the laws of the Republic of Ghana. If you are accessing the Platform on behalf of a business, company, or other legal entity, you represent and warrant that you have the authority to bind that entity to these Terms, and that the entity is lawfully organized and in good standing under the laws of the Republic of Ghana or, where applicable, the jurisdiction of its incorporation.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.2 Student Eligibility</h3>
          <p className="text-gray-600 mb-4">
            To register as a Student on the Platform, you must be currently enrolled at an accredited university, polytechnic, technical university, or tertiary institution recognized by the National Accreditation Board of Ghana or the relevant regulatory authority in the Republic of Ghana. You must verify your identity using your university email address or your Ghana Card number. Intemso reserves the right to request additional documentation to verify your enrollment status, identity, or eligibility at any time, and failure to provide such documentation upon request may result in the restriction or termination of your Account.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.3 Employer Eligibility</h3>
          <p className="text-gray-600 mb-4">
            To register as an Employer on the Platform, you must be an individual at least eighteen (18) years of age, a registered business entity, a campus organization, or any other lawful entity or person with legitimate project or task needs. Employers may register using an email address or a Ghana Card number. By registering as an Employer, you represent and warrant that the gigs you post are for lawful purposes, that you have the financial means to fund the agreed compensation, and that you will comply with all applicable laws of the Republic of Ghana, including but not limited to the Labour Act, 2003 (Act 651), in relation to the nature and conditions of the work you procure through the Platform.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.4 Account Registration</h3>
          <p className="text-gray-600 mb-4">
            When creating an Account, you agree to provide accurate, current, and complete information as required by the registration process. You are solely responsible for maintaining the confidentiality of your Account credentials, including your password, and for all activities that occur under your Account. You must notify Intemso immediately if you become aware of any unauthorized access to or use of your Account. Intemso shall not be liable for any loss or damage arising from your failure to maintain the security of your Account credentials. Each User may maintain only one (1) Account on the Platform. The creation of multiple Accounts by a single individual or entity is strictly prohibited and may result in the suspension or permanent termination of all associated Accounts.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. Nature of the Platform and Relationship of Parties</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.1 Platform as Marketplace</h3>
          <p className="text-gray-600 mb-4">
            Intemso operates as a digital marketplace that facilitates connections between Students and Employers. The Platform provides the technological infrastructure for gig posting, application submission, communication, payment processing, and dispute resolution. Intemso does not itself perform any gigs, provide services to Employers, or employ Students. The Platform acts solely as an intermediary facilitating transactions between independent parties.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.2 Independent Contractor Status</h3>
          <p className="text-gray-600 mb-4">
            Students who perform work through the Platform do so as independent contractors and not as employees, agents, partners, or joint venture partners of Intemso or the Employer, unless the Employer and Student explicitly agree otherwise in writing outside of the Platform. Nothing in these Terms shall be construed as creating an employment relationship, partnership, joint venture, or agency relationship between Intemso and any User, or between an Employer and a Student, unless expressly agreed in writing between the relevant parties. Students are solely responsible for determining the manner and means by which they perform the work agreed upon in a Contract, subject to the agreed deliverables, timelines, and project specifications. Students are solely responsible for their own tax obligations, social security contributions, and any other statutory obligations arising from their earnings through the Platform, in accordance with the Income Tax Act, 2015 (Act 896) and other applicable laws of the Republic of Ghana.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.3 No Endorsement or Guarantee</h3>
          <p className="text-gray-600 mb-4">
            Intemso does not endorse, guarantee, or warrant the skills, qualifications, reliability, integrity, or conduct of any User on the Platform. Intemso does not guarantee the quality, accuracy, timeliness, or completeness of any work delivered by a Student, nor does it guarantee that an Employer will fund, approve, or complete a Contract. All Users acknowledge that they engage with other Users at their own risk and that Intemso&apos;s role is limited to providing the marketplace infrastructure and certain mediation services as described in these Terms.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">4. Gig Posting, Applications, and Contract Formation</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.1 Gig Posting</h3>
          <p className="text-gray-600 mb-4">
            Employers may post gigs on the Platform at no cost to the Employer. Each gig posting must include a clear and accurate description of the work required, the proposed budget or compensation, the expected timeline, and any specific requirements or qualifications desired. Employers bear sole responsibility for the accuracy and completeness of their gig postings. Gig postings must comply with all applicable laws of the Republic of Ghana and must not request work that is illegal, fraudulent, harmful, discriminatory, or in violation of the <Link href="/acceptable-use" className="text-primary-600 hover:text-primary-700 underline">Acceptable Use Policy</Link>. Intemso reserves the right to remove, modify, or decline to publish any gig posting that, in its sole discretion, violates these Terms or any applicable law.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.2 Applications and Connects</h3>
          <p className="text-gray-600 mb-4">
            Students may apply to posted gigs. Each application requires the expenditure of a specified number of Connects, which varies depending on the gig. Students receive fifteen (15) free Connects each calendar month. Additional Connects may be earned through Platform activity, including but not limited to completing gigs, receiving positive reviews, completing profile information, and regular Platform engagement, as detailed in Section 8 of these Terms. Connects may also be purchased directly through the Platform. Connects are non transferable, non refundable (except as required by applicable law), and have no cash value outside the Platform. Unused purchased Connects do not expire; however, free monthly Connects that are unused do not roll over to the following month.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.3 Contract Formation</h3>
          <p className="text-gray-600 mb-4">
            A Contract is formed when an Employer accepts a Student&apos;s application or directly hires a Student through the Platform. Upon formation of a Contract, both the Student and the Employer are bound by the terms of that Contract, including the agreed scope of work, deliverables, timeline, and compensation. The Contract terms as documented on the Platform shall constitute the definitive record of the agreement between the Student and the Employer, and shall take precedence over any prior negotiations, discussions, or representations not captured on the Platform. Both parties acknowledge that the formation, performance, and enforcement of Contracts are subject to these Terms and the applicable policies referenced herein.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.4 Milestones</h3>
          <p className="text-gray-600 mb-4">
            For Contracts that involve multiple stages or deliverables, the work may be divided into Milestones. Each Milestone must have a clearly defined scope of work, deliverable, and associated payment amount. The Employer is required to fund each Milestone in advance through the escrow system before the Student commences work on that Milestone. Upon completion of a Milestone, the Student submits the relevant Deliverables for the Employer&apos;s review and approval. The Employer may approve the Milestone (thereby releasing payment), request revisions (up to two (2) revision rounds per Milestone unless otherwise agreed in writing), or initiate a dispute in accordance with the <Link href="/dispute-resolution" className="text-primary-600 hover:text-primary-700 underline">Dispute Resolution Policy</Link>.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">5. User Obligations and Conduct</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.1 General Obligations</h3>
          <p className="text-gray-600 mb-4">
            All Users agree to use the Platform in compliance with these Terms, all applicable policies, and all applicable laws of the Republic of Ghana. Users shall at all times act in good faith, deal honestly and fairly with other Users, and refrain from any conduct that could harm the reputation, functionality, or integrity of the Platform or its community of Users.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.2 Student Obligations</h3>
          <p className="text-gray-600 mb-4">
            Students agree to: (a) perform all work to a professional standard and in accordance with the specifications, timeline, and requirements set out in the Contract; (b) communicate promptly and transparently with Employers throughout the duration of a Contract; (c) submit accurate and truthful applications that reflect their genuine capabilities, experience, and availability; (d) not misrepresent their skills, qualifications, university enrollment, or identity; (e) deliver original work that does not infringe upon any third party&apos;s intellectual property rights; (f) not subcontract or delegate work to any third party without the prior written consent of the Employer; and (g) comply with all applicable laws, including but not limited to laws relating to intellectual property, data protection, and professional conduct.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.3 Employer Obligations</h3>
          <p className="text-gray-600 mb-4">
            Employers agree to: (a) provide accurate and complete gig descriptions that clearly communicate the scope of work, expectations, and any specific requirements; (b) fund Milestones promptly as required by the Contract and the escrow system; (c) review and respond to Milestone submissions within a reasonable time, not exceeding fourteen (14) calendar days from the date of submission; (d) treat Students with respect and professionalism at all times; (e) not request work that is illegal, unsafe, or in violation of any applicable law; (f) not attempt to recruit Students for work outside the Platform in order to circumvent the Platform&apos;s payment system or Service Fees; and (g) honour all payment obligations arising from approved Milestones and completed Contracts.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.4 Prohibited Conduct</h3>
          <p className="text-gray-600 mb-4">
            All Users are strictly prohibited from engaging in the following conduct on or through the Platform:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Circumventing, attempting to circumvent, or encouraging others to circumvent the Platform&apos;s payment system, escrow system, or Service Fee structure, including but not limited to arranging for direct payments outside the Platform for work initiated, discovered, or facilitated through the Platform.</li>
            <li>Creating false, misleading, or fraudulent Accounts, profiles, gig postings, applications, reviews, or ratings.</li>
            <li>Engaging in fraud, money laundering, financing of terrorism, or any other financial crime as defined under the Anti Money Laundering Act, 2020 (Act 1044) or other applicable legislation.</li>
            <li>Harassing, threatening, intimidating, defaming, or discriminating against any other User on the basis of race, ethnicity, gender, religion, disability, sexual orientation, or any other protected characteristic.</li>
            <li>Uploading, transmitting, or distributing any content that is obscene, pornographic, hateful, violent, defamatory, or otherwise harmful or unlawful.</li>
            <li>Interfering with, disrupting, or attempting to gain unauthorized access to any part of the Platform, its servers, databases, or networks, including through the use of malware, denial of service attacks, or exploitation of security vulnerabilities.</li>
            <li>Scraping, harvesting, or collecting User data from the Platform through automated means without the express prior written consent of Intemso.</li>
            <li>Using the Platform for any purpose that is illegal under the laws of the Republic of Ghana or any other applicable jurisdiction.</li>
            <li>Impersonating another person, entity, or User, or falsely claiming an affiliation with any person, entity, or institution.</li>
            <li>Manipulating or artificially inflating profile metrics, ratings, reviews, or reputation scores through fraudulent or deceptive means.</li>
            <li>Offering or soliciting services that involve academic dishonesty, including but not limited to writing academic papers, completing examinations, or producing coursework on behalf of another student.</li>
          </ul>
          <p className="text-gray-600 mb-4">
            Violations of this Section 5.4 may result in immediate suspension or permanent termination of the offending User&apos;s Account, forfeiture of any funds held in escrow, and, where appropriate, referral to law enforcement authorities. Intemso reserves the right, in its sole discretion, to determine what constitutes a violation and to take such corrective action as it deems necessary and appropriate.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">6. Payment Circumvention</h2>
          <p className="text-gray-600 mb-4">
            Users are expressly prohibited from soliciting or making payments for work outside of the Platform when the working relationship was initiated, discovered, or facilitated through the Platform. This prohibition applies for a period of twenty four (24) months following the last interaction between the relevant Users on the Platform. If Intemso determines, in its sole discretion, that a User has engaged in payment circumvention, Intemso reserves the right to: (a) suspend or permanently terminate the offending User&apos;s Account; (b) charge the offending User a circumvention fee equivalent to the Service Fee that would have been payable had the transaction been conducted through the Platform; (c) withhold or forfeit any pending payments or earnings; and (d) pursue any other legal remedies available under the laws of the Republic of Ghana. Both Students and Employers acknowledge that this provision is essential to the sustainability and integrity of the Platform and that a breach of this provision causes direct financial harm to Intemso.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">7. Ratings, Reviews, and Feedback</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.1 Review System</h3>
          <p className="text-gray-600 mb-4">
            Upon completion of a Contract, both the Student and the Employer are encouraged to leave a rating (on a scale of one (1) to five (5) stars) and a written review of the other party. Reviews must be honest, accurate, and based on the User&apos;s genuine experience with the other party during the relevant Contract. Reviews are publicly visible on the reviewed User&apos;s profile. Once submitted, reviews cannot be edited by the reviewing User.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.2 Prohibited Review Practices</h3>
          <p className="text-gray-600 mb-4">
            Users may not: (a) submit reviews that are false, misleading, defamatory, or unrelated to the actual work experience; (b) offer or accept compensation, Connects, or other incentives in exchange for a particular rating or review; (c) threaten negative reviews as leverage during disputes or negotiations; (d) coordinate with others to submit artificially positive or negative reviews; or (e) use reviews to harass, intimidate, or retaliate against another User. Intemso reserves the right to remove reviews that violate these provisions and to take further action against the offending User&apos;s Account.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.3 Job Success Score</h3>
          <p className="text-gray-600 mb-4">
            Each Student is assigned a Job Success Score, which is a numerical score ranging from zero (0) to one hundred (100) percent, calculated by Intemso based on a proprietary algorithm that considers, among other factors, client ratings, contract completion rate, responsiveness, dispute history, and overall client satisfaction. The Job Success Score is displayed on the Student&apos;s public profile and is intended to assist Employers in making informed hiring decisions. Intemso reserves the sole right to determine the methodology, weighting, and calculation of Job Success Scores and may modify the algorithm at any time without prior notice.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.4 Talent Badges</h3>
          <p className="text-gray-600 mb-4">
            Students may earn the following reputation badges based on their performance on the Platform: (a) &quot;Rising Talent,&quot; awarded to Students who have completed at least one (1) gig with a perfect rating; (b) &quot;Top Rated,&quot; awarded to Students who maintain a Job Success Score of ninety percent (90%) or higher, have completed at least ten (10) gigs, and have demonstrated a strong earnings history; and (c) &quot;Top Rated Plus,&quot; awarded by invitation only at Intemso&apos;s sole discretion to Students who consistently deliver exceptional work and maintain the highest standards of professionalism. Intemso reserves the right to award, revoke, or modify badge criteria at any time.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">8. Fees, Payments, and Financial Terms</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">8.1 Service Fees</h3>
          <p className="text-gray-600 mb-4">
            Intemso charges Students a Service Fee on all earnings received through the Platform. The Service Fee is calculated on a sliding scale based on the cumulative lifetime billings between a Student and a specific Employer, as follows:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Cumulative Billings with a Single Employer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Service Fee Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">First GH₵500.00</td>
                  <td className="px-4 py-3 text-sm text-gray-500">15%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">GH₵500.01 to GH₵2,000.00</td>
                  <td className="px-4 py-3 text-sm text-gray-500">10%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">Above GH₵2,000.00</td>
                  <td className="px-4 py-3 text-sm text-gray-500">5%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-600 mb-4">
            The Service Fee is automatically deducted from the Student&apos;s earnings at the time of payment release. The sliding scale resets for each distinct Employer; cumulative billings are tracked separately for each Student and Employer pair. Employers are not charged any Service Fees or platform fees for posting gigs, reviewing applications, or hiring Students. Intemso reserves the right to modify the Service Fee structure upon thirty (30) calendar days&apos; prior written notice to affected Users. Any modification to Service Fees shall apply only to Contracts formed after the effective date of the modification and shall not retroactively affect existing Contracts.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">8.2 Connects Pricing</h3>
          <p className="text-gray-600 mb-4">
            Students who wish to purchase additional Connects beyond the fifteen (15) free Connects allocated monthly may do so at the following rates:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Connects Pack</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">10 Connects</td>
                  <td className="px-4 py-3 text-sm text-gray-500">GH₵5.00</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">20 Connects</td>
                  <td className="px-4 py-3 text-sm text-gray-500">GH₵9.00</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">40 Connects</td>
                  <td className="px-4 py-3 text-sm text-gray-500">GH₵16.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-600 mb-4">
            Students may also earn Connects through platform engagement activities, including: completing a gig (five (5) Connects), receiving a five star review (three (3) Connects), leaving a review for an Employer (one (1) Connect), completing their profile to one hundred percent (100%) (ten (10) Connects), and daily login (one (1) Connect, up to a maximum of five (5) per week). Intemso reserves the right to modify the pricing of Connects and the earn rates at any time, with thirty (30) calendar days&apos; prior notice to Users.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">8.3 Escrow and Payment Processing</h3>
          <p className="text-gray-600 mb-4">
            All payments for gig work transacted through the Platform are processed through the escrow system as detailed in the <Link href="/escrow-terms" className="text-primary-600 hover:text-primary-700 underline">Escrow and Payment Terms</Link>. Employers fund Milestones or fixed price Contracts in advance; funds are held securely by the Payment Processor until the agreed conditions for release are met. Payment methods accepted by the Platform include mobile money (MTN Mobile Money, Vodafone Cash, AirtelTigo Money), debit and credit cards, and bank transfers. Students may withdraw their available earnings to mobile money wallets or Ghanaian bank accounts. There is no minimum withdrawal amount. All financial transactions are processed through Paystack, a Payment Processor licensed and regulated under the laws of the Republic of Ghana. Intemso is not a bank, financial institution, or money services business and does not hold User funds directly.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">8.4 Currency</h3>
          <p className="text-gray-600 mb-4">
            All prices, fees, earnings, and financial amounts displayed on the Platform are denominated in the Ghanaian Cedi (GH₵) unless otherwise expressly indicated. Users are responsible for any currency conversion fees that may be charged by their banks or payment providers for transactions involving currencies other than the Ghanaian Cedi.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">8.5 Taxes</h3>
          <p className="text-gray-600 mb-4">
            Each User is solely responsible for determining and fulfilling their own tax obligations arising from their use of the Platform, including but not limited to income tax, value added tax, and any other applicable taxes or levies under the Income Tax Act, 2015 (Act 896), the Value Added Tax Act, 2013 (Act 870), and any other applicable fiscal legislation of the Republic of Ghana. Intemso does not provide tax advice and is not responsible for withholding, collecting, or remitting taxes on behalf of Users, except where required by applicable law.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">9. Intellectual Property</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">9.1 Platform Intellectual Property</h3>
          <p className="text-gray-600 mb-4">
            All intellectual property rights in and to the Platform, including but not limited to the software, source code, design, layout, text, graphics, logos, trademarks, trade names, service marks, icons, and the overall look and feel of the Platform, are and shall remain the exclusive property of Intemso or its licensors. No User acquires any ownership interest in the Platform&apos;s intellectual property by virtue of using the Platform. Users are granted a limited, non exclusive, non transferable, non sublicensable, revocable licence to access and use the Platform solely for its intended purposes and in accordance with these Terms. Any unauthorized reproduction, distribution, modification, reverse engineering, decompilation, or disassembly of the Platform or any component thereof is strictly prohibited and may constitute a violation of the Copyright Act, 2005 (Act 690) and other applicable intellectual property laws of the Republic of Ghana.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">9.2 User Content Licence</h3>
          <p className="text-gray-600 mb-4">
            By uploading, posting, or submitting any User Content to the Platform, you grant Intemso a worldwide, non exclusive, royalty free, sublicensable, transferable licence to use, reproduce, modify, distribute, display, and perform such User Content solely for the purposes of operating, promoting, improving, and providing the Platform and its services. This licence continues for as long as the User Content remains on the Platform and for a reasonable period thereafter necessary for backup, archival, or legal compliance purposes. You represent and warrant that you own or have the necessary rights, licences, and permissions to grant this licence, and that your User Content does not infringe upon any third party&apos;s intellectual property rights, privacy rights, or any other rights.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">9.3 Work Product Ownership</h3>
          <p className="text-gray-600 mb-4">
            Unless the Student and Employer expressly agree otherwise in writing within the Contract, all Deliverables produced by a Student under a Contract shall become the exclusive property of the Employer upon full and final payment for the relevant Milestone or Contract. Until full payment is received and approved, the Student retains all intellectual property rights in the Deliverables. Notwithstanding the transfer of ownership to the Employer, the Student retains the right to display and reference the Deliverables in their portfolio and Showcase on the Platform and in their personal portfolio outside the Platform for the purpose of demonstrating their skills and experience, unless the Employer explicitly restricts such use in writing within the Contract. For detailed provisions regarding intellectual property, please refer to the <Link href="/intellectual-property" className="text-primary-600 hover:text-primary-700 underline">Intellectual Property Policy</Link>.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">10. Account Suspension and Termination</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">10.1 Suspension by Intemso</h3>
          <p className="text-gray-600 mb-4">
            Intemso reserves the right to suspend, restrict, or temporarily disable any User&apos;s Account, in whole or in part, at any time and without prior notice, if Intemso reasonably believes that: (a) the User has violated or is likely to violate these Terms or any applicable policy; (b) the User&apos;s Account has been compromised or is being used in an unauthorized manner; (c) the User&apos;s conduct poses a risk to the safety, security, or integrity of the Platform or other Users; (d) continued access by the User may expose Intemso to liability; or (e) suspension is required by applicable law, regulation, or court order.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">10.2 Termination by Intemso</h3>
          <p className="text-gray-600 mb-4">
            Intemso reserves the right to permanently terminate any User&apos;s Account for material or repeated violations of these Terms, fraud, illegal activity, or any other conduct that Intemso, in its sole discretion, deems harmful to the Platform or its Users. Upon termination, the User&apos;s access to the Platform will be revoked, and any pending earnings will be handled in accordance with the <Link href="/escrow-terms" className="text-primary-600 hover:text-primary-700 underline">Escrow and Payment Terms</Link>. Intemso may, at its discretion, provide the User with an opportunity to withdraw available funds, minus any applicable fees or penalties, within a specified time period following termination. Intemso is not obligated to disclose the specific reasons for termination where doing so could compromise an ongoing investigation, violate applicable law, or risk harm to other Users.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">10.3 Termination by User</h3>
          <p className="text-gray-600 mb-4">
            Users may terminate their Account at any time by contacting Intemso through the Platform&apos;s support channels. Upon voluntary termination: (a) the User must complete or cancel all active Contracts before the Account can be closed; (b) any available earnings will be disbursed to the User, minus applicable Service Fees; (c) purchased Connects that have not been used are non refundable; and (d) the User&apos;s profile and publicly visible information will be deactivated but may be retained by Intemso for legal, regulatory, or compliance purposes as described in the <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">Privacy Policy</Link>.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">10.4 Survival</h3>
          <p className="text-gray-600 mb-4">
            The following provisions shall survive the termination or expiration of these Terms or a User&apos;s Account: Section 1 (Definitions), Section 3.2 (Independent Contractor Status), Section 5.4 (Prohibited Conduct), Section 6 (Payment Circumvention), Section 9 (Intellectual Property), Section 11 (Dispute Resolution), Section 12 (Limitation of Liability), Section 13 (Indemnification), Section 14 (Disclaimer of Warranties), Section 16 (Governing Law and Jurisdiction), Section 17 (Severability), and any other provisions that by their nature are intended to survive termination.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">11. Dispute Resolution</h2>
          <p className="text-gray-600 mb-4">
            In the event of a dispute between a Student and an Employer arising from or relating to a Contract, the parties agree to first attempt to resolve the dispute amicably through direct communication on the Platform. If the parties are unable to resolve the dispute within seven (7) calendar days of the dispute being raised, either party may escalate the dispute to Intemso&apos;s mediation team. Intemso shall review the facts and evidence submitted by both parties and render a decision within fourteen (14) calendar days. Both parties agree to participate in the mediation process in good faith and to provide all reasonably requested information and documentation. The detailed procedures and rules governing the dispute resolution process are set out in the <Link href="/dispute-resolution" className="text-primary-600 hover:text-primary-700 underline">Dispute Resolution Policy</Link>. For disputes between a User and Intemso itself, the provisions of Section 16 (Governing Law and Jurisdiction) shall apply.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">12. Limitation of Liability</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">12.1 General Limitation</h3>
          <p className="text-gray-600 mb-4">
            To the maximum extent permitted by the laws of the Republic of Ghana, Intemso, its directors, officers, employees, agents, affiliates, and licensors shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages arising out of or in connection with: (a) your use of or inability to use the Platform; (b) any conduct or content of any third party or other User on the Platform; (c) any Deliverables, work product, or services obtained through the Platform; (d) unauthorized access to, alteration of, or loss of your data or transmissions; or (e) any other matter relating to the Platform, whether based on contract, tort (including negligence), strict liability, statute, or any other legal theory, even if Intemso has been advised of the possibility of such damages.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">12.2 Aggregate Liability Cap</h3>
          <p className="text-gray-600 mb-4">
            In no event shall the total aggregate liability of Intemso to any User for all claims arising out of or relating to these Terms or the use of the Platform exceed the greater of: (a) the total amount of Service Fees actually paid by or on behalf of the User to Intemso during the twelve (12) month period immediately preceding the event giving rise to the claim; or (b) one hundred Ghanaian Cedis (GH₵100.00). This cap on liability applies to all claims in the aggregate, including but not limited to claims in contract, tort, strict liability, or under any other legal theory.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">12.3 No Liability for User Actions</h3>
          <p className="text-gray-600 mb-4">
            Intemso is not liable for the actions, omissions, conduct, quality of work, or reliability of any User on the Platform. Intemso is not responsible for: (a) the quality, accuracy, or fitness for purpose of any Deliverables; (b) any failure by a Student to complete work as agreed; (c) any failure by an Employer to fund, review, or approve Milestones in a timely manner; (d) any loss or damage arising from disputes between Users; or (e) any personal injury, property damage, or other harm resulting from work performed in connection with a gig. Users engage with each other at their own risk.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">13. Indemnification</h2>
          <p className="text-gray-600 mb-4">
            You agree to indemnify, defend, and hold harmless Intemso, its directors, officers, employees, agents, affiliates, successors, and assigns from and against any and all claims, demands, damages, losses, liabilities, costs, and expenses (including reasonable legal fees and court costs) arising out of or in connection with: (a) your use of the Platform; (b) your violation of these Terms or any applicable law; (c) your User Content; (d) your interaction with any other User, including any Contract entered into with another User; (e) any Deliverables you produce, provide, or receive through the Platform; (f) your breach of any representation or warranty made herein; or (g) your infringement of any third party&apos;s intellectual property rights, privacy rights, or other rights. This indemnification obligation shall survive the termination of your Account and these Terms.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">14. Disclaimer of Warranties</h2>
          <p className="text-gray-600 mb-4">
            The Platform and all services provided through the Platform are provided on an &quot;as is&quot; and &quot;as available&quot; basis, without warranties of any kind, whether express, implied, statutory, or otherwise. To the maximum extent permitted by the laws of the Republic of Ghana, Intemso expressly disclaims all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, non infringement, accuracy, reliability, availability, and any warranties arising from course of dealing, usage, or trade practice. Intemso does not warrant that: (a) the Platform will be available at all times, uninterrupted, secure, or free from errors, bugs, or viruses; (b) the information, content, or materials available on the Platform are accurate, complete, or current; (c) any defects in the Platform will be corrected; or (d) the Platform will meet your specific requirements or expectations. Your use of the Platform is at your sole risk.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">15. Force Majeure</h2>
          <p className="text-gray-600 mb-4">
            Intemso shall not be liable for any failure or delay in performing its obligations under these Terms where such failure or delay results from circumstances beyond Intemso&apos;s reasonable control, including but not limited to: acts of God; natural disasters; epidemics or pandemics; war, terrorism, or civil unrest; government actions, orders, or regulations; power outages; internet or telecommunications failures; cyberattacks; failures of third party service providers (including the Payment Processor); labour disputes; or any other event that could not have been reasonably foreseen or prevented. In the event of a force majeure occurrence, Intemso shall use reasonable efforts to mitigate the impact and resume normal operations as soon as practicable.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">16. Governing Law and Jurisdiction</h2>
          <p className="text-gray-600 mb-4">
            These Terms and any dispute or claim arising out of or in connection with them, their subject matter, or their formation (including non contractual disputes or claims) shall be governed by and construed in accordance with the laws of the Republic of Ghana, without regard to conflict of law principles. These Terms are subject to and shall be interpreted in light of the following legislation, as amended from time to time: the Electronic Transactions Act, 2008 (Act 772); the Data Protection Act, 2012 (Act 843); the Cybersecurity Act, 2020 (Act 1038); the Payment Systems and Services Act, 2019 (Act 987); the Anti Money Laundering Act, 2020 (Act 1044); the Copyright Act, 2005 (Act 690); the Labour Act, 2003 (Act 651); and the Alternative Dispute Resolution Act, 2010 (Act 798), where applicable. The courts of the Republic of Ghana shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with these Terms. Prior to instituting any legal proceedings before the courts, the parties shall first attempt to resolve the dispute through the Alternative Dispute Resolution mechanisms described in Section 11 and the <Link href="/dispute-resolution" className="text-primary-600 hover:text-primary-700 underline">Dispute Resolution Policy</Link>.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">17. Severability</h2>
          <p className="text-gray-600 mb-4">
            If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction in the Republic of Ghana, such provision shall be modified to the minimum extent necessary to make it valid, legal, and enforceable, or, if modification is not possible, shall be severed from these Terms. The invalidity, illegality, or unenforceability of any single provision shall not affect the validity, legality, or enforceability of the remaining provisions of these Terms, which shall continue in full force and effect.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">18. Entire Agreement</h2>
          <p className="text-gray-600 mb-4">
            These Terms, together with the Privacy Policy, Cookie Policy, Acceptable Use Policy, Escrow and Payment Terms, Dispute Resolution Policy, Intellectual Property Policy, Refund and Cancellation Policy, Community Guidelines, and any additional terms or policies referenced herein, constitute the entire agreement between you and Intemso with respect to your access to and use of the Platform. These Terms supersede all prior and contemporaneous agreements, proposals, representations, warranties, and understandings, whether written or oral, between you and Intemso relating to the Platform.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">19. Waiver</h2>
          <p className="text-gray-600 mb-4">
            No failure or delay by Intemso in exercising any right, power, or remedy under these Terms shall operate as a waiver thereof, nor shall any single or partial exercise of any right, power, or remedy preclude any other or further exercise of that right, power, or remedy, or the exercise of any other right, power, or remedy. A waiver of any term or condition of these Terms shall be effective only if given in writing and signed by an authorized representative of Intemso, and any such waiver shall apply only to the specific instance and for the specific purpose for which it was given.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">20. Assignment</h2>
          <p className="text-gray-600 mb-4">
            You may not assign, transfer, delegate, or sublicence your rights or obligations under these Terms, in whole or in part, without the prior written consent of Intemso. Any attempted assignment or transfer without such consent shall be null and void. Intemso may freely assign, transfer, or delegate its rights and obligations under these Terms, in whole or in part, to any affiliate, successor, or acquirer in connection with a merger, acquisition, corporate reorganization, or sale of all or substantially all of its assets, without notice to or consent from the User.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">21. Notices</h2>
          <p className="text-gray-600 mb-4">
            Intemso may provide notices to Users through the Platform (including in app notifications, dashboard alerts, or announcements), by posting on the Platform, or by any other reasonable means. Notices provided through the Platform are deemed received at the time of posting or sending. For legal notices or formal communications to Intemso, Users should use the contact channels provided on the Platform. It is the User&apos;s responsibility to ensure that their contact information on the Platform is current and accurate.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">22. Modifications to These Terms</h2>
          <p className="text-gray-600 mb-4">
            Intemso reserves the right to modify, amend, or update these Terms at any time. When we make material changes, we will provide reasonable notice to Users through the Platform, including by displaying a prominent notice on the Platform. The updated Terms will specify the effective date. Your continued use of the Platform after the effective date of any modification constitutes your acceptance of the modified Terms. If you do not agree with the modified Terms, you must stop using the Platform and may terminate your Account as described in Section 10.3. We encourage you to review these Terms periodically to stay informed of any updates. For non material changes, such as typographical corrections or minor clarifications, Intemso may update these Terms without prior notice.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">23. Third Party Services</h2>
          <p className="text-gray-600 mb-4">
            The Platform may integrate with, link to, or rely upon third party services, websites, or platforms, including but not limited to payment processors, analytics providers, cloud hosting services, and communication tools. Intemso does not control and is not responsible for the availability, accuracy, content, privacy practices, or terms of service of any third party service. Your interactions with third party services are governed by the terms and policies of those third parties. Intemso is not liable for any loss or damage arising from your use of or reliance on any third party service, and the inclusion of any third party integration or link on the Platform does not constitute an endorsement by Intemso.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">24. Electronic Communications</h2>
          <p className="text-gray-600 mb-4">
            By creating an Account on the Platform, you consent to receiving electronic communications from Intemso, including but not limited to notifications, updates, promotional messages, and transactional communications, in accordance with the Electronic Transactions Act, 2008 (Act 772). You agree that all agreements, notices, disclosures, and other communications that Intemso provides to you electronically satisfy any legal requirement that such communications be in writing. You may manage your notification preferences through your Account settings; however, certain transactional and security related communications are mandatory and cannot be opted out of.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">25. Confidentiality</h2>
          <p className="text-gray-600 mb-4">
            Users acknowledge that, in the course of using the Platform and engaging in Contracts, they may receive or have access to confidential or proprietary information belonging to other Users or to Intemso. Users agree to: (a) treat all confidential information received through the Platform with the same degree of care as they would treat their own confidential information, but in no event less than a reasonable standard of care; (b) not use confidential information for any purpose other than the performance of the relevant Contract; and (c) not disclose confidential information to any third party without the prior written consent of the disclosing party, except where disclosure is required by applicable law or court order. This confidentiality obligation shall survive the termination of any Contract and of the User&apos;s Account.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">26. Contact Information</h2>
          <p className="text-gray-600 mb-4">
            For questions, concerns, or inquiries regarding these Terms, Users may contact Intemso through the contact form available on the Platform or through any other official communication channel provided by Intemso. All formal legal notices should be directed to Intemso through the official contact channels listed on the Platform.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              These Terms of Service were last updated on 1 April 2026. Please review them periodically for changes.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}

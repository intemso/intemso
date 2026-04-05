import Link from 'next/link';

export const metadata = {
  title: 'Dispute Resolution Policy | Intemso',
  description: 'Dispute Resolution Policy for the Intemso platform.',
};

export default function DisputeResolutionPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dispute Resolution Policy</h1>
          <p className="text-gray-500 mt-2">Effective Date: 1 April 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none">

          <p className="text-gray-600 mb-6">
            This Dispute Resolution Policy (hereinafter referred to as &quot;Policy&quot;) sets out the procedures and rules governing the resolution of disputes between Users of the Intemso platform, including the website at intemso.com, all associated subdomains, mobile applications, and any related services (collectively referred to as the &quot;Platform&quot;). This Policy supplements and forms part of the <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link> and is incorporated therein by reference.
          </p>
          <p className="text-gray-600 mb-8">
            This Policy is guided by the principles of fairness, transparency, and efficiency, and is informed by the Alternative Dispute Resolution Act, 2010 (Act 798) of the Republic of Ghana. Intemso&apos;s dispute resolution process is intended to provide a practical and accessible mechanism for resolving disputes without the need for formal court proceedings, whilst preserving each party&apos;s right to pursue legal remedies where appropriate.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">1. Scope of This Policy</h2>
          <p className="text-gray-600 mb-4">
            This Policy applies to disputes arising from or relating to Contracts formed through the Platform, including but not limited to disputes regarding:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>The quality, scope, or completeness of Deliverables submitted by a Student.</li>
            <li>The timeliness of work delivery or Milestone submissions.</li>
            <li>The accuracy of gig descriptions or Contract specifications.</li>
            <li>Non payment, delayed payment, or failure to fund Milestones by an Employer.</li>
            <li>Scope creep, meaning requests by an Employer for work beyond the originally agreed scope without corresponding additional compensation.</li>
            <li>Disagreements regarding Milestone approval or rejection.</li>
            <li>Allegations of fraud, misrepresentation, or breach of contract by either party.</li>
            <li>Intellectual property ownership disputes arising from a Contract.</li>
          </ul>
          <p className="text-gray-600 mb-4">
            This Policy does not apply to disputes between a User and Intemso itself regarding the Platform&apos;s policies, Account decisions, or enforcement actions. Such disputes are governed by Section 16 of the <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link> (Governing Law and Jurisdiction) and, where applicable, the appeals process described in Section 7 of the <Link href="/acceptable-use" className="text-primary-600 hover:text-primary-700 underline">Acceptable Use Policy</Link>.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. General Principles</h2>
          <p className="text-gray-600 mb-4">
            The following principles shall guide the dispute resolution process:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li><strong>Good Faith:</strong> Both parties are expected to participate in the dispute resolution process in good faith, with a genuine intent to reach a fair resolution.</li>
            <li><strong>Transparency:</strong> Both parties are expected to provide honest, accurate, and complete information and evidence during the dispute process. Withholding material information, submitting falsified evidence, or making knowingly false statements constitutes a violation of this Policy and the <Link href="/acceptable-use" className="text-primary-600 hover:text-primary-700 underline">Acceptable Use Policy</Link>.</li>
            <li><strong>Timeliness:</strong> Both parties are expected to respond to communications, requests for information, and deadlines in a timely manner. Failure to respond within the specified timeframes may result in a decision being made based on the available information.</li>
            <li><strong>Confidentiality:</strong> The details of dispute proceedings, including evidence submitted and communications made during the process, shall be treated as confidential by both parties and by Intemso. Neither party may publicly disclose the details of a pending or resolved dispute except as required by law.</li>
            <li><strong>Proportionality:</strong> The resolution sought and the remedies applied shall be proportionate to the nature and severity of the dispute.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. Stage One: Direct Resolution</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.1 Requirement to Attempt Direct Resolution</h3>
          <p className="text-gray-600 mb-4">
            Before escalating a dispute to Intemso, both parties are required to attempt to resolve the matter directly through good faith communication using the Platform&apos;s messaging system. The parties should clearly articulate their concerns, listen to the other party&apos;s perspective, and endeavour to reach a mutually acceptable solution.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.2 Time Period for Direct Resolution</h3>
          <p className="text-gray-600 mb-4">
            The direct resolution stage begins when either party formally raises a concern or disagreement through the Platform&apos;s messaging system and continues for a period of seven (7) calendar days (hereinafter referred to as the &quot;Direct Resolution Period&quot;). During the Direct Resolution Period, the parties should exchange messages, clarify misunderstandings, and propose solutions. If the parties reach a resolution during this period, both parties must confirm the resolution on the Platform, and the dispute will be recorded as resolved.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.3 Escalation</h3>
          <p className="text-gray-600 mb-4">
            If the parties are unable to resolve the dispute within the Direct Resolution Period, either party may escalate the dispute to Intemso&apos;s mediation team by selecting the &quot;Escalate Dispute&quot; option on the Contract or Milestone page. The escalation must include: (a) a clear and detailed description of the dispute; (b) the outcome or remedy sought by the escalating party; (c) all relevant evidence, including but not limited to Contract details, messages, files, screenshots, and Deliverables; and (d) a summary of the efforts made during the Direct Resolution Period.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">4. Stage Two: Intemso Mediation</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.1 Mediation Process</h3>
          <p className="text-gray-600 mb-4">
            Upon receiving an escalated dispute, Intemso&apos;s mediation team will: (a) acknowledge receipt of the dispute within two (2) business days; (b) notify the other party of the escalation and request their response and evidence within five (5) calendar days; (c) review all evidence and information submitted by both parties; (d) request additional information or clarification from either party if necessary; (e) conduct an impartial assessment of the dispute based on the Contract terms, Deliverables, communications, and the standards set out in these Terms and applicable policies; and (f) render a mediation decision within fourteen (14) calendar days of receiving the escalated dispute, or within such longer period as may reasonably be required for complex disputes, provided that the parties are notified of any extension.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.2 Evidence Considered</h3>
          <p className="text-gray-600 mb-4">
            In reaching a mediation decision, Intemso will consider the following types of evidence:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>The original gig posting, including the scope of work, requirements, and specifications.</li>
            <li>The Student&apos;s application, including any notes, representations, or timelines stated therein.</li>
            <li>The Contract terms as documented on the Platform, including Milestone descriptions and agreed Deliverables.</li>
            <li>Messages exchanged between the parties through the Platform&apos;s messaging system.</li>
            <li>Submitted Deliverables and work product.</li>
            <li>Screenshots, screen recordings, or other visual evidence.</li>
            <li>Any files, documents, or attachments shared through the Platform.</li>
            <li>The history of interactions between the parties, including prior Contracts and reviews.</li>
            <li>Any other evidence that Intemso, in its reasonable judgment, considers relevant.</li>
          </ul>
          <p className="text-gray-600 mb-4">
            Evidence not submitted through the Platform (such as communications on external messaging applications, social media, or in person) may be considered but will generally be given less weight than evidence generated on the Platform, due to the difficulty of verifying external evidence.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.3 Mediation Outcomes</h3>
          <p className="text-gray-600 mb-4">
            Following review, Intemso&apos;s mediation team may issue any of the following outcomes:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li><strong>Full Payment Release:</strong> The escrowed funds are released in full to the Student, less the applicable Service Fee. This outcome is appropriate where the submitted Deliverables substantially meet the Contract specifications.</li>
            <li><strong>Full Refund:</strong> The escrowed funds are refunded in full to the Employer. This outcome is appropriate where the Student has failed to deliver any work, has abandoned the Contract, or has delivered work that fundamentally fails to meet the Contract specifications.</li>
            <li><strong>Partial Payment and Partial Refund:</strong> The escrowed funds are divided between the Student (for work completed to a satisfactory standard) and the Employer (for the portion of work not completed or not meeting specifications). The specific split will be determined by Intemso based on the proportion of work satisfactorily completed.</li>
            <li><strong>Revision Required:</strong> The Student is required to complete specific revisions within a defined timeframe (not exceeding fourteen (14) calendar days) before payment is released. If the Student fails to complete the required revisions within the specified timeframe, the Employer may be issued a refund.</li>
            <li><strong>Mutual Cancellation:</strong> The Contract is cancelled with the escrowed funds returned to the Employer, with no negative impact on either party&apos;s reputation score. This outcome is appropriate where both parties agree that the Contract cannot be completed due to circumstances beyond either party&apos;s control.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.4 Binding Nature of Mediation Decision</h3>
          <p className="text-gray-600 mb-4">
            By using the Platform and entering into Contracts, both parties agree that Intemso&apos;s mediation decision shall be binding with respect to the disbursement or retention of escrowed funds held on the Platform. The mediation decision does not prevent either party from pursuing additional legal remedies before the courts of the Republic of Ghana, as described in Section 6 of this Policy. Intemso&apos;s mediation decision is limited to the funds held in escrow on the Platform and does not constitute a legal judgment or arbitral award under the laws of the Republic of Ghana.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">5. Specific Dispute Scenarios</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.1 Quality Disputes</h3>
          <p className="text-gray-600 mb-4">
            If an Employer claims that the Deliverables do not meet the agreed quality or specifications, Intemso will assess: (a) whether the Contract terms clearly specified the quality standards and requirements; (b) whether the Student&apos;s Deliverables substantially meet those specifications, taking into account industry standards and reasonable expectations; (c) whether the Employer provided sufficient instructions and responsive feedback during the performance of the Contract; and (d) whether the Student was given a reasonable opportunity to address any shortcomings through the revision process. If the specifications in the Contract are vague or ambiguous, the dispute may be resolved in favour of the Student, provided the Deliverables are of a reasonable professional standard.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.2 Scope Creep Disputes</h3>
          <p className="text-gray-600 mb-4">
            If a Student claims that the Employer has requested work beyond the originally agreed scope without offering additional compensation, Intemso will compare the original Contract specifications with the additional requests made by the Employer. If the additional requests are determined to constitute work beyond the agreed scope, the Employer may be required to fund an additional Milestone to cover the additional work, or the dispute may be resolved on the basis of the original scope.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.3 Non Delivery Disputes</h3>
          <p className="text-gray-600 mb-4">
            If an Employer claims that the Student has failed to deliver any work or has abandoned the Contract, Intemso will assess: (a) the activity and communication history on the Platform; (b) whether the Student provided any partial Deliverables; (c) whether there were any extenuating circumstances communicated by the Student; and (d) the overall timeline and responsiveness. If the Student has abandoned the Contract without delivering any work, the full escrowed amount will be refunded to the Employer, and the Student&apos;s Account may be subject to penalties including a reduction in Job Success Score.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.4 Payment Disputes</h3>
          <p className="text-gray-600 mb-4">
            If a Student claims that an Employer has failed to fund a Milestone as required, has rejected satisfactory work without justification, or has used the dispute process in bad faith to avoid payment, Intemso will review the Contract terms, the submitted Deliverables, and the Employer&apos;s stated reasons for rejection. If the Employer&apos;s rejection is determined to be unjustified, the escrowed funds may be released to the Student. If the Employer has failed to fund a required Milestone, the Student is not obligated to continue work until funding is confirmed.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.5 Intellectual Property Disputes</h3>
          <p className="text-gray-600 mb-4">
            Intellectual property disputes arising from Contracts are assessed in accordance with the <Link href="/intellectual-property" className="text-primary-600 hover:text-primary-700 underline">Intellectual Property Policy</Link>, the Copyright Act, 2005 (Act 690), and the Contract terms. These disputes may involve claims of plagiarism, unauthorized use of third party materials, or disagreements regarding ownership of Deliverables. Intemso&apos;s mediation in intellectual property disputes is limited to determining the appropriate disbursement of escrowed funds and does not constitute a determination of intellectual property ownership under applicable law.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">6. Escalation Beyond Intemso</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6.1 Alternative Dispute Resolution</h3>
          <p className="text-gray-600 mb-4">
            If either party is dissatisfied with the outcome of Intemso&apos;s mediation, they may pursue alternative dispute resolution (hereinafter referred to as &quot;ADR&quot;) in accordance with the Alternative Dispute Resolution Act, 2010 (Act 798) of the Republic of Ghana. The parties may agree to submit the dispute to mediation or arbitration before a qualified mediator or arbitrator in Accra, Ghana. The costs of ADR shall be borne by the parties as agreed between them or as determined by the mediator or arbitrator.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6.2 Court Proceedings</h3>
          <p className="text-gray-600 mb-4">
            Nothing in this Policy prevents either party from pursuing legal remedies before the courts of the Republic of Ghana. However, both parties agree that they will first exhaust the dispute resolution procedures set out in this Policy (Stages One and Two) before commencing court proceedings, except where urgent interim relief is required to prevent irreparable harm. The courts of the Republic of Ghana shall have exclusive jurisdiction over any disputes arising from or in connection with Contracts formed through the Platform.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">7. Impact on User Reputation</h2>
          <p className="text-gray-600 mb-4">
            The outcome of a dispute may affect the parties&apos; reputation on the Platform as follows:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Disputes resolved in favour of the Student (full payment release) will not negatively affect the Student&apos;s Job Success Score. However, the Employer&apos;s record may reflect the unjustified dispute.</li>
            <li>Disputes resolved in favour of the Employer (full refund) may reduce the Student&apos;s Job Success Score, depending on the circumstances and the severity of the failure.</li>
            <li>Disputes resolved through a split decision (partial payment) may have a moderate impact on the Student&apos;s Job Success Score.</li>
            <li>Mutual cancellations will have no negative impact on either party&apos;s reputation.</li>
            <li>Users who are found to have used the dispute process in bad faith, such as filing frivolous disputes to avoid payment or to coerce a Student into providing free work, may face additional penalties, including Account suspension.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">8. Dispute Filing Limits</h2>
          <p className="text-gray-600 mb-4">
            Disputes must be filed within thirty (30) calendar days of the event giving rise to the dispute. For Milestone based Contracts, the thirty (30) day period begins on the date the Milestone was submitted by the Student or the date the dispute first arose, whichever is later. Disputes filed after the thirty (30) day period may not be accepted by Intemso, except in exceptional circumstances where the filing party can demonstrate that the delay was justified.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">9. Frivolous or Bad Faith Disputes</h2>
          <p className="text-gray-600 mb-4">
            Intemso takes a serious view of disputes filed in bad faith. Users who are found to have filed frivolous disputes, used the dispute process as a tool for coercion or harassment, submitted falsified evidence, or made knowingly false statements during the dispute process may face the following consequences: (a) the dispute being dismissed with an outcome favourable to the other party; (b) a formal warning; (c) Account suspension or termination; (d) forfeiture of any associated funds; and (e) referral to law enforcement authorities where the conduct constitutes criminal behaviour.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">10. Changes to This Policy</h2>
          <p className="text-gray-600 mb-4">
            Intemso reserves the right to update or modify this Dispute Resolution Policy at any time. When we make material changes, we will provide reasonable notice to Users through the Platform. The updated Policy will specify the effective date. Changes to this Policy shall apply to disputes filed after the effective date and shall not retroactively affect disputes that are already in progress.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">11. Contact Information</h2>
          <p className="text-gray-600 mb-4">
            For questions or concerns regarding this Dispute Resolution Policy, please contact Intemso through the contact form available on the Platform or through any other official communication channel provided by Intemso.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              This Dispute Resolution Policy was last updated on 1 April 2026.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}

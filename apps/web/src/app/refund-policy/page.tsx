import Link from 'next/link';

export const metadata = {
  title: 'Refund and Cancellation Policy | Intemso',
  description: 'Refund and Cancellation Policy for the Intemso platform.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Refund and Cancellation Policy</h1>
          <p className="text-gray-500 mt-2">Effective Date: 1 April 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none">

          <p className="text-gray-600 mb-6">
            This Refund and Cancellation Policy (hereinafter referred to as &quot;Policy&quot;) sets out the rules and procedures governing refunds, cancellations, and credits on the Intemso platform, including the website at intemso.com, all associated subdomains, mobile applications, and any related services (collectively referred to as the &quot;Platform&quot;). This Policy supplements and forms part of the <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link> and is incorporated therein by reference.
          </p>
          <p className="text-gray-600 mb-8">
            By using the Platform to process financial transactions, you agree to be bound by this Policy. This Policy should be read in conjunction with the <Link href="/escrow-terms" className="text-primary-600 hover:text-primary-700 underline">Escrow and Payment Terms</Link> and the <Link href="/dispute-resolution" className="text-primary-600 hover:text-primary-700 underline">Dispute Resolution Policy</Link>.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">1. Contract Cancellations</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1.1 Cancellation Before Work Begins</h3>
          <p className="text-gray-600 mb-4">
            If a Contract or Milestone is cancelled before the Student has commenced work (and before any Deliverables have been submitted), the full escrowed amount will be refunded to the Employer. A cancellation at this stage may be initiated by either the Student or the Employer through the Platform. Both parties must confirm the cancellation through the Platform. Cancellations before work begins will not negatively affect either party&apos;s reputation or Job Success Score.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1.2 Cancellation After Work Has Begun</h3>
          <p className="text-gray-600 mb-4">
            If a Contract or Milestone is cancelled after the Student has commenced work but before the Deliverables are submitted for review, the following rules apply:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
            <li><strong>Mutual Agreement:</strong> If both parties agree to cancel the Contract or Milestone, the parties may also agree on how the escrowed funds should be distributed (for example, the Employer receives a full refund, or the funds are split based on the proportion of work completed). The agreed distribution must be confirmed by both parties through the Platform.</li>
            <li><strong>Cancellation by the Employer:</strong> If the Employer unilaterally cancels the Contract or Milestone after work has begun, without cause attributable to the Student, the Student shall be entitled to compensation for the work already completed, as determined through the dispute resolution process described in the <Link href="/dispute-resolution" className="text-primary-600 hover:text-primary-700 underline">Dispute Resolution Policy</Link>. If the Employer cancels because the Student has not performed work as agreed, the Employer may initiate a dispute for a full refund.</li>
            <li><strong>Cancellation by the Student:</strong> If the Student unilaterally cancels the Contract or Milestone after work has begun, without cause attributable to the Employer, the full escrowed amount will be refunded to the Employer. The Student&apos;s Job Success Score may be negatively affected, and the cancellation will be recorded on the Student&apos;s profile. Repeated unilateral cancellations by a Student may result in Account restrictions or termination.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1.3 Cancellation After Submission</h3>
          <p className="text-gray-600 mb-4">
            After the Student has submitted Deliverables for review, the Contract or Milestone may not be cancelled unilaterally by either party. If either party wishes to cancel at this stage, they must either: (a) reach a mutual agreement through the Platform, with agreed distribution of the escrowed funds; or (b) initiate a formal dispute in accordance with the <Link href="/dispute-resolution" className="text-primary-600 hover:text-primary-700 underline">Dispute Resolution Policy</Link>.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. Escrow Refunds</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.1 Full Refund Scenarios</h3>
          <p className="text-gray-600 mb-4">
            An Employer may receive a full refund of the escrowed amount in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>The Contract or Milestone is cancelled before the Student has commenced work, as described in Section 1.1.</li>
            <li>The Student has abandoned the Contract without delivering any work and without communication for a period of seven (7) or more calendar days.</li>
            <li>The Student has failed to deliver any Deliverables within the agreed timeline (plus any agreed extensions) and has not initiated a dispute or provided a satisfactory explanation.</li>
            <li>A dispute is resolved in the Employer&apos;s favour with a full refund outcome, as described in the <Link href="/dispute-resolution" className="text-primary-600 hover:text-primary-700 underline">Dispute Resolution Policy</Link>.</li>
            <li>Both parties agree to a mutual cancellation with a full refund to the Employer.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.2 Partial Refund Scenarios</h3>
          <p className="text-gray-600 mb-4">
            An Employer may receive a partial refund in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>Both parties agree to a partial refund through mutual agreement on the Platform.</li>
            <li>A dispute is resolved with a split decision, with partial payment to the Student for work completed and partial refund to the Employer for work not completed.</li>
            <li>The Student has completed a portion of the work to a satisfactory standard, but the remainder is incomplete or unsatisfactory, and the parties cannot agree on a resolution.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.3 No Refund Scenarios</h3>
          <p className="text-gray-600 mb-4">
            A refund will not be issued in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>The Employer has approved the Milestone or Contract and the payment has been released to the Student. Once a Milestone is approved and payment is released, the transaction is final.</li>
            <li>The automatic release mechanism has been triggered (fourteen (14) calendar days have elapsed since submission without the Employer taking action), as described in the <Link href="/escrow-terms" className="text-primary-600 hover:text-primary-700 underline">Escrow and Payment Terms</Link>. It is the Employer&apos;s responsibility to review submissions in a timely manner.</li>
            <li>A dispute is resolved in the Student&apos;s favour with a full payment release outcome.</li>
            <li>The Employer&apos;s refund request is based on dissatisfaction with work that substantially meets the Contract specifications as written.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. Refund Processing</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.1 Refund Method</h3>
          <p className="text-gray-600 mb-4">
            Refunds will be processed to the original payment method used by the Employer to fund the Contract or Milestone. If the original payment method is no longer available (for example, an expired card or a closed mobile money account), Intemso will work with the Employer to arrange an alternative refund method. Refunds are processed through the Payment Processor (Paystack) and are subject to the processing times of the Payment Processor and the Employer&apos;s financial institution.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.2 Refund Timeline</h3>
          <p className="text-gray-600 mb-4">
            Refunds are typically processed within five (5) to ten (10) business days of the refund being approved or the dispute being resolved. However, the actual time for the refund to appear in the Employer&apos;s account may vary depending on the payment method and the processing times of the Employer&apos;s financial institution. Mobile money refunds are generally processed faster (within one (1) to three (3) business days) than bank transfer refunds (which may take up to ten (10) business days). Intemso is not responsible for delays caused by the Payment Processor, banks, or mobile money providers.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.3 Transaction Fees on Refunds</h3>
          <p className="text-gray-600 mb-4">
            Intemso does not charge a fee for processing refunds. However, original transaction processing fees charged by the Payment Processor at the time of funding may not be refundable. Any fees charged by the Employer&apos;s bank or mobile money provider in connection with the refund are the Employer&apos;s responsibility. Intemso is not responsible for any currency conversion losses or fees that may occur in connection with a refund.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">4. Connects Refunds</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.1 General Rule</h3>
          <p className="text-gray-600 mb-4">
            Purchased Connects are non refundable. Once you have purchased Connects, the transaction is final and you will not receive a monetary refund for unused Connects. This applies regardless of whether you subsequently close your Account or cease using the Platform.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.2 Connects Restoration</h3>
          <p className="text-gray-600 mb-4">
            In the following limited circumstances, Connects that were used to submit a proposal may be restored to the Student&apos;s Account:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>The gig to which the proposal was submitted is cancelled, withdrawn, or removed by the Employer or by Intemso before the Employer has reviewed or acted on the proposal.</li>
            <li>The gig posting is determined to be fraudulent, in violation of the <Link href="/acceptable-use" className="text-primary-600 hover:text-primary-700 underline">Acceptable Use Policy</Link>, or otherwise illegitimate.</li>
            <li>A technical error or Platform malfunction caused the Connects to be deducted incorrectly.</li>
          </ul>
          <p className="text-gray-600 mb-4">
            Connects are not restored for proposals that are not accepted by the Employer, as this is a normal and expected part of the competitive proposal process.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.3 Free Monthly Connects</h3>
          <p className="text-gray-600 mb-4">
            The fifteen (15) free Connects allocated to each Student at the beginning of each calendar month are non refundable and have no cash value. Unused free Connects do not roll over to the following month and are forfeited at the end of each calendar month. Free Connects are used before purchased Connects when a Student submits a proposal.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">5. Service Fee Refunds</h2>
          <p className="text-gray-600 mb-4">
            Service Fees deducted from a Student&apos;s earnings are non refundable, except in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li>If a refund is issued to the Employer for a Milestone or Contract that was previously approved and paid, and the Student is required to return the earnings, the corresponding Service Fee will be credited back to the Student&apos;s Account.</li>
            <li>If a technical error or Platform malfunction caused an incorrect Service Fee to be deducted, the excess amount will be credited to the Student&apos;s Account.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">6. Chargebacks</h2>
          <p className="text-gray-600 mb-4">
            Employers who initiate chargebacks or payment reversals through their payment provider, bank, or mobile money provider, rather than using the Platform&apos;s dispute and refund process, may be subject to the penalties described in Section 6 of the <Link href="/escrow-terms" className="text-primary-600 hover:text-primary-700 underline">Escrow and Payment Terms</Link>. Intemso strongly encourages all Employers to use the Platform&apos;s internal dispute and refund processes rather than filing chargebacks with their payment providers.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">7. Account Termination and Refunds</h2>
          <p className="text-gray-600 mb-4">
            Upon termination of a User&apos;s Account:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li><strong>Employer Accounts:</strong> Any unfunded Contracts will be cancelled. Any funds held in escrow for active Contracts will be handled in accordance with the dispute resolution process or, where no dispute exists, will be refunded to the Employer after giving the Student a reasonable opportunity to submit any outstanding Deliverables.</li>
            <li><strong>Student Accounts:</strong> Any available balance will be disbursed to the Student within thirty (30) calendar days, minus applicable Service Fees, penalties, or amounts owed to Intemso. Any active Contracts will be managed in accordance with the <Link href="/escrow-terms" className="text-primary-600 hover:text-primary-700 underline">Escrow and Payment Terms</Link>.</li>
            <li><strong>Unused Connects:</strong> Purchased Connects that have not been used are non refundable upon Account termination.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">8. Exceptional Circumstances</h2>
          <p className="text-gray-600 mb-4">
            In exceptional circumstances, including but not limited to verified fraud, significant Platform errors, or force majeure events, Intemso may, in its sole discretion, issue refunds or credits outside of the standard refund procedures described in this Policy. Any such exceptional refund or credit is at Intemso&apos;s sole discretion and does not create a precedent or an entitlement for future refunds. Users who believe they are entitled to a refund under exceptional circumstances should contact Intemso through the Platform&apos;s support channels.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">9. Changes to This Policy</h2>
          <p className="text-gray-600 mb-4">
            Intemso reserves the right to update or modify this Refund and Cancellation Policy at any time. When we make material changes, we will provide reasonable notice to Users through the Platform. The updated Policy will specify the effective date. Changes to this Policy shall apply to transactions and cancellations initiated after the effective date and shall not retroactively affect refunds or cancellations already in progress.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">10. Contact Information</h2>
          <p className="text-gray-600 mb-4">
            For questions or concerns regarding this Refund and Cancellation Policy, please contact Intemso through the contact form available on the Platform or through any other official communication channel provided by Intemso.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              This Refund and Cancellation Policy was last updated on 1 April 2026.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}

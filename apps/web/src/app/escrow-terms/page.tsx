import Link from 'next/link';

export const metadata = {
  title: 'Escrow and Payment Terms | Intemso',
  description: 'Escrow and Payment Terms for the Intemso platform.',
};

export default function EscrowTermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Escrow and Payment Terms</h1>
          <p className="text-gray-500 mt-2">Effective Date: 1 April 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none">

          <p className="text-gray-600 mb-6">
            These Escrow and Payment Terms (hereinafter referred to as &quot;Payment Terms&quot;) govern all financial transactions conducted through the Intemso platform, including the website at intemso.com, all associated subdomains, mobile applications, and any related services (collectively referred to as the &quot;Platform&quot;). These Payment Terms supplement and form part of the <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link> and are incorporated therein by reference.
          </p>
          <p className="text-gray-600 mb-8">
            By using the Platform to process any financial transaction, including but not limited to funding a Contract, purchasing Connects, receiving payment for work, or withdrawing earnings, you agree to be bound by these Payment Terms in their entirety. All financial transactions on the Platform are processed in compliance with the Payment Systems and Services Act, 2019 (Act 987), the Anti Money Laundering Act, 2020 (Act 1044), the Electronic Transactions Act, 2008 (Act 772), and all other applicable financial laws and regulations of the Republic of Ghana.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">1. The Escrow System</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1.1 Overview</h3>
          <p className="text-gray-600 mb-4">
            The Intemso escrow system is designed to protect both Students and Employers by ensuring that funds for gig work are secured in advance before work begins and are released only when agreed conditions have been met. The escrow system provides a layer of financial security and trust that benefits all parties to a transaction on the Platform. Intemso does not itself hold or manage escrow funds directly; all funds are held and processed through our licensed third party Payment Processor, Paystack, which operates in compliance with the Payment Systems and Services Act, 2019 (Act 987) and is regulated by the Bank of Ghana.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1.2 How the Escrow System Works</h3>
          <p className="text-gray-600 mb-4">
            The escrow process consists of the following stages:
          </p>
          <ol className="list-decimal pl-6 text-gray-600 space-y-3 mb-6">
            <li><strong>Funding:</strong> When a Contract is formed (either through an accepted application or direct hire), the Employer is required to fund the agreed amount (or the first Milestone amount, for Milestone based Contracts) into the escrow system. The funded amount is deducted from the Employer&apos;s chosen payment method and held securely by the Payment Processor. Work should not commence on any Milestone or Contract until the relevant funding has been confirmed by the Platform.</li>
            <li><strong>Work Performance:</strong> Once funding is confirmed by the Platform, the Student proceeds with the agreed work. During this stage, the funds remain securely held in escrow and are not accessible to either party.</li>
            <li><strong>Submission:</strong> Upon completion of the work (or a Milestone), the Student submits the Deliverables through the Platform for the Employer&apos;s review. The submission must include all agreed Deliverables, files, and documentation as specified in the Contract.</li>
            <li><strong>Review and Approval:</strong> The Employer reviews the submitted Deliverables and may take one of the following actions: (a) approve the submission, which triggers the release of the escrowed funds to the Student (less the applicable Service Fee); (b) request revisions, with clear and specific instructions on what changes are needed (up to two (2) rounds of revisions per Milestone, unless otherwise agreed in the Contract); or (c) initiate a dispute, if the Employer believes the Deliverables do not meet the agreed specifications.</li>
            <li><strong>Automatic Release:</strong> If the Employer does not approve, request revisions, or initiate a dispute within fourteen (14) calendar days of the Student&apos;s submission, the escrowed funds will be automatically released to the Student. This automatic release mechanism protects Students from Employers who fail to review or respond to submissions in a timely manner.</li>
            <li><strong>Payment Release:</strong> Upon approval (whether manual or automatic), the escrowed funds are released to the Student&apos;s Platform balance, less the applicable Service Fee as described in the <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link>. The Student may then withdraw the funds using any available withdrawal method.</li>
          </ol>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1.3 Milestone Based Payments</h3>
          <p className="text-gray-600 mb-4">
            For Contracts that are divided into Milestones, each Milestone operates as an independent escrow transaction. The Employer must fund each Milestone individually before the Student begins work on that Milestone. The review, approval, and release process described in Section 1.2 applies independently to each Milestone. Subsequent Milestones must be funded before the Student is required to commence work on them. Neither party may unilaterally modify the scope, Deliverables, or payment amount of a funded Milestone without the other party&apos;s written agreement. If both parties agree to modify a Milestone, the modification must be documented on the Platform, and any additional funding required must be deposited into escrow before the modified work begins.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1.4 Fixed Price Payments</h3>
          <p className="text-gray-600 mb-4">
            For fixed price Contracts (Contracts with a single total price and no separate Milestones), the full Contract amount must be funded into escrow by the Employer before the Student begins work. The escrow, submission, review, and release process described in Section 1.2 applies to the full Contract amount.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. Payment Methods</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.1 Accepted Payment Methods for Funding</h3>
          <p className="text-gray-600 mb-4">
            Employers may fund Contracts and Milestones using the following payment methods:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li><strong>Mobile Money:</strong> MTN Mobile Money, Vodafone Cash, and AirtelTigo Money.</li>
            <li><strong>Debit and Credit Cards:</strong> Visa and Mastercard debit and credit cards issued by banks licensed by the Bank of Ghana, as well as internationally issued cards accepted by our Payment Processor.</li>
            <li><strong>Bank Transfer:</strong> Direct bank transfers from Ghanaian bank accounts to the Platform&apos;s escrow account through the Payment Processor.</li>
          </ul>
          <p className="text-gray-600 mb-4">
            The availability of specific payment methods may vary and is subject to the capabilities of our Payment Processor. Intemso reserves the right to add or remove payment methods at any time. All payment methods require verified ownership; Users may not use payment methods belonging to third parties without proper authorization.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.2 Withdrawal Methods for Students</h3>
          <p className="text-gray-600 mb-4">
            Students may withdraw their available earnings from the Platform using the following methods:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
            <li><strong>Mobile Money:</strong> Withdrawal to MTN Mobile Money, Vodafone Cash, or AirtelTigo Money wallets registered in the Student&apos;s name.</li>
            <li><strong>Bank Transfer:</strong> Withdrawal to a Ghanaian bank account in the Student&apos;s name.</li>
          </ul>
          <p className="text-gray-600 mb-4">
            There is no minimum withdrawal amount. Withdrawals are processed within one (1) to three (3) business days, depending on the withdrawal method and the processing times of the receiving financial institution. Intemso does not charge a separate withdrawal fee; however, the Student&apos;s mobile money provider or bank may charge their own transaction fees, which are the Student&apos;s responsibility. Withdrawal accounts must be in the name of the registered Account holder. Withdrawals to third party accounts are not permitted.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. Service Fees</h2>
          <p className="text-gray-600 mb-4">
            Intemso charges Students a Service Fee on all earnings received through the Platform. The Service Fee is calculated on a sliding scale based on the cumulative lifetime billings between a Student and a specific Employer, as set out in Section 8 of the <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link>. The Service Fee is automatically deducted from the Student&apos;s earnings at the time of payment release. Employers are not charged any platform fees or Service Fees for posting gigs, hiring Students, or funding Contracts. Transaction processing fees charged by the Payment Processor (if any) are absorbed by Intemso and are not passed on to Users, except where explicitly stated otherwise.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">4. Connects Purchases</h2>
          <p className="text-gray-600 mb-4">
            Students may purchase additional Connects through the Platform using the same payment methods available for Contract funding, as described in Section 2.1. The pricing for Connects packs is set out in Section 8.2 of the <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link>. All Connects purchases are final and non refundable, except where required by applicable law or as otherwise set out in the <Link href="/refund-policy" className="text-primary-600 hover:text-primary-700 underline">Refund and Cancellation Policy</Link>. Purchased Connects do not expire. Connects have no cash value and cannot be redeemed for cash or transferred to another User.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">5. Disputes and Fund Holds</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.1 Fund Holds During Disputes</h3>
          <p className="text-gray-600 mb-4">
            When a dispute is raised by either party regarding a Contract or Milestone, the associated escrowed funds are placed on hold and are not released to either party until the dispute is resolved. During the dispute period, neither the Student nor the Employer may withdraw, transfer, or access the held funds. The dispute resolution process is governed by the <Link href="/dispute-resolution" className="text-primary-600 hover:text-primary-700 underline">Dispute Resolution Policy</Link>.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.2 Dispute Outcomes and Fund Distribution</h3>
          <p className="text-gray-600 mb-4">
            Upon resolution of a dispute, the escrowed funds will be distributed in accordance with the outcome, which may include any of the following: (a) full release of the escrowed funds to the Student, if the dispute is resolved in the Student&apos;s favour; (b) full refund of the escrowed funds to the Employer, if the dispute is resolved in the Employer&apos;s favour; (c) partial release to the Student and partial refund to the Employer, if the dispute is resolved with a split decision; or (d) any other distribution agreed upon by both parties or determined by Intemso&apos;s mediation team. The Service Fee is calculated and deducted only on the amount released to the Student.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">6. Chargebacks and Payment Reversals</h2>
          <p className="text-gray-600 mb-4">
            If an Employer initiates a chargeback or payment reversal with their payment provider for a payment that was legitimately processed through the Platform, Intemso reserves the right to: (a) suspend the Employer&apos;s Account pending investigation; (b) hold or forfeit any pending payments or refunds owed to the Employer; (c) charge the Employer for any fees, costs, or penalties incurred by Intemso as a result of the chargeback; and (d) permanently terminate the Employer&apos;s Account if the chargeback is determined to be fraudulent or in bad faith. Filing a fraudulent chargeback is a violation of the <Link href="/acceptable-use" className="text-primary-600 hover:text-primary-700 underline">Acceptable Use Policy</Link> and may be referred to law enforcement authorities. Students who have already received payment for work on a Contract that is subsequently subject to a chargeback will not be required to return funds that were legitimately earned for work that was properly completed and approved, unless the payment is determined to be the result of fraud.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">7. Account Balances and Holds</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.1 Available Balance</h3>
          <p className="text-gray-600 mb-4">
            Your available balance represents the total amount of funds in your Account that are available for withdrawal. This balance includes earnings from completed and approved Milestones and Contracts (less applicable Service Fees) that are no longer subject to any hold or pending period. Funds become available in your balance immediately upon approval by the Employer or upon automatic release under Section 1.2 of these Payment Terms.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.2 Pending Balance</h3>
          <p className="text-gray-600 mb-4">
            Your pending balance represents funds that are in the process of being released but are not yet available for withdrawal. This may include funds that are subject to a processing period, funds associated with Milestones that have been submitted but not yet approved, or funds that are under review for compliance purposes.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.3 Compliance Holds</h3>
          <p className="text-gray-600 mb-4">
            Intemso and the Payment Processor reserve the right to place holds on Account balances or individual transactions for compliance and anti fraud purposes, including where: (a) suspicious activity is detected on the Account; (b) identity verification is incomplete or requires re verification; (c) a compliance review is required under the Anti Money Laundering Act, 2020 (Act 1044); or (d) a government order or legal process requires the freezing of funds. Intemso will notify the affected User of any such hold (unless prohibited from doing so by law or regulatory order) and will work to resolve the matter as expeditiously as reasonably practicable.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">8. Account Termination and Remaining Funds</h2>
          <p className="text-gray-600 mb-4">
            Upon termination of a User&apos;s Account (whether by the User or by Intemso): (a) any available balance in the User&apos;s Account will be disbursed to the User within thirty (30) calendar days, minus any applicable fees, penalties, or amounts owed to Intemso; (b) any funds held in escrow for active Contracts will be handled in accordance with the dispute resolution process or, where no dispute exists, in accordance with the terms of the relevant Contract; (c) purchased Connects that have not been used are non refundable; and (d) if the User owes any amounts to Intemso (including but not limited to circumvention fees, chargeback costs, or outstanding penalties), Intemso may deduct such amounts from the available balance before disbursement. If the User&apos;s Account was terminated for fraud or illegal activity, Intemso reserves the right to withhold all remaining funds pending investigation and may forfeit such funds to the extent permitted by applicable law.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">9. Currency and Exchange Rates</h2>
          <p className="text-gray-600 mb-4">
            All financial transactions on the Platform are denominated in the Ghanaian Cedi (GH₵). Where a User makes a payment using a non Ghanaian Cedi payment method, the conversion will be handled by the Payment Processor or the User&apos;s financial institution at the applicable exchange rate. Intemso does not control and is not responsible for exchange rates, conversion fees, or any costs associated with currency conversion.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">10. Tax Obligations</h2>
          <p className="text-gray-600 mb-4">
            Each User is solely responsible for determining and fulfilling their own tax obligations arising from financial transactions on the Platform, in accordance with the Income Tax Act, 2015 (Act 896), the Value Added Tax Act, 2013 (Act 870), and any other applicable tax legislation of the Republic of Ghana. Intemso does not provide tax advice and is not responsible for withholding, collecting, or remitting taxes on behalf of Users, except where expressly required by applicable law. Users are advised to consult with a qualified tax professional regarding their tax obligations.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">11. Anti Money Laundering Compliance</h2>
          <p className="text-gray-600 mb-4">
            Intemso is committed to complying with the Anti Money Laundering Act, 2020 (Act 1044) and all applicable anti money laundering regulations of the Republic of Ghana. In furtherance of this commitment, Intemso and the Payment Processor may: (a) require Users to complete identity verification, including submission of a Ghana Card number or other government issued identification; (b) monitor transactions for suspicious activity; (c) place holds on transactions or accounts that trigger suspicious activity indicators; (d) file suspicious transaction reports with the Financial Intelligence Centre of Ghana; and (e) decline to process transactions that, in the reasonable judgment of Intemso or the Payment Processor, may be associated with money laundering, terrorism financing, or other financial crimes. Users agree to cooperate fully with any verification or investigation conducted by Intemso, the Payment Processor, or any regulatory or law enforcement authority.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">12. Payment Processor</h2>
          <p className="text-gray-600 mb-4">
            All payments on the Platform are processed through Paystack, a licensed third party Payment Processor. By using the Platform&apos;s payment features, you also agree to Paystack&apos;s terms of service and privacy policy. Intemso is not responsible for errors, delays, or failures attributable to the Payment Processor. In the event that the Payment Processor experiences downtime or technical issues, Intemso will use reasonable efforts to resolve the disruption but shall not be liable for any resulting delays in payment processing. Intemso reserves the right to change the Payment Processor at any time, with reasonable notice to Users. A change of Payment Processor will not affect existing escrowed funds, which will be handled in an orderly transition.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">13. Limitation of Liability for Payment Services</h2>
          <p className="text-gray-600 mb-4">
            Intemso is not a bank, financial institution, or licensed money services business. Intemso does not hold User funds directly; all funds are held by the Payment Processor. To the maximum extent permitted by applicable law, Intemso shall not be liable for: (a) any loss of funds resulting from failures, errors, or insolvency of the Payment Processor, banks, or mobile money providers; (b) any unauthorized transactions resulting from the User&apos;s failure to maintain the security of their Account credentials or payment methods; (c) any delays in payment processing caused by the Payment Processor, receiving financial institutions, or circumstances beyond Intemso&apos;s reasonable control; or (d) any taxes, penalties, or interest arising from the User&apos;s failure to comply with their tax obligations.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">14. Changes to These Payment Terms</h2>
          <p className="text-gray-600 mb-4">
            Intemso reserves the right to update or modify these Escrow and Payment Terms at any time. When we make material changes, we will provide at least thirty (30) calendar days&apos; prior notice to Users through the Platform. Changes to these Payment Terms shall apply only to transactions initiated after the effective date of the modification and shall not retroactively affect existing funded Contracts or escrow balances. Your continued use of the Platform&apos;s payment features after the effective date constitutes your acceptance of the modified Payment Terms.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">15. Contact Information</h2>
          <p className="text-gray-600 mb-4">
            For questions or concerns regarding these Escrow and Payment Terms, please contact Intemso through the contact form available on the Platform or through any other official communication channel provided by Intemso.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              These Escrow and Payment Terms were last updated on 1 April 2026.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}

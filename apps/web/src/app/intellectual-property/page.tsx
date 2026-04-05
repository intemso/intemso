import Link from 'next/link';

export const metadata = {
  title: 'Intellectual Property Policy | Intemso',
  description: 'Intellectual Property Policy for the Intemso platform.',
};

export default function IntellectualPropertyPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Intellectual Property Policy</h1>
          <p className="text-gray-500 mt-2">Effective Date: 1 April 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none">

          <p className="text-gray-600 mb-6">
            This Intellectual Property Policy (hereinafter referred to as &quot;Policy&quot;) governs the ownership, use, licensing, and protection of intellectual property in connection with the Intemso platform, including the website at intemso.com, all associated subdomains, mobile applications, and any related services (collectively referred to as the &quot;Platform&quot;). This Policy supplements and forms part of the <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link> and is incorporated therein by reference.
          </p>
          <p className="text-gray-600 mb-8">
            This Policy is issued in compliance with the Copyright Act, 2005 (Act 690), the Trade Marks Act, 2004 (Act 664), the Patents Act, 2003 (Act 657), the Industrial Designs Act, 2003 (Act 660), and all other applicable intellectual property legislation of the Republic of Ghana. All Users agree to comply with this Policy and with all applicable intellectual property laws when using the Platform.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">1. Intemso&apos;s Intellectual Property</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1.1 Ownership</h3>
          <p className="text-gray-600 mb-4">
            All intellectual property rights in and to the Platform, including but not limited to the software, source code, object code, algorithms, databases, architecture, design, layout, user interface, text, graphics, logos, icons, images, audio and video clips, digital downloads, data compilations, trademarks, trade names, service marks, trade dress, domain names, and the overall look and feel of the Platform, are and shall remain the exclusive property of Intemso or its licensors. These rights are protected under the Copyright Act, 2005 (Act 690), the Trade Marks Act, 2004 (Act 664), and other applicable laws of the Republic of Ghana and international intellectual property treaties and conventions to which the Republic of Ghana is a party.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1.2 Limited Licence to Users</h3>
          <p className="text-gray-600 mb-4">
            Subject to your compliance with the <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline">Terms of Service</Link> and all applicable policies, Intemso grants you a limited, non exclusive, non transferable, non sublicensable, revocable licence to access and use the Platform solely for its intended purposes. This licence does not grant you any right to: (a) copy, modify, adapt, translate, or create derivative works of the Platform or any part thereof; (b) reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code or underlying structure of the Platform; (c) rent, lease, loan, sell, sublicence, distribute, or otherwise transfer the Platform or access thereto to any third party; (d) remove, alter, or obscure any copyright notices, trademarks, or other proprietary notices on the Platform; or (e) use the Platform other than as expressly permitted in the Terms of Service.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1.3 Trademarks</h3>
          <p className="text-gray-600 mb-4">
            The name &quot;Intemso,&quot; the Intemso logo, and all related names, logos, product and service names, designs, slogans, and taglines are trademarks of Intemso or its affiliates. You may not use these trademarks without the prior written permission of Intemso. All other trademarks, service marks, and trade names appearing on the Platform are the property of their respective owners. Reference to any third party trademarks on the Platform does not constitute or imply endorsement, sponsorship, or recommendation by Intemso.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. Ownership of Work Product (Deliverables)</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.1 Default Ownership Rule</h3>
          <p className="text-gray-600 mb-4">
            Unless the Student and Employer expressly agree otherwise in writing within the Contract, the following default rules shall apply to the ownership of Deliverables produced under a Contract:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
            <li><strong>Before Full Payment:</strong> The Student retains all intellectual property rights (including copyright, moral rights, and any other applicable rights) in the Deliverables until the Employer has made full and final payment for the relevant Milestone or Contract. During this period, the Employer has no right to use, reproduce, modify, distribute, or display the Deliverables for any purpose.</li>
            <li><strong>Upon Full Payment:</strong> Upon the Employer&apos;s full and final payment (whether through manual approval or automatic release under the <Link href="/escrow-terms" className="text-primary-600 hover:text-primary-700 underline">Escrow and Payment Terms</Link>), all intellectual property rights in the Deliverables shall transfer to the Employer. This transfer includes the right to use, reproduce, modify, adapt, publish, distribute, display, perform, and create derivative works of the Deliverables, in any medium and for any purpose, without further compensation to the Student.</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.2 Custom Ownership Agreements</h3>
          <p className="text-gray-600 mb-4">
            The Student and Employer may agree to different intellectual property ownership terms within the Contract. Any custom ownership arrangement must be clearly documented in the Contract details on the Platform. In the event of a conflict between the default ownership rules in Section 2.1 and a custom ownership agreement documented in the Contract, the custom agreement shall prevail, provided it is clearly expressed and agreed to by both parties. Custom ownership arrangements may include, but are not limited to: (a) the Student retaining full ownership and granting the Employer only a licence to use the Deliverables; (b) joint ownership of the Deliverables; (c) the Student retaining certain rights (such as the right to use the Deliverables for portfolio or promotional purposes) while transferring other rights to the Employer; or (d) any other arrangement that the parties may agree upon.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.3 Moral Rights</h3>
          <p className="text-gray-600 mb-4">
            Under the Copyright Act, 2005 (Act 690), the author of a work retains certain moral rights, including the right to be identified as the author of the work (the right of attribution) and the right to object to any distortion, mutilation, or other modification of the work that would be prejudicial to the author&apos;s honour or reputation (the right of integrity). These moral rights subsist independently of the economic rights in the work and cannot be transferred. However, the Student may waive the right of attribution in writing if both parties agree to such a waiver within the Contract. The Student&apos;s exercise of portfolio rights under Section 3 of this Policy shall not be considered a violation of any moral rights waiver.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. Portfolio and Showcase Rights</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.1 Default Portfolio Rights</h3>
          <p className="text-gray-600 mb-4">
            Unless the Employer explicitly restricts such use in writing within the Contract, the Student retains the right to display, reference, and describe the Deliverables in their portfolio on the Platform (including the Showcase feature) and in their personal portfolio outside the Platform (including personal websites, social media profiles, and curriculum vitae) for the purpose of demonstrating their skills, experience, and professional capabilities. This portfolio right is a non exclusive, perpetual, royalty free licence retained by the Student and survives the transfer of ownership of the Deliverables to the Employer.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.2 Restrictions on Portfolio Use</h3>
          <p className="text-gray-600 mb-4">
            The Student&apos;s portfolio rights are subject to the following restrictions: (a) the Student may not use the Deliverables for any purpose other than portfolio display and professional self promotion; (b) the Student may not sell, licence, or commercially distribute the Deliverables or any derivative thereof under the portfolio right; (c) the Student must respect any confidentiality obligations agreed in the Contract and must not disclose confidential information belonging to the Employer in their portfolio; and (d) if the Employer has explicitly restricted portfolio use in writing within the Contract, the Student must comply with such restrictions.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">4. User Content</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.1 Licence Granted to Intemso</h3>
          <p className="text-gray-600 mb-4">
            By uploading, posting, or submitting any User Content to the Platform (including but not limited to profile information, portfolio items, community posts, reviews, messages, and files), you grant Intemso a worldwide, non exclusive, royalty free, sublicensable, transferable licence to use, reproduce, modify, distribute, display, and perform such User Content solely for the purposes of operating, promoting, improving, and providing the Platform and its services. This licence continues for as long as the User Content remains on the Platform and for a reasonable period thereafter necessary for backup, archival, audit, or legal compliance purposes.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.2 Representations and Warranties</h3>
          <p className="text-gray-600 mb-4">
            By uploading or submitting User Content to the Platform, you represent and warrant that: (a) you own or have the necessary rights, licences, consents, and permissions to submit the User Content and to grant the licence described in Section 4.1; (b) the User Content does not infringe upon any third party&apos;s intellectual property rights, including copyrights, trademarks, patents, trade secrets, or moral rights; (c) the User Content does not violate the privacy or publicity rights of any third party; (d) the User Content does not contain material that is defamatory, obscene, illegal, or otherwise objectionable; and (e) the User Content complies with the <Link href="/acceptable-use" className="text-primary-600 hover:text-primary-700 underline">Acceptable Use Policy</Link> and all other applicable policies.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">5. Pre Existing Intellectual Property</h2>
          <p className="text-gray-600 mb-4">
            A Student may incorporate pre existing intellectual property (including but not limited to templates, frameworks, libraries, tools, methodologies, and prior works created before or outside of the Contract) into the Deliverables. Unless otherwise agreed in writing within the Contract: (a) the Student retains all intellectual property rights in their pre existing intellectual property; (b) the Employer is granted a non exclusive, perpetual, irrevocable, royalty free licence to use the pre existing intellectual property as incorporated in the Deliverables, solely for the purposes for which the Deliverables were created; (c) the Student must disclose to the Employer, prior to incorporation, any material pre existing intellectual property that will be included in the Deliverables; and (d) the Student warrants that they have the right to incorporate and licence the pre existing intellectual property as described herein. If the Employer requires exclusive ownership of all components of the Deliverables, including pre existing intellectual property, this must be expressly agreed and documented in the Contract before work begins.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">6. Third Party Materials</h2>
          <p className="text-gray-600 mb-4">
            Students may incorporate third party materials (such as open source libraries, stock images, licensed fonts, or other third party content) into Deliverables, provided that: (a) the Student has the right to use such third party materials under the applicable licence or agreement; (b) the use of such materials does not impose obligations on the Employer that conflict with the terms of the Contract (for example, copyleft open source licences that would require the Employer to release the entire Deliverable under the same licence); (c) the Student discloses to the Employer any third party materials incorporated into the Deliverables and the applicable licence terms; and (d) the Student ensures that the use of third party materials complies with the applicable licence terms. The Student is solely responsible for verifying that the licences governing any third party materials permit their intended use within the Deliverables.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">7. Intellectual Property Infringement</h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.1 Prohibition on Infringement</h3>
          <p className="text-gray-600 mb-4">
            Users are strictly prohibited from uploading, posting, sharing, or otherwise making available on the Platform any content or material that infringes upon the intellectual property rights of any third party. This includes, but is not limited to: (a) copying, reproducing, or distributing copyrighted works without authorization; (b) using trademarks, logos, or brand names without permission; (c) submitting Deliverables that contain plagiarized content; and (d) using patented inventions or processes without appropriate licensing. Infringement of intellectual property rights is a violation of the Copyright Act, 2005 (Act 690) and other applicable laws and may result in civil and criminal liability.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.2 Reporting Intellectual Property Infringement</h3>
          <p className="text-gray-600 mb-4">
            If you believe that your intellectual property rights have been infringed by content or material on the Platform, you may submit a report to Intemso through the Platform&apos;s reporting feature or through the official contact channels. Your report should include: (a) identification of the copyrighted work, trademark, or other intellectual property right that you claim has been infringed; (b) identification of the material on the Platform that you claim is infringing, with sufficient detail to enable Intemso to locate the material; (c) your contact information; (d) a statement that you have a good faith belief that the use of the material is not authorized by the intellectual property owner, its agent, or the law; and (e) a statement, made under penalty of perjury, that the information in the report is accurate and that you are the intellectual property owner or are authorized to act on the owner&apos;s behalf.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.3 Response to Infringement Reports</h3>
          <p className="text-gray-600 mb-4">
            Upon receiving a valid infringement report, Intemso will: (a) acknowledge receipt of the report within five (5) business days; (b) review the report and, if it appears valid, remove or disable access to the allegedly infringing material; (c) notify the User who posted the material of the report and the action taken; and (d) provide the accused User with an opportunity to submit a counter notification if they believe the material was removed in error. If the dispute is not resolved through the counter notification process, the reporting party may pursue legal remedies before the courts of the Republic of Ghana.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.4 Counter Notification</h3>
          <p className="text-gray-600 mb-4">
            If you believe that your content was removed or disabled as a result of an infringement report submitted in error or through misidentification, you may submit a counter notification to Intemso. The counter notification must include: (a) identification of the material that was removed and the location where it appeared before removal; (b) a statement, under penalty of perjury, that you have a good faith belief that the material was removed or disabled as a result of a mistake or misidentification; (c) your contact information; and (d) a statement that you consent to the jurisdiction of the courts of the Republic of Ghana for any legal proceedings relating to the matter. Upon receiving a valid counter notification, Intemso may restore the removed material within ten (10) to fourteen (14) business days, unless the original reporting party provides evidence that they have initiated court proceedings.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.5 Repeat Infringers</h3>
          <p className="text-gray-600 mb-4">
            Intemso maintains a policy of terminating the Accounts of Users who are determined to be repeat infringers of intellectual property rights. A User may be considered a repeat infringer if two (2) or more valid infringement reports are upheld against them. Termination for repeat infringement may be carried out without prior notice and without the opportunity to appeal.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">8. Open Source and Shared Work</h2>
          <p className="text-gray-600 mb-4">
            If a Contract involves the creation of open source software or content that is intended to be shared publicly, the Student and Employer must agree upon the appropriate open source licence (such as MIT, Apache 2.0, GNU GPL, or Creative Commons) and document this agreement in the Contract. Intemso is not responsible for ensuring that open source licence obligations are fulfilled by either party. Both parties are responsible for understanding and complying with the terms of any open source licence used in connection with the Deliverables.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">9. Feedback and Suggestions</h2>
          <p className="text-gray-600 mb-4">
            If you provide Intemso with any feedback, suggestions, ideas, or recommendations regarding the Platform or its services (hereinafter referred to as &quot;Feedback&quot;), you grant Intemso an irrevocable, perpetual, worldwide, non exclusive, royalty free, fully sublicensable licence to use, reproduce, modify, create derivative works of, distribute, and display the Feedback for any purpose, without any obligation to compensate you or to attribute the Feedback to you. Intemso is under no obligation to implement any Feedback and may choose to use or disregard Feedback at its sole discretion.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">10. Changes to This Policy</h2>
          <p className="text-gray-600 mb-4">
            Intemso reserves the right to update or modify this Intellectual Property Policy at any time. When we make material changes, we will provide reasonable notice to Users through the Platform. The updated Policy will specify the effective date. Your continued use of the Platform after the effective date constitutes your acceptance of the modified Policy. Changes to this Policy shall not retroactively affect intellectual property rights in Deliverables produced under Contracts formed before the effective date of the modification.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">11. Contact Information</h2>
          <p className="text-gray-600 mb-4">
            For questions or concerns regarding this Intellectual Property Policy, please contact Intemso through the contact form available on the Platform or through any other official communication channel provided by Intemso.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              This Intellectual Property Policy was last updated on 1 April 2026.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}

import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - PeerLens',
  description: 'Terms of Service for PeerLens peer feedback platform',
}

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-primary-600">
            PeerLens
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: December 31, 2025</p>

        <div className="mt-8 space-y-8 text-gray-600">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
            <p className="mt-3">
              By accessing or using PeerLens (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Description of Service</h2>
            <p className="mt-3">
              PeerLens is a peer feedback platform designed for Product Managers. The Service allows users to create feedback cycles, invite peers to provide feedback, and receive reports comparing self-assessments to peer perceptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. User Accounts</h2>
            <div className="mt-3 space-y-3">
              <p>To use certain features of the Service, you must create an account. You agree to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Provide accurate and complete information when creating your account</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Acceptable Use</h2>
            <div className="mt-3 space-y-3">
              <p>You agree not to use the Service to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Harass, abuse, or harm others through feedback or communications</li>
                <li>Submit false or misleading information</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the Service or its infrastructure</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Use the Service to send spam or unsolicited communications</li>
                <li>Collect or harvest information about other users without consent</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Feedback Content</h2>
            <div className="mt-3 space-y-3">
              <p>When providing feedback through the Service, you agree that:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Your feedback will be honest and constructive</li>
                <li>You will not include defamatory, discriminatory, or harassing content</li>
                <li>You will not include confidential or proprietary information of third parties</li>
                <li>Your feedback may be shared with the feedback requester according to the selected mode (anonymous or named)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Inviting Peers</h2>
            <p className="mt-3">
              When inviting peers to provide feedback, you represent that you have a legitimate professional relationship with the invitee and a reasonable basis for requesting their feedback. You agree not to use the invitation feature to send unsolicited or spam communications.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. Fees and Payment</h2>
            <p className="mt-3">
              Certain features of the Service may require payment. Current pricing and payment terms will be displayed before you incur any charges. All fees are non-refundable unless otherwise stated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">8. Intellectual Property</h2>
            <p className="mt-3">
              The Service, including its design, features, and content (excluding user-submitted content), is owned by PeerLens and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works based on the Service without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">9. User Content</h2>
            <p className="mt-3">
              You retain ownership of content you submit to the Service (self-assessments, feedback, etc.). By submitting content, you grant us a license to use, store, and process that content as necessary to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">10. Privacy</h2>
            <p className="mt-3">
              Your use of the Service is subject to our <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>, which describes how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">11. Disclaimer of Warranties</h2>
            <p className="mt-3">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. WE MAKE NO WARRANTIES REGARDING THE ACCURACY OR RELIABILITY OF ANY FEEDBACK RECEIVED THROUGH THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">12. Limitation of Liability</h2>
            <p className="mt-3">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PEERLENS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">13. Indemnification</h2>
            <p className="mt-3">
              You agree to indemnify and hold harmless PeerLens and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">14. Termination</h2>
            <p className="mt-3">
              We may suspend or terminate your access to the Service at any time for any reason, including violation of these Terms. You may terminate your account at any time by contacting us. Upon termination, your right to use the Service will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">15. Changes to Terms</h2>
            <p className="mt-3">
              We may modify these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">16. Governing Law</h2>
            <p className="mt-3">
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">17. Contact</h2>
            <p className="mt-3">
              If you have questions about these Terms, please contact us at legal@peerlens.app.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-gray-500">
          <div className="flex justify-center gap-6">
            <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-700">Terms of Service</Link>
          </div>
          <p className="mt-4">PeerLens — Peer feedback for Product Managers</p>
        </div>
      </footer>
    </main>
  )
}

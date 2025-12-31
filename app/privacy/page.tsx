import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - PeerLens',
  description: 'Privacy Policy for PeerLens peer feedback platform',
}

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: December 31, 2025</p>

        <div className="mt-8 space-y-8 text-gray-600">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Introduction</h2>
            <p className="mt-3">
              PeerLens (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our peer feedback platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Information We Collect</h2>
            <div className="mt-3 space-y-3">
              <p><strong>Account Information:</strong> When you create an account, we collect your email address for authentication purposes.</p>
              <p><strong>Self-Assessment Data:</strong> Ratings you provide about your own skills across our six PM competency areas.</p>
              <p><strong>Feedback Data:</strong> Ratings and written feedback provided by your peers. In anonymous mode, this data is aggregated and cannot be attributed to individual respondents.</p>
              <p><strong>Invitation Data:</strong> Email addresses of peers you invite to provide feedback.</p>
              <p><strong>Usage Data:</strong> Information about how you interact with our service, including access times and pages viewed.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. How We Use Your Information</h2>
            <div className="mt-3 space-y-3">
              <p>We use the information we collect to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Send invitation emails to peers on your behalf</li>
                <li>Generate feedback reports comparing self-assessments to peer feedback</li>
                <li>Send you service-related communications</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Protect against fraudulent or unauthorized activity</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Data Sharing and Disclosure</h2>
            <div className="mt-3 space-y-3">
              <p>We do not sell your personal information. We may share information in the following circumstances:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li><strong>Service Providers:</strong> We use third-party services (Supabase for database, Resend for email, Vercel for hosting) that process data on our behalf.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Anonymous Feedback Protection</h2>
            <p className="mt-3">
              When you select anonymous mode for your feedback cycle, we implement technical measures to protect respondent anonymity. Feedback is aggregated and shuffled so that individual responses cannot be attributed to specific peers. We do not store identifying information that would allow you to determine who provided specific anonymous feedback.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Data Security</h2>
            <p className="mt-3">
              We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest, secure authentication mechanisms, and regular security assessments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. Data Retention</h2>
            <p className="mt-3">
              We retain your account information and feedback data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us at privacy@peerlens.app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">8. Your Rights</h2>
            <div className="mt-3 space-y-3">
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to or restrict certain processing</li>
                <li>Data portability</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
              <p>To exercise these rights, contact us at privacy@peerlens.app.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">9. Cookies and Tracking</h2>
            <p className="mt-3">
              We use essential cookies necessary for authentication and service functionality. We do not use third-party advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">10. Children&apos;s Privacy</h2>
            <p className="mt-3">
              Our service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">11. Changes to This Policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">12. Contact Us</h2>
            <p className="mt-3">
              If you have questions about this Privacy Policy or our data practices, please contact us at privacy@peerlens.app.
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

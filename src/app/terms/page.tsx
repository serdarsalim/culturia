export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">C</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CULTURIA</h1>
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="prose prose-lg">
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using CULTURIA ("the Service"), you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to these Terms of Service, please do not use
              the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User-Submitted Content</h2>
            <p className="text-gray-700 mb-4">
              CULTURIA allows users to submit YouTube video links for cultural content. By submitting content,
              you agree that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You do not own the video content; you are only sharing publicly available YouTube links</li>
              <li>All submitted content remains subject to YouTube's Terms of Service</li>
              <li>Submissions must comply with our community guidelines and content policy</li>
              <li>Submissions are subject to review and approval by our team</li>
              <li>We reserve the right to reject or remove any submission at our sole discretion</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Content Guidelines</h2>
            <p className="text-gray-700 mb-4">Submitted videos should:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Have at least 1 million views (quality indicator)</li>
              <li>Have English subtitles available</li>
              <li>Be culturally authentic and appropriate</li>
              <li>Not contain hate speech, violence, or inappropriate content</li>
              <li>Be properly categorized</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Copyright and Intellectual Property</h2>
            <p className="text-gray-700">
              All video content remains the property of its original creators and is hosted on YouTube. CULTURIA
              does not claim ownership of any submitted video content. Users are responsible for ensuring they
              have the right to share the links they submit. If you believe any content infringes your copyright,
              please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Accounts</h2>
            <p className="text-gray-700">
              To submit content, you must create an account and verify your email address. You are responsible
              for maintaining the confidentiality of your account credentials and for all activities that occur
              under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Activities</h2>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Submit false, misleading, or inappropriate content</li>
              <li>Spam or abuse the submission system</li>
              <li>Impersonate others or provide false information</li>
              <li>Attempt to circumvent our approval process</li>
              <li>Use automated tools to submit content</li>
              <li>Submit content that violates any laws or regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Reporting and Flagging</h2>
            <p className="text-gray-700">
              Users can flag videos for issues such as broken links, inappropriate content, or miscategorization.
              All flags are reviewed by our team. False or malicious flagging may result in account suspension.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-gray-700">
              The Service is provided "as is" without any warranties, expressed or implied. We do not guarantee
              the accuracy, completeness, or usefulness of any content. Video availability is subject to YouTube's
              policies and may change without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700">
              CULTURIA and its operators shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages resulting from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon
              posting. Your continued use of the Service constitutes acceptance of modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact</h2>
            <p className="text-gray-700">
              For questions about these Terms of Service, please contact us through our website.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </a>
        </div>
      </main>
    </div>
  );
}

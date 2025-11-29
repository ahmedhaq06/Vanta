import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-purple-400 hover:text-purple-300 mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: November 26, 2025</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Vanta ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Use of Service</h2>
            <p className="mb-2">You agree to use the Service only for lawful purposes. You are prohibited from:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Sending spam or unsolicited emails</li>
              <li>Violating CAN-SPAM Act or other email regulations</li>
              <li>Impersonating others or providing false information</li>
              <li>Attempting to breach security or access unauthorized data</li>
              <li>Using the Service to harass, abuse, or harm others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Payment Terms</h2>
            <p className="mb-2">
              Vanta charges $2 for 500 test email credits and $19 per meeting booked. All payments are processed securely through PayPal.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Initial payment is required before uploading leads</li>
              <li>Meeting charges are applied when meetings are confirmed</li>
              <li>All prices are in USD</li>
              <li>Payments are non-refundable except as stated in our Refund Policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Email Sending</h2>
            <p>
              You are responsible for ensuring you have permission to contact leads. All emails must comply with applicable email laws including CAN-SPAM Act, GDPR, and other regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these terms or engage in fraudulent or abusive behavior.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Limitation of Liability</h2>
            <p>
              Vanta is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Service, including but not limited to lost profits, data loss, or service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Contact</h2>
            <p>
              For questions about these terms, contact us at: support@vanta.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

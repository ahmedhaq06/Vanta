import Link from 'next/link';

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-purple-400 hover:text-purple-300 mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: November 26, 2025</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Initial Credit Purchase ($2)</h2>
            <p className="mb-2">
              The $2 initial payment for 500 test email credits is <strong>non-refundable</strong> once emails have been sent.
            </p>
            <p className="mb-2">You may request a refund if:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>No emails have been sent using your credits</li>
              <li>Technical issues prevented you from using the Service</li>
              <li>Refund requested within 24 hours of purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Meeting Charges ($19/meeting)</h2>
            <p className="mb-2">
              Meeting charges are <strong>non-refundable</strong> once a meeting has been booked and confirmed.
            </p>
            <p className="mb-2">You may dispute a meeting charge if:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The meeting was incorrectly marked as booked</li>
              <li>The lead did not actually schedule a meeting</li>
              <li>System error resulted in duplicate charges</li>
            </ul>
            <p className="mt-2">
              Disputes must be submitted within 7 days of the charge with evidence (screenshots, calendar invites, etc.)
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Service Issues</h2>
            <p className="mb-2">If you experience service issues (emails not sent, technical failures), we may offer:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Credit restoration for unused credits</li>
              <li>Partial refund for affected charges</li>
              <li>Extended service credit</li>
            </ul>
            <p className="mt-2">Contact support within 48 hours of the issue with details.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Fraudulent Activity</h2>
            <p>
              If we detect fraudulent use of your account or payment method, all charges are non-refundable and your account may be suspended.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. How to Request a Refund</h2>
            <p className="mb-2">To request a refund:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Email support@vanta.app with your account email</li>
              <li>Include transaction ID and reason for refund</li>
              <li>Provide any supporting documentation</li>
            </ol>
            <p className="mt-4">
              Refund requests are reviewed within 3-5 business days. Approved refunds are processed through PayPal and may take 5-10 business days to appear in your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. PayPal Disputes</h2>
            <p>
              If you file a dispute or chargeback through PayPal without contacting us first, your account may be permanently suspended. Please reach out to support first so we can resolve the issue.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Contact</h2>
            <p>
              For refund requests or questions, contact us at: support@vanta.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

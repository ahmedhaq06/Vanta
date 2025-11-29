import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="text-purple-400 hover:text-purple-300 mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: November 26, 2025</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <p className="mb-2">We collect the following information:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Information:</strong> Email address, password (encrypted)</li>
              <li><strong>Lead Data:</strong> Names, email addresses, company names uploaded by you</li>
              <li><strong>Campaign Data:</strong> Email content, subject lines, sending preferences</li>
              <li><strong>Payment Information:</strong> Processed securely through PayPal (we don't store credit card details)</li>
              <li><strong>Usage Data:</strong> Email opens, clicks, replies, meeting bookings</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To provide and improve the Service</li>
              <li>To send emails on your behalf to your leads</li>
              <li>To process payments and manage your account</li>
              <li>To track campaign performance and analytics</li>
              <li>To communicate with you about your account and updates</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Data Sharing</h2>
            <p className="mb-2">We do not sell your data. We may share information with:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Service Providers:</strong> Supabase (database), PayPal (payments), Resend (email delivery)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
            <p>
              We use industry-standard security measures including encryption, secure authentication, and row-level security to protect your data. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Retention</h2>
            <p>
              We retain your data as long as your account is active. You may request deletion of your account and data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We do not use tracking cookies for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. GDPR Compliance</h2>
            <p>
              If you are in the EU, you have additional rights under GDPR including data portability and the right to object to processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to Privacy Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of significant changes via email or through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact</h2>
            <p>
              For privacy-related questions or to exercise your rights, contact us at: privacy@vanta.app
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

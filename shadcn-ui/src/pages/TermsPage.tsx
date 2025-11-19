import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <FileText className="h-12 w-12 text-netflix-red mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-gray-400">Last updated: November 2024</p>
          </div>

          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-400 leading-relaxed">
                By accessing and using The Bazaar marketplace, you agree to be bound by these Terms
                of Service. If you disagree with any part of these terms, you may not access the
                service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Use of the Platform</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  <strong className="text-white">2.1 Eligibility:</strong> You must be at least 18
                  years old to use our platform or have parental consent.
                </p>
                <p>
                  <strong className="text-white">2.2 Account Responsibility:</strong> You are
                  responsible for maintaining the confidentiality of your account credentials and
                  for all activities under your account.
                </p>
                <p>
                  <strong className="text-white">2.3 Prohibited Activities:</strong> You may not
                  use the platform for any illegal activities, fraud, or violation of applicable
                  laws.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Products and Services</h2>
              <p className="text-gray-400 leading-relaxed">
                Products are sold by independent vendors on our platform. The Bazaar acts as a
                marketplace facilitator. We do not guarantee the quality, safety, or legality of
                products sold by vendors. All product descriptions and images are provided by
                vendors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Payments</h2>
              <p className="text-gray-400 leading-relaxed">
                All payments are processed securely through our payment partners (Paystack, Stripe,
                M-Pesa). Prices are displayed in KES or USD as indicated. You agree to pay all
                charges associated with your purchases.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Returns and Refunds</h2>
              <p className="text-gray-400 leading-relaxed">
                Returns are accepted within 7 days of delivery for items in original condition.
                Refund eligibility and processing times are subject to vendor policies. See our
                Shipping page for detailed return procedures.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
              <p className="text-gray-400 leading-relaxed">
                All content on The Bazaar, including logos, text, graphics, and software, is the
                property of The Bazaar or its licensors and is protected by copyright and trademark
                laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-400 leading-relaxed">
                The Bazaar shall not be liable for any indirect, incidental, or consequential
                damages arising from your use of the platform or products purchased through the
                platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to Terms</h2>
              <p className="text-gray-400 leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the
                platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Information</h2>
              <p className="text-gray-400 leading-relaxed">
                For questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@thebazaar.com" className="text-netflix-red hover:underline">
                  legal@thebazaar.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Shield className="h-12 w-12 text-netflix-red mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: November 2024</p>
          </div>

          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  <strong className="text-white">Personal Information:</strong> Name, email
                  address, phone number, shipping address, and payment information when you create
                  an account or make a purchase.
                </p>
                <p>
                  <strong className="text-white">Usage Data:</strong> Information about how you use
                  our platform, including pages visited, products viewed, and interactions.
                </p>
                <p>
                  <strong className="text-white">Device Information:</strong> IP address, browser
                  type, device type, and operating system.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <div className="text-gray-400 space-y-3">
                <p>• Process and fulfill your orders</p>
                <p>• Communicate with you about your account and orders</p>
                <p>• Improve our platform and services</p>
                <p>• Send marketing communications (with your consent)</p>
                <p>• Prevent fraud and ensure platform security</p>
                <p>• Comply with legal obligations</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Data Sharing</h2>
              <p className="text-gray-400 leading-relaxed">
                We do not sell your personal information. We may share data with:
              </p>
              <div className="text-gray-400 space-y-2 mt-3">
                <p>• Payment processors to complete transactions</p>
                <p>• Shipping partners to deliver orders</p>
                <p>• Vendors for order fulfillment</p>
                <p>• Service providers who assist in platform operations</p>
                <p>• Legal authorities when required by law</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
              <p className="text-gray-400 leading-relaxed">
                We implement industry-standard security measures to protect your personal
                information, including encryption, secure servers, and access controls. However,
                no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  <strong className="text-white">Access:</strong> Request access to your personal
                  data
                </p>
                <p>
                  <strong className="text-white">Correction:</strong> Update or correct your
                  personal information
                </p>
                <p>
                  <strong className="text-white">Deletion:</strong> Request deletion of your
                  account and data
                </p>
                <p>
                  <strong className="text-white">Opt-out:</strong> Unsubscribe from marketing
                  emails
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies</h2>
              <p className="text-gray-400 leading-relaxed">
                We use cookies to enhance your experience, analyze usage, and personalize content.
                You can control cookies through your browser settings. See our Cookie Policy for
                more details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
              <p className="text-gray-400 leading-relaxed">
                For privacy-related questions or to exercise your rights, contact us at{' '}
                <a href="mailto:privacy@thebazaar.com" className="text-netflix-red hover:underline">
                  privacy@thebazaar.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


import { Cookie } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Cookie className="h-12 w-12 text-netflix-red mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Cookie Policy</h1>
            <p className="text-gray-400">Last updated: November 2024</p>
          </div>

          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">What Are Cookies?</h2>
              <p className="text-gray-400 leading-relaxed">
                Cookies are small text files stored on your device when you visit our website. They
                help us provide you with a better experience by remembering your preferences and
                understanding how you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Types of Cookies We Use</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Essential Cookies</h3>
                  <p className="text-gray-400">
                    Required for the platform to function properly, including authentication,
                    security, and shopping cart functionality.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Analytics Cookies</h3>
                  <p className="text-gray-400">
                    Help us understand how visitors interact with our platform to improve user
                    experience and performance.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Functional Cookies</h3>
                  <p className="text-gray-400">
                    Remember your preferences and settings to personalize your experience on
                    subsequent visits.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Marketing Cookies</h3>
                  <p className="text-gray-400">
                    Used to track your browsing behavior to deliver relevant advertisements and
                    measure campaign effectiveness.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Managing Cookies</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                You can control and manage cookies in several ways:
              </p>
              <div className="text-gray-400 space-y-2">
                <p>
                  <strong className="text-white">Browser Settings:</strong> Most browsers allow
                  you to refuse or delete cookies. Check your browser's help section for
                  instructions.
                </p>
                <p>
                  <strong className="text-white">Cookie Preferences:</strong> Use our cookie
                  preference center (when available) to manage your cookie choices.
                </p>
                <p>
                  <strong className="text-white">Note:</strong> Disabling essential cookies may
                  affect platform functionality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Cookies</h2>
              <p className="text-gray-400 leading-relaxed">
                Some cookies are placed by third-party services that appear on our pages, such as
                payment processors and analytics providers. We do not control these cookies. Please
                refer to their privacy policies for more information.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


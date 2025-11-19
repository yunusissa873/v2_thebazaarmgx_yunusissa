import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@thebazaar/ui/button';

export default function VendorTermsPage() {
  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <FileText className="h-12 w-12 text-netflix-red mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Vendor Terms of Service</h1>
            <p className="text-gray-400">Last updated: November 2024</p>
          </div>

          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Vendor Agreement</h2>
              <p className="text-gray-400 leading-relaxed">
                By registering as a vendor on The Bazaar, you agree to these Vendor Terms of
                Service in addition to our general Terms of Service. These terms govern your
                relationship with The Bazaar as a seller on our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Vendor Responsibilities</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  <strong className="text-white">2.1 Product Listings:</strong> You are
                  responsible for accurate product descriptions, pricing, and images. All products
                  must comply with applicable laws and regulations.
                </p>
                <p>
                  <strong className="text-white">2.2 Order Fulfillment:</strong> You must fulfill
                  orders within the specified timeframes and maintain adequate inventory levels.
                </p>
                <p>
                  <strong className="text-white">2.3 Customer Service:</strong> You are
                  responsible for responding to customer inquiries and resolving disputes
                  professionally.
                </p>
                <p>
                  <strong className="text-white">2.4 KYC Verification:</strong> All vendors must
                  complete identity verification and provide necessary business documentation.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Fees and Payments</h2>
              <div className="text-gray-400 space-y-3">
                <p>
                  <strong className="text-white">3.1 Subscription Fees:</strong> Vendors pay
                  monthly subscription fees based on their selected tier. Fees are charged in
                  advance.
                </p>
                <p>
                  <strong className="text-white">3.2 Commission:</strong> The Bazaar charges a
                  commission on each sale. Commission rates vary by subscription tier.
                </p>
                <p>
                  <strong className="text-white">3.3 Payouts:</strong> Vendor payouts are
                  processed weekly or bi-weekly, depending on your subscription tier. A minimum
                  balance may be required.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Prohibited Items</h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                The following items are strictly prohibited:
              </p>
              <div className="text-gray-400 space-y-2">
                <p>• Illegal goods or services</p>
                <p>• Counterfeit or replica products</p>
                <p>• Weapons, firearms, or ammunition</p>
                <p>• Drugs, tobacco, or alcohol (without proper licenses)</p>
                <p>• Stolen goods</p>
                <p>• Items that infringe on intellectual property rights</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Account Suspension</h2>
              <p className="text-gray-400 leading-relaxed">
                The Bazaar reserves the right to suspend or terminate vendor accounts that violate
                these terms, engage in fraudulent activities, or fail to maintain service quality
                standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
              <p className="text-gray-400 leading-relaxed">
                You retain ownership of your product images and descriptions. By listing on The
                Bazaar, you grant us a license to display and promote your products on our
                platform.
              </p>
            </section>

            <section className="bg-gradient-to-r from-netflix-red/20 to-orange-600/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Ready to Start Selling?</h2>
              <p className="text-gray-300 mb-4">
                Join thousands of successful vendors on The Bazaar marketplace.
              </p>
              <Link to="/vendors/register">
                <Button className="bg-netflix-red hover:bg-netflix-red/90 text-white">
                  Become a Vendor
                </Button>
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


/**
 * KYC Verification Page
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

import KYCWizard from "@/components/vendor/KYCWizard";

export default function VerifyPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Verification</h1>
          <p className="text-gray-600">Upload required documents to verify your vendor account</p>
        </div>
        <KYCWizard />
      </div>
    </div>
  );
}

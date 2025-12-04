/**
 * Subscription Page
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

import SubscriptionPlansGrid from "@/components/vendor/SubscriptionPlansGrid";

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-gray-600">Select a subscription plan to continue</p>
        </div>
        <SubscriptionPlansGrid />
      </div>
    </div>
  );
}

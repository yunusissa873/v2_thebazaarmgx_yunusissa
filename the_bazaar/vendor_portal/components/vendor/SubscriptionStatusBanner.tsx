/**
 * Subscription Status Banner Component
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

"use client";

import { useVendorStore } from "@/state/vendorStore";
import { Calendar, RefreshCw, X } from "lucide-react";

export default function SubscriptionStatusBanner() {
  const { subscription } = useVendorStore();

  if (!subscription) return null;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <span className="font-semibold">Plan: {subscription.plan_name}</span>
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={subscription.auto_renew}
              onChange={() => {}}
              className="rounded"
            />
            Auto-renew
          </label>
          <button className="text-sm text-[#E50914] hover:underline">Manage</button>
        </div>
      </div>
    </div>
  );
}

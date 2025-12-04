/**
 * Dashboard Layout - Protected route with access gates
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVendorStore } from "@/state/vendorStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { kycStatus, subscription, isAuthenticated } = useVendorStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/vendor/register");
      return;
    }

    if (kycStatus !== "verified") {
      router.push("/vendor/verify");
      return;
    }

    if (!subscription || subscription.status !== "active") {
      router.push("/vendor/subscription");
      return;
    }
  }, [kycStatus, subscription, isAuthenticated, router]);

  // Show loading while checking
  if (!isAuthenticated || kycStatus !== "verified" || !subscription || subscription.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E50914] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen">{children}</div>;
}

/**
 * Vendor Layout - Wraps all vendor routes
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

import VendorHeader from "@/components/vendor/VendorHeader";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <VendorHeader />
      <main>{children}</main>
    </div>
  );
}

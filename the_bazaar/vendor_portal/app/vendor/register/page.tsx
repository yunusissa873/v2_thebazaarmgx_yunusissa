/**
 * Vendor Registration Page
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

import VendorRegisterForm from "@/components/vendor/VendorRegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-[#E50914]">The</span> Bazaar
          </h1>
          <h2 className="text-2xl font-semibold mt-4">Vendor Registration</h2>
          <p className="text-gray-600 mt-2">Create your vendor account</p>
        </div>
        <VendorRegisterForm />
      </div>
    </div>
  );
}

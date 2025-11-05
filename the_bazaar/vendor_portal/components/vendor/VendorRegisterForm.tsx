/**
 * Vendor Registration Form Component
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVendorStore } from "@/state/vendorStore";
import { Building2, Mail, Phone, Lock } from "lucide-react";

export default function VendorRegisterForm() {
  const router = useRouter();
  const registerVendor = useVendorStore((state) => state.registerVendor);
  const [formData, setFormData] = useState({
    business_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await registerVendor({
        business_name: formData.business_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      router.push("/vendor/verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium mb-2">Business Name</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            required
            value={formData.business_name}
            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            placeholder="Your business name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Phone</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            placeholder="+254 700 000 000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            placeholder="Minimum 8 characters"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Confirm Password</label>
        <input
          type="password"
          required
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className="w-full px-4 py-2 border rounded-md"
          placeholder="Re-enter password"
        />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#E50914] text-white py-2 px-4 rounded-md hover:bg-[#c11119] disabled:opacity-50"
      >
        {isLoading ? "Creating Account..." : "Create Vendor Account"}
      </button>
    </form>
  );
}

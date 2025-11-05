/**
 * Subscription Plans Grid Component
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  monthly_kes: number;
  annual_discount_pct: number;
  sku_limit: number | "unlimited";
  features: string[];
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic Vendor",
    monthly_kes: 2000,
    annual_discount_pct: 10,
    sku_limit: 50,
    features: ["Basic Dashboard", "Order Tracking", "Invoices", "Email/SMS Alerts"],
  },
  {
    id: "bronze",
    name: "Bronze Vendor",
    monthly_kes: 3500,
    annual_discount_pct: 10,
    sku_limit: 150,
    features: ["Full Dashboard", "CRM Lite", "Accounting Lite", "Product Insights"],
  },
  {
    id: "silver",
    name: "Silver Vendor",
    monthly_kes: 5500,
    annual_discount_pct: 10,
    sku_limit: 500,
    features: ["Advanced Analytics", "Full CRM", "Accounting Module", "Bulk Upload", "Ad Credits"],
  },
  {
    id: "gold",
    name: "Gold Vendor",
    monthly_kes: 7500,
    annual_discount_pct: 10,
    sku_limit: 1000,
    features: ["Dedicated Account Manager", "CRM & Marketing Suite", "Staff Accounts (5)", "Integrations (WhatsApp, Meta)"],
  },
  {
    id: "platinum",
    name: "Platinum Vendor",
    monthly_kes: 12000,
    annual_discount_pct: 10,
    sku_limit: "unlimited",
    features: ["All Modules", "Custom Storefront", "ERP/POS API", "Staff Accounts (10)", "24/7 Support"],
  },
];

export default function SubscriptionPlansGrid() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const calculatePrice = (plan: Plan) => {
    if (billingCycle === "annual") {
      const annualPrice = plan.monthly_kes * 12;
      const discount = annualPrice * (plan.annual_discount_pct / 100);
      return annualPrice - discount;
    }
    return plan.monthly_kes;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`px-4 py-2 rounded-md ${billingCycle === "monthly" ? "bg-[#E50914] text-white" : "bg-gray-200"}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle("annual")}
          className={`px-4 py-2 rounded-md ${billingCycle === "annual" ? "bg-[#E50914] text-white" : "bg-gray-200"}`}
        >
          Annual (Save {plans[0].annual_discount_pct}%)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPlan === plan.id
                ? "border-[#E50914] bg-red-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">KES {calculatePrice(plan).toLocaleString()}</span>
              {billingCycle === "annual" && (
                <span className="text-gray-600 ml-2">
                  /year (KES {Math.round(calculatePrice(plan) / 12).toLocaleString()}/mo)
                </span>
              )}
              {billingCycle === "monthly" && <span className="text-gray-600 ml-2">/month</span>}
            </div>
            <div className="mb-4">
              <span className="text-sm text-gray-600">SKU Limit: </span>
              <span className="font-semibold">{plan.sku_limit === "unlimited" ? "Unlimited" : plan.sku_limit}</span>
            </div>
            <ul className="space-y-2 mb-4">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-2 px-4 rounded-md font-semibold ${
                selectedPlan === plan.id
                  ? "bg-[#E50914] text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {selectedPlan === plan.id ? "Selected" : "Select Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

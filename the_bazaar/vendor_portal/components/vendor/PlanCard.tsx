/**
 * Plan Card Component
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

import { Check } from "lucide-react";

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    monthly_kes: number;
    annual_discount_pct: number;
    sku_limit: number | "unlimited";
    features: string[];
  };
  billingCycle: "monthly" | "annual";
  isSelected: boolean;
  onSelect: () => void;
}

export default function PlanCard({
  plan,
  billingCycle,
  isSelected,
  onSelect,
}: PlanCardProps) {
  const calculatePrice = () => {
    if (billingCycle === "annual") {
      const annualPrice = plan.monthly_kes * 12;
      const discount = annualPrice * (plan.annual_discount_pct / 100);
      return annualPrice - discount;
    }
    return plan.monthly_kes;
  };

  return (
    <div
      onClick={onSelect}
      className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-[#E50914] bg-red-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">KES {calculatePrice().toLocaleString()}</span>
        {billingCycle === "annual" && (
          <span className="text-gray-600 ml-2">
            /year (KES {Math.round(calculatePrice() / 12).toLocaleString()}/mo)
          </span>
        )}
        {billingCycle === "monthly" && <span className="text-gray-600 ml-2">/month</span>}
      </div>
      <div className="mb-4">
        <span className="text-sm text-gray-600">SKU Limit: </span>
        <span className="font-semibold">
          {plan.sku_limit === "unlimited" ? "Unlimited" : plan.sku_limit}
        </span>
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
          isSelected
            ? "bg-[#E50914] text-white"
            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
        }`}
      >
        {isSelected ? "Selected" : "Select Plan"}
      </button>
    </div>
  );
}

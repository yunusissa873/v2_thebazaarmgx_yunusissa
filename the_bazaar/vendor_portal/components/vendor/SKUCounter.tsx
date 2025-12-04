/**
 * SKU Counter Component
 * 
 * @author The Bazaar Development Team
 * @schema vendor_portal_spec.json
 */

interface SKUCounterProps {
  current: number;
  limit: number | "unlimited";
}

export default function SKUCounter({ current, limit }: SKUCounterProps) {
  const percentage = limit === "unlimited" ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = limit !== "unlimited" && percentage >= 80;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">SKU Usage</span>
        <span className={isNearLimit ? "text-orange-600 font-semibold" : "text-gray-600"}>
          {current} / {limit === "unlimited" ? "∞" : limit}
        </span>
      </div>
      {limit !== "unlimited" && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isNearLimit ? "bg-orange-500" : "bg-[#E50914]"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      {isNearLimit && (
        <p className="text-xs text-orange-600">
          ⚠️ You're approaching your SKU limit. Consider upgrading your plan.
        </p>
      )}
    </div>
  );
}

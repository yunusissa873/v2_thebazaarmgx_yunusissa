/**
 * Status Badge Component
 * 
 * @author The Bazaar Development Team
 */

import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

type StatusType = "success" | "pending" | "error" | "warning";

interface StatusBadgeProps {
  status: StatusType;
  label: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = {
    success: { icon: CheckCircle2, className: "bg-green-100 text-green-800" },
    pending: { icon: Clock, className: "bg-yellow-100 text-yellow-800" },
    error: { icon: XCircle, className: "bg-red-100 text-red-800" },
    warning: { icon: AlertCircle, className: "bg-orange-100 text-orange-800" },
  };

  const { icon: Icon, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

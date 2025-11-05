/**
 * Basic UI Components
 * Using shadcn/ui patterns
 */

import { cn } from "@/lib/utils";
import { brandKit } from "@/theme/brandKit";

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md font-medium transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-brand-primary",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("block text-sm font-medium mb-1", className)} {...props} />
  );
}

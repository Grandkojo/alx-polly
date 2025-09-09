import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  error: string;
  className?: string;
  variant?: "default" | "destructive" | "warning";
}

/**
 * Renders a small, styled inline error notification with an icon and message.
 *
 * Supports three visual variants: `"default"`, `"destructive"` (red, used by default), and `"warning"` (yellow).
 *
 * @param error - The message text to display.
 * @param className - Optional additional class names to merge with the component's base styles.
 * @param variant - Visual variant to apply; defaults to `"destructive"`.
 * @returns A JSX element containing an icon and the provided error text.
 */
export function ErrorDisplay({ 
  error, 
  className, 
  variant = "destructive" 
}: ErrorDisplayProps) {
  const variantClasses = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    destructive: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200"
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-md border text-sm",
        variantClasses[variant],
        className
      )}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

interface SuccessDisplayProps {
  message: string;
  className?: string;
}

/**
 * Renders a compact success notification with a green indicator and message.
 *
 * @param message - The text to display inside the success notification.
 * @param className - Optional additional CSS classes merged into the component container.
 * @returns A JSX element containing the success display.
 */
export function SuccessDisplay({ message, className }: SuccessDisplayProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-md border text-sm bg-green-50 text-green-800 border-green-200",
        className
      )}
    >
      <div className="h-4 w-4 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-white" />
      </div>
      <span>{message}</span>
    </div>
  );
}

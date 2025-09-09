import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  error: string;
  className?: string;
  variant?: "default" | "destructive" | "warning";
}

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
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        "flex items-center gap-2 p-3 rounded-md border text-sm",
        variantClasses[variant],
        className
      )}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{error}</span>
    </div>
  );
}

interface SuccessDisplayProps {
  message: string;
  className?: string;
}

export function SuccessDisplay({ message, className }: SuccessDisplayProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "flex items-center gap-2 p-3 rounded-md border text-sm bg-green-50 text-green-800 border-green-200",
        className
      )}
    >
      <div className="h-4 w-4 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center" aria-hidden="true">
        <div className="h-2 w-2 rounded-full bg-white" />
      </div>
      <span>{message}</span>
    </div>
  );
}

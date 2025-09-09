import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Renders a circular spinning loader with configurable size and optional classes.
 *
 * @param size - Visual size of the spinner; one of `"sm" | "md" | "lg"`. Defaults to `"md"`.
 * @param className - Additional CSS classes to apply to the spinner element.
 * @returns A `div` element styled and animated as a circular spinner.
 */
export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-slate-300 border-t-slate-600",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingPageProps {
  message?: string;
}

/**
 * Full-screen centered loading page that shows a large spinner and a message.
 *
 * Displays a fullscreen, vertically centered layout containing a large
 * LoadingSpinner and a message below it.
 *
 * @param message - Text to display beneath the spinner (defaults to `"Loading..."`).
 * @returns A React element representing the loading page.
 */
export function LoadingPage({ message = "Loading..." }: LoadingPageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-600">{message}</p>
      </div>
    </div>
  );
}

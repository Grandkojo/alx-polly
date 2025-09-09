/**
 * Dashboard footer displaying a copyright notice.
 *
 * Renders a semantic footer with a centered, small, muted copyright line that includes the current year
 * (computed at render time) followed by "ALX Polly. All rights reserved."
 *
 * @returns The JSX element for the dashboard footer.
 */
export function DashboardFooter() {
  return (
    <footer className="border-t bg-white py-4">
      <div className="container mx-auto px-4 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} ALX Polly. All rights reserved.
      </div>
    </footer>
  );
}

export function DashboardFooter() {
  return (
    <footer className="border-t bg-white py-4">
      <div className="container mx-auto px-4 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} ALX Polly. All rights reserved.
      </div>
    </footer>
  );
}

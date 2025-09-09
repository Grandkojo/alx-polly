export function AuthFooter() {
  return (
    <footer className="py-4 px-6 border-t bg-white">
      <div className="container mx-auto text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} ALX Polly. All rights reserved.
      </div>
    </footer>
  );
}

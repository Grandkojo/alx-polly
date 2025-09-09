"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/context/auth-context";
import { LoadingPage } from "@/app/components/ui/loading-spinner";
import { DashboardHeader } from "@/app/components/layout/dashboard-header";
import { DashboardFooter } from "@/app/components/layout/dashboard-footer";

/**
 * Layout wrapper for authenticated dashboard pages.
 *
 * Ensures only authenticated users can access its children by showing a loading
 * state while auth is resolving and redirecting to "/login" when unauthenticated.
 * When authenticated, renders the dashboard chrome (header and footer) and the
 * provided page content. Exposes a built-in sign-out flow that terminates the
 * session and navigates to the login page.
 *
 * @param children - Page content to render inside the authenticated dashboard layout
 * @returns The dashboard layout JSX element for authenticated users, or null/LoadingPage while resolving auth
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  /**
   * Handle authentication state changes and redirects.
   * 
   * This effect monitors authentication state and automatically redirects
   * unauthenticated users to the login page, ensuring dashboard pages
   * remain protected and accessible only to authenticated users.
   */
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  /**
   * Handle user logout and redirect to login page.
   * 
   * This function terminates the user session and redirects to the
   * login page, providing a clean logout experience and ensuring
   * proper session cleanup.
   */
  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading) {
    return <LoadingPage message="Loading user session..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DashboardHeader onSignOut={handleSignOut} />
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      <DashboardFooter />
    </div>
  );
}

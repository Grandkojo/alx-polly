"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/context/auth-context";
import { LoadingPage } from "@/app/components/ui/loading-spinner";
import { DashboardHeader } from "@/app/components/layout/dashboard-header";
import { DashboardFooter } from "@/app/components/layout/dashboard-footer";

/**
 * Dashboard layout component that provides authenticated user interface.
 * 
 * This component serves as the main layout wrapper for all authenticated
 * dashboard pages, providing navigation, user menu, and authentication
 * state management. It ensures only authenticated users can access
 * protected dashboard content.
 * 
 * Key Responsibilities:
 * - Provide consistent navigation and branding across dashboard pages
 * - Display user authentication status and profile information
 * - Handle automatic redirects for unauthenticated users
 * - Provide logout functionality and user menu
 * - Manage loading states during authentication checks
 * 
 * Security Context:
 * - Automatically redirects unauthenticated users to login page
 * - Displays user-specific information only when authenticated
 * - Handles authentication state changes gracefully
 * - Provides secure logout functionality
 * 
 * Assumptions:
 * - AuthContext is properly configured and provides user state
 * - Router is available for navigation operations
 * - User has valid session data when authenticated
 * - All child components require authentication
 * 
 * Edge Cases:
 * - Loading state: Shows loading spinner while checking auth
 * - Unauthenticated user: Redirects to login page
 * - Session expiration: Handles gracefully with redirect
 * - Network issues: Auth context handles retries
 * 
 * Integration:
 * - Wraps all dashboard route pages
 * - Uses AuthContext for user state management
 * - Provides navigation to polls, create poll, and admin pages
 * - Enables user profile management and logout
 * 
 * @param children - React components to render within the dashboard layout
 * @returns JSX element with dashboard layout and authentication handling
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

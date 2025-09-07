"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/lib/context/auth-context";

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p>Loading user session...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/polls" className="text-xl font-bold text-slate-800">
            ALX Polly
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/polls" className="text-slate-600 hover:text-slate-900">
              My Polls
            </Link>
            <Link
              href="/create"
              className="text-slate-600 hover:text-slate-900"
            >
              Create Poll
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button asChild>
              <Link href="/create">Create Poll</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        user?.user_metadata?.avatar_url ||
                        "/placeholder-user.jpg"
                      }
                      alt={user?.email || "User"}
                    />
                    <AvatarFallback>
                      {user?.email ? user.email[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile" className="w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings" className="w-full">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      <footer className="border-t bg-white py-4">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} ALX Polly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/context/auth-context';
import { LoadingPage } from '@/app/components/ui/loading-spinner';
import { AuthHeader } from '@/app/components/layout/auth-header';
import { AuthFooter } from '@/app/components/layout/auth-footer';

/**
 * Layout wrapper for authentication pages.
 *
 * Renders an authentication layout (header, centered content, footer) for unauthenticated users,
 * shows a loading screen while auth state is resolving, and redirects authenticated users to `/polls`.
 *
 * @param children - Content to render in the layout's main area when no authenticated user is present.
 * @returns The layout JSX for authentication pages, or null while redirecting an authenticated user.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/polls');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingPage message="Checking authentication..." />;
  }

  if (user) {
    return null; // Should already be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AuthHeader title="ALX Polly" subtitle="Create and share polls with ease" />
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <AuthFooter />
    </div>
  );
}
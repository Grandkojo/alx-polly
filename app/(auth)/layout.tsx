'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/context/auth-context';
import { LoadingPage } from '@/app/components/ui/loading-spinner';
import { AuthHeader } from '@/app/components/layout/auth-header';
import { AuthFooter } from '@/app/components/layout/auth-footer';

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
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthForm, FormField } from '@/app/components/forms/auth-form';
import { login } from '@/app/lib/actions/auth-actions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await login({ email, password });

    if (result?.error) {
      setError(result.error);
    } else {
      window.location.href = '/polls'; // Full reload to pick up session
    }
  };

  return (
    <AuthForm
      title="Login to ALX Polly"
      description="Enter your credentials to access your account"
      onSubmit={handleSubmit}
      submitText="Login"
      footerText="Don't have an account?"
      footerLink={
        <Link href="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      }
      error={error}
    >
      <FormField
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="your@email.com"
        required
        autoComplete="email"
      />
      <FormField
        id="password"
        name="password"
        label="Password"
        type="password"
        required
        autoComplete="current-password"
      />
    </AuthForm>
  );
}
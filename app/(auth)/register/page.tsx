'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthForm, FormField } from '@/app/components/forms/auth-form';
import { register } from '@/app/lib/actions/auth-actions';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await register({ name, email, password });

    if (result?.error) {
      setError(result.error);
    } else {
      window.location.href = '/polls'; // Full reload to pick up session
    }
  };

  return (
    <AuthForm
      title="Create an Account"
      description="Sign up to start creating and sharing polls"
      onSubmit={handleSubmit}
      submitText="Register"
      footerText="Already have an account?"
      footerLink={
        <Link href="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      }
      error={error}
    >
      <FormField
        id="name"
        name="name"
        label="Full Name"
        type="text"
        placeholder="John Doe"
        required
      />
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
        autoComplete="new-password"
      />
      <FormField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        required
        autoComplete="new-password"
      />
    </AuthForm>
  );
}
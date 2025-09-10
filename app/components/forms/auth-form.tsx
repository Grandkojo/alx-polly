'use client';

import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorDisplay } from '@/app/components/ui/error-display';
import { LoadingSpinner } from '@/app/components/ui/loading-spinner';

interface AuthFormProps {
  title: string;
  description: string;
  children: ReactNode;
  onSubmit: (formData: FormData) => Promise<void>;
  submitText: string;
  footerText: string;
  footerLink: ReactNode;
  isLoading?: boolean;
  error?: string | null;
}

export function AuthForm({
  title,
  description,
  children,
  onSubmit,
  submitText,
  footerText,
  footerLink,
  isLoading = false,
  error
}: AuthFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Prevent double-submits
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      await onSubmit(formData);
    } catch (error) {
      // Let the parent component handle the error
      // The error will be caught by the parent's error handling
      throw error;
    } finally {
      // Always clear the submitting flag
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {children}
            {error && <ErrorDisplay error={error} />}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Processing...
                </div>
              ) : (
                submitText
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-500">
            {footerText} {footerLink}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

export function FormField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  autoComplete
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
}

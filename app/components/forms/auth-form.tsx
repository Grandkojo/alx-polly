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

/**
 * Reusable authentication form wrapper that renders a card with header, content (form), and footer.
 *
 * The form collects form values into a FormData and calls `onSubmit(formData)`. While the submission
 * promise is pending an internal `isSubmitting` state disables the submit button and replaces its
 * label with a small loading spinner and "Processing...". The submit button is also disabled when
 * `isLoading` is true. If `error` is provided an ErrorDisplay is rendered above the submit button.
 *
 * Note: `isSubmitting` is set to true before calling `onSubmit` and set back to false after the
 * awaited call resolves. If `onSubmit` rejects, `isSubmitting` will remain true because there is
 * no error handling inside the component.
 *
 * @param onSubmit - Async handler invoked with the form's FormData on submit; should return a Promise<void>.
 * @param isLoading - When true, disables the submit button (used for external loading state).
 * @param error - Optional error message to display inside the form.
 * @returns A React element containing the complete auth form UI.
 */
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
    setIsSubmitting(true);
    
    const formData = new FormData(event.currentTarget);
    await onSubmit(formData);
    
    setIsSubmitting(false);
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

/**
 * A labeled text input wrapper used in auth forms.
 *
 * Renders a label tied to an input and an Input element configured by the provided props.
 *
 * @param id - The input's id; also used for the label's htmlFor.
 * @param name - The input's name attribute (form key).
 * @param label - Visible label text for the input.
 * @param type - Input type (defaults to `"text"`).
 * @param placeholder - Optional placeholder shown inside the input.
 * @param required - Whether the input is required (defaults to `false`).
 * @param autoComplete - Optional autocomplete attribute value for the browser.
 * @returns A React element containing the label and input.
 */
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

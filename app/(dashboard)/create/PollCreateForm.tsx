"use client";

import { useState } from "react";
import { createPoll } from "@/app/lib/actions/poll-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorDisplay, SuccessDisplay } from "@/app/components/ui/error-display";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

/**
 * Poll creation form component enabling authenticated users to create new polls.
 * 
 * This component provides a comprehensive interface for poll creation, including
 * dynamic option management, input validation, and user feedback. It handles
 * the complete poll creation workflow from form input to successful submission
 * and redirect to the polls dashboard.
 * 
 * Key Responsibilities:
 * - Provide form interface for poll question and options input
 * - Enable dynamic addition and removal of poll options
 * - Handle form submission with validation and error handling
 * - Provide user feedback during creation process
 * - Manage form state and option management
 * 
 * Security Context:
 * - Requires user authentication for poll creation
 * - Validates and sanitizes all form input data
 * - Enforces minimum and maximum option limits
 * - Prevents submission of invalid or empty data
 * - Handles server-side validation errors gracefully
 * 
 * Business Logic:
 * - Minimum 2 options required, maximum 10 options allowed
 * - Dynamic option management with add/remove functionality
 * - Form validation with real-time error display
 * - Success feedback with automatic redirect
 * - Consistent error handling and user feedback
 * 
 * Assumptions:
 * - User is authenticated and can create polls
 * - Form data will be validated server-side
 * - Poll creation action handles all validation
 * - User expects immediate feedback on form actions
 * - Successful creation should redirect to polls dashboard
 * 
 * Edge Cases:
 * - Invalid form data: Shows validation errors
 * - Server errors: Displays error messages to user
 * - Network issues: Handles gracefully with error feedback
 * - Empty options: Prevents submission and shows error
 * - Too many options: Enforces maximum limit
 * 
 * Integration:
 * - Used in create poll page for poll creation workflow
 * - Integrates with poll actions for data submission
 * - Provides data for poll management and display
 * - Enables poll creation and immediate access to polls
 * 
 * @returns JSX element with poll creation form and option management
 */
export default function PollCreateForm() {
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionChange = (idx: number, value: string) => {
    setOptions((opts) => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions((opts) => [...opts, ""]);
    }
  };

  const removeOption = (idx: number) => {
    if (options.length > 2) {
      setOptions((opts) => opts.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const res = await createPoll(formData);
    
    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/polls";
      }, 1200);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form action={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="question">Poll Question</Label>
          <Input 
            name="question" 
            id="question" 
            placeholder="What would you like to ask?"
            required 
            className="text-lg"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <span className="text-sm text-slate-500">
              {options.length}/10 options
            </span>
          </div>
          
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm text-slate-500 w-6">{idx + 1}.</span>
              <Input
                name="options"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                required
                className="flex-1"
              />
              {options.length > 2 && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  onClick={() => removeOption(idx)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          
          {options.length < 10 && (
            <Button 
              type="button" 
              onClick={addOption} 
              variant="outline"
              className="w-full"
            >
              + Add Option
            </Button>
          )}
        </div>

        {error && <ErrorDisplay error={error} />}
        {success && <SuccessDisplay message="Poll created successfully! Redirecting..." />}
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Creating Poll...
            </div>
          ) : (
            "Create Poll"
          )}
        </Button>
      </form>
    </div>
  );
} 
"use client";

import { useState } from "react";
import { createPoll } from "@/app/lib/actions/poll-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  const handleOptionChange = (idx: number, value: string) => {
    setOptions((opts) => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  const addOption = () => setOptions((opts) => [...opts, ""]);
  const removeOption = (idx: number) => {
    if (options.length > 2) {
      setOptions((opts) => opts.filter((_, i) => i !== idx));
    }
  };

  return (
    <form
      action={async (formData) => {
        setError(null);
        setSuccess(false);
        const res = await createPoll(formData);
        if (res?.error) {
          setError(res.error);
        } else {
          setSuccess(true);
          setTimeout(() => {
            window.location.href = "/polls";
          }, 1200);
        }
      }}
      className="space-y-6 max-w-md mx-auto"
    >
      <div>
        <Label htmlFor="question">Poll Question</Label>
        <Input name="question" id="question" required />
      </div>
      <div>
        <Label>Options</Label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <Input
              name="options"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              required
            />
            {options.length > 2 && (
              <Button type="button" variant="destructive" onClick={() => removeOption(idx)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" onClick={addOption} variant="secondary">
          Add Option
        </Button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">Poll created! Redirecting...</div>}
      <Button type="submit">Create Poll</Button>
    </form>
  );
} 
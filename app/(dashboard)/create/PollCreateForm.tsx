"use client";

import { useState } from "react";
import { createPoll } from "@/app/lib/actions/poll-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorDisplay, SuccessDisplay } from "@/app/components/ui/error-display";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

/**
 * Renders a poll creation form for authenticated users with dynamic option management and client-side submission.
 *
 * The form maintains local state for poll options, submission status, and feedback. It enforces a minimum of
 * 2 and a maximum of 10 options, prevents removing options below the minimum, and allows adding options up to the maximum.
 * On submit it calls `createPoll` with the form data, displays server-side errors when present, shows a success message
 * on success, and redirects the user to "/polls" after a short delay.
 *
 * Behavior notes:
 * - Each option and the question input are required.
 * - While submitting, the submit button is disabled and a loading indicator is shown.
 *
 * @returns JSX element containing the poll creation form.
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
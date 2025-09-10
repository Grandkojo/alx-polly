"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPoll } from "@/app/lib/actions/poll-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorDisplay, SuccessDisplay } from "@/app/components/ui/error-display";
import { LoadingSpinner } from "@/app/components/ui/loading-spinner";

const initialState = {
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={pending}
      size="lg"
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          Creating Poll...
        </div>
      ) : (
        "Create Poll"
      )}
    </Button>
  );
}

export default function PollCreateForm() {
  const [options, setOptions] = useState(["", ""]);
  const [state, formAction] = useActionState(createPoll, initialState);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (state.success) {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/polls";
      }, 1200);
    }
  }, [state.success]);

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

  return (
    <div className="max-w-2xl mx-auto">
      <form action={formAction} className="space-y-6">
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

        {state.error && <ErrorDisplay error={state.error} />}
        {success && <SuccessDisplay message="Poll created successfully! Redirecting..." />}
        
        <SubmitButton />
      </form>
    </div>
  );
}
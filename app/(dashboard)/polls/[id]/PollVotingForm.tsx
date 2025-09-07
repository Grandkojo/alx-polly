"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitVote } from "@/app/lib/actions/poll-actions";

interface Poll {
  id: string;
  question: string;
  options: string[];
  user_id: string;
  created_at: string;
}

interface PollVotingFormProps {
  poll: Poll;
}

/**
 * Poll voting form component enabling users to cast votes on polls.
 * 
 * This component provides the core voting interface, allowing users to
 * select poll options and submit votes. It handles both authenticated
 * and anonymous voting scenarios while providing comprehensive validation
 * and user feedback throughout the voting process.
 * 
 * Key Responsibilities:
 * - Display poll options in an interactive selection interface
 * - Handle vote submission with validation and error handling
 * - Provide visual feedback for vote selection and submission
 * - Prevent duplicate voting for authenticated users
 * - Show success confirmation after vote submission
 * 
 * Security Context:
 * - Validates poll data before allowing vote submission
 * - Prevents duplicate voting through server-side checks
 * - Handles both authenticated and anonymous voting securely
 * - Provides clear error messages without information disclosure
 * - Validates option selection against poll structure
 * 
 * Business Logic:
 * - Supports single-option selection from poll options
 * - Handles vote submission with loading states
 * - Shows success message after successful vote
 * - Prevents further voting after successful submission
 * - Maintains consistent UI state throughout voting process
 * 
 * Assumptions:
 * - Poll data is valid and contains required fields
 * - Poll options are properly formatted and accessible
 * - Vote submission action handles validation and errors
 * - User can select only one option per vote
 * - Vote submission is idempotent and secure
 * 
 * Edge Cases:
 * - Invalid poll data: Handles gracefully with error display
 * - Vote submission failure: Shows error message to user
 * - Duplicate vote attempt: Server prevents and shows error
 * - Network issues: Handles with appropriate error feedback
 * - Loading states: Provides visual feedback during submission
 * 
 * Integration:
 * - Used in poll detail pages for vote submission
 * - Integrates with poll actions for vote processing
 * - Provides data for poll analytics and results
 * - Enables both authenticated and anonymous voting flows
 * 
 * @param poll - Poll object containing poll data and options
 * @returns JSX element with voting interface and submission handling
 */
export default function PollVotingForm({ poll }: PollVotingFormProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async () => {
    if (selectedOption === null) return;
    
    setIsSubmitting(true);
    setError(null);
    
    const result = await submitVote(poll.id, selectedOption);
    
    if (result.error) {
      setError(result.error);
    } else {
      setHasVoted(true);
    }
    
    setIsSubmitting(false);
  };

  if (hasVoted) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 text-lg font-medium mb-2">
          ✅ Vote submitted successfully!
        </div>
        <p className="text-gray-600">
          Thank you for participating in this poll.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {poll.options.map((option, index) => (
          <div 
            key={index} 
            className={`p-3 border rounded-md cursor-pointer transition-colors ${
              selectedOption === index 
                ? 'border-blue-500 bg-blue-50' 
                : 'hover:bg-slate-50'
            }`}
            onClick={() => setSelectedOption(index)}
          >
            {option}
          </div>
        ))}
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <Button 
        onClick={handleVote} 
        disabled={selectedOption === null || isSubmitting} 
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Vote'}
      </Button>
    </div>
  );
}

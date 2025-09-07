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

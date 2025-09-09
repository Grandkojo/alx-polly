"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { deletePoll } from "@/app/lib/actions/poll-actions";
import { Poll, PollActionsProps } from "@/app/lib/types";
import { ErrorDisplay } from "@/app/components/ui/error-display";
import { useState } from "react";

/**
 * Poll actions component providing poll management interface for poll owners.
 * 
 * This component displays individual poll cards with management actions,
 * enabling poll owners to view, edit, and delete their polls. It implements
 * ownership-based authorization to ensure only poll owners can perform
 * management actions on their polls.
 * 
 * Key Responsibilities:
 * - Display poll information in an accessible card format
 * - Provide navigation to poll detail and edit pages
 * - Enable poll deletion with confirmation
 * - Implement ownership-based action visibility
 * - Handle poll management workflows
 * 
 * Security Context:
 * - Only displays management actions to poll owners
 * - Uses client-side ownership verification for UI state
 * - Server-side actions enforce additional authorization
 * - Provides confirmation dialogs for destructive actions
 * 
 * Business Logic:
 * - Shows poll question and option count
 * - Provides edit and delete actions for poll owners
 * - Handles poll deletion with user confirmation
 * - Refreshes page after successful deletion
 * - Maintains consistent UI state across actions
 * 
 * Assumptions:
 * - Poll data includes all required fields (id, question, options, user_id)
 * - Current user context is available and accurate
 * - Poll ownership is determined by user_id comparison
 * - Delete action requires user confirmation
 * 
 * Edge Cases:
 * - Poll owner mismatch: Actions are hidden (secure by default)
 * - Deletion failure: Error handling in delete action
 * - Network issues: Actions may fail gracefully
 * - User context changes: Actions update accordingly
 * 
 * Integration:
 * - Used in polls dashboard to display user's polls
 * - Integrates with poll management actions (edit, delete)
 * - Provides navigation to poll detail and edit pages
 * - Enables poll lifecycle management workflows
 * 
 * @param poll - Poll object containing poll data and metadata
 * @returns JSX element with poll card and management actions
 */
export default function PollActions({ poll }: PollActionsProps) {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this poll? This action cannot be undone.")) {
      setIsDeleting(true);
      setError(null);
      
      const result = await deletePoll(poll.id);
      
      if (result?.error) {
        setError(result.error);
        setIsDeleting(false);
      } else {
        window.location.reload();
      }
    }
  };

  return (
    <div className="border rounded-md shadow-md hover:shadow-lg transition-shadow bg-white">
      <Link href={`/polls/${poll.id}`}>
        <div className="group p-4">
          <div className="h-full">
            <div>
              <h2 className="group-hover:text-blue-600 transition-colors font-bold text-lg">
                {poll.question}
              </h2>
              <p className="text-slate-500">{poll.options.length} options</p>
            </div>
          </div>
        </div>
      </Link>
      {user && user.id === poll.user_id && (
        <div className="p-2 space-y-2">
          {error && <ErrorDisplay error={error} />}
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/polls/${poll.id}/edit`}>Edit</Link>
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

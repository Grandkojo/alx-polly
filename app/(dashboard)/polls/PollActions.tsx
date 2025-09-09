"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { deletePoll } from "@/app/lib/actions/poll-actions";
import { Poll, PollActionsProps } from "@/app/lib/types";
import { ErrorDisplay } from "@/app/components/ui/error-display";
import { useState } from "react";

/**
 * Render a poll card with owner-only management actions (view, edit, delete).
 *
 * Displays the poll question and option count and, when the current user is
 * the poll owner, shows Edit and Delete controls. Delete prompts for
 * confirmation, displays any server-side error, disables while in progress,
 * and reloads the page on success.
 *
 * @param poll - The poll to render (expects `id`, `question`, `options`, and `user_id`)
 * @returns A JSX element representing the poll card and owner actions
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

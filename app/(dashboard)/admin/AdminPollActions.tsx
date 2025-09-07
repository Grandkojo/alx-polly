"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deletePollAsAdmin } from "@/app/lib/actions/admin-actions";

interface Poll {
  id: string;
  question: string;
  user_id: string;
  created_at: string;
  options: string[];
}

interface AdminPollActionsProps {
  poll: Poll;
}

export default function AdminPollActions({ poll }: AdminPollActionsProps) {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this poll? This action cannot be undone.")) {
      return;
    }

    setDeleteLoading(true);
    const result = await deletePollAsAdmin(poll.id);

    if (!result.error) {
      // Refresh the page to show updated list
      window.location.reload();
    } else {
      alert(`Error deleting poll: ${result.error}`);
    }

    setDeleteLoading(false);
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{poll.question}</CardTitle>
            <CardDescription>
              <div className="space-y-1 mt-2">
                <div>
                  Poll ID:{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {poll.id}
                  </code>
                </div>
                <div>
                  Owner ID:{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {poll.user_id}
                  </code>
                </div>
                <div>
                  Created:{" "}
                  {new Date(poll.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardDescription>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h4 className="font-medium">Options:</h4>
          <ul className="list-disc list-inside space-y-1">
            {poll.options.map((option, index) => (
              <li key={index} className="text-gray-700">
                {option}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

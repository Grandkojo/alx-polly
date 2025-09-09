"use client";

import { Button } from "@/components/ui/button";
import { deletePoll } from "@/app/lib/actions/poll-actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function PollDeleteButton({ pollId }: { pollId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this poll?")) {
      startTransition(async () => {
        const { error } = await deletePoll(pollId);
        if (error) {
          toast.error(error);
        } else {
          toast.success("Poll deleted successfully.");
          router.push("/polls");
        }
      });
    }
  };

  return (
    <Button
      variant="outline"
      className="text-red-500 hover:text-red-700"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}

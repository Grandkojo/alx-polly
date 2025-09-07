import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllPolls, deletePollAsAdmin, checkAdminAccess } from "@/app/lib/actions/admin-actions";
import { redirect } from "next/navigation";
import AdminPollActions from "./AdminPollActions";

interface Poll {
  id: string;
  question: string;
  user_id: string;
  created_at: string;
  options: string[];
}

export default async function AdminPage() {
  // Check admin access server-side
  const adminCheck = await checkAdminAccess();
  
  if (!adminCheck.isAdmin) {
    redirect("/polls");
  }

  // Fetch polls server-side
  const { polls, error } = await getAllPolls();

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-600 mt-2">
          View and manage all polls in the system.
        </p>
      </div>

      <div className="grid gap-4">
        {polls.map((poll) => (
          <AdminPollActions key={poll.id} poll={poll} />
        ))}
      </div>

      {polls.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No polls found in the system.
        </div>
      )}
    </div>
  );
}

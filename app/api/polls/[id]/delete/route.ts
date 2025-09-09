import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  // Verify user authentication for deletion authorization
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 401 });
  }
  
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to delete a poll." }, { status: 401 });
  }

  // Delete poll only if user is the owner (compound WHERE clause for security)
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ success: true });
}

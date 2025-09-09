import { createClient } from "@/lib/supabase/server";
import { validatePollId, validateOptionIndex } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id: pollId } = params;
  const { optionIndex } = await req.json();

  // Validate poll ID format to prevent injection attacks
  const pollIdValidation = validatePollId(pollId);
  if (!pollIdValidation.isValid) {
    return NextResponse.json({ error: pollIdValidation.error }, { status: 400 });
  }

  // Verify poll exists and retrieve options for validation
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("options")
    .eq("id", pollId)
    .single();

  if (pollError || !poll) {
    return NextResponse.json({ error: "Poll not found." }, { status: 404 });
  }

  // Validate option index is within poll's option range
  const optionIndexValidation = validateOptionIndex(optionIndex, poll.options.length);
  if (!optionIndexValidation.isValid) {
    return NextResponse.json({ error: optionIndexValidation.error }, { status: 400 });
  }

  // Get current user for duplicate vote prevention
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check for existing vote if user is authenticated
  if (user) {
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .single();

    if (existingVote) {
      return NextResponse.json({ error: "You have already voted on this poll." }, { status: 409 });
    }
  }

  // Insert vote record with user association (null for anonymous votes)
  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null,
      option_index: optionIndex,
    },
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

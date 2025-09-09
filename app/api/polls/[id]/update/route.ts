import { createClient } from "@/lib/supabase/server";
import { validatePollQuestion, validatePollOptions, validatePollId } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id: pollId } = params;
  const { question, options } = await req.json();

  // Validate poll ID format to prevent injection attacks
  const pollIdValidation = validatePollId(pollId);
  if (!pollIdValidation.isValid) {
    return NextResponse.json({ error: pollIdValidation.error }, { status: 400 });
  }

  // Validate question content and length
  const questionValidation = validatePollQuestion(question);
  if (!questionValidation.isValid) {
    return NextResponse.json({ error: questionValidation.error }, { status: 400 });
  }

  // Validate options array and content
  const optionsValidation = validatePollOptions(options);
  if (!optionsValidation.isValid) {
    return NextResponse.json({ error: optionsValidation.error }, { status: 400 });
  }

  // Verify user authentication for update authorization
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 401 });
  }
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to update a poll." }, { status: 401 });
  }

  // Update poll only if user is the owner (compound WHERE clause for security)
  const { data, error } = await supabase
    .from("polls")
    .update({ 
      question: questionValidation.isValid ? question : "",
      options: optionsValidation.sanitizedOptions || []
    })
    .eq("id", pollId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

import { createClient } from "@/lib/supabase/server";
import { validatePollQuestion, validatePollOptions } from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { question, options } = await req.json();

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

  // Verify user authentication for poll creation
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 401 });
  }
  if (!user) {
    return NextResponse.json({ error: "You must be logged in to create a poll." }, { status: 401 });
  }

  // Insert validated poll data into database
  const { data, error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question: questionValidation.isValid ? question : "",
      options: optionsValidation.sanitizedOptions || [],
    },
  ]).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ poll: null, error: error.message }, { status: 404 });
  return NextResponse.json({ poll: data, error: null });
}

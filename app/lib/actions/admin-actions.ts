"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Define admin users (in production, this should be stored in database)
const ADMIN_EMAILS = [
  "admin@example.com", // Replace with actual admin email
  // Add more admin emails as needed
];

async function isAdmin(): Promise<{ isAdmin: boolean; error?: string }> {
  const supabase = await createClient();
  
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  
  if (userError) {
    return { isAdmin: false, error: userError.message };
  }
  
  if (!user || !user.email) {
    return { isAdmin: false, error: "Not authenticated" };
  }
  
  // Check if user email is in admin list
  const isAdminUser = ADMIN_EMAILS.includes(user.email);
  
  return { isAdmin: isAdminUser };
}

export async function getAllPolls() {
  const adminCheck = await isAdmin();
  
  if (!adminCheck.isAdmin) {
    return { polls: [], error: "Access denied. Admin privileges required." };
  }
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    return { polls: [], error: error.message };
  }
  
  return { polls: data ?? [], error: null };
}

export async function deletePollAsAdmin(pollId: string) {
  const adminCheck = await isAdmin();
  
  if (!adminCheck.isAdmin) {
    return { error: "Access denied. Admin privileges required." };
  }
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", pollId);
    
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/admin");
  return { error: null };
}

export async function checkAdminAccess() {
  return await isAdmin();
}

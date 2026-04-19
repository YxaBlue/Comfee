import { supabase } from "@/app/shared/lib/supabaseClient";

export async function validateUsername(username: string): Promise<string> {
  if (!username.trim()) return "Username is required.";

  const { data, error } = await supabase
    .from("profile")
    .select("id")
    .eq("username", username.trim());

  if (error) return "Error checking username.";
  if (data && data.length > 0) return "Username already taken.";

  return "";
}

import { supabase } from "./supabase-client";

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return data;
}

import { calculateAge } from "@/app/shared/utils/dateUtils";
import { supabase } from "../../../shared/lib/supabaseClient";
import { validateEditProfile } from "../utils/profileValidation";

type updatedData = {
  userId: string;
  username: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  bio: string;
};

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return data;
}

export async function editProfile(data: updatedData, currentUsername: string) {
  const errors = await validateEditProfile(
    {
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      birth_date: data.birth_date,
      bio: data.bio,
    },
    currentUsername,
  );

  if (Object.keys(errors).length > 0) {
    const err = new Error("Validation failed") as any;
    err.validationErrors = errors;
    throw err;
  }

  const age = calculateAge(data.birth_date);

  const { error } = await supabase
    .from("profile")
    .update({
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      birth_date: data.birth_date,
      age,
      bio: data.bio,
    })
    .eq("id", data.userId);

  if (error) throw error;
}

export async function uploadAvatar(userId: string, uri: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const ext =
    uri.startsWith("blob:") || !uri.includes(".")
      ? "jpg"
      : (uri.split(".").pop()?.split("?")[0] ?? "jpg");

  const path = `${userId}/avatar.${ext}`;

  // Delete all existing avatars first
  const { data: existingFiles } = await supabase.storage
    .from("avatars")
    .list(userId);

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map((f) => `${userId}/${f.name}`);
    await supabase.storage.from("avatars").remove(filesToDelete);
  }

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, blob, { upsert: true, contentType: `image/${ext}` });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);

  // Bust the CDN cache with a timestamp
  const bustUrl = `${data.publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profile")
    .update({ profile_picture: bustUrl })
    .eq("id", userId);

  if (updateError) throw updateError;

  return bustUrl;
}

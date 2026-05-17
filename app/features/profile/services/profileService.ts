import { calculateAge } from "@/app/shared/utils/dateUtils";
import { supabase } from "../../../shared/lib/supabaseClient";
import { validateEditProfile } from "../utils/profileValidation";

// Re-export review-related types and functions from the canonical source
export {
  deleteReview,
  editReview,
  getReviewsByUser,
  toggleUpvote
} from "@/app/shared/modals/reviewService";
export type { ProfileReview as Review } from "@/app/shared/modals/reviewService";

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

// ── Shared helpers ─────────────────────────────────────────────
function getExt(uri: string): string {
  return uri.startsWith("blob:") || !uri.includes(".")
    ? "jpg"
    : (uri.split(".").pop()?.split("?")[0] ?? "jpg");
}

async function deleteFile(bucket: string, path: string) {
  await supabase.storage.from(bucket).remove([path]);
}

async function uploadToStorage(
  bucket: string,
  path: string,
  uri: string,
  ext: string,
): Promise<string> {
  // fetch the local file and convert to blob
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, blob, {
      upsert: true,
      contentType: `image/${ext}`,
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

// ── Avatar ─────────────────────────────────────────────────────
export async function uploadAvatar(
  userId: string,
  uri: string,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const ext = getExt(uri);
  const path = `avatars/${userId}.${ext}`;

  await deleteFile("profile", path);

  const bustUrl = await uploadToStorage("profile", path, uri, ext);

  const { error: updateError } = await supabase
    .from("profile")
    .update({ profile_picture: bustUrl })
    .eq("id", userId);

  if (updateError) throw updateError;

  return bustUrl;
}

export async function uploadCoverPhoto(
  userId: string,
  uri: string,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const ext = getExt(uri);
  const path = `cover_photos/${userId}.${ext}`;

  await deleteFile("profile", path);

  const bustUrl = await uploadToStorage("profile", path, uri, ext);

  const { error: updateError } = await supabase
    .from("profile")
    .update({ cover_photo: bustUrl })
    .eq("id", userId);

  if (updateError) throw updateError;

  return bustUrl;
}

import { calculateAge, formatDate } from "@/app/shared/utils/dateUtils";
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

export type Review = {
  id: string;
  cafeName: string;
  cafeAvatar: string | null;
  rating: number;
  comment: string;
  date: string;
  likes: number;
  isLiked: boolean;
  imageUrls: string[];
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
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { upsert: true, contentType: `image/${ext}` });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  // Bust CDN cache with timestamp
  return `${data.publicUrl}?t=${Date.now()}`;
}

// ── Avatar ─────────────────────────────────────────────────────
export async function uploadAvatar(
  userId: string,
  uri: string,
): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

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

// ── Cover photo ────────────────────────────────────────────────
export async function uploadCoverPhoto(
  userId: string,
  uri: string,
): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

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

export async function getReviewsByUser(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("review")
    .select(
      `
      id,
      rating,
      comment,
      images_url,
      created_at,
      updated_at,
      cafe:cafe_id ( name, avatar_url )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const reviewIds = (data ?? []).map((r) => String(r.id));

  // Fetch all upvotes for these reviews in one query
  const { data: upvoteData } = await supabase
    .from("review_upvotes")
    .select("review_id, user_id")
    .in("review_id", reviewIds.length > 0 ? reviewIds : [""]);

  const upvotes = upvoteData ?? [];

  // Count likes per review
  const likesCountMap: Record<string, number> = {};
  const likedByUserSet = new Set<string>();

  for (const upvote of upvotes) {
    const rid = String(upvote.review_id);
    likesCountMap[rid] = (likesCountMap[rid] ?? 0) + 1;
    if (upvote.user_id === userId) {
      likedByUserSet.add(rid);
    }
  }

  return (data ?? []).map((r) => {
    const cafe = Array.isArray(r.cafe) ? r.cafe[0] : r.cafe;
    const isEdited = r.updated_at !== null;
    const displayDate = isEdited ? r.updated_at : r.created_at;
    const rid = String(r.id);

    return {
      id: rid,
      cafeName: cafe?.name ?? "Unknown Cafe",
      cafeAvatar: cafe?.avatar_url ?? null,
      rating: r.rating,
      comment: r.comment ?? "",
      date: `${formatDate(displayDate)}${isEdited ? " (edited)" : ""}`,
      likes: likesCountMap[rid] ?? 0,
      isLiked: likedByUserSet.has(rid),
      imageUrls: Array.isArray(r.images_url) ? r.images_url : [],
    };
  });
}

export async function toggleUpvote(
  reviewId: string,
  userId: string,
): Promise<void> {
  // Check if the user has already upvoted
  const { data: existing, error: fetchError } = await supabase
    .from("review_upvotes")
    .select("id")
    .eq("review_id", reviewId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    // Already liked → remove upvote
    const { error } = await supabase
      .from("review_upvotes")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    // Not liked → insert upvote
    const { error } = await supabase
      .from("review_upvotes")
      .insert({ review_id: reviewId, user_id: userId });
    if (error) throw error;
  }
}
// Delete a review
export const deleteReview = async (reviewId: string) => {
  // First get the review to get image URLs
  const { data: review, error: fetchError } = await supabase
    .from("review")
    .select("images_url")
    .eq("id", reviewId)
    .single();

  if (fetchError) throw fetchError;

  // Delete images from storage if they exist
  if (review?.images_url && Array.isArray(review.images_url)) {
    const deletePromises = review.images_url.map(async (url: string) => {
      // Extract path from URL (e.g., "reviews/filename.jpg" from full URL)
      const urlParts = url.split("/");
      const filename = urlParts[urlParts.length - 1]?.split("?")[0];
      if (filename) {
        const path = `reviews/${filename}`;
        await deleteFile("posts", path);
      }
    });
    await Promise.all(deletePromises);
  }

  // Delete the review record
  const { error } = await supabase.from("review").delete().eq("id", reviewId);
  if (error) throw error;
};

// Update a review
export const editReview = async (
  reviewId: string,
  updates: { rating: number; comment: string; images_url: string[] },
) => {
  const { error } = await supabase
    .from("review")
    .update({
      rating: updates.rating,
      comment: updates.comment,
      images_url: updates.images_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId);
  if (error) throw error;
};

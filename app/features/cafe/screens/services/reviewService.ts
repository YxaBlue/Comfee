import { supabase } from "@/app/shared/lib/supabaseClient";

export type Review = {
  id: number;
  cafe_id: number;
  user_id: string;
  rating: number;
  comment: string | null;
  images_url: string[] | null;
  upvotes: number;
  created_at: string;
  updated_at: string;

  profile?: {
    username: string;
    profile_picture: string | null;
  };
  cafe?: {
    name: string;
  };
};

export async function getReviewsByCafe(cafeId: number): Promise<Review[]> {
  const { data, error } = await supabase
    .from("review")
    .select(
      `
        *,
        profile:user_id (
        username,
        profile_picture
        )
    `,
    )
    .eq("cafe_id", cafeId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getReviewsByUser(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("review")
    .select(
      `
      *,
      cafe:cafe_id (
        name
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// have to store the images in the buckets
export async function createReview(payload: {
  cafe_id: number;
  rating: number;
  comment: string;
  images_url?: string[];
}): Promise<Review> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("review")
    .insert({
      cafe_id: payload.cafe_id,
      user_id: session.user.id,
      rating: payload.rating,
      comment: payload.comment,
      images_url: payload.images_url ?? [],
      upvotes: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function editReview(payload: {
  reviewId: number;
  rating: number;
  comment: string;
  images_url?: string[];
}): Promise<Review> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("review")
    .update({
      rating: payload.rating,
      comment: payload.comment,
      images_url: payload.images_url ?? [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.reviewId)
    .eq("user_id", session.user.id) // ← safety: only own reviews
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Delete own review ─────────────────────────────────────────
export async function deleteReview(reviewId: number): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("review")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", session.user.id); // ← safety: only own reviews

  if (error) throw error;
}

// ── Upvote a review ───────────────────────────────────────────
export async function upvoteReview(reviewId: number): Promise<void> {
  const { error } = await supabase.rpc("increment_upvotes", {
    review_id: reviewId,
  });

  if (error) throw error;
}

// reviewService.ts  ── add below your existing imports

/**
 * Upload one review image to the `cafes` bucket under `reviews/<cafeId>/`
 * Returns the public URL.
 */
export async function uploadReviewImage(
  reviewId: number,
  localUri: string,
): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const response = await fetch(localUri);
  const blob = await response.blob();

  const ext = localUri.split(".").pop()?.split("?")[0] ?? "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `reviews/${reviewId}/${fileName}`; // ← posts/reviews/<reviewId>/

  const { error } = await supabase.storage
    .from("posts") // ← correct bucket
    .upload(path, blob, {
      contentType: blob.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("posts").getPublicUrl(path);
  return data.publicUrl;
}

import { supabase } from "@/app/shared/lib/supabaseClient";
import { formatDate } from "@/app/shared/utils/dateUtils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Review = {
  id: number;
  cafe_id: number;
  user_id: string;
  rating: number;
  comment: string | null;
  images_url: string[] | null;
  created_at: string;
  updated_at: string | null;
  profile?: {
    username: string;
    profile_picture: string | null;
  };
  cafe?: {
    name: string;
  };
};

export type ReviewWithMeta = {
  id: number;
  cafe_id: number;
  user_id: string;
  rating: number;
  comment: string | null;
  images_url: string[] | null;
  created_at: string;
  updated_at: string | null;
  likes: number;
  isLiked: boolean;
  profile: {
    username: string;
    profile_picture: string | null;
  } | null;
};

// Profile screen uses this shape
export type ProfileReview = {
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

// ─── Shared storage helper ────────────────────────────────────────────────────

async function deleteFile(bucket: string, path: string) {
  await supabase.storage.from(bucket).remove([path]);
}

// ─── Fetch reviews for a cafe (with upvote counts + liked status) ─────────────

export async function getReviewsByCafe(
  cafeId: number,
  currentUserId: string,
): Promise<ReviewWithMeta[]> {
  // Step 1: Fetch reviews (no join)
  const { data: reviews, error } = await supabase
    .from("review")
    .select(
      `
      id,
      cafe_id,
      user_id,
      rating,
      comment,
      images_url,
      created_at,
      updated_at
      `,
    )
    .eq("cafe_id", cafeId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!reviews || reviews.length === 0) return [];

  // Step 2: Fetch profiles for all unique user_ids
  const userIds = [...new Set(reviews.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("profile")
    .select("id, username, profile_picture")
    .in("id", userIds);

  const profileMap: Record<
    string,
    { username: string; profile_picture: string | null }
  > = {};
  for (const p of profiles ?? []) {
    profileMap[p.id] = {
      username: p.username,
      profile_picture: p.profile_picture,
    };
  }

  // Step 3: Fetch upvotes
  const reviewIds = reviews.map((r) => r.id);
  const { data: upvoteData } = await supabase
    .from("review_upvotes")
    .select("review_id, user_id")
    .in("review_id", reviewIds);

  const upvotes = upvoteData ?? [];
  const likesCountMap: Record<number, number> = {};
  const likedByUserSet = new Set<number>();

  for (const upvote of upvotes) {
    const rid = upvote.review_id as number;
    likesCountMap[rid] = (likesCountMap[rid] ?? 0) + 1;
    if (upvote.user_id === currentUserId) {
      likedByUserSet.add(rid);
    }
  }

  return reviews.map((r) => ({
    id: r.id,
    cafe_id: r.cafe_id,
    user_id: r.user_id,
    rating: r.rating,
    comment: r.comment,
    images_url: r.images_url,
    created_at: r.created_at,
    updated_at: r.updated_at,
    likes: likesCountMap[r.id] ?? 0,
    isLiked: likedByUserSet.has(r.id),
    profile: profileMap[r.user_id] ?? null,
  }));
}

// ─── Fetch reviews by user (profile screen) ───────────────────────────────────

export async function getReviewsByUser(
  userId: string,
): Promise<ProfileReview[]> {
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

  const reviewIds = (data ?? []).map((r) => r.id);

  const { data: upvoteData } = await supabase
    .from("review_upvotes")
    .select("review_id, user_id")
    .in("review_id", reviewIds.length > 0 ? reviewIds : [-1]);

  const upvotes = upvoteData ?? [];
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

// ─── Toggle upvote (profile screen) ──────────────────────────────────────────

export async function toggleUpvote(
  reviewId: string,
  userId: string,
): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from("review_upvotes")
    .select("id")
    .eq("review_id", reviewId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    const { error } = await supabase
      .from("review_upvotes")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("review_upvotes")
      .insert({ review_id: reviewId, user_id: userId });
    if (error) throw error;
  }
}

// ─── Toggle upvote (cafe profile screen) ─────────────────────────────────────

export async function toggleCafeReviewUpvote(
  reviewId: number,
  userId: string,
): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from("review_upvotes")
    .select("id")
    .eq("review_id", reviewId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    const { error } = await supabase
      .from("review_upvotes")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("review_upvotes")
      .insert({ review_id: reviewId, user_id: userId });
    if (error) throw error;
  }
}

// ─── Create a review ──────────────────────────────────────────────────────────

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
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Delete a review ──────────────────────────────────────────────────────────

export async function deleteReview(reviewId: string): Promise<void> {
  const { data: review, error: fetchError } = await supabase
    .from("review")
    .select("images_url")
    .eq("id", reviewId)
    .single();

  if (fetchError) throw fetchError;

  if (review?.images_url && Array.isArray(review.images_url)) {
    await Promise.all(
      review.images_url.map(async (url: string) => {
        const filename = url.split("/").pop()?.split("?")[0];
        if (filename) {
          await deleteFile("posts", `reviews/${filename}`);
        }
      }),
    );
  }

  const { error } = await supabase.from("review").delete().eq("id", reviewId);
  if (error) throw error;
}

// ─── Edit a review ────────────────────────────────────────────────────────────

export async function editReview(
  reviewId: string,
  updates: { rating: number; comment: string; images_url: string[] },
): Promise<void> {
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
}

// ─── Upload a review image to storage ────────────────────────────────────────

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
  const path = `reviews/${reviewId}/${fileName}`;

  const { error } = await supabase.storage.from("posts").upload(path, blob, {
    contentType: blob.type || "image/jpeg",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("posts").getPublicUrl(path);
  return data.publicUrl;
}

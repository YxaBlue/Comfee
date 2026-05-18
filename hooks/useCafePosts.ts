// hooks/useCafePosts.ts
import { supabase } from "@/app/shared/lib/supabaseClient";
import { useCallback, useEffect, useState } from "react";

export type CafePost = {
  id: number;
  cafe_id: number;
  caption: string;
  photo_url: string[] | null;
  likes: number;
  created_at: string;
};

async function uploadLocalPostPhoto(
  cafeId: number,
  localUri: string,
  index: number,
): Promise<{ url: string } | { error: string }> {
  let blob: Blob;
  try {
    const response = await fetch(localUri);
    if (!response.ok) {
      return {
        error: `Could not read selected photo ${index + 1}: ${response.status} ${response.statusText}`,
      };
    }
    blob = await response.blob();
  } catch (err: any) {
    return {
      error: `Could not read selected photo ${index + 1}: ${
        err?.message ?? "Unknown local file error"
      }`,
    };
  }

  const contentType = blob.type || "image/jpeg";
  const filePath = `posts/post_${cafeId}_${Date.now()}_${index}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("cafes")
    .upload(filePath, blob, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    return {
      error: `Photo ${index + 1} upload failed in Supabase Storage bucket "cafes" at "${filePath}": ${uploadError.message}`,
    };
  }

  const { data: urlData } = supabase.storage.from("cafes").getPublicUrl(filePath);

  if (!urlData.publicUrl) {
    return {
      error: `Photo ${index + 1} uploaded, but Supabase did not return a public URL.`,
    };
  }

  return { url: urlData.publicUrl };
}

async function resolvePhotoUrls(
  cafeId: number,
  imageUris: string[],
): Promise<{ urls: string[] } | { error: string }> {
  const photoUrls: string[] = [];

  for (const [index, uri] of imageUris.entries()) {
    if (uri.startsWith("http")) {
      photoUrls.push(uri);
      continue;
    }

    const uploaded = await uploadLocalPostPhoto(cafeId, uri, index);
    if ("error" in uploaded) {
      return { error: uploaded.error };
    }
    photoUrls.push(uploaded.url);
  }

  return { urls: photoUrls };
}

export function useCafePosts(cafeId: number) {
  const [posts, setPosts] = useState<CafePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    try {
      if (!silent) setLoading(true);
      const { data, error } = await supabase
        .from("cafe_posts")
        .select("*")
        .eq("cafe_id", cafeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [cafeId]);

  useEffect(() => {
    if (cafeId) fetchPosts();
  }, [cafeId, fetchPosts]);

  const addPost = async (
    caption: string,
    localUris: string[] = [],
  ): Promise<{ error: string | null }> => {
    try {
      const trimmedCaption = caption.trim();
      const resolved = await resolvePhotoUrls(cafeId, localUris);
      if ("error" in resolved) {
        return { error: resolved.error };
      }

      const { error } = await supabase.from("cafe_posts").insert({
        cafe_id: cafeId,
        caption: trimmedCaption,
        photo_url: resolved.urls,
        created_at: new Date().toISOString(),
      });

      if (error) {
        return {
          error: `Post insert failed in cafe_posts: ${error.message}`,
        };
      }

      await fetchPosts();
      return { error: null };
    } catch (err: any) {
      return {
        error: `Unexpected post creation error: ${
          err?.message ?? "Unknown error"
        }`,
      };
    }
  };

  const updatePost = async (
    postId: number,
    caption: string,
    imageUris: string[],
  ): Promise<{ error: string | null }> => {
    try {
      const trimmedCaption = caption.trim();
      const resolved = await resolvePhotoUrls(cafeId, imageUris);
      if ("error" in resolved) {
        return { error: resolved.error };
      }

      const { error } = await supabase
        .from("cafe_posts")
        .update({
          caption: trimmedCaption,
          photo_url: resolved.urls,
        })
        .eq("id", postId);

      if (error) {
        return {
          error: `Post update failed in cafe_posts: ${error.message}`,
        };
      }

      await fetchPosts();
      return { error: null };
    } catch (err: any) {
      return {
        error: `Unexpected post update error: ${
          err?.message ?? "Unknown error"
        }`,
      };
    }
  };

  const likePost = async (postId: number, currentLikes: number) => {
    const { error } = await supabase
      .from("cafe_posts")
      .update({ likes: currentLikes + 1 })
      .eq("id", postId);

    if (!error) {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p)),
      );
    }
  };

  const deletePost = useCallback(
    async (postId: number): Promise<{ error: string | null }> => {
      const id = Number(postId);
      if (!Number.isFinite(id)) {
        const message = `Invalid post id: ${postId}`;
        console.error("[useCafePosts] deletePost:", message);
        return { error: message };
      }

      if (!cafeId) {
        const message = "Cannot delete post: café id is missing.";
        console.error("[useCafePosts] deletePost:", message);
        return { error: message };
      }

      console.log("[useCafePosts] deletePost called", {
        postId,
        normalizedId: id,
        cafeId,
      });

      try {
        console.log(
          "[useCafePosts] deletePost calling supabase.from('cafe_posts').delete()...",
        );

        const { data, error } = await supabase
          .from("cafe_posts")
          .delete()
          .eq("id", id)
          .eq("cafe_id", cafeId)
          .select("id");

        console.log("[useCafePosts] deletePost Supabase response", {
          data,
          error,
        });

        if (error) {
          console.error("[useCafePosts] deletePost Supabase error:", error);
          return { error: error.message };
        }

        if (!data || data.length === 0) {
          const message =
            "Post was not deleted. No rows were removed — check RLS delete policy on cafe_posts for your user.";
          console.warn("[useCafePosts] deletePost:", message, { id, cafeId });
          return { error: message };
        }

        console.log("[useCafePosts] deletePost succeeded", { deleted: data });

        setPosts((prev) => prev.filter((p) => Number(p.id) !== id));
        return { error: null };
      } catch (err: any) {
        console.error("[useCafePosts] deletePost unexpected error:", err);
        return { error: err?.message ?? "Failed to delete post" };
      }
    },
    [cafeId],
  );

  return {
    posts,
    loading,
    error,
    addPost,
    updatePost,
    likePost,
    deletePost,
    refetch: fetchPosts,
  };
}

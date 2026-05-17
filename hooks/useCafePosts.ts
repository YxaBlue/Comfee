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

export function useCafePosts(cafeId: number) {
  const [posts, setPosts] = useState<CafePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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
      const photoUrls: string[] = [];

      for (const [index, localUri] of localUris.entries()) {
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

        const { data: urlData } = supabase.storage
          .from("cafes")
          .getPublicUrl(filePath);

        if (!urlData.publicUrl) {
          return {
            error: `Photo ${index + 1} uploaded, but Supabase did not return a public URL.`,
          };
        }

        photoUrls.push(urlData.publicUrl);
      }

      const { error } = await supabase
        .from("cafe_posts")
        .insert({
          cafe_id: cafeId,
          caption: trimmedCaption,
          photo_url: photoUrls,
          created_at: new Date().toISOString(),
        });

      if (error) {
        return {
          error: `Post insert failed in cafe_posts: ${error.message}`,
        };
      }

      await fetchPosts(); // refresh list
      return { error: null };
    } catch (err: any) {
      return {
        error: `Unexpected post creation error: ${
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

  const deletePost = async (postId: number): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase
        .from("cafe_posts")
        .delete()
        .eq("id", postId);

      if (error) return { error: error.message };

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return {
    posts,
    loading,
    error,
    addPost,
    likePost,
    deletePost,
    refetch: fetchPosts,
  };
}

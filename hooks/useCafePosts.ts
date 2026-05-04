// hooks/useCafePosts.ts
import { supabase } from "@/app/shared/lib/supabaseClient";
import { useEffect, useState } from "react";

export type CafePost = {
  id: number;
  cafe_id: number;
  caption: string;
  photo_url: string | null;
  likes: number;
  created_at: string;
};

export function useCafePosts(cafeId: number) {
  const [posts, setPosts] = useState<CafePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cafeId) fetchPosts();
  }, [cafeId]);

  async function fetchPosts() {
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
  }

  const addPost = async (
    caption: string,
    localUri?: string,
  ): Promise<{ error: string | null }> => {
    try {
      let photo_url: string | null = null;

      // Upload image if provided
      if (localUri) {
        const response = await fetch(localUri);
        const arrayBuffer = await response.arrayBuffer();
        const fileName = `post_${cafeId}_${Date.now()}.jpg`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("cafes")
          .upload(filePath, arrayBuffer, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) return { error: uploadError.message };

        const { data: urlData } = supabase.storage
          .from("cafes")
          .getPublicUrl(filePath);

        photo_url = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("cafe_posts")
        .insert({ cafe_id: cafeId, caption, photo_url });

      if (error) return { error: error.message };

      await fetchPosts(); // refresh list
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
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

  return { posts, loading, error, addPost, likePost, refetch: fetchPosts };
}

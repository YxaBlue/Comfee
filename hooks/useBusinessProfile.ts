import { supabase } from "@/app/shared/lib/supabaseClient";
import { useEffect, useState } from "react";

export type BusinessProfile = {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  main_photo_url: string | null;
  city: string;
  info: string;
  featured: boolean;
  is_deleted: boolean;
  landline: string | null;
  branches: string | null;
};

export function useBusinessProfile() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("cafe")
        .select("*")
        .eq("id", 4)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ─── Update text fields ──────────────────────────────────────────────────
  const updateProfile = async (updates: Partial<BusinessProfile>) => {
    if (!profile?.id) return { error: "No profile loaded" };

    const allowedFields: (keyof BusinessProfile)[] = [
      "info",
      "address",
      "city",
      "phone",
      "landline",
      "email",
      "branches",
    ];

    const sanitized = Object.fromEntries(
      Object.entries(updates).filter(([key]) =>
        allowedFields.includes(key as keyof BusinessProfile),
      ),
    );

    const { error } = await supabase
      .from("cafe")
      .update(sanitized)
      .eq("id", profile.id)
      .select();

    if (!error) setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
    return { error: error?.message ?? null };
  };

  // ─── Upload avatar to Supabase Storage ──────────────────────────────────
  const updateAvatar = async (
    localUri: string,
  ): Promise<{ error: string | null }> => {
    if (!profile?.id) return { error: "No profile loaded" };

    try {
      const response = await fetch(localUri);
      const blob = await response.blob();

      const fileName = `avatar_${profile.id}_${Date.now()}.jpg`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("cafes")
        .upload(filePath, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) return { error: uploadError.message };

      const { data: urlData } = supabase.storage
        .from("cafes")
        .getPublicUrl(filePath);

      const avatar_url = urlData.publicUrl;

      const { error: dbError } = await supabase
        .from("cafe")
        .update({ avatar_url })
        .eq("id", profile.id);

      if (dbError) return { error: dbError.message };

      setProfile((prev) =>
        prev ? { ...prev, avatar_url: `${avatar_url}?t=${Date.now()}` } : prev,
      );
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };
  // ─── Upload cover photo to Supabase Storage ──────────────────────────────
  const updateCoverPhoto = async (
    localUri: string,
  ): Promise<{ error: string | null }> => {
    if (!profile?.id) return { error: "No profile loaded" };

    try {
      const response = await fetch(localUri);
      const blob = await response.blob();

      const fileName = `cover_${profile.id}_${Date.now()}.jpg`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("cafes")
        .upload(filePath, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) return { error: uploadError.message };

      const { data: urlData } = supabase.storage
        .from("cafes")
        .getPublicUrl(filePath);

      const main_photo_url = urlData.publicUrl;

      const { error: dbError } = await supabase
        .from("cafe")
        .update({ main_photo_url })
        .eq("id", profile.id);

      if (dbError) return { error: dbError.message };

      await fetchProfile(); // ← refetch to get real URL
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    updateAvatar,
    updateCoverPhoto,
  };
}

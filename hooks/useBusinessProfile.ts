import { supabase } from "@/app/shared/lib/supabaseClient";
import { useEffect, useState } from "react";

export type BusinessProfile = {
  id: number;
  name: string; // not cafe_name
  address: string; // not location
  email: string;
  phone: string;
  avatar_url: string | null;
  main_photo_url: string | null;
  city: string;
  info: string; // not intro
  featured: boolean;
  is_deleted: boolean;
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

  return { profile, loading, error, refetch: fetchProfile };
}

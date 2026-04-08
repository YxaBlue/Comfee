import { supabase } from "@/app/shared/lib/supabaseClient";

export type Cafe = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  avatar_url: string | null;
  main_photo_url: string | null;
};

const PAGE_SIZE = 10;
const KM_TO_DEGREE = 0.09;

export async function getFeaturedCafes(
  coords?: { latitude: number; longitude: number },
  maxDistanceKm: number = 10,
): Promise<Cafe[]> {
  let query = supabase
    .from("cafe")
    .select(
      "id, name, address, latitude, longitude, avatar_url, main_photo_url, featured",
    )
    .eq("featured", true);

  if (coords) {
    const delta = maxDistanceKm * KM_TO_DEGREE;
    query = query
      .gte("latitude", coords.latitude - delta)
      .lte("latitude", coords.latitude + delta)
      .gte("longitude", coords.longitude - delta)
      .lte("longitude", coords.longitude + delta);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getDiscoverCafes(
  coords?: { latitude: number; longitude: number },
  maxDistanceKm: number = 10,
): Promise<Cafe[]> {
  let query = supabase
    .from("cafe")
    .select(
      "id, name, address, latitude, longitude, avatar_url, main_photo_url, featured",
    )
    .eq("featured", false);

  if (coords) {
    const delta = maxDistanceKm * KM_TO_DEGREE;
    query = query
      .gte("latitude", coords.latitude - delta)
      .lte("latitude", coords.latitude + delta)
      .gte("longitude", coords.longitude - delta)
      .lte("longitude", coords.longitude + delta);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

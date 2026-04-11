import { supabase } from "@/app/shared/lib/supabaseClient";

export type Cafe = {
  id: number;
  name: string;
  address: string;
  city: string;
  main_photo_url: string | null;
  average_rating: number | null;
  featured: boolean;
};

export type CafeFeatures = {
  id: number;
  cafe_id: number;
  music: string;
  wifi_speed: string;
  sockets: string;
  parking: string;
  operating_24h: boolean;
  price_level: string;
  lighting: string;
  pet_friendly: boolean;
  coffee_brew_method: string[];
  seating: string[];
  tables_type: string[];
  suitable_for: string[];
  coffee_bean_type: string[];
};

export type CafeWithFeatures = Cafe & {
  features: CafeFeatures | null;
};

const PAGE_SIZE = 10;

export async function getCafesByCity(
  city: string,
  page: number = 0,
): Promise<Cafe[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("cafe")
    .select("id, name, address, city, main_photo_url, average_rating, featured")
    .eq("city", city)
    .neq("is_deleted", true)
    .range(from, to);

  if (error) throw error;
  return data ?? [];
}

export async function getCafesWithFeatures(): Promise<CafeWithFeatures[]> {
  const { data: cafes, error: cafeError } = await supabase
    .from("cafe")
    .select("id, name, address, city, main_photo_url, average_rating, featured")
    .neq("is_deleted", true);

  if (cafeError) throw cafeError;

  const cafeList = cafes ?? [];

  if (cafeList.length === 0) {
    return [];
  }

  const { data: features, error: featureError } = await supabase
    .from("cafe_amenities")
    .select(
      "id, cafe_id, music, wifi_speed, sockets, parking, operating_24h, price_level, lighting, pet_friendly, coffee_brew_method, seating, tables_type, suitable_for, coffee_bean_type",
    )
    .in(
      "cafe_id",
      cafeList.map((cafe) => cafe.id),
    );

  if (featureError) throw featureError;

  const featuresByCafeId = new Map<number, CafeFeatures>();

  for (const feature of features ?? []) {
    featuresByCafeId.set(feature.cafe_id, feature);
  }

  return cafeList.map((cafe) => ({
    ...cafe,
    features: featuresByCafeId.get(cafe.id) ?? null,
  }));
}

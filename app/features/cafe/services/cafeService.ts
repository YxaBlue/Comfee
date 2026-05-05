import { supabase } from "@/app/shared/lib/supabaseClient";
import * as Location from "expo-location";

export type Cafe = {
  id: number;
  name: string;
  address: string;
  city: string;
  main_photo_url: string | null;
  average_rating: number;
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

export type CafeDetail = {
  id: number;
  name: string;
  address: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  cover_photo_url: string | null;
  menu_urls: string[] | null;
  average_rating: number;
  review_count: number;
  favorites_count: number;
  opening_time: string | null;
  closing_time: string | null;
  opening_days: string[] | null;
  info: string | null;
  // ── Amenities ──
  wifi_speed: "None" | "Slow" | "Moderate" | "Fast" | null;
  sockets: "None" | "Some" | "Many" | null;
  parking: "None" | "Limited" | "Plenty" | null;
  lighting: "Dim" | "Balanced" | "Bright" | null;
  seating: string[];
  tables_type: string[];
  music: "Quiet" | "Normal" | "Blaring" | null;
  pet_friendly: boolean;
  suitable_for: string[];
  coffee_bean_type: string[];
  coffee_brew_method: string[];
  price_level: "P" | "PP" | "PPP" | null;
};

const PAGE_SIZE = 10;

// ─── Normalization helpers ────────────────────────────────────────────────────

/**
 * Maps raw DB strings (e.g. "cold-brew", "fast", "french_press")
 * to the display labels used in the UI pills.
 */
const DISPLAY_OVERRIDES: Record<string, string> = {
  // Coffee bean types
  "Liberica (Barako)": "Liberica (Barako)",
  "Liberica (barako)": "Liberica (Barako)",
  // Brew methods
  "French Press": "French Press",
  "Pour Over": "Pour Over",
  "Cold Brew": "Cold Brew",
  // Tables
  "Bar Type": "Bar type",
  "Individual Tables": "Individual Tables",
  "Large Tables (>6)": "Large tables (>6)",
  "Large Tables (> 6)": "Large tables (>6)",
};

function toDisplay(val: string | null | undefined): string | null {
  if (!val) return null;
  const normalized = val
    .replace(/_/g, " ")                          // snake_case → spaces
    .replace(/-/g, " ")                          // kebab-case → spaces
    .replace(/\b\w/g, (c) => c.toUpperCase());   // title Case
  return DISPLAY_OVERRIDES[normalized] ?? normalized;
}

function toDisplayArr(arr: string[] | null | undefined): string[] {
  return (arr ?? []).map((v) => toDisplay(v) ?? v);
}

// ─── Location ─────────────────────────────────────────────────────────────────

export async function getUserLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    return null;
  }
}

// ─── Cafe lists ───────────────────────────────────────────────────────────────

export async function getCafesByCity(
  city: string,
  page: number = 0,
): Promise<Cafe[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("cafe")
    .select(
      "id, name, address, city, main_photo_url, featured, review (rating)",
    )
    .eq("city", city)
    .neq("is_deleted", true)
    .range(from, to);

  if (error) throw error;
  return (data ?? []).map((cafe) => {
    const ratings = (cafe.review ?? []).map(
      (r: { rating: number }) => r.rating,
    );
    const average_rating =
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((a: number, b: number) => a + b, 0) /
              ratings.length) *
              10,
          ) / 10
        : 0;

    return {
      id: cafe.id,
      name: cafe.name,
      address: cafe.address,
      city: cafe.city,
      main_photo_url: cafe.main_photo_url,
      featured: cafe.featured,
      average_rating,
    };
  });
}

export async function getCafesWithFeatures(): Promise<CafeWithFeatures[]> {
  const { data: cafes, error: cafeError } = await supabase
    .from("cafe")
    .select(
      `
      id,
      name,
      address,
      city,
      avatar_url,
      featured,
      review ( rating )
    `,
    )
    .neq("is_deleted", true);

  if (cafeError) throw cafeError;

  const cafeList = cafes ?? [];
  if (cafeList.length === 0) return [];

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

  return cafeList.map((cafe) => {
    const ratings = (cafe.review ?? []).map(
      (r: { rating: number }) => r.rating,
    );
    const average_rating =
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((a: number, b: number) => a + b, 0) /
              ratings.length) *
              10,
          ) / 10
        : 0;

    return {
      id: cafe.id,
      name: cafe.name,
      address: cafe.address,
      city: cafe.city,
      main_photo_url: cafe.avatar_url,
      featured: cafe.featured,
      average_rating,
      features: featuresByCafeId.get(cafe.id) ?? null,
    };
  });
}

export async function getNearbyCafes(
  latitude: number,
  longitude: number,
  radiusMeters: number = 5000,
): Promise<Cafe[]> {
  const { data, error } = await supabase.rpc("get_cafes_near", {
    lat: latitude,
    lng: longitude,
    radius_meters: radiusMeters,
  });

  if (error) throw error;
  return data ?? [];
}

// ─── Cafe detail ──────────────────────────────────────────────────────────────

const WEEKDAY_MAP: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export async function getCafeById(cafeId: string): Promise<CafeDetail | null> {
  const [{ data, error }, { data: amenitiesData }] = await Promise.all([
    supabase
      .from("cafe")
      .select(
        `
        id, name, address, email, phone,
        review ( rating ), avatar_url, main_photo_url,
        cafe_hours (weekday, open_time, close_time),
        info
      `,
      )
      .eq("id", Number(cafeId))
      .single(),
    supabase
      .from("cafe_amenities")
      .select(
        "music, wifi_speed, sockets, parking, lighting, pet_friendly, price_level, coffee_brew_method, seating, tables_type, suitable_for, coffee_bean_type",
      )
      .eq("cafe_id", Number(cafeId))
      .maybeSingle(),
  ]);

  if (error) {
    console.log("Supabase error:", JSON.stringify(error));
    throw error;
  }
  if (!data) return null;

  // ── Ratings ──
  const ratings = (data.review ?? []).map((r: { rating: number }) => r.rating);
  const average_rating =
    ratings.length > 0
      ? Math.round(
          (ratings.reduce((a: number, b: number) => a + b, 0) /
            ratings.length) *
            10,
        ) / 10
      : 0;

  // ── Opening hours ──
  const hours: { weekday: number; open_time: string; close_time: string }[] =
    data.cafe_hours ?? [];
  const opening_days = hours.map((h) => WEEKDAY_MAP[h.weekday]).filter(Boolean);
  const opening_time = hours[0]?.open_time?.slice(0, 5) ?? null;
  const closing_time = hours[0]?.close_time?.slice(0, 5) ?? null;

  // ── Debug: remove once values are confirmed correct ──
  console.log("RAW amenitiesData:", JSON.stringify(amenitiesData, null, 2));

  return {
    id: data.id,
    name: data.name,
    address: data.address,
    email: data.email ?? null,
    phone: data.phone ?? null,
    avatar_url: data.avatar_url ?? null,
    cover_photo_url: data.main_photo_url ?? null,
    menu_urls: null,
    average_rating,
    review_count: ratings.length,
    favorites_count: 0,
    opening_time,
    closing_time,
    opening_days,
    info: data.info ?? null,

    wifi_speed: toDisplay(amenitiesData?.wifi_speed) as CafeDetail["wifi_speed"],
    sockets: toDisplay(amenitiesData?.sockets) as CafeDetail["sockets"],
    parking: toDisplay(amenitiesData?.parking) as CafeDetail["parking"],
    lighting: toDisplay(amenitiesData?.lighting) as CafeDetail["lighting"],
    seating: toDisplayArr(amenitiesData?.seating),
    tables_type: toDisplayArr(amenitiesData?.tables_type),
    music: toDisplay(amenitiesData?.music) as CafeDetail["music"],
    pet_friendly: amenitiesData?.pet_friendly ?? false,
    suitable_for: toDisplayArr(amenitiesData?.suitable_for),
    coffee_bean_type: toDisplayArr(amenitiesData?.coffee_bean_type),
    coffee_brew_method: toDisplayArr(amenitiesData?.coffee_brew_method),
    price_level: (amenitiesData?.price_level ?? null) as CafeDetail["price_level"],
  };
}
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
export const DASHBOARD_PAGE_SIZE = 4;

// ─── Normalization helpers ────────────────────────────────────────────────────
const DISPLAY_OVERRIDES: Record<string, string> = {
  // ── Bean Type ──
  Arabica: "Arabica",
  Robusta: "Robusta",
  Excelsa: "Excelsa",

  // Handles both old + new DB values
  Liberica: "Liberica",
  "Liberica (Barako)": "Liberica",

  // ── Brew Method ──
  Expresso: "Espresso",
  Espresso: "Espresso",

  "French Press": "French Press",
  "Pour Over": "Pour Over",
  "Cold Brew": "Cold Brew",
  Drip: "Drip",

  // ── Tables ──
  "Bar Type": "Bar Type",
  "Individual Tables": "Individual Tables",

  // Handles all possible DB variants
  "Large Tables": "Large Tables",
  "Large Tables (>6)": "Large Tables",
  "Large Tables (> 6)": "Large Tables",

  // ── Price ──
  "Low Price": "P",
  "Medium Price": "PP",
  "High Price": "PPP",

  "low_price": "P",
  "medium_price": "PP",
  "high_price": "PPP",
};


function toDisplay(val: string | null | undefined): string | null {
  if (!val) return null;

  const normalized = val
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

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
    .select("id, name, address, city, main_photo_url, featured, review (rating)")
    .eq("city", city)
    .neq("is_deleted", true)
    .range(from, to);

  if (error) throw error;
  return (data ?? []).map((cafe) => mapCafeWithRatings(cafe));
}

// ─── Dashboard sections (Featured / Discover) ────────────────────────────────

export async function getFeaturedCafes(
  city: string,
  page: number = 0,
): Promise<Cafe[]> {
  const from = page * DASHBOARD_PAGE_SIZE;
  const to = from + DASHBOARD_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("cafe")
    .select("id, name, address, city, main_photo_url, featured, review (rating)")
    .eq("city", city)
    .eq("featured", true)
    .neq("is_deleted", true)
    .range(from, to);

  if (error) throw error;
  return (data ?? []).map((cafe) => mapCafeWithRatings(cafe));
}

export async function getDiscoverCafes(
  city: string,
  page: number = 0,
): Promise<Cafe[]> {
  const from = page * DASHBOARD_PAGE_SIZE;
  const to = from + DASHBOARD_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("cafe")
    .select("id, name, address, city, main_photo_url, featured, review (rating)")
    .eq("city", city)
    .eq("featured", false)
    .neq("is_deleted", true)
    .range(from, to);

  if (error) throw error;
  return (data ?? []).map((cafe) => mapCafeWithRatings(cafe));
}

export async function getCafesWithFeatures(): Promise<CafeWithFeatures[]> {
  const { data: cafes, error: cafeError } = await supabase
    .from("cafe")
    .select("id, name, address, city, avatar_url, featured, review ( rating )")
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

  return cafeList.map((cafe) => ({
    ...mapCafeWithRatings({ ...cafe, main_photo_url: cafe.avatar_url }),
    features: featuresByCafeId.get(cafe.id) ?? null,
  }));
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
        id,
        name,
        address,
        email,
        phone,
        review ( rating ),
        avatar_url,
        main_photo_url,
        menu_urls,
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

  if (error) throw error;
  if (!data) return null;

  // ── Ratings ──
  const ratings = (data.review ?? []).map((r: { rating: number }) => r.rating);
  const average_rating = computeAverageRating(ratings);

  // ── Opening hours ──
  const hours: { weekday: number; open_time: string; close_time: string }[] =
    data.cafe_hours ?? [];
  const opening_days = hours.map((h) => WEEKDAY_MAP[h.weekday]).filter(Boolean);
  const opening_time = to12Hour(hours[0]?.open_time?.slice(0, 5)) ?? null;
  const closing_time = to12Hour(hours[0]?.close_time?.slice(0, 5)) ?? null;

  return {
    id: data.id,
    name: data.name,
    address: data.address,
    email: data.email ?? null,
    phone: data.phone ?? null,
    avatar_url: data.avatar_url ?? null,
    // main_photo_url is used as the cover/banner image on the profile screen
    cover_photo_url: data.main_photo_url ?? null,
    menu_urls: data.menu_urls ?? null,
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
    price_level: (toDisplay(amenitiesData?.price_level) ?? null) as CafeDetail["price_level"],
  };
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function computeAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

/**
 * Converts a "HH:MM" 24-hour string to "H:MM AM/PM" format.
 * Returns null if input is null/undefined.
 */
function to12Hour(time: string | null | undefined): string | null {
  if (!time) return null;
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m} ${period}`;
}

function mapCafeWithRatings(cafe: {
  id: number;
  name: string;
  address: string;
  city: string;
  main_photo_url: string | null;
  featured: boolean;
  review?: { rating: number }[];
}): Cafe {
  const ratings = (cafe.review ?? []).map((r) => r.rating);
  return {
    id: cafe.id,
    name: cafe.name,
    address: cafe.address,
    city: cafe.city,
    main_photo_url: cafe.main_photo_url,
    featured: cafe.featured,
    average_rating: computeAverageRating(ratings),
  };
}
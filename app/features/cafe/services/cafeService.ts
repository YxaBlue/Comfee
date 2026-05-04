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

const PAGE_SIZE = 10;

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

    // REVERSE GEOCODING CITY STILL DOES NOT WORK
    // const [geocode] = await Location.reverseGeocodeAsync({
    //   latitude: location.coords.latitude,
    //   longitude: location.coords.longitude,
    // });

    // // Map to your CEBU_CITIES list
    // const CEBU_CITIES = ["Cebu", "Mandaue", "Lapu-Lapu", "Talisay"];
    // const detectedCity = CEBU_CITIES.find(c =>
    //   geocode.city?.toLowerCase().includes(c.toLowerCase())
    // );

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    return null;
  }
}

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
        : 0; // ← was null

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
        : 0; // ← 0 if no reviews

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
};
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
  const { data, error } = await supabase
    .from("cafe")
    .select(
      `
      id, name, address, email, phone,
      review ( rating ), avatar_url, main_photo_url,
      cafe_hours (weekday, open_time, close_time) ,
      info
    `,
    )
    .eq("id", Number(cafeId))
    .single();

  if (error) {
    console.log("Supabase error:", JSON.stringify(error));
    throw error;
  }
  if (!data) return null;

  const ratings = (data.review ?? []).map((r: { rating: number }) => r.rating);
  const average_rating =
    ratings.length > 0
      ? Math.round(
          (ratings.reduce((a: number, b: number) => a + b, 0) /
            ratings.length) *
            10,
        ) / 10
      : 0;

  //opening hours
  const hours: { weekday: number; open_time: string; close_time: string }[] =
    data.cafe_hours ?? [];

  const opening_days = hours.map((h) => WEEKDAY_MAP[h.weekday]).filter(Boolean);

  const opening_time = hours[0]?.open_time?.slice(0, 5) ?? null; // "08:00"
  const closing_time = hours[0]?.close_time?.slice(0, 5) ?? null;

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
  };
}

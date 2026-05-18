import { supabase } from "@/app/shared/lib/supabaseClient";

export const EDIT_CAFE_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type EditCafeDayHours = {
  day: (typeof EDIT_CAFE_DAYS)[number];
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

const DAY_TO_WEEKDAY: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export const toSqlTime = (value: string): string | null => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  const [, hourText, minuteText, periodText] = match;
  let hour = Number(hourText);
  const period = periodText.toUpperCase();

  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour !== 12) hour += 12;

  return `${hour.toString().padStart(2, "0")}:${minuteText}:00`;
};

export const toDisplayTime = (value?: string | null): string => {
  if (!value) return "";
  const [hourText = "0", minuteText = "00"] = value.split(":");
  const hour24 = Number(hourText);
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minuteText.slice(0, 2)} ${period}`;
};

export function buildHoursFromCafe(
  openingHours: {
    day: string;
    opening_time: string | null;
    closing_time: string | null;
  }[],
): EditCafeDayHours[] {
  return EDIT_CAFE_DAYS.map((day) => {
    const entry = openingHours.find((h) => h.day === day);
    if (entry?.opening_time && entry?.closing_time) {
      return {
        day,
        isOpen: true,
        openTime: entry.opening_time,
        closeTime: entry.closing_time,
      };
    }
    return {
      day,
      isOpen: false,
      openTime: "9:00 AM",
      closeTime: "5:00 PM",
    };
  });
}

async function uploadCafeImage(
  bucketPath: string,
  localUri: string,
): Promise<string> {
  const response = await fetch(localUri);
  if (!response.ok) {
    throw new Error(`Could not read image: ${response.statusText}`);
  }
  const blob = await response.blob();
  const contentType = blob.type || "image/jpeg";

  const { error: uploadError } = await supabase.storage
    .from("cafes")
    .upload(bucketPath, blob, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from("cafes").getPublicUrl(bucketPath);
  if (!data.publicUrl) {
    throw new Error("Upload succeeded but no public URL was returned.");
  }
  return data.publicUrl;
}

async function replaceCafeHours(
  cafeId: number,
  hours: EditCafeDayHours[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("cafe_hours")
    .delete()
    .eq("cafe_id", cafeId);

  if (deleteError) {
    throw new Error(`Failed to clear hours: ${deleteError.message}`);
  }

  const rows = hours
    .filter((day) => day.isOpen)
    .map((day) => {
      const openTime = toSqlTime(day.openTime);
      const closeTime = toSqlTime(day.closeTime);
      if (!openTime || !closeTime) {
        throw new Error(
          `Invalid hours for ${day.day}. Use format like 9:00 AM.`,
        );
      }
      return {
        cafe_id: cafeId,
        weekday: DAY_TO_WEEKDAY[day.day],
        open_time: openTime,
        close_time: closeTime,
      };
    });

  if (rows.length === 0) return;

  const { error: insertError } = await supabase.from("cafe_hours").insert(rows);
  if (insertError) {
    throw new Error(`Failed to save hours: ${insertError.message}`);
  }
}

export type SaveCafeProfileInput = {
  cafeId: number;
  name: string;
  info: string;
  address: string;
  phone: string;
  email: string;
  coverUri: string;
  avatarUri: string;
  newCoverLocalUri: string | null;
  newAvatarLocalUri: string | null;
  hours: EditCafeDayHours[];
  // Local URIs for menu images to upload (new images picked by user)
  newMenuLocalUris?: string[];
  // Existing remote menu URLs to keep
  menuExistingUrls?: string[];
};

export async function saveCafeProfile(
  input: SaveCafeProfileInput,
): Promise<{ error: string | null }> {
  try {
    const id = input.cafeId;
    let main_photo_url: string | undefined;
    let avatar_url: string | undefined;
    let uploadedMenuUrls: string[] = [];

    if (input.newCoverLocalUri) {
      main_photo_url = await uploadCafeImage(
        `covers/${id}_${Date.now()}.jpg`,
        input.newCoverLocalUri,
      );
    }

    if (input.newAvatarLocalUri) {
      avatar_url = await uploadCafeImage(
        `avatars/${id}_${Date.now()}.jpg`,
        input.newAvatarLocalUri,
      );
    }

    // Upload any new menu images and collect their public URLs
    if (input.newMenuLocalUris && input.newMenuLocalUris.length > 0) {
      const uploads: string[] = [];
      for (let i = 0; i < input.newMenuLocalUris.length; i++) {
        const uri = input.newMenuLocalUris[i];
        try {
          const url = await uploadCafeImage(`menus/${id}_${Date.now()}_${i}.jpg`, uri);
          uploads.push(url);
        } catch (e) {
          // ignore individual upload failures here; surface later if needed
          console.warn("Failed to upload menu image", e);
        }
      }
      uploadedMenuUrls = uploads;
    }

    const cafePayload: Record<string, any> = {
      name: input.name.trim(),
      info: input.info.trim(),
      address: input.address.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
    };

    if (main_photo_url) cafePayload.main_photo_url = main_photo_url;
    if (avatar_url) cafePayload.avatar_url = avatar_url;
    // If there are menu images either existing remote URLs or newly uploaded ones,
    // save them in the cafe record as menu_urls (JSON/array column expected).
    const finalMenuUrls: string[] = [
      ...(input.menuExistingUrls ?? []),
      ...uploadedMenuUrls,
    ];
    if (finalMenuUrls.length > 0) cafePayload.menu_urls = finalMenuUrls;

    const [cafeResult] = await Promise.all([
      supabase.from("cafe").update(cafePayload).eq("id", id).select("id"),
      replaceCafeHours(id, input.hours),
    ]);

    if (cafeResult.error) {
      return { error: `Café update failed: ${cafeResult.error.message}` };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err?.message ?? "Failed to save café profile." };
  }
}


// ─── Amenities types ──────────────────────────────────────────────────────────

export type AmenitiesFormState = {
  wifi_speed: "None" | "Slow" | "Moderate" | "Fast" | null;
  sockets: "None" | "Some" | "Many" | null;
  parking: "None" | "Limited" | "Plenty" | null;
  lighting: "Dim" | "Balanced" | "Bright" | null;
  music: "Quiet" | "Normal" | "Blaring" | null;
  price_level: "P" | "PP" | "PPP" | null;
  pet_friendly: boolean;
  seating: string[];
  tables_type: string[];
  coffee_bean_type: string[];
  coffee_brew_method: string[];
  suitable_for: string[];
};

export function buildAmenitiesFromCafe(cafe: {
  wifi_speed: string | null;
  sockets: string | null;
  parking: string | null;
  lighting: string | null;
  music: string | null;
  price_level: string | null;
  pet_friendly: boolean;
  seating: string[];
  tables_type: string[];
  coffee_bean_type: string[];
  coffee_brew_method: string[];
  suitable_for: string[];
}): AmenitiesFormState {
  return {
    wifi_speed: (cafe.wifi_speed ?? null) as AmenitiesFormState["wifi_speed"],
    sockets: (cafe.sockets ?? null) as AmenitiesFormState["sockets"],
    parking: (cafe.parking ?? null) as AmenitiesFormState["parking"],
    lighting: (cafe.lighting ?? null) as AmenitiesFormState["lighting"],
    music: (cafe.music ?? null) as AmenitiesFormState["music"],
    price_level: (cafe.price_level ?? null) as AmenitiesFormState["price_level"],
    pet_friendly: cafe.pet_friendly ?? false,
    seating: cafe.seating ?? [],
    tables_type: cafe.tables_type ?? [],
    coffee_bean_type: cafe.coffee_bean_type ?? [],
    coffee_brew_method: cafe.coffee_brew_method ?? [],
    suitable_for: cafe.suitable_for ?? [],
  };
}

// ─── DB value maps (display → DB raw) ────────────────────────────────────────

// The DB stores lowercase/underscore values, cafeService normalises them to
// display strings on read. We reverse that here on write.
const SEATING_TO_DB: Record<string, string> = {
  Inside: "inside",
  Outside: "outside",
};
const TABLES_TO_DB: Record<string, string> = {
  "Bar Type": "Bar Type",
  "Individual Tables": "Individual Tables",
  "Large Tables": "Large Tables",
};
const BEAN_TO_DB: Record<string, string> = {
  Arabica: "Arabica",
  Robusta: "Robusta",
  Liberica: "Liberica",
  Excelsa: "Excelsa",
};
const BREW_TO_DB: Record<string, string> = {
  Espresso: "Espresso",
  Drip: "Drip",
  "French Press": "French Press",
  "Pour Over": "Pour Over",
  "Cold Brew": "Cold Brew",
};
const SUITABLE_TO_DB: Record<string, string> = {
  Student: "student",
  Work: "work",
  Group: "group",
  Vibes: "vibes",
};

function mapArr(arr: string[], map: Record<string, string>): string[] {
  return arr.map((v) => map[v] ?? v);
}

export async function saveAmenities(
  cafeId: number,
  amenities: AmenitiesFormState,
): Promise<{ error: string | null }> {
  try {
    const { supabase } = await import("@/app/shared/lib/supabaseClient");

    const payload = {
      cafe_id: cafeId,
      wifi_speed: amenities.wifi_speed?.toLowerCase() ?? null,
      sockets: amenities.sockets?.toLowerCase() ?? null,
      parking: amenities.parking?.toLowerCase() ?? null,
      lighting: amenities.lighting?.toLowerCase() ?? null,
      music: amenities.music?.toLowerCase() ?? null,
      price_level: amenities.price_level ?? null,
      pet_friendly: amenities.pet_friendly,
      seating: mapArr(amenities.seating, SEATING_TO_DB),
      tables_type: mapArr(amenities.tables_type, TABLES_TO_DB),
      coffee_bean_type: mapArr(amenities.coffee_bean_type, BEAN_TO_DB),
      coffee_brew_method: mapArr(amenities.coffee_brew_method, BREW_TO_DB),
      suitable_for: mapArr(amenities.suitable_for, SUITABLE_TO_DB),
    };

    const { error } = await supabase
      .from("cafe_amenities")
      .upsert(payload, { onConflict: "cafe_id" });

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err?.message ?? "Failed to save amenities." };
  }
}
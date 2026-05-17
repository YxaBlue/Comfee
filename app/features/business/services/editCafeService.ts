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
};

export async function saveCafeProfile(
  input: SaveCafeProfileInput,
): Promise<{ error: string | null }> {
  try {
    const id = input.cafeId;
    let main_photo_url: string | undefined;
    let avatar_url: string | undefined;

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

    const cafePayload: Record<string, string> = {
      name: input.name.trim(),
      info: input.info.trim(),
      address: input.address.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
    };

    if (main_photo_url) cafePayload.main_photo_url = main_photo_url;
    if (avatar_url) cafePayload.avatar_url = avatar_url;

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

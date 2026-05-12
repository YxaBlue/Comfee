import { supabase } from "@/app/shared/lib/supabaseClient";

const SUBMISSION_IMAGE_BUCKET = "cafe-submissions";
export const SUPABASE_PROJECT_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";

type SupabaseLikeError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  statusCode?: string;
};

const formatSupabaseError = (step: string, error: SupabaseLikeError) => {
  const parts = [
    `${step}: ${error.message ?? "Unknown Supabase error"}`,
    error.code ? `code=${error.code}` : "",
    error.details ? `details=${error.details}` : "",
    error.hint ? `hint=${error.hint}` : "",
    error.statusCode ? `status=${error.statusCode}` : "",
    SUPABASE_PROJECT_URL ? `url=${SUPABASE_PROJECT_URL}` : "",
  ].filter(Boolean);

  return parts.join(" | ");
};

export type ExistingCafeSearchResult = {
  id: number;
  name: string;
  address: string;
  avatar_url: string | null;
};

export type ExistingCafeSubmissionDefaults = {
  id: number;
  cafeName: string;
  description: string;
  email: string;
  phone: string;
  telephone: string;
  address: string;
  city: string;
  priceLevel: string;
  open247: boolean;
  hours: SubmissionDayHours[];
  amenities: Record<string, string[]>;
  beanTypes: string[];
  brewMethods: string[];
  petFriendly: boolean;
};

export const searchExistingCafes = async (
  query: string,
): Promise<ExistingCafeSearchResult[]> => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const { data, error } = await supabase
    .from("cafe")
    .select("id, name, address, avatar_url")
    .neq("is_deleted", true)
    .or(`name.ilike.%${normalizedQuery}%,address.ilike.%${normalizedQuery}%`)
    .order("name", { ascending: true })
    .limit(5);

  if (error) {
    throw new Error(error.message || "Unable to search cafes.");
  }

  return data ?? [];
};

export type SubmissionDayHours = {
  day: string;
  is24Hours: boolean;
  isClosed: boolean;
  start: string;
  end: string;
};

export type CafeSubmissionInput = {
  existingCafeId?: number | null;
  cafeName: string;
  description: string;
  email: string;
  phone: string;
  telephone: string;
  address: string;
  city: string;
  priceLevel: string;
  conditionTags: string;
  open247: boolean;
  hours: SubmissionDayHours[];
  amenities: Record<string, string[]>;
  beanTypes: string[];
  brewMethods: string[];
  petFriendly: boolean;
  profileImageUri?: string | null;
  coverImageUri?: string | null;
  menuImageUris: string[];
};

const DAY_INDEX: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_HOURS: SubmissionDayHours[] = DAY_NAMES.map((day) => ({
  day,
  is24Hours: false,
  isClosed: false,
  start: "8:00 AM",
  end: "8:00 PM",
}));

const getExt = (uri: string) => {
  const cleanUri = uri.split("?")[0] ?? uri;
  const ext = cleanUri.split(".").pop()?.toLowerCase();
  if (!ext || ext === cleanUri || ext.length > 5) return "jpg";
  return ext === "jpeg" ? "jpg" : ext;
};

const getContentType = (ext: string) => {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
};

const toSqlTime = (value: string) => {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  const [, hourText, minuteText, periodText] = match;
  let hour = Number(hourText);
  const period = periodText.toUpperCase();

  if (period === "AM" && hour === 12) hour = 0;
  if (period === "PM" && hour !== 12) hour += 12;

  return `${hour.toString().padStart(2, "0")}:${minuteText}:00`;
};

const toDisplayTime = (value?: string | null) => {
  if (!value) return "";
  const [hourText = "0", minuteText = "00"] = value.split(":");
  const hour24 = Number(hourText);
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minuteText} ${period}`;
};

export const getExistingCafeSubmissionDefaults = async (
  cafeId: number,
): Promise<ExistingCafeSubmissionDefaults> => {
  const { data: cafe, error: cafeError } = await supabase
    .from("cafe")
    .select("id, name, email, phone, landline, info, address, city")
    .eq("id", cafeId)
    .single();

  if (cafeError) {
    throw new Error(formatSupabaseError("Cafe details failed", cafeError));
  }

  const { data: amenity, error: amenityError } = await supabase
    .from("cafe_amenities")
    .select(
      "wifi_speed, sockets, parking, lighting, seating, tables_type, suitable_for, music, coffee_bean_type, coffee_brew_method, price_level, operating_24h, pet_friendly",
    )
    .eq("cafe_id", cafeId)
    .maybeSingle();

  if (amenityError) {
    throw new Error(formatSupabaseError("Cafe amenities failed", amenityError));
  }

  const { data: cafeHours, error: hoursError } = await supabase
    .from("cafe_hours")
    .select("weekday, open_time, close_time")
    .eq("cafe_id", cafeId)
    .order("weekday", { ascending: true });

  if (hoursError) {
    throw new Error(formatSupabaseError("Cafe hours failed", hoursError));
  }

  const hoursByDay = new Map(
    (cafeHours ?? []).map((item) => [Number(item.weekday), item]),
  );
  const open247 = Boolean(amenity?.operating_24h);
  const hours = DEFAULT_HOURS.map((item, index) => {
    const dayHours = hoursByDay.get(index + 1);
    if (open247) {
      return { ...item, is24Hours: true, start: "", end: "" };
    }
    if (!dayHours) {
      return { ...item, isClosed: true, start: "", end: "" };
    }
    return {
      ...item,
      start: toDisplayTime(dayHours.open_time) || item.start,
      end: toDisplayTime(dayHours.close_time) || item.end,
    };
  });

  return {
    id: cafe.id,
    cafeName: cafe.name ?? "",
    description: cafe.info ?? "",
    email: cafe.email ?? "",
    phone: cafe.phone ?? "",
    telephone: cafe.landline ?? "",
    address: cafe.address ?? "",
    city: cafe.city ?? "",
    priceLevel: amenity?.price_level ?? "PHP",
    open247,
    hours,
    amenities: {
      WiFi: amenity?.wifi_speed ? [amenity.wifi_speed] : [],
      Sockets: amenity?.sockets ? [amenity.sockets] : [],
      Parking: amenity?.parking ? [amenity.parking] : [],
      Lighting: amenity?.lighting ? [amenity.lighting] : [],
      Seating: amenity?.seating ?? [],
      Tables: amenity?.tables_type ?? [],
      "Suitable Conditions": Array.isArray(amenity?.suitable_for)
        ? amenity.suitable_for.slice(0, 1)
        : amenity?.suitable_for
          ? [amenity.suitable_for]
          : [],
      Music: amenity?.music ? [amenity.music] : [],
    },
    beanTypes: amenity?.coffee_bean_type ?? [],
    brewMethods: amenity?.coffee_brew_method ?? [],
    petFriendly: Boolean(amenity?.pet_friendly),
  };
};

const uploadSubmissionImage = async ({
  userId,
  submissionId,
  kind,
  uri,
  sortOrder = 0,
}: {
  userId: string;
  submissionId: string;
  kind: "avatar" | "cover" | "menu";
  uri: string;
  sortOrder?: number;
}) => {
  const ext = getExt(uri);
  const response = await fetch(uri);
  const blob = await response.blob();
  const path = `submissions/${userId}/${submissionId}/${kind}_${sortOrder}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(SUBMISSION_IMAGE_BUCKET)
    .upload(path, blob, {
      contentType: blob.type || getContentType(ext),
      upsert: false,
    });

  if (error) {
    throw new Error(
      formatSupabaseError(`Image upload failed (${kind})`, error),
    );
  }
  return path;
};

export const submitCafeSubmission = async (input: CafeSubmissionInput) => {
  // ── 1. Get current user ──────────────────────────────────────────────────
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(formatSupabaseError("Auth check failed", userError));
  }
  if (!user) throw new Error("Please sign in before submitting a cafe.");

  const userId = user.id;

  // ── 2. Rate limit check ──────────────────────────────────────────────────
  const { count, error: countError } = await supabase
    .from("cafe_submissions")
    .select("*", { count: "exact", head: true })
    .eq("submitted_by", userId)
    .gte(
      "created_at",
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    );

  if (countError) {
    throw new Error("Unable to verify submission limit.");
  }

  if (count && count >= 3) {
    throw new Error(
      "You have reached the maximum of 3 submissions per 24 hours. Please try again later.",
    );
  }

  // ── 3. Validate required fields ──────────────────────────────────────────
  // All fields are now optional

  // ── 4. Insert main submission row ────────────────────────────────────────
  const { data: submission, error: submissionError } = await supabase
    .from("cafe_submissions")
    .insert([
      {
        submitted_by: userId,
        existing_cafe_id: input.existingCafeId ?? null,
        cafe_name: input.cafeName.trim(),
        description: input.description.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        landline: input.telephone.trim(),
        address: input.address.trim(),
        city: input.city.trim(),
        price_level: input.priceLevel.trim(),
        condition_tags: input.conditionTags.trim(),
        open_247: input.open247,
      },
    ])
    .select("id")
    .single();

  if (submissionError) {
    throw new Error(
      formatSupabaseError("Submission row failed", submissionError),
    );
  }
  if (!submission?.id) throw new Error("Unable to create cafe submission.");

  const submissionId = submission.id as string;

  // ── 5. Insert hours ──────────────────────────────────────────────────────
  const submissionHours = input.hours.map((item) => {
    const is24Hours = input.open247 || item.is24Hours;
    const isClosed = !input.open247 && item.isClosed;

    return {
      submission_id: submissionId,
      day_of_week: DAY_INDEX[item.day],
      is_24_hours: is24Hours,
      is_closed: isClosed,
      start_time: is24Hours || isClosed ? null : toSqlTime(item.start),
      end_time: is24Hours || isClosed ? null : toSqlTime(item.end),
    };
  });

  const { error: hoursError } = await supabase
    .from("cafe_submission_hours")
    .insert(submissionHours);

  if (hoursError) {
    throw new Error(formatSupabaseError("Hours row failed", hoursError));
  }

  // ── 6. Insert amenities (optional) ──────────────────────────────────────
  const hasAmenityData =
    input.amenities.WiFi?.length ||
    input.amenities.Sockets?.length ||
    input.amenities.Parking?.length ||
    input.amenities.Lighting?.length ||
    input.amenities.Seating?.length ||
    input.amenities.Tables?.length ||
    input.amenities["Suitable Conditions"]?.length ||
    input.amenities.Music?.length ||
    input.beanTypes.length ||
    input.brewMethods.length ||
    input.petFriendly;

  if (hasAmenityData) {
    const { error: amenitiesError } = await supabase
      .from("cafe_submission_amenities")
      .insert([
        {
          submission_id: submissionId,
          wifi_speed: input.amenities.WiFi?.[0] ?? null,
          sockets: input.amenities.Sockets?.[0] ?? null,
          parking: input.amenities.Parking?.[0] ?? null,
          lighting: input.amenities.Lighting?.[0] ?? null,
          seating: input.amenities.Seating ?? [],
          tables_type: input.amenities.Tables ?? [],
          suitable_for: input.amenities["Suitable Conditions"]?.[0] ?? null,
          music: input.amenities.Music?.[0] ?? null,
          pet_friendly: input.petFriendly,
          coffee_bean_type: input.beanTypes,
          coffee_brew_method: input.brewMethods,
        },
      ]);

    if (amenitiesError) {
      throw new Error(
        formatSupabaseError("Amenities row failed", amenitiesError),
      );
    }
  }

  // ── 7. Upload and insert images ──────────────────────────────────────────
  const imageUploads = [
    ...(input.profileImageUri
      ? [
          uploadSubmissionImage({
            userId,
            submissionId,
            kind: "avatar" as const,
            uri: input.profileImageUri,
          }).then((storagePath) => ({
            submission_id: submissionId,
            kind: "avatar",
            storage_path: storagePath,
            sort_order: 0,
          })),
        ]
      : []),
    ...(input.coverImageUri
      ? [
          uploadSubmissionImage({
            userId,
            submissionId,
            kind: "cover" as const,
            uri: input.coverImageUri,
          }).then((storagePath) => ({
            submission_id: submissionId,
            kind: "cover",
            storage_path: storagePath,
            sort_order: 0,
          })),
        ]
      : []),
    ...input.menuImageUris.map((uri, index) =>
      uploadSubmissionImage({
        userId,
        submissionId,
        kind: "menu",
        uri,
        sortOrder: index,
      }).then((storagePath) => ({
        submission_id: submissionId,
        kind: "menu",
        storage_path: storagePath,
        sort_order: index,
      })),
    ),
  ];

  const uploadedImages = await Promise.all(imageUploads);

  if (uploadedImages.length > 0) {
    const { error: imagesError } = await supabase
      .from("cafe_submission_images")
      .insert(uploadedImages);

    if (imagesError) {
      throw new Error(
        formatSupabaseError("Image metadata row failed", imagesError),
      );
    }
  }

  return { id: submissionId };
};

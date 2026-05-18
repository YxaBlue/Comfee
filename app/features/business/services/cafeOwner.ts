import { supabase } from "@/app/shared/lib/supabaseClient";
import * as ImagePicker from "expo-image-picker";

const OWNER_VERIFICATION_BUCKET = "cafe-submissions";
const OWNER_VERIFICATION_FOLDER = "owner-verification";
const DAILY_SUBMISSION_LIMIT = 3;

export type CafeStatus = "verified" | "pending";

export interface OwnedCafe {
  id: number;
  cafeId: number;
  name: string;
  address: string;
  city: string;
  avatarUrl: string | null;
  status: CafeStatus;
}

export interface CafeSearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  avatar_url: string | null;
}

export interface VerificationFormData {
  cafe_id?: string;
  cafe_name?: string;
  is_new_cafe?: boolean;
  owner_name?: string;
  valid_id_image?: string;
  email?: string;
  phone?: string;
  telephone?: string;
  registration_certificate_image?: string;
  permit_image?: string;
  lease_or_title_image?: string;
  interior_images?: string[];
}

// ---------------------------------------------------------------------------
// Cafe fetching
// ---------------------------------------------------------------------------

export async function getOwnedCafes(userId: string): Promise<OwnedCafe[]> {
  const [verifiedResult, pendingResult] = await Promise.all([
    supabase
      .from("cafe_owners")
      .select("id, cafe_id, cafe(id, name, address, city, avatar_url)")
      .eq("user_id", userId),

    supabase
      .from("owner_submissions_cafe")
      .select("id, cafe_id, cafe(id, name, address, city, avatar_url)")
      .eq("user_id", userId)
      .eq("status", "pending"),
  ]);

  if (verifiedResult.error) throw verifiedResult.error;
  if (pendingResult.error) throw pendingResult.error;

  const verified: OwnedCafe[] = (verifiedResult.data ?? []).map((row) => {
    const cafe = row.cafe as any;
    return {
      id: row.id,
      cafeId: row.cafe_id,
      name: cafe?.name ?? "",
      address: cafe?.address ?? "",
      city: cafe?.city ?? "",
      avatarUrl: cafe?.avatar_url ?? null,
      status: "verified",
    };
  });

  const pending: OwnedCafe[] = (pendingResult.data ?? []).map((row) => {
    const cafe = row.cafe as any;
    return {
      id: row.id,
      cafeId: row.cafe_id,
      name: cafe?.name ?? "",
      address: cafe?.address ?? "",
      city: cafe?.city ?? "",
      avatarUrl: cafe?.avatar_url ?? null,
      status: "pending",
    };
  });

  return [...verified, ...pending];
}

// ---------------------------------------------------------------------------
// Cafe search
// ---------------------------------------------------------------------------

export async function searchCafes(query: string): Promise<CafeSearchResult[]> {
  if (query.trim().length < 2) return [];

  const { data, error } = await supabase
    .from("cafe")
    .select("id, name, address, city, avatar_url")
    .ilike("name", `%${query.trim()}%`)
    .limit(6);

  if (error) throw error;
  return (data ?? []) as CafeSearchResult[];
}

// ---------------------------------------------------------------------------
// Image picking
// ---------------------------------------------------------------------------

export async function pickImage(): Promise<string | undefined> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"] as any,
    allowsEditing: false,
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) return undefined;
  return result.assets[0].uri;
}

export async function pickImages(limit: number): Promise<string[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"] as any,
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 0.8,
  });

  if (result.canceled) return [];
  return result.assets.map((asset) => asset.uri).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  ].filter(Boolean);

  return parts.join(" | ");
};

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

const requireValue = (value: string | undefined, label: string) => {
  const trimmed = value?.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  return trimmed;
};

// ---------------------------------------------------------------------------
// Daily limit check
// ---------------------------------------------------------------------------

async function checkDailySubmissionLimit(userId: string): Promise<void> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("owner_submissions_cafe")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString());

  if (error) {
    throw new Error(formatSupabaseError("Daily limit check failed", error));
  }

  if ((count ?? 0) >= DAILY_SUBMISSION_LIMIT) {
    throw new Error(
      `You've reached the limit of ${DAILY_SUBMISSION_LIMIT} café submissions per day. Please try again tomorrow.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Document upload
// ---------------------------------------------------------------------------

const uploadOwnerVerificationDocument = async ({
  userId,
  submissionId,
  kind,
  uri,
}: {
  userId: string;
  submissionId: number;
  kind:
    | "valid_id"
    | "registration_certificate"
    | "permit"
    | "lease_title"
    | "interior_exterior_signage";
  uri: string;
}): Promise<string> => {
  const ext = getExt(uri);
  const response = await fetch(uri);
  const blob = await response.blob();
  const path = `${OWNER_VERIFICATION_FOLDER}/${userId}/${submissionId}/${kind}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(OWNER_VERIFICATION_BUCKET)
    .upload(path, blob, {
      contentType: blob.type || getContentType(ext),
      upsert: false,
    });

  if (error) {
    throw new Error(
      formatSupabaseError(`Document upload failed (${kind})`, error),
    );
  }

  return path;
};

// ---------------------------------------------------------------------------
// Main submission
// ---------------------------------------------------------------------------

export async function submitOwnerVerification(
  formData: VerificationFormData,
): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated.");
  }

  // Check daily limit before doing anything else
  await checkDailySubmissionLimit(user.id);

  if (!formData.cafe_id) {
    throw new Error("Please choose an existing café before submitting.");
  }

  const cafeId = Number(formData.cafe_id);
  if (!Number.isFinite(cafeId)) {
    throw new Error("Selected café is invalid. Please choose a café again.");
  }

  const requiredFields = {
    ownerName: requireValue(formData.owner_name, "Owner name"),
    email: requireValue(formData.email, "Email"),
    phone: requireValue(formData.phone, "Phone"),
    validId: requireValue(formData.valid_id_image, "Valid ID"),
    registrationCertificate: requireValue(
      formData.registration_certificate_image,
      "Registration certificate",
    ),
    permit: requireValue(formData.permit_image, "Permit"),
    leaseTitle: requireValue(formData.lease_or_title_image, "Lease or title"),
    interiorExteriorSignage: requireValue(
      formData.interior_images?.[0],
      "Café interior/exterior/signage photo",
    ),
  };

  // Insert submission row
  const { data: submission, error: submissionError } = await supabase
    .from("owner_submissions_cafe")
    .insert({
      user_id: user.id,
      cafe_id: cafeId,
      owner_name: requiredFields.ownerName,
      email: requiredFields.email,
      phone: requiredFields.phone,
      telephone: formData.telephone?.trim() ?? "",
      status: "pending",
    })
    .select("id")
    .single();

  if (submissionError) {
    throw new Error(formatSupabaseError("Submission failed", submissionError));
  }
  if (!submission?.id) {
    throw new Error("Unable to create submission. Please try again.");
  }

  const submissionId = Number(submission.id);

  // Upload all documents in parallel
  const [
    validId,
    registrationCertificate,
    permit,
    leaseTitle,
    interiorExteriorSignage,
  ] = await Promise.all([
    uploadOwnerVerificationDocument({
      userId: user.id,
      submissionId,
      kind: "valid_id",
      uri: requiredFields.validId,
    }),
    uploadOwnerVerificationDocument({
      userId: user.id,
      submissionId,
      kind: "registration_certificate",
      uri: requiredFields.registrationCertificate,
    }),
    uploadOwnerVerificationDocument({
      userId: user.id,
      submissionId,
      kind: "permit",
      uri: requiredFields.permit,
    }),
    uploadOwnerVerificationDocument({
      userId: user.id,
      submissionId,
      kind: "lease_title",
      uri: requiredFields.leaseTitle,
    }),
    uploadOwnerVerificationDocument({
      userId: user.id,
      submissionId,
      kind: "interior_exterior_signage",
      uri: requiredFields.interiorExteriorSignage,
    }),
  ]);

  // Insert documents row
  const { error: documentsError } = await supabase
    .from("owner_submissions_documents")
    .insert({
      submission_id: submissionId,
      valid_id: validId,
      registration_certificate: registrationCertificate,
      permit,
      lease_title: leaseTitle,
      interior_exterior_signage: interiorExteriorSignage,
    });

  if (documentsError) {
    throw new Error(
      formatSupabaseError("Document records failed", documentsError),
    );
  }
}

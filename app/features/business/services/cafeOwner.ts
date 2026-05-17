import { supabase } from "@/app/shared/lib/supabaseClient";
import * as ImagePicker from "expo-image-picker";

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

export async function submitOwnerVerification(
  formData: VerificationFormData,
): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.from("owner_submissions").insert({
    user_id: user.id,
    cafe_id: formData.cafe_id ?? null,
    cafe_name: formData.cafe_name ?? null,
    is_new_cafe: formData.is_new_cafe ?? false,
    owner_name: formData.owner_name,
    valid_id_image: formData.valid_id_image,
    email: formData.email,
    phone: formData.phone,
    telephone: formData.telephone ?? null,
    registration_certificate_image: formData.registration_certificate_image,
    permit_image: formData.permit_image,
    lease_or_title_image: formData.lease_or_title_image,
    interior_images: formData.interior_images ?? [],
    status: "pending",
    submitted_at: new Date().toISOString(),
  });

  if (error) throw error;
}

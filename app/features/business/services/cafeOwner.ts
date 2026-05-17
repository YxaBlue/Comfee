import { supabase } from "@/app/shared/lib/supabaseClient";

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

export async function getOwnedCafes(userId: string): Promise<OwnedCafe[]> {
  const [verifiedResult, pendingResult] = await Promise.all([
    supabase
      .from("cafe_owners")
      .select("id, cafe_id, cafe(id, name, address, city, avatar_url)")
      .eq("user_id", userId),

    supabase
      .from("cafe_submission_owners")
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

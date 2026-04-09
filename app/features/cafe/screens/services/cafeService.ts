import { supabase } from "@/app/shared/lib/supabaseClient";

export type Cafe = {
  id: number;
  name: string;
  address: string;
  main_photo_url: string | null;
  average_rating: number | null;
  featured: boolean;
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
    .select("id, name, address, main_photo_url, average_rating, featured")
    .eq("city", city)
    .neq("is_deleted", true)
    .range(from, to);

  if (error) throw error;
  return data ?? [];
}

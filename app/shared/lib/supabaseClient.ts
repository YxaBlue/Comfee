import { createClient } from "@supabase/supabase-js";
import * as Linking from "expo-linking";

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
);

function handleAuthUrl(url: string) {
  const hash = url.split("#")[1] ?? "";
  const params = new URLSearchParams(hash);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");

  if (access_token && refresh_token) {
    supabase.auth.setSession({ access_token, refresh_token });
  }
}

// Cold start
Linking.getInitialURL().then((url) => {
  if (url) handleAuthUrl(url);
});

// Warm start
Linking.addEventListener("url", ({ url }) => {
  handleAuthUrl(url);
});

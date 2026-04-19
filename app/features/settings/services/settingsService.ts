import { supabase } from "@/app/shared/lib/supabaseClient";

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
) => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message || "Unable to verify your session.");
  }

  if (!session) {
    throw new Error("You must be logged in to change your password.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message || "Unable to verify your account.");
  }

  if (!user?.email) {
    throw new Error("You must be logged in to change your password.");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error("Current password is incorrect.");
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message || "Unable to update your password.");
  }

  return data;
};

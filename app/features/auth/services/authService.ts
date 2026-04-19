import { calculateAge } from "@/app/shared/utils/dateUtils";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "../../../shared/lib/supabaseClient";

type signUpData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  birthDate: string;
};

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUp(data: signUpData) {
  const { data: user, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
      },
    },
  });
  if (authError) throw authError;
  const age = calculateAge(data.birthDate);
  const { error: profileError } = await supabase.from("profile").insert([
    {
      id: user.user?.id,
      email: user.user?.email,
      joined_at: user.user?.created_at,
      username: data.username,
      first_name: data.firstName,
      last_name: data.lastName,
      birth_date: data.birthDate,
      age: age,
    },
  ]);

  if (profileError) throw profileError;

  return user;
}

export async function forgotPassword(email: string) {
  const redirectTo = makeRedirectUri({
    path: "reset-password",
  });

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) throw error;
  return data;
}

export async function resetPassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

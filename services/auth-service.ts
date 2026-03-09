import { calculateAge } from "@/utils/date-utils";
import { supabase } from "./supabase-client";

type signUpData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
};

export async function signIn(email: string, password: string) {
  console.log("LOGGING IN");
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

export async function forgotPassword() {
  console.log("Handle password reset");
}

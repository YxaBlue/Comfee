// utils/validation.ts
import { supabase } from "@/services/supabase-client";

type signUpData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
};

async function validateUsername(username: string) {
  if (!username.trim()) return "Username is required.";

  // check uniqueness in Supabase
  const { data, error } = await supabase
    .from("profile")
    .select("id")
    .eq("username", username.trim());

  if (error) return "Error checking username.";
  if (data && data.length > 0) return "Username already taken.";

  return "";
}

function validateEmail(email: string) {
  if (!email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "Email is invalid.";
  return "";
}

function validatePassword(password: string) {
  if (!password.trim()) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return "";
}

export function validateLogin(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (!password.trim()) errors.password = "Password is required.";

  return errors;
}

export async function validateSignUp(data: signUpData) {
  const errors: Record<string, string> = {};

  if (!data.firstName.trim()) errors.firstName = "First name is required.";

  if (!data.lastName.trim()) errors.lastName = "Last name is required.";

  const usernameError = await validateUsername(data.username);
  if (usernameError) errors.username = usernameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  if (!data.confirmPassword.trim())
    errors.confirmPassword = "Please confirm your password.";
  else if (data.confirmPassword !== data.password)
    errors.confirmPassword = "Passwords do not match.";

  const validMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  if (!data.birthMonth || !validMonths.includes(data.birthMonth))
    errors.birthMonth = "Birth month is invalid.";

  const day = parseInt(data.birthDay, 10);
  if (isNaN(day) || day < 1 || day > 31)
    errors.birthDay = "Birth day is invalid.";

  const year = parseInt(data.birthYear, 10);
  const currentYear = new Date().getFullYear();
  if (isNaN(year) || year < 1900 || year > currentYear)
    errors.birthYear = "Birth year is invalid.";

  return errors;
}

// utils/validation.ts
import { dateFromInput } from "@/app/shared/utils/dateUtils";
import { validateUsername } from "@/app/shared/utils/validation";

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

// ─── Private helpers ──────────────────────────────────────────────────────────

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

// ─── Public validators ────────────────────────────────────────────────────────

export function validateLogin(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (!password.trim()) errors.password = "Password is required.";

  return errors;
}

export async function validateSignUp(data: signUpData): Promise<{
  errors: Record<string, string>;
  birthDate: string | null;
}> {
  const errors: Record<string, string> = {};

  // ── Sync checks ──────────────────────────────────────────────────────────
  if (!data.firstName.trim()) errors.firstName = "First name is required.";
  if (!data.lastName.trim()) errors.lastName = "Last name is required.";

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  if (!data.confirmPassword.trim()) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (data.confirmPassword !== data.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  // ── Async checks in parallel (FIX #9) ────────────────────────────────────
  const [usernameError] = await Promise.all([
    validateUsername(data.username),
    // future async validators go here
  ]);
  if (usernameError) errors.username = usernameError;

  let birthDate: string | null = null;
  try {
    birthDate = dateFromInput({
      birthMonth: data.birthMonth,
      birthDay: data.birthDay,
      birthYear: data.birthYear,
    })
      .toISOString()
      .split("T")[0];
  } catch (error: any) {
    errors.birthDate = error.message ?? "Birth date is invalid.";
  }

  return { errors, birthDate };
}

export function validateResetPassword(
  password: string,
  confirmPassword: string,
): string {
  if (!password || !confirmPassword) return "Please fill in both fields.";
  if (password !== confirmPassword) return "Passwords do not match.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return "";
}

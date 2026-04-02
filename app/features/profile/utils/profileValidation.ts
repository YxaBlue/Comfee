// app/shared/utils/validation.ts
import { validateUsername } from "@/app/shared/utils/validation";

export async function validateEditProfile(
  data: {
    username: string;
    first_name: string;
    last_name: string;
    birth_date: string; // expects "YYYY-MM-DD"
    bio: string;
  },
  currentUsername: string,
) {
  const errors: Record<string, string> = {};

  if (!data.first_name.trim()) errors.firstName = "First name is required.";
  if (!data.last_name.trim()) errors.lastName = "Last name is required.";

  if (!data.username.trim()) {
    errors.username = "Username is required.";
  } else if (data.username.trim() !== currentUsername.trim()) {
    const usernameError = await validateUsername(data.username);
    if (usernameError) errors.username = usernameError;
  }

  if (!data.birth_date.trim()) {
    errors.birthDate = "Birth date is required.";
  } else {
    const parsed = new Date(data.birth_date);
    const currentYear = new Date().getFullYear();
    if (isNaN(parsed.getTime())) {
      errors.birthDate = "Birth date is invalid.";
    } else if (
      parsed.getFullYear() < 1900 ||
      parsed.getFullYear() > currentYear
    ) {
      errors.birthDate = "Birth date is out of range.";
    }
  }

  return errors;
}

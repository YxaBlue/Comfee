// utils/validation.ts

type signUpData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
};

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

export function validateSignUp(data: signUpData) {
  const errors: Record<string, string> = {};

  if (!data.firstName.trim()) errors.firstName = "First name is required.";

  if (!data.lastName.trim()) errors.lastName = "Last name is required.";

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

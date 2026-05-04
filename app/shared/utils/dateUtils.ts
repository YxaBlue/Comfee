import { format, parseISO } from "date-fns";

const monthMap: { [key: string]: number } = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export function dateFromInput(data: {
  birthMonth: string;
  birthDay: string;
  birthYear: string;
}) {
  const monthIndex = monthMap[data.birthMonth];
  const day = parseInt(data.birthDay, 10);
  const year = parseInt(data.birthYear, 10);

  const date = new Date(year, monthIndex, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    throw new Error("Invalid birth date");
  }

  return date;
}

export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

export const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), "MMM dd, yyyy · h:mm a");
  } catch {
    return dateString;
  }
};

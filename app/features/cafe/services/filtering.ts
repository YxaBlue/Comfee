import { MaterialIcons } from "@expo/vector-icons";

import type { CafeWithFeatures } from "./cafeService";

export type FilterOption = {
  id: string;
  label: string;
};

export type FilterCategory = {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  selectionMode?: "single" | "multiple";
  options: FilterOption[];
};

export type FilterSelectionState = Record<string, string[]>;

export const FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: "price",
    title: "Price",
    icon: "payments",
    selectionMode: "single",
    options: [
      { id: "low_price", label: "₱" },
      { id: "medium_price", label: "₱₱" },
      { id: "high_price", label: "₱₱₱" },
    ],
  },
  {
    id: "beanType",
    title: "Bean Type",
    icon: "coffee",
    options: [
      { id: "arabica", label: "Arabica" },
      { id: "robusta", label: "Robusta" },
      { id: "liberica", label: "Liberica (Barako)" },
      { id: "excelsa", label: "Excelsa" },
    ],
  },
  {
    id: "brewMethod",
    title: "Brew Method",
    icon: "local-cafe",
    options: [
      { id: "espresso", label: "Espresso" },
      { id: "drip", label: "Drip" },
      { id: "french-press", label: "French Press" },
      { id: "pour-over", label: "Pour Over" },
      { id: "cold-brew", label: "Cold Brew" },
    ],
  },
  {
    id: "wifi",
    title: "WiFi",
    icon: "wifi",
    selectionMode: "single",
    options: [
      { id: "none", label: "None" },
      { id: "slow", label: "Slow" },
      { id: "moderate", label: "Moderate" },
      { id: "fast", label: "Fast" },
    ],
  },
  {
    id: "sockets",
    title: "Sockets",
    icon: "power",
    selectionMode: "single",
    options: [
      { id: "none", label: "None" },
      { id: "some", label: "Some" },
      { id: "many", label: "Many" },
    ],
  },
  {
    id: "parking",
    title: "Parking",
    icon: "local-parking",
    selectionMode: "single",
    options: [
      { id: "none", label: "None" },
      { id: "limited", label: "Limited" },
      { id: "plenty", label: "Plenty" },
    ],
  },
  {
    id: "operating-time",
    title: "Operating Time",
    icon: "schedule",
    selectionMode: "single",
    options: [
      { id: "24-hours", label: "24 hours" },
      { id: "not-24-hours", label: "Not 24 hours" },
    ],
  },
  {
    id: "lighting",
    title: "Lighting",
    icon: "wb-incandescent",
    selectionMode: "single",
    options: [
      { id: "dim", label: "Dim" },
      { id: "balanced", label: "Balanced" },
      { id: "bright", label: "Bright" },
    ],
  },
  {
    id: "seating",
    title: "Seating",
    icon: "weekend",
    options: [
      { id: "inside", label: "Inside" },
      { id: "outside", label: "Outside" },
    ],
  },
  {
    id: "pet-friendly",
    title: "Pet Friendly",
    icon: "pets",
    selectionMode: "single",
    options: [
      { id: "allowed", label: "Pet friendly" },
      { id: "not-allowed", label: "Not pet friendly" },
    ],
  },
  {
    id: "tables",
    title: "Tables",
    icon: "table-bar",
    options: [
      { id: "bar-type", label: "Bar type" },
      { id: "individual-tables", label: "Individual tables" },
      { id: "large-tables", label: "Large tables (>6)" },
    ],
  },
  {
    id: "suitable-conditions",
    title: "Suitable Conditions",
    icon: "groups",
    options: [
      { id: "students", label: "Student" },
      { id: "work", label: "Work" },
      { id: "group", label: "Group" },
      { id: "vibes", label: "Vibes" },
    ],
  },
  {
    id: "music",
    title: "Music",
    icon: "graphic-eq",
    selectionMode: "single",
    options: [
      { id: "quiet", label: "Quiet" },
      { id: "normal", label: "Normal" },
      { id: "blaring", label: "Blaring" },
    ],
  },
  {
    id: "ratings",
    title: "Ratings",
    icon: "star-rate",
    selectionMode: "single",
    options: [
      { id: "1", label: "1+" },
      { id: "2", label: "2+" },
      { id: "3", label: "3+" },
      { id: "4", label: "4+" },
      { id: "5", label: "5" },
    ],
  },
];

export const createInitialSelections = (
  categories: FilterCategory[] = FILTER_CATEGORIES,
): FilterSelectionState =>
  categories.reduce<FilterSelectionState>((accumulator, category) => {
    accumulator[category.id] = [];
    return accumulator;
  }, {});

export const normalizeFilterSelections = (
  selections?: Partial<FilterSelectionState>,
): FilterSelectionState => {
  const normalized = createInitialSelections();

  if (!selections) {
    return normalized;
  }

  for (const category of FILTER_CATEGORIES) {
    const selectedOptions = selections[category.id];

    normalized[category.id] = Array.isArray(selectedOptions)
      ? selectedOptions
      : [];
  }

  return normalized;
};

const toComparableOption = (value: string) => {
  if (value === "group") {
    return "groups";
  }

  return value;
};

const matchesArrayFilter = (values: string[], selected: string[]) =>
  selected.length === 0 ||
  selected.some(
    (option) =>
      values.includes(option) || values.includes(toComparableOption(option)),
  );

export const cafeMatchesFilters = (
  cafe: CafeWithFeatures,
  filters: FilterSelectionState,
) => {
  const { features } = cafe;

  if (!features) {
    return Object.values(filters).every((selected) => selected.length === 0);
  }

  if (
    filters.price.length > 0 &&
    !filters.price.includes(features.price_level)
  ) {
    return false;
  }

  if (
    filters.beanType.length > 0 &&
    !matchesArrayFilter(features.coffee_bean_type, filters.beanType)
  ) {
    return false;
  }

  if (
    filters.brewMethod.length > 0 &&
    !matchesArrayFilter(features.coffee_brew_method, filters.brewMethod)
  ) {
    return false;
  }

  if (filters.wifi.length > 0 && !filters.wifi.includes(features.wifi_speed)) {
    return false;
  }

  if (
    filters.sockets.length > 0 &&
    !filters.sockets.includes(features.sockets)
  ) {
    return false;
  }

  if (
    filters.parking.length > 0 &&
    !filters.parking.includes(features.parking)
  ) {
    return false;
  }

  if (
    filters["operating-time"].includes("24-hours") &&
    !features.operating_24h
  ) {
    return false;
  }

  if (
    filters["operating-time"].includes("not-24-hours") &&
    features.operating_24h
  ) {
    return false;
  }

  if (
    filters.lighting.length > 0 &&
    !filters.lighting.includes(features.lighting)
  ) {
    return false;
  }

  if (
    filters.seating.length > 0 &&
    !matchesArrayFilter(features.seating, filters.seating)
  ) {
    return false;
  }

  if (filters["pet-friendly"].includes("allowed") && !features.pet_friendly) {
    return false;
  }

  if (
    filters["pet-friendly"].includes("not-allowed") &&
    features.pet_friendly
  ) {
    return false;
  }

  if (
    filters.tables.length > 0 &&
    !matchesArrayFilter(features.tables_type, filters.tables)
  ) {
    return false;
  }

  if (
    filters["suitable-conditions"].length > 0 &&
    !matchesArrayFilter(features.suitable_for, filters["suitable-conditions"])
  ) {
    return false;
  }

  if (filters.music.length > 0 && !filters.music.includes(features.music)) {
    return false;
  }

  if (filters.ratings.length > 0) {
    const minimumRating = Number(filters.ratings[0]);
    const rating = cafe.average_rating ?? 0;

    if (rating < minimumRating) {
      return false;
    }
  }

  return true;
};

import React, { useMemo, useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterOption = {
  id: string;
  label: string;
};

type FilterCategory = {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  selectionMode?: "single" | "multiple";
  options: FilterOption[];
};

const FILTER_CATEGORIES: FilterCategory[] = [
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
      { id: "student", label: "Student" },
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
    options: [
      { id: "1", label: "1" },
      { id: "2", label: "2" },
      { id: "3", label: "3" },
      { id: "4", label: "4" },
      { id: "5", label: "5" },
    ],
  },
];

type FilterSelectionState = Record<string, string[]>;

const createInitialSelections = (
  categories: FilterCategory[],
): FilterSelectionState =>
  categories.reduce<FilterSelectionState>((accumulator, category) => {
    accumulator[category.id] = [];
    return accumulator;
  }, {});

export default function FilterScreen() {
  const router = useRouter();
  const [selectedFilters, setSelectedFilters] = useState<FilterSelectionState>(
    () => createInitialSelections(FILTER_CATEGORIES),
  );

  const selectedCount = useMemo(
    () =>
      Object.values(selectedFilters).reduce(
        (count, options) => count + options.length,
        0,
      ),
    [selectedFilters],
  );

  const toggleOption = (categoryId: string, optionId: string) => {
    setSelectedFilters((currentSelections) => {
      const categorySelections = currentSelections[categoryId] ?? [];
      const isSelected = categorySelections.includes(optionId);
      const category = FILTER_CATEGORIES.find((item) => item.id === categoryId);
      const isSingleSelect = category?.selectionMode === "single";

      if (isSingleSelect) {
        return {
          ...currentSelections,
          [categoryId]: isSelected ? [] : [optionId],
        };
      }

      return {
        ...currentSelections,
        [categoryId]: isSelected
          ? categorySelections.filter((selection) => selection !== optionId)
          : [...categorySelections, optionId],
      };
    });
  };

  const resetFilters = () => {
    setSelectedFilters(createInitialSelections(FILTER_CATEGORIES));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={styles.iconButton}
            >
              <MaterialIcons
                name="keyboard-arrow-left"
                size={28}
                color="#4B2C11"
              />
            </Pressable>

            <View style={styles.headerCopy}>
              <Text style={styles.title}>Filters</Text>
              <Text style={styles.subtitle}>
                Refine cafes by mood, amenities, and setting.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.selectionSummary}>
          <Text style={styles.selectionSummaryText}>
            {selectedCount} {selectedCount === 1 ? "filter" : "filters"}{" "}
            selected
          </Text>

          <Pressable
            onPress={resetFilters}
            hitSlop={10}
            style={styles.resetButton}
          >
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {FILTER_CATEGORIES.map((category) => (
            <View key={category.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <MaterialIcons
                    name={category.icon}
                    size={18}
                    color="#966A0C"
                  />
                  <Text style={styles.sectionTitle}>{category.title}</Text>
                </View>
              </View>

              <View style={styles.sectionCard}>
                {category.options.map((option, optionIndex) => {
                  const isSelected = selectedFilters[category.id]?.includes(
                    option.id,
                  );

                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => toggleOption(category.id, option.id)}
                      style={[
                        styles.optionRow,
                        optionIndex < category.options.length - 1 &&
                          styles.optionDivider,
                      ]}
                    >
                      <Text style={styles.optionLabel}>{option.label}</Text>

                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected ? (
                          <MaterialIcons
                            name="check"
                            size={16}
                            color="#FFFAF3"
                          />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.applyButton} onPress={() => router.back()}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3E6CF",
  },

  container: {
    flex: 1,
    backgroundColor: "#F3E6CF",
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 16,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E9D6B9",
  },

  headerCopy: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4B2C11",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#966A0C",
  },

  resetButton: {
    marginLeft: 12,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },

  resetText: {
    color: "#A97C4E",
    fontSize: 13,
    fontWeight: "600",
  },

  selectionSummary: {
    marginHorizontal: 18,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#E9D6B9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectionSummaryText: {
    color: "#4B2C11",
    fontSize: 13,
    fontWeight: "600",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },

  section: {
    marginBottom: 18,
  },

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4B2C11",
  },

  sectionCard: {
    borderRadius: 16,
    backgroundColor: "#FFFAF3",
    overflow: "hidden",
    shadowColor: "#A97C4E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },

  optionRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1E3CB",
  },

  optionLabel: {
    flex: 1,
    paddingRight: 16,
    fontSize: 15,
    color: "#4B2C11",
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#C8AA7A",
    backgroundColor: "#FFFAF3",
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxSelected: {
    borderColor: "#966A0C",
    backgroundColor: "#966A0C",
  },

  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: "#F3E6CF",
  },

  applyButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#966A0C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7A560D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },

  applyButtonText: {
    color: "#FFFAF3",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

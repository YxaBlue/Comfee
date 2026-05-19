import { useEffect, useMemo, useState } from "react";

import { RootStackParamList } from "@/App";
import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  createInitialSelections,
  FILTER_CATEGORIES,
  FilterSelectionState,
  normalizeFilterSelections,
} from "../../../services/filtering";

type FilterRouteProp = RouteProp<RootStackParamList, "Filter">;

export default function FilterScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<FilterRouteProp>();
  const userCoords = route.params?.userCoords;
  const [selectedFilters, setSelectedFilters] = useState<FilterSelectionState>(
    () => normalizeFilterSelections(route.params?.selectedFilters),
  );

  useEffect(() => {
    setSelectedFilters(
      normalizeFilterSelections(route.params?.selectedFilters),
    );
  }, [route.params?.selectedFilters]);

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
    setSelectedFilters(createInitialSelections());
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => navigation.goBack()}
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
          <Pressable
            style={styles.applyButton}
            onPress={() =>
              navigation.navigate("Search", {
                query: route.params?.query ?? "",
                selectedFilters,
                userCoords: userCoords ?? undefined,
              })
            }
          >
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
    color: "#4B2C11",
    fontFamily: "SourceSerifPro-Bold",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#966A0C",
    fontFamily: "SourceSerifPro-Regular",
  },

  resetButton: {
    marginLeft: 12,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },

  resetText: {
    color: "#A97C4E",
    fontSize: 13,
    fontFamily: "SourceSerifPro-Bold",
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
    fontFamily: "SourceSerifPro-Bold",
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
    fontFamily: "SourceSerifPro-Bold",
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
    fontFamily: "SourceSerifPro-Regular",
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
    fontFamily: "SourceSerifPro-Bold",
    letterSpacing: 0.3,
  },
});

import { RootStackParamList } from "@/App";
import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  FILTER_CATEGORIES,
  FilterSelectionState,
  cafeMatchesFilters,
  normalizeFilterSelections,
} from "./filtering";
import { CafeWithFeatures, getCafesWithFeatures } from "./services/cafeService";

type NavProps = NativeStackNavigationProp<RootStackParamList>;
type SearchScreenRouteProp = RouteProp<RootStackParamList, "Search">;

const DEFAULT_NEAR_ME_ACTIVE = true;

export default function SearchScreen() {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<SearchScreenRouteProp>();
  const [search, setSearch] = useState(route.params?.query ?? "");
  const [cafes, setCafes] = useState<CafeWithFeatures[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [nearMeActive, setNearMeActive] = useState(DEFAULT_NEAR_ME_ACTIVE);
  const [selectedFilters, setSelectedFilters] = useState<FilterSelectionState>(
    () => normalizeFilterSelections(route.params?.selectedFilters),
  );

  const city = route.params?.city;

  useEffect(() => {
    setSearch(route.params?.query ?? "");
  }, [route.params?.query]);

  useEffect(() => {
    setSelectedFilters(
      normalizeFilterSelections(route.params?.selectedFilters),
    );
  }, [route.params?.selectedFilters]);

  useEffect(() => {
    let isMounted = true;

    const loadCafes = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const data = await getCafesWithFeatures();

        if (isMounted) {
          setCafes(data);
        }
      } catch (error) {
        console.error("Failed to load searchable cafes:", error);

        if (isMounted) {
          setCafes([]);
          setErrorMessage("We couldn't load cafes right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCafes();

    return () => {
      isMounted = false;
    };
  }, []);

  // removable chips; uses FILTER_CATEGORIES for labels
  const activeFilterChips = useMemo(() => {
    const chips: {
      categoryId: string;
      categoryTitle: string;
      optionId: string;
      optionLabel: string;
    }[] = [];

    for (const category of FILTER_CATEGORIES) {
      const selectedOptionIds = selectedFilters[category.id];
      if (!selectedOptionIds || selectedOptionIds.length === 0) continue;

      for (const optionId of selectedOptionIds) {
        const option = category.options.find((o) => o.id === optionId);
        chips.push({
          categoryId: category.id,
          categoryTitle: category.title,
          optionId,
          optionLabel: option?.label ?? optionId,
        });
      }
    }

    return chips;
  }, [selectedFilters]);

  const removeFilterChip = (categoryId: string, optionId: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] ?? []).filter((id) => id !== optionId),
    }));
  };

  const filteredCafes = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    return cafes.filter((cafe) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        cafe.name.toLowerCase().includes(normalizedQuery) ||
        cafe.address.toLowerCase().includes(normalizedQuery);

      const matchesNearMe = nearMeActive
        ? city
          ? cafe.city === city
          : true
        : true;

      return (
        matchesQuery &&
        matchesNearMe &&
        cafeMatchesFilters(cafe, selectedFilters)
      );
    });
  }, [cafes, city, nearMeActive, search, selectedFilters]);

  return (
    <ImageBackground
      source={require("../../../../assets/images/bg1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.rectangle1, styles.shadow, styles.androidShadow]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.navigate("Dashboard")}
            hitSlop={10}
            style={styles.iconButton}
          >
            <MaterialIcons
              name="keyboard-arrow-left"
              size={28}
              color="#4B2C11"
            />
          </Pressable>
        </View>
      </View>

      <View style={[styles.searchBar, styles.androidShadow]}>
        <MaterialIcons name="search" size={24} color="#C8AA7A" />

        <TextInput
          style={styles.searchInput}
          placeholder="Search cafe"
          placeholderTextColor="#C8AA7A"
          value={search}
          onChangeText={(text) => setSearch(text)}
          onSubmitEditing={() => {
            navigation.navigate("Search", {
              query: search,
              city,
              selectedFilters,
            });
          }}
        />

        <Pressable
          onPress={() =>
            navigation.navigate("Filter", {
              query: search,
              city,
              selectedFilters,
            })
          }
          hitSlop={10}
          style={styles.filterTrigger}
        >
          <MaterialIcons name="tune" size={22} color="#C8AA7A" />
        </Pressable>
      </View>

      <View style={styles.quickFilterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFilterContent}
        >
          <Pressable
            onPress={() => setNearMeActive((prev) => !prev)}
            style={[
              styles.quickFilterChip,
              nearMeActive && styles.quickFilterChipActive,
            ]}
          >
            {nearMeActive && (
              <Pressable
                onPress={() => setNearMeActive(false)}
                hitSlop={6}
                style={styles.chipRemove}
              >
                <MaterialIcons name="close" size={12} color="#FFFAF3" />
              </Pressable>
            )}
            <Text
              style={[
                styles.quickFilterText,
                nearMeActive && styles.quickFilterTextActive,
              ]}
            >
              Near Me
            </Text>
          </Pressable>

          {/* Dynamic; one per selected filter, grouped by category title */}
          {activeFilterChips.map((chip) => (
            <View
              key={`${chip.categoryId}-${chip.optionId}`}
              style={[styles.quickFilterChip, styles.quickFilterChipActive]}
            >
              <Pressable
                onPress={() => removeFilterChip(chip.categoryId, chip.optionId)}
                hitSlop={6}
                style={styles.chipRemove}
              >
                <MaterialIcons name="close" size={12} color="#FFFAF3" />
              </Pressable>
              <Text
                style={[styles.quickFilterText, styles.quickFilterTextActive]}
              >
                {chip.categoryTitle}: {chip.optionLabel}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator
            color="#966A0C"
            size="large"
            style={styles.loadingIndicator}
          />
        ) : errorMessage ? (
          <Text style={styles.noResult}>{errorMessage}</Text>
        ) : (
          <FlatList
            data={filteredCafes}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.cafeHolder}>
                <View style={{ flex: 1 }} />
                <View style={styles.cafeText}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cafeName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.locationRow}>
                      <MaterialIcons
                        name="location-on"
                        size={14}
                        color="#E9D0A2"
                      />
                      <Text style={styles.location} numberOfLines={1}>
                        {item.address}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.rating}>
                    {item.average_rating?.toFixed(1) ?? "New"}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.noResult}>No cafes found.</Text>
            }
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 18,
  },

  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },

  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 10,
  },

  cafeHolder: {
    width: 143,
    height: 136,
    backgroundColor: "#FFFAF3",
    borderRadius: 10,
    padding: 10,
    margin: 10,
    alignItems: "flex-start",
    shadowColor: "#A97C4E",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 20,
    flex: 1,
  },

  cafeText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  cafeName: {
    fontSize: 11,
    color: "#4B2C11",
    fontWeight: "600",
    marginBottom: 0,
  },

  location: {
    fontSize: 7,
    color: "#E9D0A2",
    fontWeight: "400",
    marginBottom: 0,
    marginLeft: 2,
  },

  rating: {
    fontSize: 12,
    color: "#4B2C11",
    marginBottom: 0,
    fontWeight: "400",
  },

  noResult: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#4B2C11",
  },

  loadingIndicator: {
    marginTop: 48,
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  rectangle1: {
    backgroundColor: "#E9D6B9",
    borderRadius: 0,
    padding: 0,
    marginBottom: 1,
    width: "100%",
    height: 79,
    shadowColor: "#0B0B0B",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 5,
  },

  shadow: {
    shadowColor: "#00000040",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.75,
    shadowRadius: 7,
  },

  androidShadow: {
    elevation: 15,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 79,
  },

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: -1,
    paddingRight: 4,
    backgroundColor: "#e1c9a1",
  },

  searchBar: {
    position: "absolute",
    backgroundColor: "#FFFAF3",
    borderRadius: 15,
    marginTop: 55,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    width: "75%",
    height: 46,
    shadowColor: "#E9D6B9",
    shadowOffset: { width: 0, height: 4 },
    elevation: 20,
    paddingHorizontal: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#4B2C11",
    marginLeft: 8,
  },

  filterTrigger: {
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },

  quickFilterSection: {
    marginTop: 30,
    paddingLeft: 12,
  },

  quickFilterContent: {
    paddingRight: 12,
  },

  quickFilterChip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: "#E9D0A2",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  quickFilterChipActive: {
    backgroundColor: "#A97C4E",
  },

  chipRemove: {
    marginRight: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  quickFilterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#A97C4E",
  },

  quickFilterTextActive: {
    color: "#FFFAF3",
  },
});

import { RootStackParamList } from "@/App";
import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import {
  CafeWithFeatures,
  getCafesWithFeatures,
  getNearbyCafes,
  getUserLocation,
} from "../services/cafeService";
import {
  cafeMatchesFilters,
  FILTER_CATEGORIES,
  FilterSelectionState,
  normalizeFilterSelections,
} from "../services/filtering";

type NavProps = NativeStackNavigationProp<RootStackParamList>;
type SearchScreenRouteProp = RouteProp<RootStackParamList, "Search">;

function DiscoverMore({
  allCafes,
  filteredCafes,
  cardWidth,
}: {
  allCafes: CafeWithFeatures[];
  filteredCafes: CafeWithFeatures[];
  cardWidth: number;
}) {
  const navigation = useNavigation<NavProps>();

  const discoverCafes = useMemo(() => {
    const filteredIds = new Set(filteredCafes.map((c) => c.id));
    const pool = allCafes.filter((c) => !filteredIds.has(c.id));
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 8);
  }, [allCafes, filteredCafes]);

  if (allCafes.length === 0) return null;
  return (
    <View style={styles.discoverSection}>
      <Text style={styles.discoverTitle}>Discover More</Text>
      <View style={styles.discoverGrid}>
        {discoverCafes.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              navigation.navigate("CafeProfile", { cafeId: String(item.id) })
            }
            style={[styles.discoverCardWrapper, { width: cardWidth }]}
          >
            <View style={styles.cafeHolder}>
              {item.main_photo_url ? (
                <Image
                  source={{ uri: item.main_photo_url }}
                  style={styles.cafeImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.cafeImageFallback}>
                  <MaterialIcons name="local-cafe" size={28} color="#C8AA7A" />
                </View>
              )}
              <View style={styles.cafeTextWrapper}>
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
                  <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={12} color="#D4A017" />
                    <Text style={styles.rating}>
                      {item.average_rating?.toFixed(1) ?? "New"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function SearchScreen() {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<SearchScreenRouteProp>();

  const [search, setSearch] = useState(route.params?.query ?? "");
  const [allCafes, setAllCafes] = useState<CafeWithFeatures[]>([]);
  const [nearbyCafes, setNearbyCafes] = useState<CafeWithFeatures[]>([]);
  const [loading, setLoading] = useState(true);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [nearMeActive, setNearMeActive] = useState(false);
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(route.params?.userCoords ?? null);
  const [selectedFilters, setSelectedFilters] = useState<FilterSelectionState>(
    () => normalizeFilterSelections(route.params?.selectedFilters),
  );

  const { width: screenWidth } = useWindowDimensions();
  const columns = screenWidth >= 760 ? 3 : 2;
  const cardSpacing = 16;
  const horizontalPadding = 20;
  const cardWidth = Math.floor(
    Math.min(
      260,
      Math.max(
        160,
        (screenWidth - horizontalPadding * 2 - cardSpacing * (columns - 1)) /
          columns,
      ),
    ),
  );

  // Ref to always access latest allCafes inside async callbacks
  const allCafesRef = useRef<CafeWithFeatures[]>([]);

  const city = route.params?.city;

  useEffect(() => {
    setSearch(route.params?.query ?? "");
  }, [route.params?.query]);

  useEffect(() => {
    setSelectedFilters(
      normalizeFilterSelections(route.params?.selectedFilters),
    );
  }, [route.params?.selectedFilters]);

  // Load all cafes on mount, then auto-activate Near Me if coords available
  useEffect(() => {
    let isMounted = true;

    const loadCafes = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const data = await getCafesWithFeatures();
        if (!isMounted) return;

        setAllCafes(data);
        allCafesRef.current = data; // ← keep ref in sync

        // Auto-activate Near Me after cafes are loaded
        if (route.params?.userCoords) {
          const coords = route.params.userCoords;
          setNearMeLoading(true);
          try {
            const nearby = await getNearbyCafes(
              coords.latitude,
              coords.longitude,
            );
            if (!isMounted) return;
            const nearbyIds = new Set(nearby.map((c) => c.id));
            setNearbyCafes(data.filter((c) => nearbyIds.has(c.id)));
            setNearMeActive(true);
          } catch (err) {
            console.error("Failed to get nearby cafes:", err);
          } finally {
            if (isMounted) setNearMeLoading(false);
          }
        }
      } catch (error) {
        console.error("Failed to load searchable cafes:", error);
        if (isMounted) {
          setAllCafes([]);
          setErrorMessage("We couldn't load cafes right now.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCafes();
    return () => {
      isMounted = false;
    };
  }, []);

  // ── activateNearMe always uses ref so it has fresh data ──
  const activateNearMe = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    if (nearMeLoading) return; // prevent double-tap
    setNearMeLoading(true);
    try {
      const nearby = await getNearbyCafes(coords.latitude, coords.longitude);
      
      const nearbyIds = new Set(nearby.map((c) => c.id));
      // ← use ref instead of allCafes state to avoid stale closure
      setNearbyCafes(allCafesRef.current.filter((c) => nearbyIds.has(c.id)));
      setNearMeActive(true);
    } catch (err) {
      console.error("Failed to get nearby cafes:", err);
    } finally {
      setNearMeLoading(false);
    }
  };

  const handleNearMePress = async () => {
    if (nearMeLoading) return; // prevent double-tap while loading

    if (nearMeActive) {
      setNearMeActive(false);
      setNearbyCafes([]);
      return;
    }

    if (userCoords) {
      await activateNearMe(userCoords);
      return;
    }
    window.alert("Location Permission Required");
    Alert.alert("Location Access", "Allow Comfee to find cafés near you?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Allow",
        onPress: async () => {
          setNearMeLoading(true);
          try {
            const result = await getUserLocation();
            if (result) {
              const coords = {
                latitude: result.latitude,
                longitude: result.longitude,
              };
              setUserCoords(coords);
              await activateNearMe(coords);
            } else {
              Alert.alert(
                "Location Permission Required",
                "Comfee needs access to your location to find nearby cafés. Please go to your device Settings and enable location permissions for Comfee.",
              );
            }
          } catch {
            Alert.alert("Error", "Failed to get location. Please try again.");
          } finally {
            setNearMeLoading(false);
          }
        },
      },
    ]);
  };

  // Removable chips
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
    // ← state update triggers filteredCafes recompute automatically via useMemo
    setSelectedFilters((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] ?? []).filter((id) => id !== optionId),
    }));
  };

  const hasAnyFilter =
    nearMeActive || activeFilterChips.length > 0 || search.trim().length > 0;

  // Use nearby cafes as base pool when Near Me is active
  const filteredCafes = useMemo(() => {
    const pool = nearMeActive ? nearbyCafes : allCafes;
    const normalizedQuery = search.trim().toLowerCase();

    return pool.filter((cafe) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        cafe.name.toLowerCase().includes(normalizedQuery) ||
        cafe.address.toLowerCase().includes(normalizedQuery);

      const matchesCity = !nearMeActive && city ? cafe.city === city : true;

      return (
        matchesQuery && matchesCity && cafeMatchesFilters(cafe, selectedFilters)
      );
    });
  }, [allCafes, nearbyCafes, nearMeActive, city, search, selectedFilters]);

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
          placeholder="Search café"
          placeholderTextColor="#C8AA7A"
          value={search}
          onChangeText={(text) => setSearch(text)}
          onSubmitEditing={() => {
            navigation.navigate("Search", {
              query: search,
              city,
              selectedFilters,
              userCoords: userCoords ?? undefined,
            });
          }}
        />
        <Pressable
          onPress={() =>
            navigation.navigate("Filter", {
              query: search,
              city,
              selectedFilters,
              userCoords: userCoords ?? undefined,
            })
          }
          hitSlop={10}
          style={styles.filterTrigger}
        >
          <MaterialIcons name="tune" size={22} color="#C8AA7A" />
        </Pressable>
      </View>

      {/* Filter chips */}
      <View style={styles.quickFilterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickFilterContent}
        >
          {/* Near Me chip */}
          <Pressable
            onPress={handleNearMePress}
            disabled={nearMeLoading}
            style={[
              styles.quickFilterChip,
              nearMeActive && styles.quickFilterChipActive,
            ]}
          >
            {nearMeLoading ? (
              <ActivityIndicator
                size={12}
                color={nearMeActive ? "#FFFAF3" : "#A97C4E"}
                style={{ marginRight: 5 }}
              />
            ) : nearMeActive ? (
              <View style={styles.chipRemove}>
                <MaterialIcons name="close" size={12} color="#FFFAF3" />
              </View>
            ) : null}
            <MaterialIcons
              name="my-location"
              size={12}
              color={nearMeActive ? "#FFFAF3" : "#A97C4E"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.quickFilterText,
                nearMeActive && styles.quickFilterTextActive,
              ]}
            >
              Near Me
            </Text>
          </Pressable>

          {/* Active filter chips */}
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

      {/* Cafe list */}
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator
            color="#966A0C"
            size="large"
            style={styles.loadingIndicator}
          />
        ) : errorMessage ? (
          <Text style={styles.noResult}>{errorMessage}</Text>
        ) : !hasAnyFilter ? (
          // ← no filters selected state
          <ScrollView>
            <View style={styles.emptyState}>
              <MaterialIcons name="manage-search" size={44} color="#D2BA94" />
              <Text style={styles.emptyTitle}>Search or filter cafés</Text>
              <Text style={styles.emptySubtitle}>
                Use the search bar, tap Near Me, or apply filters to find cafés.
              </Text>
            </View>
            <DiscoverMore
              allCafes={allCafes}
              filteredCafes={[]}
              cardWidth={cardWidth}
            />
          </ScrollView>
        ) : (
          <FlatList
            data={filteredCafes}
            keyExtractor={(item) => item.id.toString()}
            numColumns={columns}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              !hasAnyFilter ? (
                <View style={styles.emptyState}>
                  <MaterialIcons
                    name="manage-search"
                    size={44}
                    color="#D2BA94"
                  />
                  <Text style={styles.emptyTitle}>Search or filter cafés</Text>
                  <Text style={styles.emptySubtitle}>
                    Use the search bar, tap Near Me, or apply filters to find
                    cafés.
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              filteredCafes.length > 0 ? (
                <DiscoverMore
                  allCafes={allCafes}
                  filteredCafes={[]}
                  cardWidth={cardWidth}
                />
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  navigation.navigate("CafeProfile", {
                    cafeId: String(item.id),
                  })
                }
                style={[styles.cardWrapper, { width: cardWidth }]}
              >
                <View style={styles.cafeHolder}>
                  {item.main_photo_url ? (
                    <Image
                      source={{ uri: item.main_photo_url }}
                      style={styles.cafeImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.cafeImageFallback}>
                      <MaterialIcons
                        name="local-cafe"
                        size={28}
                        color="#C8AA7A"
                      />
                    </View>
                  )}
                  <View style={styles.cafeTextWrapper}>
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
                </View>
              </Pressable>
            )}
            ListEmptyComponent={
              <View>
                <View style={styles.emptyState}>
                  <MaterialIcons
                    name={nearMeActive ? "location-off" : "search-off"}
                    size={44}
                    color="#D2BA94"
                  />
                  <Text style={styles.emptyTitle}>
                    {nearMeActive ? "No nearby cafés" : "No cafés found"}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {nearMeActive
                      ? "No cafés found within 5km of your location."
                      : "Try a different search or adjust your filters."}
                  </Text>
                </View>

                <DiscoverMore
                  allCafes={allCafes}
                  filteredCafes={[]}
                  cardWidth={cardWidth}
                />
              </View>
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
    height: 136,
    backgroundColor: "#FFFAF3",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#A97C4E",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 20,
  },
  cardWrapper: {
    margin: 8,
  },
  cafeImage: {
    width: "100%",
    flex: 1,
    backgroundColor: "#E9D6B9",
  },
  cafeImageFallback: {
    width: "100%",
    flex: 1,
    backgroundColor: "#E9D6B9",
    justifyContent: "center",
    alignItems: "center",
  },
  cafeTextWrapper: {
    paddingHorizontal: 8,
    paddingBottom: 6,
    paddingTop: 4,
  },
  cafeText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    fontFamily: "SourceSerifPro-Bold",
    padding: 5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  cafeName: {
    fontSize: 13,
    color: "#4B2C11",
    fontFamily: "SourceSerifPro-Bold",
    marginBottom: 0,
  },
  location: {
    fontSize: 12,
    color: "#E9D0A2",
    marginLeft: 2,
    fontFamily: "SourceSerifPro-Regular",
  },
  rating: {
    fontSize: 12,
    color: "#4B2C11",
    marginBottom: 0,
    fontFamily: "SourceSerifPro-Regular",
    marginLeft: 3,
    marginTop: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  noResult: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#4B2C11",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "SourceSerifPro-Bold",
    color: "#8C6D4F",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#B09070",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
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
    width: "100%",
    height: 79,
    shadowColor: "#0B0B0B",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 5,
  },
  shadow: {
    shadowColor: "#00000040",
    shadowOffset: { width: 0, height: 8 },
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
    fontFamily: "SourceSerifPro-Bold",
    color: "#A97C4E",
  },
  quickFilterTextActive: {
    color: "#FFFAF3",
  },

  discoverSection: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  discoverTitle: {
    fontSize: 18,
    fontFamily: "SourceSerifPro-Bold",
    marginBottom: 10,
    color: "#4B2C11",
  },
  discoverGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  discoverCardWrapper: {
    marginBottom: 12,
  },
});

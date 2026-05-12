import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { RootStackParamList } from "@/App";
import { getProfile } from "@/app/features/profile/services/profileService";
import { supabase } from "@/app/shared/lib/supabaseClient";
import TopBar from "@/components/TopBar";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Cafe,
  DASHBOARD_PAGE_SIZE,
  getDiscoverCafes,
  getFeaturedCafes,
  getUserLocation,
} from "../services/cafeService";

type NavProps = NativeStackNavigationProp<RootStackParamList, "Dashboard">;

const CEBU_CITIES = ["Cebu", "Mandaue", "Lapu-Lapu", "Talisay"];

export default function Dashboard() {
  const navigation = useNavigation<NavProps>();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.floor(
    Math.min(200, Math.max(160, (screenWidth - 40) / 2.3)),
  );
  const cardHeight = Math.round(cardWidth * 0.95);

  // --- State ---
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<any>(null);

  const [city, setCity] = useState("Cebu");
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Featured section state
  const [featuredCafes, setFeaturedCafes] = useState<Cafe[]>([]);
  const [featuredPage, setFeaturedPage] = useState(0);
  const [featuredHasMore, setFeaturedHasMore] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(false);

  const featuredCafes = allCafes.filter((c) => c.featured);
  const discoverCafes = allCafes.filter((c) => !c.featured);
  const [latestCafe, setLatestCafe] = useState<Cafe | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("cafe")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!error && data) setLatestCafe(data);
      } catch (err) {
        console.error("Failed to load latest cafe:", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;
        const data = await getProfile(session.user.id);
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    })();
  }, []);

  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const result = await getUserLocation();
      if (result) {
        // setCity(result.city);
        setUserCoords({
          latitude: result.latitude,
          longitude: result.longitude,
        });
      }
    })();
  }, []);

  useEffect(() => {
    setFeaturedPage(0);
    setFeaturedHasMore(true);
    setDiscoverPage(0);
    setDiscoverHasMore(true);
    fetchFeatured(0, true);
    fetchDiscover(0, true);
  }, [city]);

  // --- Functions ---
  async function fetchFeatured(pageNum: number, reset = false) {
    if (!reset && featuredLoading) return;
    setFeaturedLoading(true);
    try {
      const data = await getFeaturedCafes(city, pageNum);
      setFeaturedCafes((prev) => (reset ? data : [...prev, ...data]));
      setFeaturedHasMore(data.length === DASHBOARD_PAGE_SIZE);
      setFeaturedPage(pageNum);
    } catch (err) {
      console.error("Failed to load featured cafes:", err);
    } finally {
      setFeaturedLoading(false);
    }
  }

  async function fetchDiscover(pageNum: number, reset = false) {
    if (!reset && discoverLoading) return;
    setDiscoverLoading(true);
    try {
      const data = await getDiscoverCafes(city, pageNum);
      setDiscoverCafes((prev) => (reset ? data : [...prev, ...data]));
      setDiscoverHasMore(data.length === DASHBOARD_PAGE_SIZE);
      setDiscoverPage(pageNum);
    } catch (err) {
      console.error("Failed to load discover cafes:", err);
    } finally {
      setDiscoverLoading(false);
    }
  }

  function handleLoadMoreFeatured() {
    if (!featuredLoading && featuredHasMore) fetchFeatured(featuredPage + 1);
  }

  function handleLoadMoreDiscover() {
    if (!discoverLoading && discoverHasMore) fetchDiscover(discoverPage + 1);
  }

  const renderCafeCard = ({ item }: { item: Cafe }) => (
    <Pressable
      style={[styles.cafeHolder, { width: cardWidth, height: cardHeight }]}
      onPress={() => {
        navigation.navigate("CafeProfile", { cafeId: String(item.id) });
      }}
    >
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
      <View style={styles.cafeText}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cafeName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={7} color="#E9D0A2" />
            <Text style={styles.cafeLocation} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={12} color="#D4A017" />
          <Text style={styles.cafeRating}>
            {item.average_rating?.toFixed(1) ?? "New"}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <ImageBackground
      source={require("../../../../assets/images/bg1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <TopBar
        navigation={navigation}
        profilePicture={profile?.profile_picture}
      />

      {/* Location Bar */}
      <View style={styles.rectangle3}>
        <Text style={styles.locText1}>Location</Text>
        <Pressable
          onPress={() => setLocationModalVisible(true)}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Text style={styles.locText2}>{city} City, Cebu, Philippines</Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={18}
            color="#4B2C11"
            style={{ marginLeft: 6, marginTop: 4 }}
          />
        </Pressable>
        {/* Search Bar */}
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
                userCoords: userCoords ?? undefined,
              });
            }}
          />
          <Pressable
            onPress={() =>
              navigation.navigate("Filter", {
                query: search,
                city,
                userCoords: userCoords ?? undefined,
              })
            }
            hitSlop={10}
            style={styles.filterTrigger}
          >
            <MaterialIcons name="tune" size={22} color="#C8AA7A" />
          </Pressable>
        </View>
      </View>

      {/* Scrollable body
      <ScrollView
        style={{ flex: 1 }}
      </View> */}

      {/* Scrollable body */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.promo}
          onPress={() => {
            if (latestCafe) {
              navigation.navigate("CafeProfile", {
                cafeId: String(latestCafe.id),
              });
            }
          }}
        >
          {latestCafe?.main_photo_url ? (
            <Image
              source={{ uri: latestCafe.main_photo_url }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : null}

          {/* dark gradient overlay so text stays readable */}
          <View style={styles.promoOverlay} />

          {latestCafe && (
            <Text style={styles.promoName} numberOfLines={1}>
              {latestCafe.name}
            </Text>
          )}
          <Text style={styles.promoLabel}>Latest Café</Text>
        </Pressable>

        <Text style={styles.labelText}>Featured Cafés</Text>
        <View style={{ marginTop: 3 }}>
          {featuredLoading && featuredCafes.length === 0 ? (
            <ActivityIndicator color="#A97C4E" style={{ marginVertical: 16 }} />
          ) : featuredCafes.length > 0 ? (
            <FlatList
              data={featuredCafes}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `featured-${item.id}`}
              renderItem={renderCafeCard}
              style={{ marginTop: 3, marginBottom: 14 }}
              onEndReached={handleLoadMoreFeatured}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                featuredLoading ? (
                  <ActivityIndicator
                    color="#A97C4E"
                    style={{ marginHorizontal: 16, alignSelf: "center" }}
                  />
                ) : null
              }
            />
          ) : (
            <Text style={styles.emptyText}>No featured cafés yet.</Text>
          )}
        </View>

        <Text style={styles.labelText}>Discover More</Text>
        <View style={{ marginTop: 3 }}>
          {discoverLoading && discoverCafes.length === 0 ? (
            <ActivityIndicator color="#A97C4E" style={{ marginVertical: 16 }} />
          ) : discoverCafes.length > 0 ? (
            <FlatList
              data={discoverCafes}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `discover-${item.id}`}
              renderItem={renderCafeCard}
              style={{ marginTop: 3, marginBottom: 14 }}
              onEndReached={handleLoadMoreDiscover}
              onEndReachedThreshold={0.4}
              ListFooterComponent={
                discoverLoading ? (
                  <ActivityIndicator
                    color="#A97C4E"
                    style={{ marginHorizontal: 16, alignSelf: "center" }}
                  />
                ) : null
              }
            />
          ) : (
            <Text style={styles.emptyText}>No cafés to discover yet.</Text>
          )}
        </View>
      </ScrollView>

      {/* City Picker Modal */}
      <Modal
        visible={locationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLocationModalVisible(false)}
        >
          <Pressable style={styles.bottomSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select City</Text>
            <FlatList
              data={CEBU_CITIES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.cityItem}
                  onPress={() => {
                    setCity(item);
                    setLocationModalVisible(false);
                  }}
                >
                  <MaterialIcons name="location-on" size={16} color="#A97C4E" />
                  <Text style={styles.cityText}>{item}</Text>
                  {city === item && (
                    <MaterialIcons
                      name="check"
                      size={16}
                      color="#A97C4E"
                      style={{ marginLeft: "auto" }}
                    />
                  )}
                </Pressable>
              )}
            />
            <Pressable
              onPress={() => setLocationModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={{ color: "#FFF", fontWeight: "600" }}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ImageBackground>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3E6CF",
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  rectangle3: {
    backgroundColor: "#E9D6B9",
    width: "100%",
    height: 88,
    justifyContent: "center",
    paddingHorizontal: 25,
    marginBottom: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },

  locText1: {
    fontSize: 9,
    color: "#4B2C11",
    fontFamily: "SourceSerifPro-Regular",
    marginTop: 20,
  },

  locText2: {
    fontSize: 12,
    color: "#4B2C11",
    marginTop: 2,
    fontFamily: "SourceSerifPro-Bold",
  },

  searchBar: {
    backgroundColor: "#FFFAF3",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    height: 46,
    shadowColor: "#E9D6B9",
    shadowOffset: { width: 0, height: 4 },
    elevation: 20,
    paddingHorizontal: 10,
    marginTop: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#4B2C11",
    marginLeft: 8,
    fontFamily: "SourceSerifPro-Regular",
  },

  filterTrigger: {
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },

  promo: {
    width: "90%",
    height: 131,
    backgroundColor: "#966A0C",
    borderRadius: 8,
    marginVertical: 8,
    alignSelf: "center",
    marginTop: 15,
    position: "relative", // make container relative
    padding: 10,
  },

  promoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.30)",
    borderRadius: 8,
  },
  promoLabel: {
    position: "absolute",
    color: "#FFFAF3",
    left: 15,
    bottom: 10,
    fontSize: 15,
    fontFamily: "SourceSerifPro-Bold",
    letterSpacing: 1,
  },
  promoName: {
    position: "absolute",
    color: "#FFFAF3",
    top: 10,
    right: 13,
    fontSize: 18,
    fontFamily: "SourceSerifPro-Bold",
  },

  labelText: {
    color: "#4B2C11",
    fontSize: 18,
    marginLeft: 15,
    top: 5,
    fontFamily: "SourceSerifPro-Bold",
  },

  emptyText: {
    color: "#A97C4E",
    fontSize: 12,
    textAlign: "center",
    marginTop: 30,
    marginBottom: 40,
  },

  cafeHolder: {
    backgroundColor: "#FFFAF3",
    borderRadius: 10,
    margin: 10,
    alignItems: "flex-start",
    overflow: "hidden",
    shadowColor: "#A97C4E",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 20,
  },

  cafeText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    fontFamily: "SourceSerifPro-Bold",
    padding: 10,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  cafeName: {
    fontSize: 13,
    color: "#4B2C11",
    marginBottom: 0,
    fontFamily: "SourceSerifPro-Bold",
  },

  cafeLocation: {
    fontSize: 11,
    color: "#E9D0A2",
    fontWeight: "400",
    marginBottom: 0,
    marginLeft: 2,
    fontFamily: "SourceSerifPro-Regular",
  },

  cafeRating: {
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
  androidShadow: {
    elevation: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#FFFAF3",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#4B2C11",
  },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E9D6B9",
  },
  cityText: { marginLeft: 8, color: "#4B2C11", fontSize: 14, flex: 1 },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#A97C4E",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cafeImage: {
    width: "100%",
    height: 80,
    flex: 1,
    margin: 0,
    backgroundColor: "#E9D6B9",
  },
  cafeImageFallback: {
    width: "100%",
    flex: 1,
    backgroundColor: "#E9D6B9",
    justifyContent: "center",
    alignItems: "center",
  },

});

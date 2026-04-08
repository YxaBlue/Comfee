import { useEffect, useState } from "react";
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

import { RootStackParamList } from "@/App";
import { getProfile } from "@/app/features/profile/services/profileService";
import { supabase } from "@/app/shared/lib/supabaseClient";
import TopBar from "@/components/TopBar";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Location from "expo-location";
import {
  Cafe,
  getDiscoverCafes,
  getFeaturedCafes,
} from "./services/cafeService";

type NavProps = NativeStackNavigationProp<RootStackParamList, "Dashboard">;

function fakeRating(id: number): string {
  const rand = ((id * 9301 + 49297) % 233280) / 233280;
  return (3.5 + rand * 1.5).toFixed(1);
}

export default function CafeCard() {
  const navigation = useNavigation<NavProps>();

  // --- State ---
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [locationLabel, setLocationLabel] = useState("Detecting...");
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [featuredCafes, setFeaturedCafes] = useState<Cafe[]>([]);
  const [discoverCafes, setDiscoverCafes] = useState<Cafe[]>([]);
  const [cafesLoading, setCafesLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  }>();

  const filterOptions = [
    "Near Me",
    "Wifi",
    "Ambiance",
    "Quality",
    "Service",
    "Affordable",
  ];

  // --- Effects ---
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") throw new Error("Permission Denied");

        const loc = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setUserCoords(coords);

        const [place] = await Location.reverseGeocodeAsync(coords);
        setLocationLabel(
          place?.city
            ? `${place.city}, ${place.region ?? ""}`
            : "Cebu City, Philippines",
        );
      } catch {
        setLocationLabel("Cebu City, Philippines");
        setUserCoords({ latitude: 10.3157, longitude: 123.8854 });
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

  useEffect(() => {
    if (!userCoords) return;
    loadCafes();
  }, [userCoords]);

  // --- Functions ---
  async function loadCafes() {
    setCafesLoading(true);
    try {
      const [featured, discover] = await Promise.all([
        getFeaturedCafes(userCoords!, 10),
        getDiscoverCafes(userCoords!, 10),
      ]);
      setFeaturedCafes(featured ?? []);
      setDiscoverCafes(discover ?? []);
    } catch (err) {
      console.error("Failed to load cafes:", err);
    } finally {
      setCafesLoading(false);
    }
  }

  const renderCafeCard = ({ item }: { item: Cafe }) => (
    <View style={styles.cafeHolder}>
      <View style={{ flex: 1 }} />
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
        <Text style={styles.cafeRating}>{fakeRating(item.id)}</Text>
      </View>
    </View>
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
          <Text style={styles.locText2}>{locationLabel}</Text>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={18}
            color="#4B2C11"
            style={{ marginLeft: 6, marginTop: 4 }}
          />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, styles.androidShadow]}>
        <MaterialIcons name="search" size={24} color="#C8AA7A" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cafe"
          placeholderTextColor="#C8AA7A"
          value={search}
          onChangeText={(text) => setSearch(text)}
          onSubmitEditing={() => {
            if (search.length > 0) {
              navigation.navigate("Search", { query: search });
            }
          }}
        />
        <Pressable
          onPress={() => navigation.navigate("Filter" as never)}
          hitSlop={10}
          style={styles.filterTrigger}
        >
          <MaterialIcons name="tune" size={22} color="#C8AA7A" />
        </Pressable>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterHolder}>
        <FlatList
          data={filterOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => {
                console.log(
                  "Nav state:",
                  JSON.stringify(navigation.getState(), null, 2),
                );
                console.log(navigation.getState());
                setSelectedIndex(index);
                navigation.navigate("FilteredCafes", { filterType: item });
              }}
              style={[
                styles.filter,
                {
                  backgroundColor:
                    selectedIndex === index ? "#A97C4E" : "#E9D0A2",
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: selectedIndex === index ? "#FFFAF3" : "#A97C4E" },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Scrollable body */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.promo}>
          <Text style={styles.promoText}>Today's Special Promo</Text>
        </View>

        <Text style={styles.labelText}>Featured Cafés</Text>
        <View style={{ marginTop: 3 }}>
          {cafesLoading ? (
            <ActivityIndicator color="#A97C4E" style={{ marginVertical: 16 }} />
          ) : featuredCafes.length > 0 ? (
            <FlatList
              data={featuredCafes}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `featured-${item.id}`}
              renderItem={renderCafeCard}
              style={{ marginTop: 3, marginBottom: 14 }}
            />
          ) : (
            <Text style={styles.emptyText}>No featured cafés yet.</Text>
          )}
        </View>

        <Text style={styles.labelText}>Discover More</Text>
        <View style={{ marginTop: 3 }}>
          {cafesLoading ? (
            <ActivityIndicator color="#A97C4E" style={{ marginVertical: 16 }} />
          ) : discoverCafes.length > 0 ? (
            <FlatList
              data={discoverCafes}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `discover-${item.id}`}
              renderItem={renderCafeCard}
              style={{ marginTop: 3, marginBottom: 14 }}
            />
          ) : (
            <Text style={styles.emptyText}>No cafés to discover yet.</Text>
          )}
        </View>
      </ScrollView>

      {/* Location Modal */}
      {locationModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <Text style={styles.modalTitle}>Select Location</Text>
            <View style={styles.modalSearchBar}>
              <MaterialIcons name="search" size={20} color="#A97C4E" />
              <TextInput
                placeholder="Search address"
                placeholderTextColor="#C8AA7A"
                value={locationSearch}
                onChangeText={setLocationSearch}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>

            <FlatList
              data={suggestions}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.suggestionItem}
                  onPress={() => {
                    const coords = {
                      latitude: item.latitude,
                      longitude: item.longitude,
                    };
                    setUserCoords(coords);
                    setLocationLabel(item.description);
                    setLocationModalVisible(false);
                    setSuggestions([]);
                    setLocationSearch("");
                  }}
                >
                  <MaterialIcons name="location-on" size={16} color="#A97C4E" />
                  <Text style={styles.suggestionText}>
                    {item.latitude.toFixed(3)}, {item.longitude.toFixed(3)}
                  </Text>
                </Pressable>
              )}
            />

            <Pressable
              onPress={() => setLocationModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={{ color: "#FFF" }}>Close</Text>
            </Pressable>
          </View>
        </View>
      )}
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
  },

  locText1: {
    fontSize: 9,
    color: "#4B2C11",
  },

  locText2: {
    fontSize: 12,
    color: "#4B2C11",
    fontWeight: "bold",
    marginTop: 2,
  },

  searchBar: {
    position: "absolute",
    backgroundColor: "#FFFAF3",
    borderRadius: 15,
    top: 135,
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

  filterHolder: {
    marginTop: 15,
    paddingLeft: 10,
  },

  filter: {
    backgroundColor: "#E9D6B9",
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    height: 31,
  },

  filterText: {
    color: "#C8AA7A",
    fontWeight: "500",
    fontSize: 11,
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

  promoText: {
    position: "absolute",
    color: "#E9D6B9",
    fontWeight: "bold",
    bottom: 10,
    fontSize: 15,
    left: 15,
  },

  labelText: {
    color: "#4B2C11",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 15,
    top: 5,
  },

  emptyText: {
    color: "#A97C4E",
    fontSize: 12,
    marginLeft: 5,
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
    fontWeight: 600,
    marginBottom: 0,
  },

  cafeLocation: {
    fontSize: 7,
    color: "#E9D0A2",
    fontWeight: "400",
    marginBottom: 0,
    marginLeft: 2,
  },

  cafeRating: {
    fontSize: 12,
    color: "#4B2C11",
    marginBottom: 0,
    fontWeight: 400,
  },
  androidShadow: {
    elevation: 15,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#FFFAF3",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4B2C11",
  },
  modalSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E6CF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  suggestionText: { marginLeft: 8, color: "#4B2C11" },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#A97C4E",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
});

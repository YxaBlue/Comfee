import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Modal,
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
import { Cafe, getCafesByCity } from "./services/cafeService";

type NavProps = NativeStackNavigationProp<RootStackParamList, "Dashboard">;

const PAGE_SIZE = 10;

const CEBU_CITIES = ["Cebu", "Mandaue", "Lapu-Lapu", "Talisay"];

export default function CafeCard() {
  const navigation = useNavigation<NavProps>();

  // --- State ---
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<any>(null);

  const [city, setCity] = useState("Cebu");
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const [allCafes, setAllCafes] = useState<Cafe[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [cafesLoading, setCafesLoading] = useState(false);

  const featuredCafes = allCafes.filter((c) => c.featured);
  const discoverCafes = allCafes.filter((c) => !c.featured);

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
    fetchCafes(0, true);
  }, [city]);

  // --- Functions ---
  async function fetchCafes(pageNum: number, reset = false) {
    setCafesLoading(true);
    try {
      const data = await getCafesByCity(city, pageNum);
      setAllCafes((prev) => (reset ? data : [...prev, ...data]));
      setHasMore(data.length === PAGE_SIZE);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to load cafes:", err);
    } finally {
      setCafesLoading(false);
    }
  }

  function handleLoadMore() {
    if (!cafesLoading && hasMore) fetchCafes(page + 1);
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
        <Text style={styles.cafeRating}>{item.average_rating}</Text>
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
          <Text style={styles.locText2}>{city} City, Cebu, Philippines</Text>
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
            navigation.navigate("Search", { query: search, city });
          }}
        />
        <Pressable
          onPress={() => navigation.navigate("Filter", { query: search, city })}
          hitSlop={10}
          style={styles.filterTrigger}
        >
          <MaterialIcons name="tune" size={22} color="#C8AA7A" />
        </Pressable>
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
          {/* stopPropagation so tapping inside sheet doesn't close it */}
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
  },

  locText1: {
    fontSize: 9,
    color: "#4B2C11",
    fontFamily: "SourceSerifPro-Regular",
  },

  locText2: {
    fontSize: 12,
    color: "#4B2C11",
    fontWeight: "bold",
    marginTop: 2,
    fontFamily: "SourceSerifPro-Regular",
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

  promoText: {
    position: "absolute",
    color: "#E9D6B9",
    fontWeight: "bold",
    bottom: 10,
    fontSize: 15,
    left: 15,
    fontFamily: "SourceSerifPro-Regular",
  },

  labelText: {
    color: "#4B2C11",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 15,
    top: 5,
    fontFamily: "SourceSerifPro-Regular",
  },

  emptyText: {
    color: "#A97C4E",
    fontSize: 12,
    textAlign: "center",
    marginTop: 30,
    marginBottom: 40,
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
    fontFamily: "SourceSerifPro-Regular",
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
});

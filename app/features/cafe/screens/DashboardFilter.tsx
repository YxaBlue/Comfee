import { RootStackParamList } from "@/App";
import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
    FlatList,
    Image,
    ImageBackground,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
type FilteredRouteProp = RouteProp<RootStackParamList, "FilteredCafes">;
type NavProps = NativeStackNavigationProp<RootStackParamList>;

export default function FilteredCafes() {
  const route = useRoute<FilteredRouteProp>();
  const navigation = useNavigation<NavProps>();
  const { filterType } = route.params;
  const [search, setSearch] = useState("");
  const filter = [
    "Near Me",
    "Wifi",
    "Ambiance",
    "Quality",
    "Service",
    "Affordable",
  ];

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Sample cafes data
  const cafes = [
    { id: "1", name: "Ilya Rozy Cafe", location: "Mactan", rating: 4.5 },
    { id: "2", name: "Hollander Cafe", location: "Mactan", rating: 4.2 },
    { id: "3", name: "Café Lumière", location: "Lapu-Lapu", rating: 4.8 },
    // add more
  ];

  // Filter logic (example: for demo purposes, just return all)
  const filteredCafes = cafes.filter((cafe) =>
    cafe.name.toLowerCase().includes(filterType.toLowerCase()),
  );

  return (
    <ImageBackground
      source={require("../../../../assets/images/bg1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.rectangle1, styles.shadow, styles.androidShadow]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
            <Image
              source={require("../../../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Image
              source={require("../../../../assets/images/profileHolder1.png")}
              style={styles.profHolder}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rectangle3}>
        <Text style={styles.locText1}>Location</Text>
        <Text style={styles.locText2}>Montreal, Canada </Text>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={20}
          color="#4B2C11"
          style={{ marginLeft: 125, marginTop: 4 }}
        />
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

      <View style={styles.filterHolder}>
        <FlatList
          data={filter}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => {
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
                  {
                    color: selectedIndex === index ? "#FFFAF3" : "#A97C4E",
                  },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          )}
        ></FlatList>
      </View>

      <Text style={styles.title}>Cafés: {filterType}</Text>

      <View style={styles.container2}>
        <FlatList
          data={cafes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 10,
          }}
          renderItem={({ item }) => (
            <View style={styles.cafeHolder}>
              <View style={{ flex: 1 }} />
              <View style={styles.cafeText}>
                <View>
                  <Text style={styles.cafeName}>{item.name}</Text>
                  <View style={styles.locationRow}>
                    <MaterialIcons
                      name="location-on"
                      size={14}
                      color="#E9D0A2"
                    />
                    <Text style={styles.location}>{item.location}</Text>
                  </View>
                </View>
                <Text style={styles.rating}>{item.rating}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 5 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10, marginTop: 15 },
  container2: { flex: 1 },
  card: {
    padding: 5,
    backgroundColor: "#E9D6B9",
    marginBottom: 10,
    borderRadius: 8,
  },
  name: { fontWeight: "bold" },
  location: { fontSize: 12 },
  rating: { fontSize: 12 },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  rectangle1: {
    backgroundColor: "#E9D0A2",
    borderRadius: 0,
    padding: 0,
    marginBottom: 1,
    width: "100%",
    height: 79,
    shadowColor: "#0b0b0b",
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

  logo: {
    top: 15,
    width: 40,
    height: 40,
  },

  profHolder: {
    top: 15,
    width: 40,
    height: 40,
  },

  rectangle3: {
    backgroundColor: "#E9D6B9",
    borderRadius: 0,
    padding: 0,
    marginBottom: 20,
    width: "100%",
    height: 78,
  },

  locText1: {
    top: "25%",
    fontSize: 9,
    color: "#4B2C11",
    marginLeft: 25,
  },

  locText2: {
    top: "25%",
    fontSize: 12,
    color: "#4B2C11",
    marginLeft: 25,
    fontWeight: "bold",
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

  filter: {
    backgroundColor: "#E9D6B9",
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    height: 31,
  },

  filterHolder: {
    marginTop: 15,
    paddingLeft: 10,
  },

  filterText: {
    color: "#C8AA7A",
    fontWeight: "500",
    fontSize: 11,
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
    alignItems: "center", // vertically centers icon & text
    marginTop: 2, // optional spacing from name
  },

  cafeName: {
    fontSize: 11,
    color: "#4B2C11",
    fontWeight: 600,
    marginBottom: 0,
  },
});

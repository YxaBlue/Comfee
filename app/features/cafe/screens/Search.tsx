import { RootStackParamList } from "@/App";
import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type NavProps = NativeStackNavigationProp<RootStackParamList>;

type SearchScreenRouteProp = RouteProp<RootStackParamList, "Search">;

type Props = {
  route: SearchScreenRouteProp;
};

const cafes = [
  {
    id: "1",
    name: "Ilya Rozy Cafe",
    location: "Mactan, Lapu-Lapu City",
    rating: 4.5,
  },
  {
    id: "2",
    name: "Hollander Cafe",
    location: "Mactan, Lapu-Lapu City",
    rating: 4.2,
  },
  {
    id: "3",
    name: "Ilya Rozy Cafe",
    location: "Mactan, Lapu-Lapu City",
    rating: 4.8,
  },
  {
    id: "4",
    name: "Ilya Rozy Cafe",
    location: "Mactan, Lapu-Lapu City",
    rating: 4.6,
  },
  {
    id: "5",
    name: "Ilya Rozy Cafe",
    location: "Mactan, Lapu-Lapu City",
    rating: 4.7,
  },
];

export default function SearchScreen() {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<SearchScreenRouteProp>();
  const [search, setSearch] = useState("");

  // Use optional chaining to be safe
  const query = route.params?.query ?? ""; // default to empty string if undefined

  const filteredCafes = cafes.filter((cafe) =>
    cafe.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <ImageBackground
      source={require("../../../../assets/images/bg1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.rectangle1, styles.shadow, styles.androidShadow]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 8 }}
          >
            <MaterialIcons name="arrow-back" size={20} color="#4B2C11" />
          </TouchableOpacity>
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

      <View style={styles.container}>
        <FlatList
          data={filteredCafes}
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
        {filteredCafes.length === 0 && (
          <Text style={styles.noResult}>No cafes found.</Text>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    paddingTop: 50,
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
    fontWeight: 400,
  },

  noResult: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#4B2C11",
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
});

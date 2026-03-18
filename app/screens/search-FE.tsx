import React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView } from "react-native";

import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Search() {
  //sample data
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

  return (
    <ImageBackground
      source={require("../../assets/images/bg1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.rectangle1, styles.shadow, styles.androidShadow]}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Image
            source={require("../../assets/images/profileHolder1.png")}
            style={styles.profHolder}
            resizeMode="contain"
          />
        </View>
      </View>
      <View style={styles.rectangle3}></View>
      <View style={[styles.searchBar, styles.androidShadow]}>
        <MaterialIcons name="search" size={24} color="#C8AA7A" />
        <Text style={styles.searchText}>Search cafe</Text>

        <MaterialIcons name="tune" size={22} color="#C8AA7A" />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 3 }}>
          <FlatList
            data={cafes}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cafeHolder}>
                <View style={{ flex: 1 }} />

                <View style={styles.cafeText}>
                  <View>
                    <Text style={styles.cafeName}>{item.name}</Text>
                    <View style={styles.locationRow}>
                      <MaterialIcons
                        name="location-on"
                        size={7}
                        color="#E9D0A2"
                      />
                      <Text style={styles.location}>{item.location}</Text>
                    </View>
                  </View>
                  <Text style={styles.rating}> {item.rating}</Text>
                </View>
              </View>
            )}
          />
        </View>

        <View style={{ marginTop: 3 }}>
          <FlatList
            data={cafes}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.cafeHolder}>
                <View style={{ flex: 1 }} />

                <View style={styles.cafeText}>
                  <View>
                    <Text style={styles.cafeName}>{item.name}</Text>
                    <View style={styles.locationRow}>
                      <MaterialIcons
                        name="location-on"
                        size={7}
                        color="#E9D0A2"
                      />
                      <Text style={styles.location}>{item.location}</Text>
                    </View>
                  </View>
                  <Text style={styles.rating}> {item.rating}</Text>
                </View>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

//styles - format
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

  searchText: {
    fontSize: 13,
    color: "#C8AA7A",
    marginLeft: 5,
    flex: 1,
    marginRight: 8,
  },

  labelText: {
    color: "#4B2C11",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 15,
    top: 5,
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
});

import React from "react";

import { StyleSheet, Text, View } from "react-native";

export default function CafeCard() {
  return (
    <View style={styles.container}>
      <View style={styles.rectangle1}></View>

      <View style={styles.rectangle2}>
        <Text style={styles.locText1}>Location</Text>
        <Text style={styles.locText2}>Montreal, Canada </Text>
      </View>

      <View style={styles.searchBar}></View>
    </View>
  );
}

//styles - format
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3E6CF", // background color
  },

  rectangle1: {
    backgroundColor: "#DFC299", // rectangle color
    borderRadius: 0, // rounded corners
    padding: 0, // inner spacing
    marginBottom: 0, // spacing below rectangle
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 60,
  },

  rectangle2: {
    backgroundColor: "#E9D6B9", // rectangle color
    borderRadius: 0, // rounded corners
    padding: 0, // inner spacing
    marginBottom: 20, // spacing below rectangle
    justifyContent: "center",
    width: "100%",
    height: 80,
  },

  locText1: {
    fontSize: 12,
    color: "#4B2C11",
    marginLeft: 15,
  },

  locText2: {
    fontSize: 15,
    color: "#4B2C11",
    marginLeft: 15,
  },

  searchBar: {
    backgroundColor: "#FFFAF3", // rectangle color
    borderRadius: 15, // rounded corners
    marginBottom: 0, // spacing below rectangle
    justifyContent: "center",
    alignContent: "center",
    marginLeft: 70,
    marginRight: 0,
    width: "70%",
    height: 50,
  },
});

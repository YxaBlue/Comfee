import { RootStackParamList } from "@/App";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useBusinessProfile } from "../../../../hooks/useBusinessProfile";
import BusinessInfoTab from "./components/BusinessInfoTab";

type NavProps = NativeStackNavigationProp<RootStackParamList, "ProfileBusi">;

export default function BusinessProfile() {
  const navigation = useNavigation<NavProps>();
  const [activeTab, setActiveTab] = useState<"info" | "posts" | "reviews">(
    "info",
  );
  const { profile, loading, error } = useBusinessProfile();

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

      <ScrollView>
        <View style={styles.wrapper}>
          <View style={styles.coverPhoto}></View>
          <View style={styles.businessProf}></View>
          <View style={styles.infoHolder}>
            <Text style={styles.cafeName}>{profile?.name ?? "Loading..."}</Text>
            <View style={styles.locRow}>
              <MaterialIcons name="location-on" size={12} color="#8C6D4F" />
              <Text style={styles.cafeLoc}>{profile?.city ?? ""}</Text>
            </View>
          </View>
          <View style={styles.line}></View>

          <View style={styles.divider}></View>
          <View style={styles.navRow}>
            <TouchableOpacity onPress={() => setActiveTab("info")}>
              <MaterialIcons
                name="info"
                size={25}
                color={activeTab === "info" ? "#3B2A1A" : "#8C6D4F"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab("posts")}>
              <MaterialIcons
                name="article"
                size={25}
                color={activeTab === "posts" ? "#3B2A1A" : "#8C6D4F"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab("reviews")}>
              <MaterialIcons
                name="reviews"
                size={25}
                color={activeTab === "reviews" ? "#3B2A1A" : "#8C6D4F"}
              />
            </TouchableOpacity>
          </View>

          {/* Tab content */}
          {activeTab === "info" && (
            <BusinessInfoTab
              profile={profile}
              loading={loading}
              error={error}
            />
          )}
          {activeTab === "posts" && <Text>Posts coming soon</Text>}
          {activeTab === "reviews" && <Text>Reviews coming soon</Text>}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
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

  wrapper: {
    position: "relative",
  },

  coverPhoto: {
    height: 150,
    backgroundColor: "#FAF2E6",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,

    position: "absolute",
    top: 0,
    zIndex: 2,
  },

  divider: {
    height: 110,
    backgroundColor: "#E9D0A2",
    width: "100%",

    marginTop: 5, // pushes it down so overlap is visible
    zIndex: 1,
  },

  businessProf: {
    top: 100,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FAF2E6",
    marginLeft: 30,
    borderColor: "#E9D0A2",
    borderWidth: 1,
    zIndex: 3,
  },

  infoHolder: {
    position: "relative",
    zIndex: 4,
    marginLeft: 140,
    top: 60,
  },

  cafeName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
  },
  locRow: {
    flexDirection: "row",
  },
  cafeLoc: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
  },

  line: {
    height: 1,
    backgroundColor: "#030200",
    width: "96%",
    alignSelf: "center",
    top: 75,
    zIndex: 5,
  },

  navRow: {
    flexDirection: "row",
    zIndex: 6,
    marginLeft: 15,
    alignItems: "center",
    alignSelf: "center",
    gap: 150,
    marginTop: -32,
  },
});

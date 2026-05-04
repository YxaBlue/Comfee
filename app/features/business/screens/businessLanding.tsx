import { RootStackParamList } from "@/App";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type NavProps = NativeStackNavigationProp<RootStackParamList, "ProfileBusi">;

export default function BusinessProfile() {
  const navigation = useNavigation<NavProps>();

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

      <ScrollView></ScrollView>
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
  coverPhoto: {
    height: 150,
    backgroundColor: "#FAF2E6",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    borderRadius: 15,
    top: -110,
    position: "relative",
  },

  divider: {
    height: 100,
    backgroundColor: "#E9D0A2",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    top: 115,
    position: "relative",
  },

  profPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FAF2E6",
    position: "absolute",
    borderColor: "#E9D0A2",
    borderWidth: 2,
    left: "5%",
    top: "12%",
    elevation: 5,
    zIndex: 50,
  },

  name: {
    top: -5,
    fontSize: 24,
    left: "1%",
    fontWeight: "bold",
    color: "#4B2C11",
    fontFamily: "SanserifPro-Regular",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center", // vertically centers icon & text
    top: -70,
    left: "32%", // optional spacing from name
  },
  location: {
    fontSize: 12,
    color: "#4B2C11",
    fontWeight: "400",
    marginBottom: 0,
    left: "1%",
    fontFamily: "SanserifPro-Regular",
  },

  accessRow: {
    flexDirection: "row",
    alignItems: "center",
    left: 10,
    top: 45,
    gap: 5,
  },
  access: {
    width: 210,
    height: 35,
    backgroundColor: "#E9D6B9",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "SanserifPro-Regular",
    fontSize: 15,
    color: "#4B2C11",
  },

  postCont: {
    width: "90%",
    height: 248,
    backgroundColor: "#FFFAF3",
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
  },

  postDate: {
    fontSize: 12,
    fontFamily: "SanserifPro-Regular",
    color: "#4B2C11",
    fontWeight: 300,
    marginTop: 15,
    marginLeft: 20,
  },

  postCap: {
    fontSize: 18,
    fontFamily: "SanserifPro-Regular",
    color: "#4B2C11",
    fontWeight: 500,
    marginTop: 15,
    marginLeft: 20,
  },

  picCont: {
    flexDirection: "row",
    gap: 15,
  },

  postPic: {
    backgroundColor: "#FAF2E6",
    width: 210,
    height: 140,
    position: "relative",
    marginTop: 15,
    marginLeft: 20,
  },
});

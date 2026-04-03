import { RootStackParamList } from "@/App";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type NavProps = NativeStackNavigationProp<RootStackParamList, "ProfileBusi">;

export default function ProfileBusi() {
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

      <ScrollView
        contentContainerStyle={{}}
        showsVerticalScrollIndicator={false}
      >
        {/* Content of the profile screen goes here */}
        <View style={[styles.divider, styles.shadow, styles.androidShadow]}>
          <Text style={styles.name}>Hollanov Montreal</Text>

          <View style={styles.accessRow}>
            <View style={styles.access}>
              <Text style={styles.label}>Edit Profile</Text>
            </View>
            <View style={styles.access}>
              <Text style={styles.label}>Reviews</Text>
            </View>
          </View>
        </View>

        <View style={styles.coverPhoto} />

        <View style={[styles.profPhoto, styles.shadow, styles.androidShadow]} />

        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={12} color="#4B2C11" />
          <Text style={styles.location}>Montreal, Canada</Text>
        </View>

        <View style={styles.postCont}>
          <Text style={styles.postDate}>02/05/2026 11:30</Text>
          <Text style={styles.postCap}>Promo post caption caption</Text>
          <View style={styles.picCont}>
            <View style={styles.postPic}></View>
            <View style={styles.picCont2}>
              <View style={styles.postPic2}></View>
              <View style={styles.postPic2}></View>
            </View>
          </View>
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
  picCont2: {
    flexDirection: "column",
  },

  postPic: {
    backgroundColor: "#FAF2E6",
    width: 210,
    height: 140,
    position: "relative",
    marginTop: 15,
    marginLeft: 20,
  },
  postPic2: {
    backgroundColor: "#FAF2E6",
    width: 180,
    height: 63,
    position: "relative",
    marginTop: 15,
    marginRight: 20,
  },
});

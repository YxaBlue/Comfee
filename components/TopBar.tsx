import ProfileMenu, { ProfileMenuRoute } from "@/components/ui/ProfileMenu";
import { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TopBarProps = {
  navigation: any;
  profilePicture?: string;
};

export default function TopBar({ navigation, profilePicture }: TopBarProps) {
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View
      style={[
        styles.container,
        styles.shadow,
        styles.androidShadow,
        { paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <ProfileMenu
          visible={menuVisible}
          profilePicture={profilePicture}
          onToggle={() => setMenuVisible((prev) => !prev)}
          onClose={() => setMenuVisible(false)}
          onNavigate={(route: ProfileMenuRoute) => {
            setMenuVisible(false);
            navigation.navigate(route);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#E9D0A2",
    zIndex: 10,
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
    height: 69,
  },
  logo: {
    width: 40,
    height: 40,
  },
});

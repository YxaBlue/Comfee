import { signOut } from "@/app/features/auth/services/authService";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../../../../App";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Settings">;
};

type ActionOption = {
  label: string;
  destructive?: boolean;
};

const ACTION_OPTIONS: ActionOption[] = [
  { label: "Change Password" },
  { label: "Verify Account" },
  { label: "Ads Payment" },
  { label: "Delete My Account", destructive: true },
];

export default function SettingsScreen({ navigation }: Props) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const insets = useSafeAreaInsets();

  const handleOptionPress = (label: string) => {
    if (label === "Change Password") {
      navigation.navigate("ChangePassword");
      return;
    }

    handleComingSoon(label);
  };

  const handleComingSoon = (label: string) => {
    Alert.alert(label, "This setting is not connected yet.");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Failed to log out:", error);
      Alert.alert("Logout failed", "Please try again.");
    }
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 18,
            paddingBottom: 20,
          },
        ]}
      >
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 42,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.optionsList}>
          <View style={styles.optionCard}>
            <Text style={styles.optionText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#D8C7B0", true: "#6B3F18" }}
              thumbColor="#F7F3EC"
              ios_backgroundColor="#D8C7B0"
            />
          </View>

          {ACTION_OPTIONS.map(({ label, destructive }) => (
            <Pressable
              key={label}
              style={({ pressed }) => [
                styles.optionCard,
                pressed && styles.optionCardPressed,
              ]}
              onPress={() => handleOptionPress(label)}
            >
              <Text
                style={[
                  styles.optionText,
                  destructive && styles.destructiveOptionText,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.bottomNav]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <MaterialIcons name="person" size={28} color="#6B4F2E" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="home" size={28} color="#6B4F2E" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, styles.activeNavItem]}
          onPress={() => navigation.navigate("Settings")}
        >
          <MaterialIcons name="settings" size={26} color="#4A2A0D" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#EFE2CC",
  },
  header: {
    backgroundColor: "#E4C79E",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#7A5A37",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4A2A0D",
    letterSpacing: 0.3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    justifyContent: "space-between",
  },
  optionsList: {
    gap: 22,
  },
  optionCard: {
    minHeight: 78,
    backgroundColor: "#F3E2B8",
    borderRadius: 18,
    paddingHorizontal: 26,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#7A5A37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  optionCardPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.995 }],
  },
  optionText: {
    fontSize: 18,
    color: "#5A3720",
    fontWeight: "500",
  },
  destructiveOptionText: {
    color: "#71452A",
  },
  logoutButton: {
    alignSelf: "center",
    marginTop: 42,
    minWidth: 200,
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: "#5A3414",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5A3414",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: {
    fontSize: 19,
    fontWeight: "500",
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    backgroundColor: "#D4B896",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    minWidth: 48,
  },
  activeNavItem: {
    backgroundColor: "#EAD9BE",
    borderRadius: 999,
  },
});

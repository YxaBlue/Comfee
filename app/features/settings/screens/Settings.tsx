import { signOut } from "@/app/features/auth/services/authService";
import { getProfile } from "@/app/features/profile/services/profileService";
import { supabase } from "@/app/shared/lib/supabaseClient";
import TopBar from "@/components/navigation/TopBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
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
  { label: "Submit a Cafe" },
  { label: "Ads Payment" },
  { label: "Delete My Account", destructive: true },
];

export default function SettingsScreen({ navigation }: Props) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) return;

        const data = await getProfile(session.user.id);
        setProfile(data);
      } catch (error) {
        console.error("Failed to load settings profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleOptionPress = (label: string) => {
    if (label === "Change Password") {
      navigation.navigate("ChangePassword");
      return;
    }

    if (label === "Submit a Cafe") {
      navigation.navigate("SubmitCafe");
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
      <TopBar
        navigation={navigation}
        profilePicture={profile?.profile_picture}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 152,
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#EFE2CC",
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
    // shadowColor: "#7A5A37",
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
    fontFamily: "SourceSerifPro-Bold",
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
    fontFamily: "SourceSerifPro-Bold",
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },
});

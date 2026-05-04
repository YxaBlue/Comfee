import { RootStackParamList } from "@/App";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useCafePosts } from "@/hooks/useCafePosts";
import * as ImagePicker from "expo-image-picker";
import { useBusinessProfile } from "../../../../hooks/useBusinessProfile";
import AddPostModal from "./components/AddPostModal";
import BusinessInfoTab from "./components/BusinessInfoTab";
import PostsTab from "./components/PostsTab";

type NavProps = NativeStackNavigationProp<RootStackParamList, "ProfileBusi">;

export default function BusinessProfile() {
  const navigation = useNavigation<NavProps>();
  const [activeTab, setActiveTab] = useState<"info" | "posts" | "reviews">(
    "info",
  );
  const [isEditing, setIsEditing] = useState(false);
  const saveRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const [postModalVisible, setPostModalVisible] = useState(false);
  const { addPost } = useCafePosts(4); // ← hardcoded cafe ID for now

  const {
    profile,
    loading,
    error,
    updateProfile,
    updateAvatar,
    updateCoverPhoto,
  } = useBusinessProfile();

  // Add this handler:
  const handleAvatarEdit = async () => {
    console.log("Avatar tapped");

    // ✅ Skip Alert, go straight to picker
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    console.log("Result:", JSON.stringify(result));

    if (!result.canceled) {
      console.log("URI:", result.assets[0].uri);
      const { error } = await updateAvatar(result.assets[0].uri);
      console.log("Upload error:", error);
      if (error) Alert.alert("Upload failed", error);
    }
  };

  const handleCoverEdit = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9], // ← landscape ratio for cover
      quality: 0.8,
    });

    if (!result.canceled) {
      const { error } = await updateCoverPhoto(result.assets[0].uri);
      if (error) Alert.alert("Upload failed", error);
    }
  };

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
          <TouchableOpacity style={styles.coverPhoto} onPress={handleCoverEdit}>
            {profile?.main_photo_url ? (
              <Image
                key={profile.main_photo_url}
                source={{ uri: profile.main_photo_url }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <MaterialIcons name="add-a-photo" size={28} color="#8C6D4F" />
                <Text style={styles.coverPlaceholderText}>Add Cover Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.businessProf}
            onPress={handleAvatarEdit}
          >
            {profile?.avatar_url ? (
              <Image
                key={profile.avatar_url}
                source={{ uri: profile.avatar_url }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons name="store" size={40} color="#8C6D4F" />
            )}
            {/* Camera edit badge */}
            <View style={styles.avatarBadge}>
              <MaterialIcons name="camera-alt" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

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
              updateProfile={updateProfile}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              onSaveRef={(fn) => {
                saveRef.current = fn;
              }}
            />
          )}
          {activeTab === "posts" && <PostsTab />}
          {activeTab === "reviews" && <Text>Reviews coming soon</Text>}
        </View>
      </ScrollView>
      {activeTab === "info" &&
        (isEditing ? (
          <View style={styles.fabRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsEditing(false)}
            >
              <MaterialIcons name="close" size={20} color="#8C6D4F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => saveRef.current()}
            >
              <MaterialIcons name="check" size={20} color="#8C6D4F" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <MaterialIcons name="edit" size={20} color="#8C6D4F" />
          </TouchableOpacity>
        ))}

      {activeTab === "posts" && (
        <TouchableOpacity
          style={styles.addPost}
          onPress={() => setPostModalVisible(true)} // ← new state
        >
          <MaterialIcons name="add" size={25} color="#8C6D4F" />
        </TouchableOpacity>
      )}

      <AddPostModal
        visible={postModalVisible}
        onClose={() => setPostModalVisible(false)}
        onSubmit={addPost}
      />
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
    zIndex: 10,
    elevation: 10,
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
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#8C6D4F",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E9D0A2",
  },

  coverImage: {
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  coverPlaceholderText: {
    fontSize: 12,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
  },

  // ── FAB styles ──────────────────────────────────────────────────────
  editButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E9D0A2",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 30,
    right: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabRow: {
    flexDirection: "row",
    gap: 12,
    position: "absolute",
    bottom: 30,
    right: 20,
  },
  cancelButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f5dede",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  saveButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#d4edda",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addPost: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E9D0A2",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",

    bottom: 20,
    right: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

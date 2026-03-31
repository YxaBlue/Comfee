import { signOut } from "@/app/features/auth/services/authService";
import {
  editProfile,
  getProfile,
  uploadAvatar,
} from "@/app/features/profile/services/profileService";
import { supabase } from "@/app/shared/lib/supabaseClient";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format, parseISO } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../../../App";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Profile">;
};

type Tab = "info" | "reviews";

type Review = {
  id: string;
  cafeName: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
  imageCount: number;
};

type EditableFields = {
  username: string;
  first_name: string;
  last_name: string;
  age: string;
  birth_date: string;
  bio: string;
};

const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    cafeName: "CafeName13",
    rating: 2,
    comment: "Something about their cafe...",
    date: "07/03/2026 · 11AM",
    likes: 25,
    imageCount: 3,
  },
  {
    id: "2",
    cafeName: "CafeName123",
    rating: 1,
    comment: "Ew...",
    date: "07/01/2026 · 11AM",
    likes: 8,
    imageCount: 0,
  },
  {
    id: "3",
    cafeName: "Cloud Nine Café",
    rating: 5,
    comment: "Best cold brew I've ever had. The cozy interior is perfect!",
    date: "06/28/2026 · 3PM",
    likes: 41,
    imageCount: 2,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialIcons
          key={star}
          name={star <= rating ? "star" : "star-border"}
          size={15}
          color="#6B4F2E"
        />
      ))}
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewCardHeader}>
        <View style={styles.cafeAvatarSmall} />
        <View style={styles.reviewCardMeta}>
          <Text style={styles.reviewCafeName}>To {review.cafeName}</Text>
          <StarRating rating={review.rating} />
          <Text style={styles.reviewDate}>{review.date}</Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={18} color="#8C6D4F" />
        </TouchableOpacity>
      </View>

      <Text style={styles.reviewComment}>"{review.comment}"</Text>

      {review.imageCount > 0 && (
        <View style={styles.imageGrid}>
          {review.imageCount === 1 && (
            <View
              style={[styles.imagePlaceholder, { width: "100%", height: 90 }]}
            />
          )}
          {review.imageCount === 2 && (
            <>
              <View
                style={[styles.imagePlaceholder, { flex: 1, height: 80 }]}
              />
              <View
                style={[styles.imagePlaceholder, { flex: 1, height: 80 }]}
              />
            </>
          )}
          {review.imageCount >= 3 && (
            <>
              <View
                style={[styles.imagePlaceholder, { width: "48%", height: 90 }]}
              />
              <View style={{ width: "48%", gap: 6 }}>
                <View style={[styles.imagePlaceholder, { height: 42 }]} />
                <View style={[styles.imagePlaceholder, { height: 42 }]} />
              </View>
            </>
          )}
        </View>
      )}

      <View style={styles.likesRow}>
        <MaterialIcons name="thumb-up-off-alt" size={18} color="#8C6D4F" />
        <Text style={styles.likesCount}>{review.likes}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("reviews");
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<null | any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editFields, setEditFields] = useState<EditableFields>({
    username: "",
    first_name: "",
    last_name: "",
    age: "",
    birth_date: "",
    bio: "",
  });
  const [menuVisible, setMenuVisible] = useState(false);

  const TAB_ICONS: { key: Tab; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: "info", icon: "info-outline" },
    { key: "reviews", icon: "rate-review" },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigation.navigate("Login");
          return;
        }

        setUserId(user.id);
        const data = await getProfile(user.id);
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleEditPress = () => {
    setActiveTab("info");
    setFieldErrors({});
    setEditFields({
      username: profile?.username || "",
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      age: profile?.age?.toString() || "",
      birth_date: profile?.birth_date || "",
      bio: profile?.bio || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    setFieldErrors({});
    setIsSaving(true);
    try {
      await editProfile(
        {
          userId,
          username: editFields.username || profile?.username,
          first_name: editFields.first_name,
          last_name: editFields.last_name,
          age: editFields.age,
          birth_date: editFields.birth_date,
          bio: editFields.bio,
        },
        profile?.username,
      );
      setProfile((prev: any) => ({
        ...prev,
        ...editFields,
        age: editFields.age ? Number(editFields.age) : prev?.age,
      }));
      setIsEditing(false);
    } catch (err: any) {
      if (err?.firstName || err?.lastName || err?.username || err?.birthDate) {
        setFieldErrors(err);
      } else {
        console.error("Failed to save profile:", err);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFieldErrors({});
  };

  const handleTabPress = (key: Tab) => {
    if (isEditing) return;
    setActiveTab(key);
  };

  const handlePickAvatar = async () => {
    if (!userId) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        const url = await uploadAvatar(userId, result.assets[0].uri);
        setProfile((prev: any) => ({ ...prev, profile_picture: url }));
      } catch (err) {
        console.error("Failed to upload avatar:", err);
      }
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header band ── */}
        <View style={styles.headerBand}>
          {/* ── Tap anywhere to close menu ── */}
          {menuVisible && (
            <TouchableOpacity
              style={styles.menuOverlay}
              onPress={() => setMenuVisible(false)}
              activeOpacity={1}
            />
          )}

          {/* ── 3 dots button ── */}
          <TouchableOpacity
            style={styles.menuDots}
            onPress={() => setMenuVisible((prev) => !prev)}
          >
            <MaterialIcons name="more-vert" size={22} color="#6B4F2E" />
          </TouchableOpacity>

          {/* ── Dropdown box ── */}
          {menuVisible && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={async () => {
                  setMenuVisible(false);
                  await signOut();
                  navigation.navigate("Login");
                }}
              >
                <MaterialIcons name="logout" size={16} color="#6B4F2E" />
                <Text style={styles.dropdownText}>Log out</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              onPress={isEditing ? handlePickAvatar : undefined}
              activeOpacity={isEditing ? 0.7 : 1}
            >
              <View style={styles.avatarCircle}>
                {profile?.profile_picture ? (
                  <Image
                    key={profile.profile_picture}
                    source={{ uri: profile.profile_picture }}
                    style={{ width: "100%", height: "100%", borderRadius: 48 }}
                  />
                ) : (
                  <MaterialIcons name="person" size={52} color="#C8A97A" />
                )}
                {isEditing && (
                  <View style={styles.cameraBadge}>
                    <MaterialIcons name="photo-camera" size={12} color="#fff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── User info ── */}
        <View style={styles.userInfoSection}>
          <View style={styles.nameEditRow}>
            {isEditing ? (
              <TextInput
                style={styles.usernameInput}
                value={editFields.username}
                onChangeText={(v) =>
                  setEditFields((p) => ({ ...p, username: v }))
                }
                placeholder={profile?.username}
                placeholderTextColor="#B09070"
              />
            ) : (
              <Text style={styles.userName}>{profile?.username}</Text>
            )}
            {!isEditing && (
              <TouchableOpacity onPress={handleEditPress}>
                <MaterialIcons name="edit" size={16} color="#8C6D4F" />
              </TouchableOpacity>
            )}
          </View>
          {fieldErrors.username && (
            <Text style={styles.errorText}>{fieldErrors.username}</Text>
          )}
          <Text style={styles.joinedDate}>
            Joined since{" "}
            {profile?.joined_at
              ? format(parseISO(profile.joined_at), "MMMM dd, yyyy")
              : "Not available"}
          </Text>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Icon tab bar ── */}
        <View style={styles.tabBar}>
          {TAB_ICONS.map(({ key, icon }) => {
            const isLocked = isEditing && key === "reviews";
            return (
              <TouchableOpacity
                key={key}
                style={styles.tabBtn}
                onPress={() => handleTabPress(key)}
                disabled={isLocked}
              >
                <MaterialIcons
                  name={icon}
                  size={24}
                  color={
                    isLocked
                      ? "#D9C4AA"
                      : activeTab === key
                        ? "#6B4F2E"
                        : "#C4A882"
                  }
                />
                {activeTab === key && !isLocked && (
                  <View style={styles.tabUnderline} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Tab content ── */}
        <View style={styles.tabContent}>
          {/* REVIEWS */}
          {activeTab === "reviews" && (
            <View>
              {MOCK_REVIEWS.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="menu-book" size={44} color="#D2BA94" />
                  <Text style={styles.emptyText}>No reviews yet</Text>
                  <Text style={styles.emptySubText}>
                    Start exploring cafés and share your thoughts!
                  </Text>
                </View>
              ) : (
                MOCK_REVIEWS.map((r) => <ReviewCard key={r.id} review={r} />)
              )}
            </View>
          )}

          {/* INFO */}
          {activeTab === "info" && (
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>First Name</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.infoInput}
                      value={editFields.first_name}
                      onChangeText={(v) =>
                        setEditFields((p) => ({ ...p, first_name: v }))
                      }
                      placeholder="First name"
                      placeholderTextColor="#B09070"
                    />
                  ) : (
                    <View style={styles.infoValueBox}>
                      <Text style={styles.infoValue}>
                        {profile?.first_name}
                      </Text>
                    </View>
                  )}
                  {fieldErrors.firstName && (
                    <Text style={styles.errorText}>
                      {fieldErrors.firstName}
                    </Text>
                  )}
                </View>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Last Name</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.infoInput}
                      value={editFields.last_name}
                      onChangeText={(v) =>
                        setEditFields((p) => ({ ...p, last_name: v }))
                      }
                      placeholder="Last name"
                      placeholderTextColor="#B09070"
                    />
                  ) : (
                    <View style={styles.infoValueBox}>
                      <Text style={styles.infoValue}>{profile?.last_name}</Text>
                    </View>
                  )}
                  {fieldErrors.lastName && (
                    <Text style={styles.errorText}>{fieldErrors.lastName}</Text>
                  )}
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Age</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.infoInput}
                      value={editFields.age}
                      onChangeText={(v) =>
                        setEditFields((p) => ({ ...p, age: v }))
                      }
                      placeholder="Age"
                      placeholderTextColor="#B09070"
                      keyboardType="numeric"
                    />
                  ) : (
                    <View style={styles.infoValueBox}>
                      <Text style={styles.infoValue}>{profile?.age}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Birth Date</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.infoInput}
                      value={editFields.birth_date}
                      onChangeText={(v) =>
                        setEditFields((p) => ({ ...p, birth_date: v }))
                      }
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#B09070"
                    />
                  ) : (
                    <View style={styles.infoValueBox}>
                      <Text style={styles.infoValue}>
                        {profile?.birth_date
                          ? format(
                              parseISO(profile.birth_date),
                              "MMMM dd, yyyy",
                            )
                          : "Not available"}
                      </Text>
                    </View>
                  )}
                  {fieldErrors.birthDate && (
                    <Text style={styles.errorText}>
                      {fieldErrors.birthDate}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.infoField}>
                <Text style={styles.infoLabel}>Bio</Text>
                {isEditing ? (
                  <TextInput
                    style={[
                      styles.infoInput,
                      { minHeight: 80, textAlignVertical: "top" },
                    ]}
                    value={editFields.bio}
                    onChangeText={(v) =>
                      setEditFields((p) => ({ ...p, bio: v }))
                    }
                    placeholder="Tell us about yourself..."
                    placeholderTextColor="#B09070"
                    multiline
                  />
                ) : (
                  <View style={[styles.infoValueBox, { minHeight: 80 }]}>
                    <Text style={styles.infoValue}>{profile?.bio || ""}</Text>
                  </View>
                )}
              </View>

              {/* ── Save / Cancel buttons ── */}
              {isEditing && (
                <View style={styles.editActionsRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={handleCancel}
                    disabled={isSaving}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    <Text style={styles.saveBtnText}>
                      {isSaving ? "Saving..." : "Save"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ── Bottom nav ── */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <View style={styles.profileNavAvatar}>
            {profile?.profile_picture ? (
              <Image
                key={profile.profile_picture}
                source={{ uri: profile.profile_picture }}
                style={{ width: "100%", height: "100%", borderRadius: 48 }}
              />
            ) : (
              <MaterialIcons name="person" size={52} color="#C8A97A" />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Home" as never)}
        >
          <MaterialIcons name="home" size={28} color="#6B4F2E" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="settings" size={26} color="#6B4F2E" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#EDDEC7" },
  container: { flexGrow: 1, backgroundColor: "#EDDEC7" },

  /* Header */
  headerBand: {
    height: 160,
    backgroundColor: "#D4B896",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  menuDots: {
    position: "absolute",
    top: 12,
    right: 14,
  },
  avatarWrapper: {
    marginBottom: -46,
    marginLeft: 150,
  },
  avatarCircle: {
    width: 106,
    height: 106,
    borderRadius: 48,
    backgroundColor: "#E6D6BE",
    borderWidth: 3,
    borderColor: "#EDDEC7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#6B4F2E",
    borderRadius: 10,
    padding: 4,
  },

  /* User info */
  userInfoSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3B2A1A",
  },
  usernameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#3B2A1A",
    backgroundColor: "#FDF6EC",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: "#C8A97A",
  },
  joinedDate: {
    fontSize: 12,
    color: "#8C6D4F",
    marginTop: 2,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: "#D2BA94",
    marginHorizontal: 20,
    marginTop: 14,
  },

  /* Tab bar */
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    backgroundColor: "#EDDEC7",
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    position: "relative",
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: "#6B4F2E",
    borderRadius: 2,
  },

  /* Tab content */
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  /* Review card */
  reviewCard: {
    backgroundColor: "#E6D6BE",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  reviewCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  cafeAvatarSmall: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#D2BA94",
    flexShrink: 0,
  },
  reviewCardMeta: { flex: 1 },
  reviewCafeName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B2A1A",
  },
  starsRow: {
    flexDirection: "row",
    marginVertical: 2,
  },
  reviewDate: {
    fontSize: 10,
    color: "#A08060",
  },
  reviewComment: {
    fontSize: 12,
    color: "#5C3D1E",
    fontStyle: "italic",
    lineHeight: 18,
    marginBottom: 10,
  },

  /* Image grid */
  imageGrid: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  imagePlaceholder: {
    backgroundColor: "#D2BA94",
    borderRadius: 6,
  },

  /* Likes */
  likesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  likesCount: {
    fontSize: 13,
    color: "#8C6D4F",
    fontWeight: "500",
  },

  /* Info tab */
  infoSection: { gap: 12 },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A97C4E",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
  },
  infoField: { flex: 1, gap: 4 },
  infoValueBox: {
    backgroundColor: "#E6D6BE",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoValue: {
    fontSize: 13,
    color: "#3B2A1A",
  },
  infoInput: {
    backgroundColor: "#FDF6EC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#3B2A1A",
    borderWidth: 1.5,
    borderColor: "#C8A97A",
  },
  errorText: {
    fontSize: 11,
    color: "#C0392B",
    marginTop: 2,
    paddingHorizontal: 4,
  },

  /* Edit action buttons */
  editActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#E6D6BE",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C4A882",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8C6D4F",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#6B4F2E",
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FDF6EC",
  },

  /* Empty state */
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8C6D4F",
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 12,
    color: "#B09070",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 17,
  },

  /* Bottom nav */
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
    paddingBottom: 6,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  profileNavAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#A97C4E",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9,
  },
  dropdown: {
    position: "absolute",
    top: 38,
    right: 14,
    backgroundColor: "#FDF6EC",
    borderRadius: 10,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
    minWidth: 130,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: "#6B4F2E",
    fontWeight: "500",
  },
});

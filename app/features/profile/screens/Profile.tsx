import {
  editProfile,
  getProfile,
  uploadAvatar,
  uploadCoverPhoto,
} from "@/app/features/profile/services/profileService";
import { supabase } from "@/app/shared/lib/supabaseClient";
import TopBar from "@/components/TopBar";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format, parseISO } from "date-fns";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
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

type Tab = "info" | "favorites" | "reviews";

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
  birth_date: string;
  bio: string;
};

type FaveCafe = {
  id: string;
  cafeId: number | null;
  name: string;
  location: string;
};

const AVATAR_SIZE = 106;
const AVATAR_RIGHT_OFFSET = 20;
const USER_INFO_RIGHT_GUTTER = AVATAR_SIZE + AVATAR_RIGHT_OFFSET + 14;

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
    comment: "Ew... just no. The service was terrible and the",
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
          size={18}
          color="#6B4F2E"
        />
      ))}
    </View>
  );
}

function ReviewCard({
  review,
  openMenuId,
  setOpenMenuId,
  onDelete,
  onEdit,
}: {
  review: Review;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onDelete: (id: string) => void;
  onEdit: (review: Review) => void;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const hasImages = review.imageCount > 0;
  const displayedLikes = review.likes + (isLiked ? 1 : 0);
  const showMenu = openMenuId === review.id;

  return (
    <View style={styles.reviewCard}>
      {showMenu && (
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setOpenMenuId(null);
              onEdit(review);
            }}
          >
            <MaterialIcons name="edit" size={18} color="#6B4F2E" />
            <Text style={styles.menuText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onDelete(review.id)}
          >
            <MaterialIcons name="delete" size={18} color="#C0392B" />
            <Text style={[styles.menuText, { color: "#C0392B" }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.reviewCardHeader}>
        <View style={styles.reviewMainInfo}>
          <View style={styles.cafeAvatarSmall} />
          <View style={styles.reviewCardMeta}>
            <Text style={styles.reviewLabel}>Review For</Text>
            <Text style={styles.reviewCafeName}>{review.cafeName}</Text>
            <StarRating rating={review.rating} />
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.reviewMoreButton}
          onPress={() => setOpenMenuId(showMenu ? null : review.id)}
        >
          <MaterialIcons name="more-vert" size={22} color="#6B4F2E" />
        </TouchableOpacity>
      </View>

      <Text
        style={[
          styles.reviewComment,
          !hasImages && styles.reviewCommentWithoutMedia,
        ]}
      >
        {`"${review.comment}"`}
      </Text>

      {hasImages && (
        <View style={styles.reviewMediaSection}>
          <View style={styles.reviewMediaPlaceholder} />
          {review.imageCount > 1 && (
            <View style={styles.reviewMediaDots}>
              {Array.from({ length: Math.min(review.imageCount, 5) }).map(
                (_, index) => (
                  <View key={index} style={styles.reviewMediaDot} />
                ),
              )}
            </View>
          )}
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.likesRow,
          !hasImages && styles.likesRowWithoutMedia,
          pressed && styles.likesRowPressed,
        ]}
        onPress={() => setIsLiked((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={
          isLiked ? "Remove like from review" : "Like this review"
        }
      >
        <MaterialIcons
          name={isLiked ? "thumb-up" : "thumb-up-off-alt"}
          size={20}
          color="#6B4F2E"
        />
        <Text style={[styles.likesCount, isLiked && styles.likesCountActive]}>
          {displayedLikes}
        </Text>
      </Pressable>
    </View>
  );
}

function ProfileSkeleton() {
  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.headerBand,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#8C6D4F" />
      </View>
      <View style={{ padding: 20, gap: 10 }}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: "50%" }]} />
        <View style={[styles.skeletonLine, { width: "70%", marginTop: 20 }]} />
        <View style={[styles.skeletonLine, { width: "60%" }]} />
      </View>
    </View>
  );
}

function FaveCard({
  cafe,
  onRemove,
  isRemoving,
}: {
  cafe: FaveCafe;
  onRemove: (favoriteId: string) => void;
  isRemoving: boolean;
}) {
  return (
    <View style={styles.favoriteCard}>
      <View style={styles.favoriteImagePlaceholder} />
      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteName}>{cafe.name}</Text>
        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={16} color="#E9D0A2" />
          <Text style={styles.favoriteLocation}>{cafe.location}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onRemove(cafe.id)}
        disabled={isRemoving}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${cafe.name} from favorites`}
      >
        {isRemoving ? (
          <ActivityIndicator size="small" color="#6B4F2E" />
        ) : (
          <MaterialIcons name="favorite" size={20} color="#6B4F2E" />
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function ProfileScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("reviews");
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<null | any>(null);
  const [favoriteCafes, setFavoriteCafes] = useState<FaveCafe[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [removingFavoriteId, setRemovingFavoriteId] = useState<string | null>(
    null,
  );
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null);
  const [pendingCoverUri, setPendingCoverUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<EditableFields>({
    username: "",
    first_name: "",
    last_name: "",
    birth_date: "",
    bio: "",
  });

  // ── Review state ──
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [isReviewSaving, setIsReviewSaving] = useState(false);

  const TAB_ICONS: { key: Tab; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: "info", icon: "info-outline" },
    { key: "favorites", icon: "favorite-border" },
    { key: "reviews", icon: "rate-review" },
  ];

  const trimmedUsername = editFields.username.trim();
  const trimmedFirstName = editFields.first_name.trim();
  const trimmedLastName = editFields.last_name.trim();
  const trimmedBirthDate = editFields.birth_date.trim();
  const parsedBirthDate = trimmedBirthDate ? new Date(trimmedBirthDate) : null;
  const currentYear = new Date().getFullYear();
  const usernameError =
    isEditing && !trimmedUsername ? "Username is required." : "";
  const firstNameError =
    isEditing && !trimmedFirstName ? "First name is required." : "";
  const lastNameError =
    isEditing && !trimmedLastName ? "Last name is required." : "";
  const birthDateError = !isEditing
    ? ""
    : !trimmedBirthDate
      ? "Birth date is required."
      : !parsedBirthDate || isNaN(parsedBirthDate.getTime())
        ? "Birth date is invalid."
        : parsedBirthDate.getFullYear() < 1900 ||
            parsedBirthDate.getFullYear() > currentYear
          ? "Birth date is out of range."
          : "";
  const isSaveDisabled =
    isSaving ||
    Boolean(usernameError || firstNameError || lastNameError || birthDateError);

  const fetchFavoriteCafes = async (uid: string) => {
    setFavoritesLoading(true);
    try {
      const { data, error } = await supabase
        .from("favorite_cafes")
        .select(`id, cafe_id, cafe:cafe_id ( id, name, address, city )`)
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const favorites =
        data?.flatMap((favorite) => {
          const cafe = Array.isArray(favorite.cafe)
            ? favorite.cafe[0]
            : favorite.cafe;
          if (!cafe) return [];
          return [
            {
              id: String(favorite.id),
              cafeId: favorite.cafe_id,
              name: cafe.name,
              location: cafe.address || cafe.city || "Location unavailable",
            },
          ];
        }) ?? [];

      setFavoriteCafes(favorites);
    } catch (err) {
      console.error("Failed to fetch favorite cafes:", err);
      setFavoriteCafes([]);
    } finally {
      setFavoritesLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          navigation.navigate("Login");
          return;
        }

        const uid = session.user.id;
        setUserId(uid);

        const [data] = await Promise.all([
          getProfile(uid),
          supabase.auth.getUser(),
          fetchFavoriteCafes(uid),
        ]);

        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) return <ProfileSkeleton />;

  const handleEditPress = () => {
    setActiveTab("info");
    setFieldErrors({});
    setEditFields({
      username: profile?.username || "",
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      birth_date: profile?.birth_date || "",
      bio: profile?.bio || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    if (!trimmedUsername) {
      setFieldErrors((prev) => ({
        ...prev,
        username: "Username is required.",
      }));
      return;
    }
    setFieldErrors({});
    setIsSaving(true);
    try {
      // Upload any pending images first
      let newAvatarUrl = profile?.profile_picture ?? null;
      let newCoverUrl = profile?.cover_photo ?? null;

      if (pendingAvatarUri) {
        newAvatarUrl = await uploadAvatar(userId, pendingAvatarUri);
      }
      if (pendingCoverUri) {
        newCoverUrl = await uploadCoverPhoto(userId, pendingCoverUri);
      }

      await editProfile(
        {
          userId,
          username: trimmedUsername,
          first_name: editFields.first_name,
          last_name: editFields.last_name,
          birth_date: editFields.birth_date,
          bio: editFields.bio,
        },
        profile?.username,
      );

      setProfile((prev: any) => ({
        ...prev,
        ...editFields,
        username: trimmedUsername,
        profile_picture: newAvatarUrl,
        cover_photo: newCoverUrl,
      }));

      // clear pending URIs
      setPendingAvatarUri(null);
      setPendingCoverUri(null);
      setIsEditing(false);
    } catch (err: any) {
      if (err?.validationErrors) {
        setFieldErrors(err.validationErrors);
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
    setPendingAvatarUri(null); // ← discard
    setPendingCoverUri(null); // ← discard
  };

  const handleTabPress = (key: Tab) => {
    if (isEditing) return;
    setActiveTab(key);
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    const previousFavorites = favoriteCafes;
    setRemovingFavoriteId(favoriteId);
    setFavoriteCafes((prev) => prev.filter((cafe) => cafe.id !== favoriteId));
    try {
      const { error } = await supabase
        .from("favorite_cafes")
        .delete()
        .eq("id", Number(favoriteId));
      if (error) throw error;
    } catch (err) {
      console.error("Failed to remove favorite cafe:", err);
      setFavoriteCafes(previousFavorites);
    } finally {
      setRemovingFavoriteId(null);
    }
  };

  // ── Avatar picker (1:1 crop) ──
  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      selectionLimit: 1,
    });

    if (!result.canceled) {
      setPendingAvatarUri(result.assets[0].uri); // ← local preview only
    }
  };

  // ── Cover photo picker (16:9 crop) ──
  const handlePickCoverPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
      selectionLimit: 1,
    });

    if (!result.canceled) {
      setPendingCoverUri(result.assets[0].uri); // ← local preview only
    }
  };
  const handleDeleteReview = (reviewId: string) => {
    const previous = reviews;
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    setOpenMenuId(null);
    // No DB call yet — mock only
    // When ready: deleteReview(reviewId).catch(() => setReviews(previous));
  };

  const handleOpenEditReview = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleSaveReview = () => {
    if (!editingReview) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === editingReview.id
          ? { ...r, rating: editRating, comment: editComment }
          : r,
      ),
    );
    setEditingReview(null);
    // No DB call yet — mock only
    // When ready: editReview(editingReview.id, { rating: editRating, comment: editComment })
  };

  return (
    <ImageBackground
      source={require("../../../../assets/images/bg1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.wrapper}>
        <TopBar
          navigation={navigation}
          profilePicture={pendingAvatarUri ?? profile?.profile_picture}
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ── Header band (cover photo + avatar) ── */}
          <View style={styles.headerBand}>
            {/* Cover photo */}
            {profile?.cover_photo ? (
              <Image
                key={profile.cover_photo}
                source={{
                  uri: pendingCoverUri ?? profile?.cover_photo,
                  cache: "reload",
                }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: "#FAF2E6" },
                ]}
              />
            )}

            {/* Cover edit button — only in edit mode */}
            {isEditing && (
              <TouchableOpacity
                style={styles.coverEditBtn}
                onPress={handlePickCoverPhoto}
              >
                <MaterialIcons name="photo-camera" size={16} color="#fff" />
                <Text style={styles.coverEditText}>Edit Cover</Text>
              </TouchableOpacity>
            )}

            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <TouchableOpacity
                style={styles.avatarTouchTarget}
                onPress={isEditing ? handlePickAvatar : undefined}
                activeOpacity={isEditing ? 0.7 : 1}
              >
                <View style={styles.avatarCircle}>
                  {profile?.profile_picture ? (
                    <Image
                      key={profile.profile_picture}
                      source={{
                        uri: pendingAvatarUri ?? profile?.profile_picture,
                        cache: "reload",
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 63,
                      }}
                    />
                  ) : (
                    <MaterialIcons name="person" size={52} color="#C8A97A" />
                  )}
                </View>
                {isEditing && (
                  <View style={styles.cameraBadge}>
                    <MaterialIcons name="photo-camera" size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── User info ── */}
          <View style={styles.container}>
            <View style={styles.userInfoSection}>
              <View style={styles.nameEditRow}>
                {isEditing ? (
                  <TextInput
                    style={styles.usernameInput}
                    value={editFields.username}
                    onChangeText={(v) => {
                      setEditFields((p) => ({ ...p, username: v }));
                      setFieldErrors((prev) => {
                        if (!prev.username) return prev;
                        const next = { ...prev };
                        delete next.username;
                        return next;
                      });
                    }}
                    placeholder={profile?.username}
                    placeholderTextColor="#B09070"
                    autoCapitalize="none"
                    autoCorrect={false}
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
              {(fieldErrors.username || usernameError) && (
                <Text style={styles.errorText}>
                  {fieldErrors.username || usernameError}
                </Text>
              )}
              <Text style={styles.joinedDate}>
                Joined since{" "}
                {profile?.joined_at
                  ? format(parseISO(profile.joined_at), "MMMM dd, yyyy")
                  : "Not available"}
              </Text>
            </View>
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
              <Pressable onPress={() => setOpenMenuId(null)}>
                <View>
                  {MOCK_REVIEWS.length === 0 ? (
                    <View style={styles.emptyState}>
                      <MaterialIcons
                        name="menu-book"
                        size={44}
                        color="#D2BA94"
                      />
                      <Text style={styles.emptyText}>No reviews yet</Text>
                      <Text style={styles.emptySubText}>
                        Start exploring cafés and share your thoughts!
                      </Text>
                    </View>
                  ) : (
                    MOCK_REVIEWS.map((r) => (
                      <ReviewCard
                        key={r.id}
                        review={r}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        onDelete={handleDeleteReview}
                        onEdit={handleOpenEditReview}
                      />
                    ))
                  )}
                </View>
              </Pressable>
            )}

            {/* FAVORITES */}
            {activeTab === "favorites" && (
              <View>
                {favoritesLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#8C6D4F"
                    style={{ marginTop: 12 }}
                  />
                ) : favoriteCafes.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="favorite" size={44} color="#D2BA94" />
                    <Text style={styles.emptyText}>No favorites yet</Text>
                  </View>
                ) : (
                  favoriteCafes.map((cafe) => (
                    <FaveCard
                      key={cafe.id}
                      cafe={cafe}
                      onRemove={handleRemoveFavorite}
                      isRemoving={removingFavoriteId === cafe.id}
                    />
                  ))
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
                        onChangeText={(v) => {
                          setEditFields((p) => ({ ...p, first_name: v }));
                          setFieldErrors((prev) => {
                            if (!prev.firstName) return prev;
                            const next = { ...prev };
                            delete next.firstName;
                            return next;
                          });
                        }}
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
                    {(fieldErrors.firstName || firstNameError) && (
                      <Text style={styles.errorText}>
                        {fieldErrors.firstName || firstNameError}
                      </Text>
                    )}
                  </View>
                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>Last Name</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.infoInput}
                        value={editFields.last_name}
                        onChangeText={(v) => {
                          setEditFields((p) => ({ ...p, last_name: v }));
                          setFieldErrors((prev) => {
                            if (!prev.lastName) return prev;
                            const next = { ...prev };
                            delete next.lastName;
                            return next;
                          });
                        }}
                        placeholder="Last name"
                        placeholderTextColor="#B09070"
                      />
                    ) : (
                      <View style={styles.infoValueBox}>
                        <Text style={styles.infoValue}>
                          {profile?.last_name}
                        </Text>
                      </View>
                    )}
                    {(fieldErrors.lastName || lastNameError) && (
                      <Text style={styles.errorText}>
                        {fieldErrors.lastName || lastNameError}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>Age</Text>
                    <View style={styles.infoValueBox}>
                      <Text style={styles.infoValue}>{profile?.age}</Text>
                    </View>
                  </View>
                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>Birth Date</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.infoInput}
                        value={editFields.birth_date}
                        onChangeText={(v) => {
                          setEditFields((p) => ({ ...p, birth_date: v }));
                          setFieldErrors((prev) => {
                            if (!prev.birthDate) return prev;
                            const next = { ...prev };
                            delete next.birthDate;
                            return next;
                          });
                        }}
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
                    {(fieldErrors.birthDate || birthDateError) && (
                      <Text style={styles.errorText}>
                        {fieldErrors.birthDate || birthDateError}
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
                      style={[
                        styles.saveBtn,
                        isSaveDisabled && styles.saveBtnDisabled,
                      ]}
                      onPress={handleSave}
                      disabled={isSaveDisabled}
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
        {/* ── Review Edit Modal ── */}
        {editingReview && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Edit Review</Text>
              <Text style={styles.modalCafeName}>{editingReview.cafeName}</Text>

              {/* Star picker */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setEditRating(star)}
                  >
                    <MaterialIcons
                      name={star <= editRating ? "star" : "star-border"}
                      size={28}
                      color="#6B4F2E"
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Comment input */}
              <TextInput
                style={[
                  styles.infoInput,
                  {
                    minHeight: 80,
                    textAlignVertical: "top",
                    marginTop: 12,
                  },
                ]}
                value={editComment}
                onChangeText={setEditComment}
                placeholder="Write your review..."
                placeholderTextColor="#B09070"
                multiline
              />

              {/* Actions */}
              <View style={styles.editActionsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditingReview(null)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveReview}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#FFEFD5" },
  container: {
    height: 100,
    backgroundColor: "#E9D0A2",
    overflow: "visible",
    zIndex: 1,
  },
  skeletonLine: {
    height: 16,
    borderRadius: 8,
    backgroundColor: "#D4B896",
    width: "80%",
  },

  /* Header */
  headerBand: {
    height: 150,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    overflow: "visible",
    zIndex: 10,
    elevation: 10,
  },
  coverEditBtn: {
    position: "absolute",
    top: 10,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 30,
  },
  coverEditText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  avatarWrapper: {
    alignSelf: "flex-end",
    marginRight: 30,
    bottom: -60,
    zIndex: 20,
    position: "absolute",
    elevation: 10,
  },
  avatarTouchTarget: {
    position: "relative",
    overflow: "visible",
  },
  avatarCircle: {
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: "#E6D6BE",
    borderWidth: 3,
    borderColor: "#EDDEC7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cameraBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    backgroundColor: "#6B4F2E",
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: "#EDDEC7",
    zIndex: 1,
    elevation: 2,
  },

  /* User info */
  userInfoSection: {
    marginTop: 20,
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingRight: USER_INFO_RIGHT_GUTTER,
    minHeight: AVATAR_SIZE - 8,
  },
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    minWidth: 0,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3B2A1A",
    flexShrink: 1,
    fontFamily: "SourceSerifPro-Regular",
  },
  usernameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#3B2A1A",
    minWidth: 120,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#C8A97A",
    fontFamily: "SourceSerifPro-Regular",
  },
  joinedDate: {
    fontSize: 12,
    color: "#8C6D4F",
    marginTop: 2,
    paddingRight: 8,
    fontFamily: "SourceSerifPro-Regular",
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: "#D2BA94",
    marginHorizontal: 20,
    marginTop: -10,
    zIndex: 5,
  },

  /* Tab bar */
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    backgroundColor: "#E9D0A2",
    zIndex: 1,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
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
    backgroundColor: "#F6F0E8",
    borderRadius: 14,
    marginBottom: 13,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0E2D0",
  },
  reviewCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 13,
    paddingTop: 13,
  },
  reviewMainInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    flex: 1,
  },
  reviewCardMeta: {
    justifyContent: "center",
  },
  cafeAvatarSmall: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#F1E7DA",
    borderWidth: 1,
    borderColor: "#EADAC6",
  },
  reviewMoreButton: {
    alignSelf: "flex-start",
  },
  reviewLabel: {
    fontSize: 12,
    color: "#8C6D4F",
    marginBottom: 1,
    fontFamily: "SourceSerifPro-Regular",
  },
  reviewCafeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
  },
  starsRow: {
    flexDirection: "row",
    marginTop: 3,
    marginLeft: -2,
  },
  reviewDate: {
    fontSize: 10,
    color: "#A08060",
    marginTop: 1,
    fontFamily: "SourceSerifPro-Regular",
  },
  reviewComment: {
    fontSize: 14,
    color: "#5C3D1E",
    lineHeight: 19,
    marginTop: 16,
    marginBottom: 5,
    paddingHorizontal: 22,
  },
  reviewCommentWithoutMedia: {
    marginBottom: 0,
  },
  reviewMediaSection: {
    marginBottom: 2,
  },
  reviewMediaPlaceholder: {
    height: 184,
    backgroundColor: "#F3EADA",
    borderTopWidth: 1,
    borderTopColor: "#F1E6D7",
  },
  reviewMediaDots: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  reviewMediaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFF8ED",
  },
  likesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 13,
  },
  likesRowWithoutMedia: {
    paddingTop: 2,
  },
  likesRowPressed: {
    opacity: 0.7,
  },
  likesCount: {
    fontSize: 14,
    color: "#8C6D4F",
    fontWeight: "500",
    fontFamily: "SourceSerifPro-Regular",
  },
  likesCountActive: {
    color: "#6B4F2E",
  },

  /* Info tab */
  infoSection: { gap: 12 },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A97C4E",
    marginBottom: 4,
    fontFamily: "SourceSerifPro-Regular",
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
    fontFamily: "SourceSerifPro-Regular",
  },
  errorText: {
    fontSize: 11,
    color: "#C0392B",
    marginTop: 2,
    paddingHorizontal: 4,
    fontFamily: "SourceSerifPro-Regular",
  },
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
  saveBtnDisabled: {
    opacity: 0.6,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#8C6D4F",
    marginTop: 10,
    fontFamily: "SourceSerifPro-Regular",
  },
  emptySubText: {
    fontSize: 12,
    color: "#B09070",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 17,
    fontFamily: "SourceSerifPro-Regular",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  menuContainer: {
    position: "absolute",
    top: 40,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 6,
    width: 120,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuText: {
    fontSize: 14,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
  },

  /* Favorites tab */
  favoriteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFAF3",
    marginHorizontal: 10,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    height: 90,
  },
  favoriteImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#E5D3B3",
    marginRight: 12,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4E342E",
    fontFamily: "SourceSerifPro-Regular",
  },
  favoriteLocation: {
    fontSize: 14,
    color: "#8C6D4F",
    marginTop: 2,
    marginLeft: 2,
    fontFamily: "SourceSerifPro-Regular",
  },
  locationRow: {
    flexDirection: "row",
    marginTop: 3,
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

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },
  modalCard: {
    backgroundColor: "#FDF6EC",
    borderRadius: 16,
    padding: 20,
    width: "88%",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3B2A1A",
    marginBottom: 4,
    fontFamily: "SourceSerifPro-Regular",
  },
  modalCafeName: {
    fontSize: 13,
    color: "#8C6D4F",
    marginBottom: 12,
    fontFamily: "SourceSerifPro-Regular",
  },
});

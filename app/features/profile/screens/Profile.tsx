import {
  editProfile,
  getProfile,
  uploadAvatar,
  uploadCoverPhoto,
} from "@/app/features/profile/services/profileService";
import { supabase } from "@/app/shared/lib/supabaseClient";
import ReportModal from "@/app/shared/modals/reportModal";
import {
  deleteReview,
  editReview,
  formatReviewDate,
  getReviewsByUser,
  ProfileReview,
  toggleUpvote,
} from "@/app/shared/modals/reviewService";
import TopBar from "@/components/TopBar";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
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

// Use ProfileReview as the local Review type
type Review = ProfileReview;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Profile">;
};

type Tab = "info" | "favorites" | "reviews";

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
  mainPhotoUrl: string | null;
};

const AVATAR_SIZE = 106;
const AVATAR_RIGHT_OFFSET = 20;
const USER_INFO_RIGHT_GUTTER = AVATAR_SIZE + AVATAR_RIGHT_OFFSET + 14;

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => {
        const iconName =
          rating >= star
            ? "star"
            : rating >= star - 0.5
              ? "star-half"
              : "star-border";
        return (
          <MaterialIcons key={star} name={iconName} size={18} color="#6B4F2E" />
        );
      })}
    </View>
  );
}

function ReviewCard({
  review,
  isOwn,
  openMenuId,
  setOpenMenuId,
  onDelete,
  onEdit,
  onToggleLike,
  onReport,
  navigation,
}: {
  review: Review;
  isOwn: boolean;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onDelete: (id: string) => void;
  onEdit: (review: Review) => void;
  onToggleLike: (reviewId: string, currentlyLiked: boolean) => void;
  onReport: (review: Review) => void;
  navigation: NativeStackNavigationProp<RootStackParamList, "Profile">;
}) {
  const [cardWidth, setCardWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasImages = review.imageUrls.length > 0;
  const showMenu = openMenuId === review.id;

  const columns = cardWidth < 480 ? 1 : cardWidth < 800 ? 2 : 3;
  const gap = 6;
  const imageWidth =
    cardWidth > 0 ? Math.floor((cardWidth - gap * (columns - 1)) / columns) : 0;
  const imageHeight = Math.round(imageWidth * 0.68);
  const isNarrow = columns === 1;

  const displayDate = formatReviewDate(review.created_at, review.updated_at);

  const navigateToCafe = () =>
    navigation.navigate("CafeProfile", { cafeId: String(review.cafeId) });

  return (
    <View
      style={styles.reviewCard}
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
    >
      {showMenu && (
        <View style={styles.menuContainer}>
          {isOwn ? (
            <>
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
                onPress={() => {
                  setOpenMenuId(null);
                  onDelete(review.id);
                }}
              >
                <MaterialIcons name="delete" size={18} color="#C0392B" />
                <Text style={[styles.menuText, { color: "#C0392B" }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setOpenMenuId(null);
                onReport(review);
              }}
            >
              <MaterialIcons name="flag" size={18} color="#8C6D4F" />
              <Text style={[styles.menuText, { color: "#C0392B" }]}>
                Report
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Header ── */}
      <View style={styles.reviewCardHeader}>
        <TouchableOpacity onPress={navigateToCafe} activeOpacity={0.75}>
          <View style={styles.cafeAvatarSmall}>
            {review.cafeAvatar ? (
              <Image
                source={{ uri: review.cafeAvatar }}
                style={styles.cafeAvatarImage}
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons name="store" size={24} color="#C8A97A" />
            )}
          </View>
        </TouchableOpacity>

        {/* ✅ Meta is a plain View; nothing is tappable */}
        <View style={styles.reviewCardMeta}>
          <Text style={styles.reviewLabel}>Review For</Text>
          <Text style={styles.reviewCafeName}>{review.cafeName}</Text>
          {/* Stars and date: plain Text, NOT tappable */}
          <StarRating rating={review.rating} />
          <Text style={styles.reviewDate}>{displayDate}</Text>
        </View>

        {/* Three-dot menu */}
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

      {hasImages && cardWidth > 0 && (
        <View style={styles.reviewMediaWrapper}>
          {isNarrow ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const index = Math.round(
                    e.nativeEvent.contentOffset.x / cardWidth,
                  );
                  setActiveIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {review.imageUrls.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={{ width: cardWidth, height: imageHeight }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              {review.imageUrls.length > 1 && (
                <View style={styles.dotsRow}>
                  {review.imageUrls.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        i === activeIndex && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[styles.imageGrid, { gap }]}>
              {review.imageUrls.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={{
                    width: imageWidth,
                    height: imageHeight,
                    borderRadius: 8,
                  }}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}
        </View>
      )}

      <View
        style={[styles.likesRow, !hasImages && styles.likesRowWithoutMedia]}
      >
        <Pressable
          onPress={() => onToggleLike(review.id, review.isLiked)}
          accessibilityRole="button"
          accessibilityLabel={
            review.isLiked ? "Remove like from review" : "Like this review"
          }
          style={({ pressed }) => [pressed && styles.likesRowPressed]}
        >
          <MaterialIcons
            name={review.isLiked ? "thumb-up" : "thumb-up-off-alt"}
            size={20}
            color={review.isLiked ? "#6B4F2E" : "#8C6D4F"}
          />
        </Pressable>
        <Text
          style={[styles.likesCount, review.isLiked && styles.likesCountActive]}
        >
          {review.likes}
        </Text>
      </View>
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
  navigation,
}: {
  cafe: FaveCafe;
  readonly?: boolean;
  navigation: NativeStackNavigationProp<RootStackParamList, "Profile">;
}) {
  const navigateToCafe = () => {
    if (cafe.cafeId)
      navigation.navigate("CafeProfile", { cafeId: String(cafe.cafeId) });
  };

  return (
    <View style={styles.favoriteCard}>
      <TouchableOpacity
        onPress={navigateToCafe}
        activeOpacity={0.85}
        style={styles.favoritePhotoWrapper}
      >
        {cafe.mainPhotoUrl ? (
          <Image
            source={{ uri: cafe.mainPhotoUrl }}
            style={styles.favoritePhoto}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.favoritePhoto, styles.favoritePhotoFallback]}>
            <MaterialIcons name="local-cafe" size={28} color="#C8A97A" />
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteName}>{cafe.name}</Text>
        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={14} color="#A97C4E" />
          <Text style={styles.favoriteLocation}>{cafe.location}</Text>
        </View>
      </View>
    </View>
  );
}

export default function ProfileScreen({ navigation }: Props) {
  const route = useRoute();
  const params = (route.params as { userId?: string } | undefined) ?? {};

  const [activeTab, setActiveTab] = useState<Tab>("reviews");
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [viewedUserId, setViewedUserId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  const [profile, setProfile] = useState<null | any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<null | any>(
    null,
  );
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

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [pendingEditImages, setPendingEditImages] = useState<string[]>([]);

  const [reportTarget, setReportTarget] = useState<Review | null>(null);
  const [reportUserTarget, setReportUserTarget] = useState<{
    userId: string;
    username: string;
  } | null>(null);

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
        .select(
          `id, cafe_id, cafe:cafe_id ( id, name, address, city, main_photo_url )`,
        )
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
              mainPhotoUrl: cafe.main_photo_url ?? null,
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

  const fetchReviews = async (userId: string, currentUserId?: string) => {
    setReviewsLoading(true);
    try {
      const data = await getReviewsByUser(userId, currentUserId);
      setReviews(data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setReviewsLoading(false);
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
        setSessionUserId(uid);
        const targetId =
          params.userId && params.userId !== uid ? params.userId : uid;
        setViewedUserId(targetId);
        setIsOwnProfile(targetId === uid);

        const profilePromises = [getProfile(targetId)];
        if (targetId !== uid) profilePromises.push(getProfile(uid));

        const [viewedProfile, currentUserProfileData] = await Promise.all([
          ...profilePromises,
          fetchFavoriteCafes(targetId),
          fetchReviews(targetId, uid),
        ]);

        setProfile(viewedProfile);
        if (currentUserProfileData)
          setCurrentUserProfile(currentUserProfileData);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [params.userId]);

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
    if (!viewedUserId) return;
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
      let newAvatarUrl = profile?.profile_picture ?? null;
      let newCoverUrl = profile?.cover_photo ?? null;

      if (pendingAvatarUri === null && profile?.profile_picture) {
        const avatarPath = `avatars/${viewedUserId}.${profile.profile_picture.split(".").pop()?.split("?")[0] || "jpg"}`;
        await supabase.storage.from("profile").remove([avatarPath]);
        newAvatarUrl = null;
      } else if (pendingAvatarUri) {
        newAvatarUrl = await uploadAvatar(viewedUserId, pendingAvatarUri);
      }

      if (pendingCoverUri === null && profile?.cover_photo) {
        const coverPath = `cover_photos/${viewedUserId}.${profile.cover_photo.split(".").pop()?.split("?")[0] || "jpg"}`;
        await supabase.storage.from("profile").remove([coverPath]);
        newCoverUrl = null;
      } else if (pendingCoverUri) {
        newCoverUrl = await uploadCoverPhoto(viewedUserId, pendingCoverUri);
      }

      await editProfile(
        {
          userId: viewedUserId,
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
      setPendingAvatarUri(null);
      setPendingCoverUri(null);
      setIsEditing(false);
    } catch (err: any) {
      if (err?.validationErrors) setFieldErrors(err.validationErrors);
      else console.error("Failed to save profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFieldErrors({});
    setPendingAvatarUri(null);
    setPendingCoverUri(null);
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
    if (!result.canceled) setPendingAvatarUri(result.assets[0].uri);
  };

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
    if (!result.canceled) setPendingCoverUri(result.assets[0].uri);
  };

  const handlePickEditImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const remaining = 5 - pendingEditImages.length;
    if (remaining <= 0) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: remaining,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setPendingEditImages((prev) => [...prev, ...newUris].slice(0, 5));
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    const previous = reviews;
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    setOpenMenuId(null);
    deleteReview(reviewId).catch(() => setReviews(previous));
  };

  const handleToggleReviewLike = async (
    reviewId: string,
    currentlyLiked: boolean,
  ) => {
    if (!sessionUserId) return;
    const previousReviews = reviews;
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              isLiked: !currentlyLiked,
              likes: review.likes + (currentlyLiked ? -1 : 1),
            }
          : review,
      ),
    );
    try {
      await toggleUpvote(reviewId, sessionUserId);
    } catch (err) {
      console.error("Failed to update review upvote:", err);
      setReviews(previousReviews);
    }
  };

  const handleOpenEditReview = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setPendingEditImages(review.imageUrls);
  };

  const handleSaveReview = async () => {
    if (!editingReview || !sessionUserId || !viewedUserId) return;
    const previous = reviews;
    const existingUrls = pendingEditImages.filter((uri) =>
      uri.startsWith("http"),
    );
    const newLocalUris = pendingEditImages.filter(
      (uri) => !uri.startsWith("http"),
    );
    const removedUrls = editingReview.imageUrls.filter(
      (url) => !existingUrls.includes(url),
    );

    if (removedUrls.length > 0) {
      await Promise.all(
        removedUrls.map(async (url: string) => {
          const filename = url.split("/").pop()?.split("?")[0];
          if (filename)
            await supabase.storage
              .from("posts")
              .remove([`reviews/${filename}`]);
        }),
      );
    }

    setEditingReview(null);

    try {
      const uploadedUrls = await Promise.all(
        newLocalUris.map(async (uri) => {
          const ext = uri.split(".").pop()?.split("?")[0] ?? "jpg";
          const filename = `${editingReview.id}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
          const path = `reviews/${filename}`;
          const response = await fetch(uri);
          const blob = await response.blob();
          const { error } = await supabase.storage
            .from("posts")
            .upload(path, blob, { upsert: false, contentType: `image/${ext}` });
          if (error) throw error;
          const { data } = supabase.storage.from("posts").getPublicUrl(path);
          return `${data.publicUrl}?t=${Date.now()}`;
        }),
      );

      const finalUrls = [...existingUrls, ...uploadedUrls];
      await editReview(editingReview.id, {
        rating: editRating,
        comment: editComment,
        images_url: finalUrls,
      });

      // ✅ Re-fetch so dates come from DB via formatReviewDate — no manual string construction
      await fetchReviews(viewedUserId, sessionUserId);
    } catch (err) {
      console.error("Failed to save review:", err);
      setReviews(previous);
    }
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
          profilePicture={
            currentUserProfile?.profile_picture ?? profile?.profile_picture
          }
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ── Header band ── */}
          <View style={styles.headerBand}>
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

            {isEditing && isOwnProfile && (
              <View style={styles.coverEditRow}>
                <TouchableOpacity
                  style={styles.coverEditBtn}
                  onPress={handlePickCoverPhoto}
                >
                  <MaterialIcons name="photo-camera" size={16} color="#fff" />
                  <Text style={styles.coverEditText}>Edit Cover</Text>
                </TouchableOpacity>
                {(pendingCoverUri !== null || profile?.cover_photo) && (
                  <TouchableOpacity
                    style={[styles.coverEditBtn, styles.removeBtn]}
                    onPress={() => setPendingCoverUri(null)}
                  >
                    <MaterialIcons name="delete" size={16} color="#fff" />
                    <Text style={styles.coverEditText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {!isEditing && !isOwnProfile && (
              <View style={styles.coverEditRow}>
                <TouchableOpacity
                  style={styles.coverReportBtn}
                  onPress={() =>
                    setReportUserTarget({
                      userId: viewedUserId!,
                      username: profile?.username ?? "User",
                    })
                  }
                >
                  <MaterialIcons name="flag" size={16} color="#C0392B" />
                  <Text style={styles.coverReportText}>Report</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.avatarWrapper}>
              <TouchableOpacity
                style={styles.avatarTouchTarget}
                onPress={
                  isEditing && isOwnProfile ? handlePickAvatar : undefined
                }
                activeOpacity={isEditing && isOwnProfile ? 0.7 : 1}
              >
                <View style={styles.avatarCircle}>
                  {profile?.profile_picture ? (
                    <Image
                      key={profile.profile_picture}
                      source={{
                        uri: pendingAvatarUri ?? profile?.profile_picture,
                        cache: "reload",
                      }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <MaterialIcons name="person" size={52} color="#C8A97A" />
                  )}
                </View>
                {isEditing && isOwnProfile && (
                  <View style={styles.avatarEditRow}>
                    <TouchableOpacity
                      style={styles.avatarEditBtn}
                      onPress={handlePickAvatar}
                    >
                      <MaterialIcons
                        name="photo-camera"
                        size={12}
                        color="#fff"
                      />
                    </TouchableOpacity>
                    {profile?.profile_picture && (
                      <TouchableOpacity
                        style={[styles.avatarEditBtn, styles.removeBtn]}
                        onPress={() => setPendingAvatarUri(null)}
                      >
                        <MaterialIcons name="delete" size={12} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ── User info ── */}
          <View style={styles.container}>
            <View style={styles.userInfoSection}>
              <View style={styles.nameEditRow}>
                {isEditing && isOwnProfile ? (
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
                {isOwnProfile && (
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

          <View style={styles.divider} />

          {/* ── Tab bar ── */}
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
            {activeTab === "reviews" && (
              <Pressable onPress={() => setOpenMenuId(null)}>
                <View>
                  {reviewsLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="#8C6D4F"
                      style={{ marginTop: 12 }}
                    />
                  ) : reviews.length === 0 ? (
                    <View style={styles.emptyState}>
                      <MaterialIcons
                        name="menu-book"
                        size={44}
                        color="#D2BA94"
                      />
                      <Text style={styles.emptyText}>No reviews yet</Text>
                      <Text style={styles.emptySubText}>
                        {isOwnProfile
                          ? "Start exploring cafés and share your thoughts!"
                          : "This user hasn't reviewed any cafés yet."}
                      </Text>
                    </View>
                  ) : (
                    reviews.map((r) => (
                      <ReviewCard
                        key={r.id}
                        review={r}
                        isOwn={isOwnProfile}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        onDelete={handleDeleteReview}
                        onEdit={handleOpenEditReview}
                        onToggleLike={handleToggleReviewLike}
                        onReport={(rev) => setReportTarget(rev)}
                        navigation={navigation}
                      />
                    ))
                  )}
                </View>
              </Pressable>
            )}

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
                      navigation={navigation}
                    />
                  ))
                )}
              </View>
            )}

            {activeTab === "info" && (
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>First Name</Text>
                    {isEditing && isOwnProfile ? (
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
                    {isEditing && isOwnProfile ? (
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
                    {isEditing && isOwnProfile ? (
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
                  {isEditing && isOwnProfile ? (
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

                {isEditing && isOwnProfile && (
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
        {editingReview && isOwnProfile && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Edit Review</Text>
              <Text style={styles.modalCafeName}>{editingReview.cafeName}</Text>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const iconName =
                    editRating >= star
                      ? "star"
                      : editRating >= star - 0.5
                        ? "star-half"
                        : "star-border";
                  return (
                    <Pressable
                      key={star}
                      onPressIn={(event) => {
                        const { locationX } = event.nativeEvent;
                        setEditRating(locationX < 14 ? star - 0.5 : star);
                      }}
                      style={styles.starPressable}
                    >
                      <MaterialIcons
                        name={iconName}
                        size={28}
                        color="#6B4F2E"
                      />
                    </Pressable>
                  );
                })}
              </View>

              <TextInput
                style={[
                  styles.infoInput,
                  { minHeight: 80, textAlignVertical: "top", marginTop: 12 },
                ]}
                value={editComment}
                onChangeText={setEditComment}
                placeholder="Write your review..."
                placeholderTextColor="#B09070"
                multiline
              />

              <Text
                style={[styles.infoLabel, { marginTop: 14, marginBottom: 8 }]}
              >
                {`Photos (${pendingEditImages.length}/5)`}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.editImagesRow}>
                  {pendingEditImages.map((uri, index) => (
                    <View key={index} style={styles.editImageThumb}>
                      <Image
                        source={{ uri }}
                        style={styles.editImageThumbImg}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.editImageRemoveBtn}
                        onPress={() =>
                          setPendingEditImages((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <MaterialIcons name="close" size={12} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {pendingEditImages.length < 5 && (
                    <TouchableOpacity
                      style={styles.editImageAddBtn}
                      onPress={handlePickEditImages}
                    >
                      <MaterialIcons
                        name="add-photo-alternate"
                        size={28}
                        color="#A97C4E"
                      />
                      <Text style={styles.editImageAddText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>

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

        <ReportModal
          visible={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetType="review"
          targetId={reportTarget ? reportTarget.id : ""}
          targetLabel={
            reportTarget ? `review for ${reportTarget.cafeName}` : undefined
          }
        />

        <ReportModal
          visible={!!reportUserTarget}
          onClose={() => setReportUserTarget(null)}
          targetType="user"
          targetId={reportUserTarget ? reportUserTarget.userId : ""}
          targetLabel={
            reportUserTarget ? `@${reportUserTarget.username}` : undefined
          }
        />
      </View>
    </ImageBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  headerBand: {
    height: 150,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    overflow: "visible",
    zIndex: 10,
    elevation: 10,
  },
  coverEditRow: {
    position: "absolute",
    top: 10,
    right: 12,
    flexDirection: "row",
    gap: 8,
    zIndex: 30,
  },
  coverEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coverEditText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  coverReportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coverReportText: { color: "#c83535", fontSize: 12, fontWeight: "600" },
  removeBtn: { backgroundColor: "rgba(192,57,43,0.8)" },
  avatarWrapper: {
    alignSelf: "flex-end",
    marginRight: 30,
    bottom: -60,
    zIndex: 20,
    position: "absolute",
    elevation: 10,
  },
  avatarTouchTarget: { position: "relative", overflow: "visible" },
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
  avatarImage: { width: "100%", height: "100%", borderRadius: 63 },
  avatarEditRow: {
    position: "absolute",
    right: 2,
    bottom: 2,
    flexDirection: "row",
    gap: 4,
    zIndex: 1,
    elevation: 2,
  },
  avatarEditBtn: {
    backgroundColor: "#6B4F2E",
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: "#EDDEC7",
  },
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
  divider: {
    height: 1,
    backgroundColor: "#D2BA94",
    marginHorizontal: 20,
    marginTop: -10,
    zIndex: 5,
  },
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
  tabContent: { paddingHorizontal: 16, paddingTop: 14 },
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
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 13,
    paddingTop: 13,
    paddingBottom: 4,
  },
  reviewCardMeta: { justifyContent: "center", flex: 1 },
  cafeAvatarSmall: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#F1E7DA",
    borderWidth: 1,
    borderColor: "#EADAC6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  cafeAvatarImage: { width: "100%", height: "100%", borderRadius: 33 },
  reviewMoreButton: { alignSelf: "flex-start", paddingTop: 2 },
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
  starsRow: { flexDirection: "row", marginTop: 3, marginLeft: -2 },
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
  reviewCommentWithoutMedia: { marginBottom: 0 },
  likesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 13,
  },
  likesRowWithoutMedia: { paddingTop: 2 },
  likesRowPressed: { opacity: 0.7 },
  likesCount: {
    fontSize: 14,
    color: "#8C6D4F",
    fontWeight: "500",
    fontFamily: "SourceSerifPro-Regular",
  },
  likesCountActive: { color: "#6B4F2E" },
  infoSection: { gap: 12 },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A97C4E",
    marginBottom: 4,
    fontFamily: "SourceSerifPro-Regular",
  },
  infoRow: { flexDirection: "row", gap: 10 },
  infoField: { flex: 1, gap: 4 },
  infoValueBox: {
    backgroundColor: "#E6D6BE",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoValue: { fontSize: 13, color: "#3B2A1A" },
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
  editActionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#E6D6BE",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C4A882",
  },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: "#8C6D4F" },
  saveBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#6B4F2E",
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 14, fontWeight: "600", color: "#FDF6EC" },
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
  background: { flex: 1, width: "100%", height: "100%" },
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
  favoriteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFAF3",
    marginHorizontal: 4,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ECD9BE",
    shadowColor: "#8C6D4F",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  favoritePhotoWrapper: {
    width: 90,
    height: 90,
    flexShrink: 0,
  },
  favoritePhoto: {
    width: 90,
    height: 90,
  },
  favoritePhotoFallback: {
    backgroundColor: "#ECD9BE",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteInfo: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 3,
  },
  favoriteName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
    flexWrap: "wrap",
  },
  favoriteLocation: {
    fontSize: 12,
    color: "#8C6D4F",
    marginLeft: 2,
    fontFamily: "SourceSerifPro-Regular",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  removeFromFavBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#FAE9E7",
  },
  removeFromFavText: {
    fontSize: 11,
    color: "#C0392B",
    fontWeight: "600",
    fontFamily: "SourceSerifPro-Regular",
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
  editImagesRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  editImageThumbImg: { width: "100%", height: "100%" },
  editImageRemoveBtn: {
    position: "absolute",
    top: 3,
    right: 3,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
    padding: 3,
  },
  editImageAddBtn: {
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#C8A97A",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDF6EC",
    gap: 2,
  },
  editImageAddText: {
    fontSize: 11,
    color: "#A97C4E",
    fontFamily: "SourceSerifPro-Regular",
  },
  reviewMediaWrapper: { overflow: "hidden" },
  imageGrid: { flexDirection: "row", flexWrap: "wrap", padding: 8 },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
  },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#C8A97A" },
  dotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6B4F2E",
  },
  editImageThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  starPressable: { padding: 2 },
});

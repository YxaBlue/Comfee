import { RootStackParamList } from "@/App";
import ReportModal from "@/app/shared/modals/reportModal"; // ← adjust path to match your project
import TopBar from "@/components/TopBar";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "@/app/shared/lib/supabaseClient";
import { useRoute } from "@react-navigation/native";
import {
  deleteReview,
  getReviewsByCafe,
  ReviewWithMeta,
  toggleCafeReviewUpvote,
} from "../../../shared/modals/reviewService";
import { getProfile } from "../../profile/services/profileService";
import { CafeDetail, getCafeById } from "../services/cafeService";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CafeProfile">;
};

type Tab = "Cafe-Info" | "Cafe-Reviews" | "Cafe-Posts" | "Cafe-Ammenities-Menu";

type Post = {
  id: string;
  caption: string;
  dateCreated: string;
  imageURL: string[];
  likes: number;
};

type CafeProfileInformation = {
  name: string;
  address: string;
  email: string;
  phone: string;
  avatarURL: any;
  coverPhotoURL: any;
  menuURLs: any;
  averageRating: number;
  reviewCount: number;
  favoritesCount: number;
  openingTime: string;
  closingTime: string;
  openingDays: string[];
};

type Amenities = {
  freeWifi: boolean;
  powerOutlets: boolean;
  parking: boolean;
  insideSeating: boolean;
  outsideSeating: boolean;
  music: boolean;
  light: string;
  petFriendly: string;
  others: string[];
  imageURLs: [];
};

const MOCK_AMENITIES: Amenities = {
  freeWifi: true,
  powerOutlets: true,
  parking: true,
  insideSeating: true,
  outsideSeating: false,
  music: true,
  light: "Well Lit",
  petFriendly: "Not Pet Friendly",
  others: ["Coworking Space", "Board Games"],
  imageURLs: [],
};

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    caption:
      "New arrivals just in time for the weekend — our Ube Latte and Honey Calamansi Cold Brew. Come try them before they're gone! ☕",
    dateCreated: "2026-02-10",
    imageURL: [
      "https://picsum.photos/300/200",
      "https://picsum.photos/301/200",
      "https://picsum.photos/302/200",
    ],
    likes: 83,
  },
  {
    id: "2",
    caption:
      "We're open this Saturday until 8 PM! Stop by for your afternoon coffee fix. 🌤️",
    dateCreated: "2026-01-28",
    imageURL: ["https://picsum.photos/303/200"],
    likes: 34,
  },
];

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const DAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

// ─── Star Rating (display only) ───────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const name =
          rating >= star
            ? "star"
            : rating >= star - 0.5
              ? "star-half"
              : "star-border";
        return (
          <MaterialIcons key={star} name={name} size={13} color="#C8863A" />
        );
      })}
    </View>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  isOwn,
  onToggleLike,
  onReport,
  onEdit,
  onDelete,
  onNavigateToProfile,
}: {
  review: ReviewWithMeta;
  isOwn: boolean;
  onToggleLike: (id: number, currentlyLiked: boolean) => void;
  onReport: (review: ReviewWithMeta) => void;
  onEdit?: (review: ReviewWithMeta) => void;
  onDelete?: (id: number) => void;
  onNavigateToProfile: (userId: string) => void;
}) {
  const [cardWidth, setCardWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const images = review.images_url ?? [];
  const hasImages = images.length > 0;
  const isEdited = review.updated_at !== null;

  const columns = cardWidth < 480 ? 1 : cardWidth < 800 ? 2 : 3;
  const gap = 6;
  const imageWidth =
    cardWidth > 0 ? Math.floor((cardWidth - gap * (columns - 1)) / columns) : 0;
  const imageHeight = Math.round(imageWidth * 0.68);
  const isNarrow = columns === 1;

  const displayDate = new Date(
    isEdited && review.updated_at ? review.updated_at : review.created_at,
  ).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const openMenu = () => {
    setMenuOpen(true);
    Animated.spring(menuAnim, {
      toValue: 1,
      damping: 18,
      stiffness: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => setMenuOpen(false));
  };

  const menuScale = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <View
      style={reviewCardStyles.container}
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
    >
      {/* Header */}
      <View style={reviewCardStyles.header}>
        {/* Avatar — tappable to navigate to profile */}
        <TouchableOpacity
          onPress={() =>
            review.user_id ? onNavigateToProfile(review.user_id) : undefined
          }
          disabled={!review.user_id}
          activeOpacity={0.75}
        >
          <View style={reviewCardStyles.avatar}>
            {review.profile?.profile_picture ? (
              <Image
                source={{ uri: review.profile.profile_picture }}
                style={{ width: "100%", height: "100%", borderRadius: 17 }}
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons name="person" size={20} color="#C8A97A" />
            )}
          </View>
        </TouchableOpacity>

        <View style={reviewCardStyles.meta}>
          {/* Username — also tappable */}
          <TouchableOpacity
            onPress={() =>
              review.user_id ? onNavigateToProfile(review.user_id) : undefined
            }
            disabled={!review.user_id}
            activeOpacity={0.75}
          >
            <Text style={reviewCardStyles.userName}>
              {review.profile?.username ?? "Anonymous"}
              {isOwn && <Text style={reviewCardStyles.youBadge}> (you)</Text>}
            </Text>
          </TouchableOpacity>
          <StarRating rating={review.rating} />
          <Text style={reviewCardStyles.date}>
            {displayDate}
            {isEdited ? " (edited)" : ""}
          </Text>
        </View>

        {/* Three-dot menu */}
        <View>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={menuOpen ? closeMenu : openMenu}
          >
            <MaterialIcons name="more-vert" size={18} color="#8C6D4F" />
          </TouchableOpacity>

          {menuOpen && (
            <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
          )}
          {menuOpen && (
            <Animated.View
              style={[
                reviewCardStyles.dropdownMenu,
                {
                  opacity: menuAnim,
                  transform: [{ scale: menuScale }],
                },
              ]}
            >
              {isOwn ? (
                <>
                  <TouchableOpacity
                    style={reviewCardStyles.dropdownItem}
                    onPress={() => {
                      closeMenu();
                      onEdit?.(review);
                    }}
                  >
                    <MaterialIcons name="edit" size={15} color="#6B4F2E" />
                    <Text style={reviewCardStyles.dropdownItemText}>Edit</Text>
                  </TouchableOpacity>
                  <View style={reviewCardStyles.dropdownDivider} />
                  <TouchableOpacity
                    style={reviewCardStyles.dropdownItem}
                    onPress={() => {
                      closeMenu();
                      onDelete?.(review.id);
                    }}
                  >
                    <MaterialIcons name="delete" size={15} color="#C0392B" />
                    <Text
                      style={[
                        reviewCardStyles.dropdownItemText,
                        { color: "#C0392B" },
                      ]}
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={reviewCardStyles.dropdownItem}
                  onPress={() => {
                    closeMenu();
                    onReport(review);
                  }}
                >
                  <MaterialIcons name="flag" size={15} color="#C0392B" />
                  <Text
                    style={[
                      reviewCardStyles.dropdownItemText,
                      { color: "#C0392B" },
                    ]}
                  >
                    Report
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </View>
      </View>

      {/* Comment */}
      {review.comment ? (
        <Text style={reviewCardStyles.comment}>"{review.comment}"</Text>
      ) : null}

      {/* Images */}
      {hasImages && cardWidth > 0 && (
        <View style={reviewCardStyles.mediaWrapper}>
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
                {images.map((uri, i) => (
                  <Image
                    key={i}
                    source={{ uri }}
                    style={{ width: cardWidth, height: imageHeight }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View style={reviewCardStyles.dotsRow}>
                  {images.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        reviewCardStyles.dot,
                        i === activeIndex && reviewCardStyles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[reviewCardStyles.imageGrid, { gap }]}>
              {images.map((uri, i) => (
                <Image
                  key={i}
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

      {/* Likes — filled icon when current user already liked */}
      <Pressable
        style={({ pressed }) => [
          reviewCardStyles.likesRow,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => onToggleLike(review.id, review.isLiked)}
        accessibilityRole="button"
        accessibilityLabel={review.isLiked ? "Remove like" : "Like review"}
      >
        <MaterialIcons
          name={review.isLiked ? "thumb-up" : "thumb-up-off-alt"}
          size={16}
          color={review.isLiked ? "#6B4F2E" : "#8C6D4F"}
        />
        <Text
          style={[
            reviewCardStyles.likesCount,
            review.isLiked && reviewCardStyles.likesCountActive,
          ]}
        >
          {review.likes}
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  const imageCount = post.imageURL.length;
  return (
    <View style={postCardStyles.container}>
      {imageCount === 1 && (
        <Image
          source={{ uri: post.imageURL[0] }}
          style={postCardStyles.imageSingle}
          resizeMode="cover"
        />
      )}
      {imageCount === 2 && (
        <View style={postCardStyles.imageRow}>
          {post.imageURL.map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              style={postCardStyles.imageHalf}
              resizeMode="cover"
            />
          ))}
        </View>
      )}
      {imageCount >= 3 && (
        <View style={postCardStyles.imageGrid3}>
          <Image
            source={{ uri: post.imageURL[0] }}
            style={postCardStyles.imageGrid3Main}
            resizeMode="cover"
          />
          <View style={postCardStyles.imageGrid3Sub}>
            <Image
              source={{ uri: post.imageURL[1] }}
              style={postCardStyles.imageGrid3SubItem}
              resizeMode="cover"
            />
            <View style={{ position: "relative" }}>
              <Image
                source={{ uri: post.imageURL[2] }}
                style={[
                  postCardStyles.imageGrid3SubItem,
                  imageCount > 3 && { opacity: 0.4 },
                ]}
                resizeMode="cover"
              />
              {imageCount > 3 && (
                <View style={postCardStyles.moreOverlay}>
                  <Text style={postCardStyles.moreText}>+{imageCount - 3}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
      <View style={postCardStyles.body}>
        <Text style={postCardStyles.caption}>{post.caption}</Text>
        <View style={postCardStyles.footer}>
          <Text style={postCardStyles.date}>
            {new Date(post.dateCreated).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          <View style={postCardStyles.likesRow}>
            <MaterialIcons name="thumb-up-off-alt" size={16} color="#8C6D4F" />
            <Text style={postCardStyles.likesCount}>{post.likes}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Info Tab ─────────────────────────────────────────────────────────────────

function CafeInfoTab({ cafe }: { cafe: CafeProfileInformation }) {
  return (
    <View>
      <View style={infoStyles.statsRow}>
        <View style={infoStyles.statCard}>
          <Text style={infoStyles.statNum}>
            {cafe.averageRating.toFixed(1)}
          </Text>
          <Text style={infoStyles.statLabel}>Rating</Text>
        </View>
        <View style={infoStyles.statCard}>
          <Text style={infoStyles.statNum}>{cafe.reviewCount}</Text>
          <Text style={infoStyles.statLabel}>Reviews</Text>
        </View>
        <View style={infoStyles.statCard}>
          <Text style={infoStyles.statNum}>{cafe.favoritesCount}</Text>
          <Text style={infoStyles.statLabel}>Favorites</Text>
        </View>
      </View>

      <Text style={infoStyles.sectionLabel}>Hours</Text>
      <View style={infoStyles.infoRow}>
        <MaterialIcons name="access-time" size={15} color="#8C6D4F" />
        <View>
          <Text style={infoStyles.infoText}>
            {cafe.openingTime} – {cafe.closingTime}
          </Text>
          <Text style={infoStyles.infoSubText}>
            Open {cafe.openingDays.length} days a week
          </Text>
        </View>
      </View>
      <View style={infoStyles.daysRow}>
        {ALL_DAYS.map((day) => {
          const isOpen = cafe.openingDays.includes(day);
          return (
            <View
              key={day}
              style={[infoStyles.dayPill, !isOpen && infoStyles.dayPillClosed]}
            >
              <Text
                style={[
                  infoStyles.dayPillText,
                  !isOpen && infoStyles.dayPillTextClosed,
                ]}
              >
                {DAY_SHORT[day]}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={[infoStyles.sectionLabel, { marginTop: 16 }]}>Contact</Text>
      <View style={infoStyles.infoRow}>
        <MaterialIcons name="phone" size={15} color="#8C6D4F" />
        <Text style={infoStyles.infoText}>{cafe.phone}</Text>
      </View>
      <View style={infoStyles.infoRow}>
        <MaterialIcons name="email" size={15} color="#8C6D4F" />
        <Text style={infoStyles.infoText}>{cafe.email}</Text>
      </View>
      <View style={infoStyles.infoRow}>
        <MaterialIcons name="place" size={15} color="#8C6D4F" />
        <Text style={[infoStyles.infoText, { flex: 1 }]}>{cafe.address}</Text>
      </View>
    </View>
  );
}

// ─── Amenities & Menu Tab ─────────────────────────────────────────────────────

type AmenityItemDef = {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  enabled: boolean;
};

function AmenitiesMenuTab({
  amenities,
  menuURLs,
}: {
  amenities: Amenities;
  menuURLs: any;
}) {
  const items: AmenityItemDef[] = [
    { label: "Free Wifi", icon: "wifi", enabled: amenities.freeWifi },
    {
      label: "Power Outlets",
      icon: "electrical-services",
      enabled: amenities.powerOutlets,
    },
    { label: "Parking", icon: "local-parking", enabled: amenities.parking },
    {
      label: "Inside Seating",
      icon: "chair",
      enabled: amenities.insideSeating,
    },
    {
      label: "Outside Seating",
      icon: "deck",
      enabled: amenities.outsideSeating,
    },
    { label: "Music", icon: "music-note", enabled: amenities.music },
    {
      label: amenities.light || "Lighting",
      icon: "light-mode",
      enabled: !!amenities.light,
    },
    {
      label: amenities.petFriendly || "Pet Friendly",
      icon: "pets",
      enabled: amenities.petFriendly === "Pet Friendly",
    },
  ];

  return (
    <View>
      <Text style={amenityStyles.sectionLabel}>Amenities</Text>
      <View style={amenityStyles.grid}>
        {items.map((item) => (
          <View
            key={item.label}
            style={[amenityStyles.item, !item.enabled && amenityStyles.itemOff]}
          >
            <MaterialIcons
              name={item.icon}
              size={18}
              color={item.enabled ? "#6B4F2E" : "#C4A882"}
            />
            <Text
              style={[
                amenityStyles.itemLabel,
                !item.enabled && amenityStyles.itemLabelOff,
              ]}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {amenities.others.length > 0 && (
        <>
          <Text style={[amenityStyles.sectionLabel, { marginTop: 14 }]}>
            Other Features
          </Text>
          <View style={amenityStyles.othersRow}>
            {amenities.others.map((o) => (
              <View key={o} style={amenityStyles.otherPill}>
                <Text style={amenityStyles.otherPillText}>{o}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <Text style={[amenityStyles.sectionLabel, { marginTop: 16 }]}>Menu</Text>
      {menuURLs && Array.isArray(menuURLs) && menuURLs.length > 0 ? (
        menuURLs.map((url: string, i: number) => (
          <Image
            key={i}
            source={{ uri: url }}
            style={amenityStyles.menuImage}
            resizeMode="contain"
          />
        ))
      ) : (
        <View style={amenityStyles.menuPlaceholder}>
          <MaterialIcons name="menu-book" size={32} color="#C4A882" />
          <Text style={amenityStyles.menuPlaceholderText}>
            No menu uploaded yet
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Write Review CTA ─────────────────────────────────────────────────────────

function WriteReviewCTA({
  navigation,
  cafeName,
  cafeId,
  onReviewPosted,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList, "CafeProfile">;
  cafeName: string;
  cafeId: string;
  onReviewPosted: () => void;
}) {
  const [rating, setRating] = useState<number>(0);
  return (
    <View style={writeReviewStyles.container}>
      <StarRatingInput value={rating} onChange={setRating} />
      <TouchableOpacity
        activeOpacity={0.9}
        style={writeReviewStyles.button}
        onPress={() =>
          navigation.navigate("WriteReviewFE", {
            cafeName,
            cafeId: Number(cafeId),
            initialRating: rating,
            onReviewPosted,
          })
        }
      >
        <Text style={writeReviewStyles.buttonText}>Write a review</Text>
      </TouchableOpacity>
    </View>
  );
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const renderStar = (index: number) => {
    const full = value >= index;
    const half = !full && value >= index - 0.5;
    const name: keyof typeof MaterialIcons.glyphMap = full
      ? "star"
      : half
        ? "star-half"
        : "star-border";
    return (
      <View key={index} style={starInputStyles.starBox}>
        <MaterialIcons name={name} size={30} color="#3B2A1A" />
        <Pressable
          style={starInputStyles.leftHalf}
          onPress={() => onChange(Math.max(1, index - 0.5))}
        />
        <Pressable
          style={starInputStyles.rightHalf}
          onPress={() => onChange(index)}
        />
      </View>
    );
  };
  return (
    <View style={writeReviewStyles.starsRow}>
      {[1, 2, 3, 4, 5].map(renderStar)}
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.emptyState}>
      <MaterialIcons name={icon} size={44} color="#D2BA94" />
      <Text style={styles.emptyText}>{title}</Text>
      <Text style={styles.emptySubText}>{subtitle}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CafeProfileScreen({ navigation }: Props) {
  const route = useRoute();
  const params = route.params as { cafeId?: string } | undefined;
  const cafeId = params?.cafeId ?? "";

  const [activeTab, setActiveTab] = useState<Tab>("Cafe-Info");
  const [cafe, setCafe] = useState<CafeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [cafeReviews, setCafeReviews] = useState<ReviewWithMeta[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Report modal state
  const [reportTarget, setReportTarget] = useState<ReviewWithMeta | null>(null);

  const TAB_ICONS: { key: Tab; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: "Cafe-Info", icon: "info" },
    { key: "Cafe-Reviews", icon: "rate-review" },
    { key: "Cafe-Posts", icon: "view-compact" },
    { key: "Cafe-Ammenities-Menu", icon: "list" },
  ];

  // Get current user session and profile
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        try {
          const profile = await getProfile(session.user.id);
          setCurrentUserProfile(profile);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        }
      }
    });
  }, []);

  // Fetch cafe details
  useEffect(() => {
    (async () => {
      try {
        const data = await getCafeById(cafeId);
        setCafe(data);
      } catch (err) {
        console.error("Failed to load cafe:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [cafeId]);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    if (!cafeId || !currentUserId) return;
    setReviewsLoading(true);
    try {
      const data = await getReviewsByCafe(Number(cafeId), currentUserId);
      setCafeReviews(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  }, [cafeId, currentUserId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleLike = async (
    reviewId: number,
    currentlyLiked: boolean,
  ) => {
    if (!currentUserId) return;
    const previous = cafeReviews;
    setCafeReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              isLiked: !currentlyLiked,
              likes: r.likes + (currentlyLiked ? -1 : 1),
            }
          : r,
      ),
    );
    try {
      await toggleCafeReviewUpvote(reviewId, currentUserId);
    } catch (err) {
      console.error("Failed to toggle upvote:", err);
      setCafeReviews(previous);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    const previous = cafeReviews;
    setCafeReviews((prev) => prev.filter((r) => r.id !== reviewId));
    try {
      await deleteReview(String(reviewId));
    } catch (err) {
      console.error("Failed to delete review:", err);
      setCafeReviews(previous);
    }
  };

  const handleNavigateToProfile = (userId: string) => {
    if (!userId) return;
    // Navigate to profile — pass the userId so ProfileScreen renders the right user
    navigation.navigate("Profile", { userId });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8C6D4F" />
      </View>
    );
  }

  if (!cafe) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#8C6D4F" }}>Café not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TopBar
        navigation={navigation}
        profilePicture={currentUserProfile?.profile_picture}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
      >
        {/* ── Header ── */}
        <View style={{ backgroundColor: "#E9D0A2" }}>
          <View style={avatarStyles.headerBand}>
            {cafe.cover_photo_url ? (
              <Image
                source={{ uri: cafe.cover_photo_url }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            ) : null}
          </View>

          <View style={avatarStyles.avatarWrapper}>
            <View style={avatarStyles.avatarCircle}>
              {cafe.avatar_url ? (
                <Image
                  source={{ uri: cafe.avatar_url }}
                  style={{ width: "100%", height: "100%", borderRadius: 50 }}
                />
              ) : (
                <MaterialIcons name="storefront" size={52} color="#C8A97A" />
              )}
            </View>
            <View style={cafeDetailsStyles.userInfoSection}>
              <Text
                style={cafeDetailsStyles.userName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {cafe.name}
              </Text>
              <View style={cafeDetailsStyles.metaRow}>
                <MaterialIcons name="place" size={13} color="#8C6D4F" />
                <Text
                  style={cafeDetailsStyles.metaText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {cafe.address}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={cafeProfileNavStyles.tabBar}>
            {TAB_ICONS.map(({ key, icon }) => (
              <TouchableOpacity
                key={key}
                style={cafeProfileNavStyles.tabBtn}
                onPress={() => setActiveTab(key)}
              >
                <MaterialIcons
                  name={icon}
                  size={24}
                  color={activeTab === key ? "#6B4F2E" : "#C4A882"}
                />
                {activeTab === key && (
                  <View style={cafeProfileNavStyles.tabUnderline} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Tab Content ── */}
        <View style={{ backgroundColor: "#FFEFD5" }}>
          <View style={cafeProfileNavStyles.tabContent}>
            {activeTab === "Cafe-Info" && (
              <CafeInfoTab
                cafe={{
                  name: cafe.name,
                  address: cafe.address,
                  email: cafe.email ?? "—",
                  phone: cafe.phone ?? "—",
                  avatarURL: cafe.avatar_url,
                  coverPhotoURL: cafe.cover_photo_url,
                  menuURLs: cafe.menu_urls,
                  averageRating: cafe.average_rating,
                  reviewCount: cafe.review_count,
                  favoritesCount: cafe.favorites_count,
                  openingTime: cafe.opening_time ?? "",
                  closingTime: cafe.closing_time ?? "",
                  openingDays: cafe.opening_days ?? [],
                }}
              />
            )}

            {activeTab === "Cafe-Reviews" && (
              <View>
                <WriteReviewCTA
                  navigation={navigation}
                  cafeName={cafe.name}
                  cafeId={cafeId}
                  onReviewPosted={fetchReviews}
                />
                {reviewsLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#8C6D4F"
                    style={{ marginTop: 20 }}
                  />
                ) : cafeReviews.length === 0 ? (
                  <EmptyState
                    icon="rate-review"
                    title="No reviews yet..."
                    subtitle="Be the first to leave a review for this café!"
                  />
                ) : (
                  cafeReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      isOwn={review.user_id === currentUserId}
                      onToggleLike={handleToggleLike}
                      onReport={(r) => setReportTarget(r)}
                      onDelete={handleDeleteReview}
                      onEdit={(r) => {
                        // Navigate to edit review screen — adjust to your nav setup
                        navigation.navigate("WriteReviewFE", {
                          cafeName: cafe.name,
                          cafeId: Number(cafeId),
                          initialRating: r.rating,
                          reviewId: r.id,
                          onReviewPosted: fetchReviews,
                        });
                      }}
                      onNavigateToProfile={handleNavigateToProfile}
                    />
                  ))
                )}
              </View>
            )}

            {activeTab === "Cafe-Posts" && (
              <View>
                {MOCK_POSTS.length === 0 ? (
                  <EmptyState
                    icon="photo-library"
                    title="No posts yet..."
                    subtitle="This café hasn't posted anything yet."
                  />
                ) : (
                  MOCK_POSTS.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </View>
            )}

            {activeTab === "Cafe-Ammenities-Menu" && (
              <AmenitiesMenuTab
                amenities={MOCK_AMENITIES}
                menuURLs={cafe.menu_urls}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* ── Report Modal ── */}
      <ReportModal
        visible={!!reportTarget}
        onClose={() => setReportTarget(null)}
        targetType="review"
        targetId={reportTarget ? String(reportTarget.id) : ""}
        targetLabel={
          reportTarget
            ? `review by @${reportTarget.profile?.username ?? "Anonymous"}`
            : undefined
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#EDDEC7" },
  container: { flexGrow: 1, backgroundColor: "#EDDEC7" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDDEC7",
  },
  divider: {
    height: 1,
    backgroundColor: "#D2BA94",
    marginHorizontal: 20,
    marginTop: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 70,
    paddingBottom: 120,
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
});

const cafeProfileNavStyles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    backgroundColor: "#E9D0A2",
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
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
});

const cafeDetailsStyles = StyleSheet.create({
  userInfoSection: {
    marginTop: 45,
    marginLeft: 5,
    gap: 2,
    marginBottom: 15,
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: "#8C6D4F",
    flexShrink: 1,
    fontFamily: "SourceSerifPro-Regular",
  },
});

const avatarStyles = StyleSheet.create({
  headerBand: {
    height: 125,
    backgroundColor: "#FAF2E6",
    justifyContent: "flex-end",
    overflow: "visible",
  },
  avatarWrapper: {
    marginTop: -40,
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 16,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FAF2E6",
    borderWidth: 2,
    borderColor: "#EDDEC7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
});

const starStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 1, marginTop: 1 },
});

const writeReviewStyles = StyleSheet.create({
  container: {
    backgroundColor: "#E6D6BE",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 16,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginBottom: 2,
    paddingVertical: 5,
  },
  button: {
    height: 40,
    borderRadius: 14,
    backgroundColor: "#9B6A3F",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFF7EA",
    fontSize: 18,
    fontWeight: "700",
  },
});

const starInputStyles = StyleSheet.create({
  starBox: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  leftHalf: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "50%",
  },
  rightHalf: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "50%",
  },
});

const reviewCardStyles = StyleSheet.create({
  container: {
    backgroundColor: "#E6D6BE",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "visible", // allow dropdown to overflow
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    paddingBottom: 4,
    position: "relative",
    zIndex: 1,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#D2BA94",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  meta: { flex: 1, gap: 1 },
  userName: { fontSize: 13, fontWeight: "600", color: "#3B2A1A" },
  youBadge: { fontSize: 11, fontWeight: "400", color: "#8C6D4F" },
  date: { fontSize: 11, color: "#8C6D4F", marginTop: 1 },
  comment: {
    fontSize: 12,
    color: "#4A3220",
    lineHeight: 18,
    fontStyle: "italic",
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
  },
  mediaWrapper: { overflow: "hidden" },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C8A97A",
  },
  dotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6B4F2E",
  },
  likesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
  },
  likesCount: { fontSize: 12, color: "#8C6D4F" },
  likesCountActive: { color: "#6B4F2E", fontWeight: "600" },
  // Dropdown menu
  dropdownMenu: {
    position: "absolute",
    top: 24,
    right: 0,
    backgroundColor: "#FDF6EC",
    borderRadius: 10,
    paddingVertical: 4,
    minWidth: 130,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 20,
    zIndex: 999,
    borderWidth: 1,
    borderColor: "#E6D6BE",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },
  dropdownItemText: {
    fontSize: 13,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#E6D6BE",
    marginHorizontal: 8,
  },
});

const postCardStyles = StyleSheet.create({
  container: {
    backgroundColor: "#E6D6BE",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  imageSingle: { width: "100%", height: 200, backgroundColor: "#C8A97A" },
  imageRow: { flexDirection: "row" },
  imageHalf: { flex: 1, height: 160, backgroundColor: "#C8A97A" },
  imageGrid3: { flexDirection: "row", height: 180 },
  imageGrid3Main: { flex: 2, height: "100%", backgroundColor: "#C8A97A" },
  imageGrid3Sub: { flex: 1, flexDirection: "column" },
  imageGrid3SubItem: { flex: 1, backgroundColor: "#BFA080" },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  body: { padding: 10 },
  caption: { fontSize: 13, color: "#4A3220", lineHeight: 19, marginBottom: 8 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { fontSize: 11, color: "#8C6D4F" },
  likesRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  likesCount: { fontSize: 12, color: "#8C6D4F" },
});

const infoStyles = StyleSheet.create({
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  statNum: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6B4F2E",
    fontFamily: "SourceSerifPro-Regular",
  },
  statLabel: {
    fontSize: 10,
    color: "#8C6D4F",
    marginTop: 2,
    fontFamily: "SourceSerifPro-Regular",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8C6D4F",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FFF7ED",
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 13,
    color: "#4B2C11",
    lineHeight: 18,
    fontFamily: "SourceSerifPro-Regular",
  },
  infoSubText: { fontSize: 11, color: "#8C6D4F", marginTop: 2 },
  daysRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 4 },
  dayPill: {
    backgroundColor: "#D2BA94",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dayPillClosed: { backgroundColor: "#EDE0CE" },
  dayPillText: { fontSize: 11, fontWeight: "600", color: "#5A3E28" },
  dayPillTextClosed: { color: "#B09070", textDecorationLine: "line-through" },
});

const amenityStyles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8C6D4F",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  item: {
    width: "47.5%",
    backgroundColor: "#E6D6BE",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemOff: { backgroundColor: "#EDE0CE" },
  itemLabel: { fontSize: 12, color: "#4A3220", flex: 1 },
  itemLabelOff: { color: "#B09070", textDecorationLine: "line-through" },
  othersRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 4 },
  otherPill: {
    backgroundColor: "#D2BA94",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  otherPillText: { fontSize: 11, color: "#5A3E28", fontWeight: "500" },
  menuImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    backgroundColor: "#E6D6BE",
    marginBottom: 8,
  },
  menuPlaceholder: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    backgroundColor: "#E6D6BE",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  menuPlaceholderText: { fontSize: 12, color: "#B09070" },
});

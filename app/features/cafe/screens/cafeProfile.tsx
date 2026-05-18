import { RootStackParamList } from "@/App";
import ReportModal from "@/app/shared/modals/reportModal";
import TopBar from "@/components/TopBar";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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

import { ReviewCard } from "@/components/cafe/ReviewCard";
import { WriteReviewCTA } from "@/components/cafe/WriteReview";
import { FavoriteButton } from "@/components/input/FavoritesBtn";
import { Amenities, AmenitiesMenuTab, Coffee } from "./AmenitiesSubpage";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CafeProfile">;
};

type Tab = "Cafe-Info" | "Cafe-Reviews" | "Cafe-Ammenities-Menu";


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

// ─── Star Filter Bar ──────────────────────────────────────────────────────────

function StarFilterBar({
  selected,
  counts,
  onSelect,
}: {
  selected: number | null;
  counts: Record<number, number>;
  onSelect: (star: number | null) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={filterStyles.row}
    >
      <TouchableOpacity
        style={[filterStyles.pill, selected === null && filterStyles.pillActive]}
        onPress={() => onSelect(null)}
      >
        <Text
          style={[
            filterStyles.pillText,
            selected === null && filterStyles.pillTextActive,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      {[5, 4, 3, 2, 1].map((star) => {
        const count = counts[star] ?? 0;
        const isActive = selected === star;
        return (
          <TouchableOpacity
            key={star}
            style={[
              filterStyles.pill,
              isActive && filterStyles.pillActive,
              count === 0 && filterStyles.pillDisabled,
            ]}
            onPress={() =>
              count > 0 ? onSelect(isActive ? null : star) : undefined
            }
          >
            <MaterialIcons
              name="star"
              size={13}
              color={isActive ? "#FFF7EA" : count === 0 ? "#D2BA94" : "#C8863A"}
            />
            <Text
              style={[
                filterStyles.pillText,
                isActive && filterStyles.pillTextActive,
                count === 0 && filterStyles.pillTextDisabled,
              ]}
            >
              {star}
            </Text>
            <Text
              style={[
                filterStyles.pillCount,
                isActive && filterStyles.pillTextActive,
                count === 0 && filterStyles.pillTextDisabled,
              ]}
            >
              ({count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Info Tab ─────────────────────────────────────────────────────────────────

function CafeInfoTab({ cafe }: { cafe: CafeDetail & { favoritesCount: number } }) {
  return (
    <View>
      <View style={infoStyles.section}>
        <Text style={infoStyles.sectionTitle}>Description</Text>
        <View style={infoStyles.line} />
        <Text style={infoStyles.sectionIntro}>
          {cafe.info ?? "No description available."}
        </Text>
      </View>
      <View style={infoStyles.sectionDivider} />

      <View style={infoStyles.statsRow}>
        <View style={infoStyles.statCard}>
          <Text style={infoStyles.statNum}>
            {cafe.average_rating > 0 ? cafe.average_rating.toFixed(1) : "—"}
          </Text>
          <Text style={infoStyles.statLabel}>Rating</Text>
        </View>
        <View style={infoStyles.statCard}>
          <Text style={infoStyles.statNum}>{cafe.review_count}</Text>
          <Text style={infoStyles.statLabel}>Reviews</Text>
        </View>
        <View style={infoStyles.statCard}>
          <Text style={infoStyles.statNum}>{cafe.favoritesCount}</Text>
          <Text style={infoStyles.statLabel}>Favorites</Text>
        </View>
      </View>

      <Text style={infoStyles.sectionLabel}>Operating Hours</Text>
      {ALL_DAYS.map((day) => {
        const dayHours = cafe.opening_hours.find((hours) => hours.day === day);
        const isOpen = Boolean(dayHours);
        const isOpen24Hours =
          dayHours?.opening_time === "12:00 AM" &&
          dayHours?.closing_time === "11:59 PM";
        const hoursText = isOpen24Hours
          ? "Open for 24 hours"
          : `${dayHours?.opening_time ?? cafe.opening_time} - ${
              dayHours?.closing_time ?? cafe.closing_time
            }`;
        return (
          <View key={day} style={infoStyles.infoRow}>
            <MaterialIcons
              name="access-time"
              size={15}
              color={isOpen ? "#8C6D4F" : "#C4A882"}
            />
            <Text
              style={[
                infoStyles.infoText,
                { width: 95, fontWeight: "700" },
                !isOpen && { color: "#B09070" },
              ]}
            >
              {day}
            </Text>
            {isOpen ? (
              <Text style={[infoStyles.infoText, { flex: 1 }]}>
                {hoursText}
              </Text>
            ) : (
              <Text style={[infoStyles.infoText, { flex: 1, color: "#B09070", fontStyle: "italic" }]}>
                Closed
              </Text>
            )}
          </View>
        );
      })}

      <Text style={[infoStyles.sectionLabel, { marginTop: 16 }]}>Contact</Text>
      <View style={infoStyles.infoRow}>
        <MaterialIcons name="phone" size={15} color="#8C6D4F" />
        <Text style={infoStyles.infoText}>{cafe.phone ?? "—"}</Text>
      </View>
      <View style={infoStyles.infoRow}>
        <MaterialIcons name="email" size={15} color="#8C6D4F" />
        <Text style={infoStyles.infoText}>{cafe.email ?? "—"}</Text>
      </View>
      <View style={infoStyles.infoRow}>
        <MaterialIcons name="place" size={15} color="#8C6D4F" />
        <Text style={[infoStyles.infoText, { flex: 1 }]}>{cafe.address}</Text>
      </View>
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

// ─── Favorite Button ──────────────────────────────────────────────────────────


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
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [reportTarget, setReportTarget] = useState<ReviewWithMeta | null>(null);

  const TAB_ICONS: { key: Tab; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: "Cafe-Info", icon: "info" },
    { key: "Cafe-Reviews", icon: "rate-review" },
    { key: "Cafe-Ammenities-Menu", icon: "list" },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        try {
          const profile = await getProfile(session.user.id);
          console.log("Profile data:", JSON.stringify(profile));
          setCurrentUserProfile(profile);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        }
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [cafeData, { count, error: countError }] = await Promise.all([
          getCafeById(cafeId),
          supabase
            .from("favorite_cafes")
            .select("*", { count: "exact", head: true })
            .eq("cafe_id", Number(cafeId)),
        ]);
        setCafe(cafeData);
        if (!countError) setFavoritesCount(count ?? 0);
      } catch (err) {
        console.error("Failed to load cafe:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [cafeId]);

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

  const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of cafeReviews) {
    const bucket = Math.floor(r.rating);
    if (bucket >= 1 && bucket <= 5) {
      starCounts[bucket] = (starCounts[bucket] ?? 0) + 1;
    }
  }

  const filteredReviews =
    starFilter === null
      ? cafeReviews
      : cafeReviews.filter((r) => Math.floor(r.rating) === starFilter);

  const handleToggleLike = async (reviewId: number, currentlyLiked: boolean) => {
    if (!currentUserId) return;
    const previous = cafeReviews;
    setCafeReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, isLiked: !currentlyLiked, likes: r.likes + (currentlyLiked ? -1 : 1) }
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
              <View style={cafeDetailsStyles.nameRow}>
                <Text style={[cafeDetailsStyles.userName, { flex: 1 }]}>
                  {cafe.name}
                </Text>
                <FavoriteButton
                  cafeId={cafeId}
                  userId={currentUserId}
                  onToggle={(isFavorited) =>
                    setFavoritesCount((prev) => prev + (isFavorited ? 1 : -1))
                  }
                />
              </View>
              <View style={cafeDetailsStyles.metaRow}>
                <MaterialIcons name="place" size={13} color="#8C6D4F" />
                <Text style={cafeDetailsStyles.metaText}>{cafe.address}</Text>
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
              <CafeInfoTab cafe={{ ...cafe, favoritesCount }} />
            )}

            {activeTab === "Cafe-Reviews" && (
              <View>
                <WriteReviewCTA
                  navigation={navigation}
                  cafeName={cafe.name}
                  cafeId={cafeId}
                  onReviewPosted={fetchReviews}
                />
                {!reviewsLoading && cafeReviews.length > 0 && (
                  <StarFilterBar
                    selected={starFilter}
                    counts={starCounts}
                    onSelect={setStarFilter}
                  />
                )}
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
                ) : filteredReviews.length === 0 ? (
                  <EmptyState
                    icon="filter-list"
                    title="No matching reviews"
                    subtitle={`No reviews with a ${starFilter}-star rating yet.`}
                  />
                ) : (
                  filteredReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      isOwn={review.user_id === currentUserId}
                      onToggleLike={handleToggleLike}
                      onReport={(r) => setReportTarget(r)}
                      onDelete={handleDeleteReview}
                      onEdit={(r) => {
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

            {activeTab === "Cafe-Ammenities-Menu" && (
              <AmenitiesMenuTab
                amenities={{
                  WiFi: cafe.wifi_speed,
                  Sockets: cafe.sockets,
                  Parking: cafe.parking,
                  Lighting: cafe.lighting,
                  Seating: cafe.seating,
                  Tables: cafe.tables_type,
                  Music: cafe.music,
                  PetFriendly: cafe.pet_friendly,
                  SuitableConditions:
                    cafe.suitable_for as Amenities["SuitableConditions"],
                }}
                menuURLs={cafe.menu_urls}
                coffee={{
                  BeanType: cafe.coffee_bean_type as Coffee["BeanType"],
                  BrewMethod: cafe.coffee_brew_method as Coffee["BrewMethod"],
                }}
                price={{
                  PriceRange: cafe.price_level,
                }}
              />
            )}
          </View>
        </View>
      </ScrollView>

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
  container: { flexGrow: 1, backgroundColor: "#FFEFD5" },
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
    fontFamily: "SourceSerifPro-Bold",
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


const filterStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F0E5D8",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: "#D2BA94",
  },
  pillActive: { backgroundColor: "#6B4F2E", borderColor: "#6B4F2E" },
  pillDisabled: { opacity: 0.45 },
  pillText: {
    fontSize: 12,
    color: "#6B4F2E",
    fontFamily: "SourceSerifPro-Bold",
  },
  pillTextActive: { color: "#FFF7EA" },
  pillTextDisabled: { color: "#B09070" },
  pillCount: {
    fontSize: 11,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
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
    flexShrink: 1,
  },
  userName: {
    fontSize: 22,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  metaText: {
    fontSize: 12,
    color: "#8C6D4F",
    flexShrink: 1,
    fontFamily: "SourceSerifPro-Regular",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 2,
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
    marginRight: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
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
    fontFamily: "SourceSerifPro-Bold",
    color: "#6B4F2E",
  },
  statLabel: {
    fontSize: 10,
    color: "#8C6D4F",
    marginTop: 2,
    fontFamily: "SourceSerifPro-Regular",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "SourceSerifPro-Bold",
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
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE0CE",
  },
  hoursDay: {
    width: 100,
    alignItems: "flex-start",
  },
  hoursDayOpen: {
    backgroundColor: "transparent",
  },
  hoursDayClosed: {
    backgroundColor: "transparent",
  },
  hoursDayText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B2C11",
    fontFamily: "SourceSerifPro-Regular",
  },
  hoursDayTextClosed: {
    color: "#B09070",
    fontWeight: "400",
  },
  hoursTime: {
    flex: 1,
    fontSize: 13,
    color: "#4B2C11",
    fontFamily: "SourceSerifPro-Regular",
  },
  hoursClosed: {
    flex: 1,
    fontSize: 13,
    color: "#B09070",
    fontStyle: "italic",
    fontFamily: "SourceSerifPro-Regular",
  },
  daysRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 4 },
  dayPill: {
    backgroundColor: "#D2BA94",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dayPillClosed: { backgroundColor: "#EDE0CE" },
  dayPillText: {
    fontSize: 11,
    fontFamily: "SourceSerifPro-Bold",
    color: "#5A3E28",
  },
  dayPillTextClosed: { color: "#B09070", textDecorationLine: "line-through" },
  section: {
    paddingVertical: 8,
    backgroundColor: "#FFF7ED",
    width: "100%",
    borderRadius: 10,
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#3B2A1A",
    marginBottom: 2,
    marginLeft: 10,
    fontFamily: "SourceSerifPro-Bold",
  },
  sectionIntro: {
    fontSize: 14,
    color: "#3B2A1A",
    marginLeft: 20,
    fontFamily: "SourceSerifPro-Regular",
    marginTop: 8,
    marginBottom: 4,
  },
  line: {
    height: 1,
    backgroundColor: "#4b2c1148",
    marginVertical: 4,
    width: "98%",
    alignSelf: "center",
  },
  sectionDivider: {
    height: 5,
    backgroundColor: "#FFEFD5",
    marginBottom: 4,
  },
});

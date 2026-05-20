import { RootStackParamList } from "@/App";
import ReportModal from "@/app/shared/modals/reportModal";
import TopBar from "@/components/navigation/TopBar";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
} from "../../../../shared/modals/reviewService";
import { getProfile } from "../../../profile/services/profileService";
import { CafeDetail, getCafeById } from "../../services/cafeService";

import { FavoriteButton } from "@/components/input/FavoritesButton";
import { CafePost, useCafePosts } from "@/hooks/useCafePosts";
import { formatReviewDate } from "../../../../shared/modals/reviewService";
import { Amenities, AmenitiesMenuTab, Coffee } from "./amenities/page";
import CafeReviewsTab from "./reviews/page";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CafeProfile">;
};

type Tab = "Cafe-Info" | "Cafe-Posts" | "Cafe-Reviews" | "Cafe-Ammenities-Menu";


// 1 = Sunday, 2 = Monday, ... 7 = Saturday (matches Supabase numeric day values)
const DAYS_SUN_FIRST = [1, 2, 3, 4, 5, 6, 7];

const DAY_SHORT: Record<number, string> = {
  1: "Sun",
  2: "Mon",
  3: "Tue",
  4: "Wed",
  5: "Thu",
  6: "Fri",
  7: "Sat",
};

const DAY_FULL: Record<number, string> = {
  1: "Sunday",
  2: "Monday",
  3: "Tuesday",
  4: "Wednesday",
  5: "Thursday",
  6: "Friday",
  7: "Saturday",
};

// ─── Star Filter Bar ──────────────────────────────────────────────────────────

export function StarFilterBar({
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
        style={[
          filterStyles.pill,
          selected === null && filterStyles.pillActive,
        ]}
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

export function CafeInfoTab({
  cafe,
}: {
  cafe: CafeDetail & { favoritesCount: number };
}) {
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
      {(() => {
        type Group = { hoursText: string; days: number[]; isOpen: boolean };
        const groupsMap = new Map<string, Group>();

        for (const day of DAYS_SUN_FIRST) {
          const dayName = DAY_FULL[day];
          const dayHours = cafe.opening_hours.find((h) => h.day === dayName);
          const inDefaultDays = (cafe.opening_days ?? []).includes(dayName);
          const hasDefaultTimes = !!(cafe.opening_time && cafe.closing_time);
          const isOpen =
            Boolean(dayHours) || (inDefaultDays && hasDefaultTimes);
          const isOpen24Hours =
            (dayHours?.opening_time === "12:00 AM" &&
              dayHours?.closing_time === "11:59 PM") ||
            (isOpen &&
              cafe.opening_time === "12:00 AM" &&
              cafe.closing_time === "11:59 PM");

          const hoursText = isOpen
            ? isOpen24Hours
              ? "Open for 24 hours"
              : `${dayHours?.opening_time ?? cafe.opening_time} - ${
                  dayHours?.closing_time ?? cafe.closing_time
                }`
            : "Closed";

          const existing = groupsMap.get(hoursText);
          if (existing) existing.days.push(day);
          else groupsMap.set(hoursText, { hoursText, days: [day], isOpen });
        }

        return Array.from(groupsMap.values()).map((grp) => (
          <View key={grp.hoursText} style={infoStyles.hoursGroup}>
            <View style={infoStyles.hoursGroupHeader}>
              <MaterialIcons
                name="access-time"
                size={18}
                color={grp.isOpen ? "#8C6D4F" : "#C4A882"}
              />
              <Text
                style={[
                  infoStyles.infoText,
                  { fontFamily: "SourceSerifPro-Bold", marginLeft: 8 },
                ]}
              >
                {grp.hoursText}
              </Text>
            </View>
            <View style={infoStyles.daysRow}>
              {DAYS_SUN_FIRST.map((d) => {
                const isHighlighted = grp.days.includes(d);
                return (
                  <View
                    key={d}
                    style={[
                      infoStyles.dayPill,
                      isHighlighted && infoStyles.dayPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        infoStyles.dayText,
                        isHighlighted && infoStyles.dayTextActive,
                      ]}
                    >
                      {DAY_SHORT[d]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ));
      })()}

      <Text style={[infoStyles.sectionLabel, { marginTop: 16 }]}>Contact</Text>
      <View style={infoStyles.infoRow}>
        <MaterialIcons name="smartphone" size={15} color="#8C6D4F" />
        <Text style={infoStyles.infoText}>{cafe.phone ?? "—"}</Text>
      </View>
      <View style={infoStyles.infoRow}>
        <MaterialIcons name="phone" size={15} color="#8C6D4F" />
        <Text style={infoStyles.infoText}>{cafe.landline ?? "—"}</Text>
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
    { key: "Cafe-Posts", icon: "article" },
    { key: "Cafe-Reviews", icon: "rate-review" },
    { key: "Cafe-Ammenities-Menu", icon: "list" },
  ];

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

  const filteredReviews =
    starFilter === null
      ? cafeReviews
      : cafeReviews.filter((r) => Math.floor(r.rating) === starFilter);

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

            {activeTab === "Cafe-Posts" && (
              <PublicPostsTab
                cafeId={Number(cafeId)}
                cafeName={cafe.name}
                cafeAvatarUrl={cafe.avatar_url}
              />
            )}

            {activeTab === "Cafe-Reviews" && (
              <CafeReviewsTab
                navigation={navigation}
                cafeName={cafe.name}
                cafeId={cafeId}
                onReviewPosted={fetchReviews}
                reviewsLoading={reviewsLoading}
                filteredReviews={filteredReviews}
                totalReviews={cafeReviews.length}
                starFilter={starFilter}
                currentUserId={currentUserId}
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
    paddingHorizontal: 4,
    paddingVertical: 6,
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
    marginLeft: 10,
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
  hoursGroup: {
    flexDirection: "column",
    gap: 8,
    backgroundColor: "#FFF7ED",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  hoursGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  dayPill: {
    backgroundColor: "#EDE0CE",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dayPillActive: { backgroundColor: "#6B4F2E" },
  dayText: {
    fontSize: 11,
    fontFamily: "SourceSerifPro-Regular",
    color: "#5A3E28",
  },
  dayTextActive: { color: "#FFF7EA" },
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
    marginTop: 5,
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

// ─── Public Posts Tab ─────────────────────────────────────────────────────────

function PublicPostsTab({
  cafeId,
  cafeName,
  cafeAvatarUrl,
}: {
  cafeId: number;
  cafeName: string;
  cafeAvatarUrl: string | null;
}) {
  const { posts, loading, refetch } = useCafePosts(cafeId);
  const [likedPostIds, setLikedPostIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!posts.length || !cafeId) {
      setLikedPostIds(new Set());
      return;
    }

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const postIds = posts.map((post) => post.id);
      const { data, error } = await supabase
        .from("cafe_post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds);

      if (error) {
        console.error("Failed to fetch post likes:", error);
        return;
      }

      setLikedPostIds(new Set((data ?? []).map((row) => row.post_id)));
    })();
  }, [cafeId, posts]);

  const handleTogglePostLike = async (
    postId: number,
    currentlyLiked: boolean,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const post = posts.find((item) => item.id === postId);
    if (!post) return;

    const nextLikes = Math.max(0, post.likes + (currentlyLiked ? -1 : 1));
    setLikedPostIds((prev) => {
      const next = new Set(prev);
      if (currentlyLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });

    try {
      if (currentlyLiked) {
        const { error: unlikeError } = await supabase
          .from("cafe_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (unlikeError) throw unlikeError;
      } else {
        const { error: likeError } = await supabase
          .from("cafe_post_likes")
          .insert({ post_id: postId, user_id: user.id });
        if (likeError) throw likeError;
      }

      const { error: updateError } = await supabase
        .from("cafe_posts")
        .update({ likes: nextLikes })
        .eq("id", postId);
      if (updateError) throw updateError;

      await refetch({ silent: true });
    } catch (err) {
      console.error("Failed to toggle cafe post like:", err);
      setLikedPostIds((prev) => {
        const next = new Set(prev);
        if (currentlyLiked) next.add(postId);
        else next.delete(postId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="small"
        color="#8C6D4F"
        style={{ marginTop: 20 }}
      />
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="article" size={44} color="#D2BA94" />
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptySubText}>
          This cafe has not shared any updates yet.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {posts.map((post) => (
        <PublicPostCard
          key={post.id}
          post={post}
          cafeName={cafeName}
          cafeAvatarUrl={cafeAvatarUrl}
          isLiked={likedPostIds.has(post.id)}
          onToggleLike={handleTogglePostLike}
        />
      ))}
    </View>
  );
}

// ─── Public Post Card (read-only) ────────────────────────────────────────────

function PublicPostCard({
  post,
  cafeName,
  cafeAvatarUrl,
  isLiked,
  onToggleLike,
}: {
  post: CafePost;
  cafeName: string;
  cafeAvatarUrl: string | null;
  isLiked: boolean;
  onToggleLike: (postId: number, currentlyLiked: boolean) => void;
}) {
  const [cardWidth, setCardWidth] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const displayDate = formatReviewDate(post.created_at, null);
  const postPhotoUrls = post.photo_url?.filter(Boolean) ?? [];
  const postImageHeight = Math.round(cardWidth * 0.68);

  return (
    <View
      style={publicPostStyles.container}
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
    >
      <View style={publicPostStyles.header}>
        <View style={publicPostStyles.avatar}>
          {cafeAvatarUrl ? (
            <Image
              source={{ uri: cafeAvatarUrl }}
              style={{ width: "100%", height: "100%", borderRadius: 25 }}
              resizeMode="cover"
            />
          ) : (
            <MaterialIcons name="store" size={20} color="#C8A97A" />
          )}
        </View>
        <View style={publicPostStyles.meta}>
          <Text
            style={publicPostStyles.cafeName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {cafeName}
          </Text>
          <Text style={publicPostStyles.date}>{displayDate}</Text>
        </View>
      </View>

      {post.caption ? (
        <Text style={publicPostStyles.caption}>{post.caption}</Text>
      ) : null}

      {postPhotoUrls.length > 0 && cardWidth > 0 ? (
        <View style={{ overflow: "hidden" }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) =>
              setActivePhotoIndex(
                Math.round(e.nativeEvent.contentOffset.x / cardWidth),
              )
            }
            scrollEventThrottle={16}
          >
            {postPhotoUrls.map((uri, i) => (
              <Image
                key={`${uri}-${i}`}
                source={{ uri }}
                style={{ width: cardWidth, height: postImageHeight }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {postPhotoUrls.length > 1 && (
            <View style={publicPostStyles.dotsRow}>
              {postPhotoUrls.map((_, i) => (
                <View
                  key={i}
                  style={[
                    publicPostStyles.dot,
                    i === activePhotoIndex && publicPostStyles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      ) : null}

      <Pressable
        onPress={() => onToggleLike(post.id, isLiked)}
        accessibilityRole="button"
        accessibilityLabel={isLiked ? "Unlike post" : "Like post"}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={({ pressed }) => [
          publicPostStyles.footer,
          pressed && publicPostStyles.footerPressed,
        ]}
      >
        <MaterialIcons
          name={isLiked ? "thumb-up" : "thumb-up-off-alt"}
          size={20}
          color={isLiked ? "#6B4F2E" : "#8C6D4F"}
        />
        <Text
          style={[
            publicPostStyles.likesCount,
            isLiked && publicPostStyles.likesCountActive,
          ]}
        >
          {post.likes}
        </Text>
      </Pressable>
    </View>
  );
}

const publicPostStyles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    borderColor: "#E9D0A2",
    borderWidth: 0.2,
    marginBottom: 10,
    overflow: "visible",
    shadowColor: "#8C6D4F",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    paddingBottom: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#D2BA94",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  meta: {
    flex: 1,
    gap: 1,
    justifyContent: "center",
    minHeight: 50,
  },
  cafeName: {
    fontSize: 15,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
  },
  date: {
    fontSize: 11,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
  },
  caption: {
    fontSize: 14,
    color: "#4A3220",
    lineHeight: 18,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 8,
    fontFamily: "SourceSerifPro-Regular",
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
    minHeight: 44,
  },
  footerPressed: {
    opacity: 0.7,
  },
  likesCount: {
    fontSize: 14,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
  },
  likesCountActive: {
    color: "#6B4F2E",
  },
});

import { RootStackParamList } from "@/App";
import ReportModal from "@/app/shared/modals/reportModal";
import TopBar from "@/components/TopBar";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
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

import { ReviewCard } from "@/components/cafe/ReviewCard";
import { WriteReviewCTA } from "@/components/cafe/WriteReview";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CafeProfile">;
};

type Tab = "Cafe-Info" | "Cafe-Reviews" | "Cafe-Ammenities-Menu";

type Amenities = {
  WiFi: "None" | "Slow" | "Moderate" | "Fast" | null;
  Sockets: "None" | "Some" | "Many" | null;
  Parking: "None" | "Limited" | "Plenty" | null;
  Lighting: "Dim" | "Balanced" | "Bright" | null;
  Seating: string[];
  Tables: string[];
  Music: "Quiet" | "Normal" | "Blaring" | null;
  PetFriendly: boolean;
  SuitableConditions: ("Student" | "Work" | "Group" | "Vibes")[];
};

type Coffee = {
  BeanType: ("Arabica" | "Robusta" | "Liberica" | "Excelsa")[];
  BrewMethod: (
    | "Espresso"
    | "Drip"
    | "French Press"
    | "Pour Over"
    | "Cold Brew"
  )[];
};

type PriceLevel = {
  PriceRange: "P" | "PP" | "PPP" | null;
};

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
          const isOpen = Boolean(dayHours) || (inDefaultDays && hasDefaultTimes);
          const isOpen24Hours =
            (dayHours?.opening_time === "12:00 AM" && dayHours?.closing_time === "11:59 PM") ||
            (isOpen && cafe.opening_time === "12:00 AM" && cafe.closing_time === "11:59 PM");

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
              <Text style={[infoStyles.infoText, { fontFamily: "SourceSerifPro-Bold", marginLeft: 8 }]}>
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

// ─── Amenities & Menu Tab ─────────────────────────────────────────────────────

type AmenitiesMenuTabProps = {
  amenities: Amenities;
  menuURLs: string[] | null;
  coffee: Coffee;
  price: PriceLevel;
};

function AmenityCard({
  label,
  icon,
  options,
  selected,
}: {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  options: string[];
  selected: string | string[] | null;
}) {
  return (
    <View style={amenityCardStyles.card}>
      <View style={amenityCardStyles.cardHeader}>
        <MaterialIcons name={icon} size={17} color="#6B4F2E" />
        <Text style={amenityCardStyles.cardTitle}>{label}</Text>
      </View>
      <View style={amenityCardStyles.optionsRow}>
        {options.map((opt) => {
          const isSelected = Array.isArray(selected)
            ? selected.includes(opt)
            : selected === opt;
          return (
            <View
              key={opt}
              style={[
                amenityCardStyles.optionPill,
                isSelected && amenityCardStyles.optionPillSelected,
              ]}
            >
              <Text
                style={[
                  amenityCardStyles.optionText,
                  isSelected && amenityCardStyles.optionTextSelected,
                ]}
              >
                {opt}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function AmenitiesMenuTab({
  amenities,
  menuURLs,
  coffee,
  price,
}: AmenitiesMenuTabProps) {
  const AMENITY_ROWS: {
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    options: string[];
    value: string | string[] | null;
  }[] = [
    {
      label: "WiFi",
      icon: "wifi",
      options: ["None", "Slow", "Moderate", "Fast"],
      value: amenities.WiFi,
    },
    {
      label: "Sockets",
      icon: "electrical-services",
      options: ["None", "Some", "Many"],
      value: amenities.Sockets,
    },
    {
      label: "Parking",
      icon: "local-parking",
      options: ["None", "Limited", "Plenty"],
      value: amenities.Parking,
    },
    {
      label: "Lighting",
      icon: "light-mode",
      options: ["Dim", "Balanced", "Bright"],
      value: amenities.Lighting,
    },
    {
      label: "Seating",
      icon: "chair",
      options: ["Inside", "Outside"],
      value: amenities.Seating,
    },
    {
      label: "Tables",
      icon: "table-bar",
      options: ["Bar Type", "Individual Tables", "Large Tables"],
      value: amenities.Tables,
    },
    {
      label: "Music",
      icon: "music-note",
      options: ["Quiet", "Normal", "Blaring"],
      value: amenities.Music,
    },
  ];

  const PRICE_OPTIONS: {
    symbol: string;
    value: "P" | "PP" | "PPP";
    label: string;
  }[] = [
    { symbol: "₱", value: "P", label: "Below ₱150" },
    { symbol: "₱₱", value: "PP", label: "₱150–300" },
    { symbol: "₱₱₱", value: "PPP", label: "Above ₱300" },
  ];

  return (
    <View>
      {/* ── Menu ── */}
      <Text style={amenityCardStyles.sectionLabel}>Menu</Text>
      {menuURLs && menuURLs.length > 0 ? (
        menuURLs.map((url, i) => (
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

      {/* ── Price Level ── */}
      <SectionCard
        icon="local-offer"
        title="Price Level"
        subtitle="Based on average drink prices"
      >
        <View style={priceCoffeeStyles.priceRow}>
          {PRICE_OPTIONS.map((opt) => (
            <PricePill
              key={opt.value}
              symbol={opt.symbol}
              label={opt.label}
              selected={price.PriceRange === opt.value}
            />
          ))}
        </View>
      </SectionCard>

      {/* ── Coffee ── */}
      <SectionCard
        icon="coffee"
        title="Coffee"
        subtitle="Bean type, brewing methods, etc."
      >
        <CoffeeSubCard
          label="Bean Type"
          options={["Arabica", "Robusta", "Liberica", "Excelsa"]}
          selected={coffee.BeanType}
        />
        <CoffeeSubCard
          label="Brew Method"
          options={[
            "Espresso",
            "Drip",
            "French Press",
            "Pour Over",
            "Cold Brew",
          ]}
          selected={coffee.BrewMethod}
        />
      </SectionCard>

      {/* ── Amenities ── */}
      <Text style={[amenityCardStyles.sectionLabel, { marginTop: 20 }]}>
        Amenities
      </Text>
      {AMENITY_ROWS.map((row) => (
        <AmenityCard
          key={row.label}
          label={row.label}
          icon={row.icon}
          options={row.options}
          selected={row.value}
        />
      ))}

      {/* ── Suitable Conditions ── */}
      {amenities.SuitableConditions?.length > 0 && (
        <View style={amenityCardStyles.card}>
          <View style={amenityCardStyles.cardHeader}>
            <MaterialIcons name="group" size={17} color="#6B4F2E" />
            <Text style={amenityCardStyles.cardTitle}>Suitable Conditions</Text>
          </View>
          <View style={amenityCardStyles.optionsRow}>
            {(["Student", "Work", "Group", "Vibes"] as const).map((cond) => {
              const isSelected = amenities.SuitableConditions.includes(cond);
              return (
                <View
                  key={cond}
                  style={[
                    amenityCardStyles.optionPill,
                    isSelected && amenityCardStyles.optionPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      amenityCardStyles.optionText,
                      isSelected && amenityCardStyles.optionTextSelected,
                    ]}
                  >
                    {cond}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Pet Friendly ── */}
      <View style={amenityCardStyles.card}>
        <View style={amenityCardStyles.cardHeader}>
          <MaterialIcons name="pets" size={17} color="#6B4F2E" />
          <Text style={amenityCardStyles.cardTitle}>Pet Friendly</Text>
        </View>
        <View style={amenityCardStyles.optionsRow}>
          {(["Yes", "No"] as const).map((opt) => {
            const isSelected =
              (opt === "Yes" && amenities.PetFriendly) ||
              (opt === "No" && !amenities.PetFriendly);
            return (
              <View
                key={opt}
                style={[
                  amenityCardStyles.optionPill,
                  isSelected && amenityCardStyles.optionPillSelected,
                ]}
              >
                <Text
                  style={[
                    amenityCardStyles.optionText,
                    isSelected && amenityCardStyles.optionTextSelected,
                  ]}
                >
                  {opt}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Price Pill ───────────────────────────────────────────────────────────────

function PricePill({
  symbol,
  label,
  selected,
}: {
  symbol: string;
  label: string;
  selected: boolean;
}) {
  return (
    <View
      style={[
        priceCoffeeStyles.pricePill,
        selected && priceCoffeeStyles.pricePillSelected,
      ]}
    >
      <Text
        style={[
          priceCoffeeStyles.priceSymbol,
          selected && priceCoffeeStyles.priceSymbolSelected,
        ]}
      >
        {symbol}
      </Text>
      <Text
        style={[
          priceCoffeeStyles.priceLabel,
          selected && priceCoffeeStyles.priceLabelSelected,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={priceCoffeeStyles.sectionCard}>
      <View style={priceCoffeeStyles.sectionCardHeader}>
        <MaterialIcons name={icon} size={22} color="#6B4F2E" />
        <View>
          <Text style={priceCoffeeStyles.sectionCardTitle}>{title}</Text>
          {subtitle ? (
            <Text style={priceCoffeeStyles.sectionCardSubtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {children}
    </View>
  );
}

// ─── Coffee Sub Card ──────────────────────────────────────────────────────────

function CoffeeSubCard({
  label,
  options,
  selected,
}: {
  label: string;
  options: string[];
  selected: string[];
}) {
  return (
    <View style={priceCoffeeStyles.coffeeSubCard}>
      <Text style={priceCoffeeStyles.coffeeSubCardTitle}>{label}</Text>
      <View style={priceCoffeeStyles.optionsRow}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <View
              key={opt}
              style={[
                priceCoffeeStyles.coffeePill,
                isSelected && priceCoffeeStyles.coffeePillSelected,
              ]}
            >
              <Text
                style={[
                  priceCoffeeStyles.coffeePillText,
                  isSelected && priceCoffeeStyles.coffeePillTextSelected,
                ]}
              >
                {opt}
              </Text>
            </View>
          );
        })}
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

function FavoriteButton({
  cafeId,
  userId,
  onToggle,
}: {
  cafeId: string;
  userId: string;
  onToggle?: (isFavorited: boolean) => void;
}) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!userId || !cafeId) return;
    (async () => {
      try {
        const { data } = await supabase
          .from("favorite_cafes")
          .select("id")
          .eq("user_id", userId)
          .eq("cafe_id", Number(cafeId))
          .maybeSingle();
        if (data) {
          setIsFavorited(true);
          setFavoriteId(data.id);
        }
      } catch (err) {
        console.error("Failed to check favorite status:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, cafeId]);

  const handleToggle = async () => {
    if (toggling || !userId) return;
    setToggling(true);

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start();

    const wasLiked = isFavorited;
    setIsFavorited(!wasLiked);
    onToggle?.(!wasLiked);

    try {
      if (wasLiked && favoriteId) {
        const { error } = await supabase
          .from("favorite_cafes")
          .delete()
          .eq("id", favoriteId);
        if (error) throw error;
        setFavoriteId(null);
      } else {
        const { data, error } = await supabase
          .from("favorite_cafes")
          .insert({ user_id: userId, cafe_id: Number(cafeId) })
          .select("id")
          .single();
        if (error) throw error;
        setFavoriteId(data.id);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setIsFavorited(wasLiked);
      onToggle?.(wasLiked);
    } finally {
      setToggling(false);
    }
  };

  if (loading) return null;

  return (
    <TouchableOpacity
      onPress={handleToggle}
      disabled={toggling || !userId}
      activeOpacity={0.8}
      style={favStyles.btn}
      accessibilityRole="button"
      accessibilityLabel={
        isFavorited ? "Remove from favorites" : "Add to favorites"
      }
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <MaterialIcons
          name={isFavorited ? "favorite" : "favorite-border"}
          size={18}
          color={isFavorited ? "#C0392B" : "#8C6D4F"}
        />
      </Animated.View>
    </TouchableOpacity>
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

const favStyles = StyleSheet.create({
  btn: { padding: 4 },
});

const reviewsHeaderStyles = StyleSheet.create({
  block: {
    marginTop: 4,
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
    fontFamily: "SourceSerifPro-Bold",
  },
});

const starInputStyles = StyleSheet.create({
  starBox: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  leftHalf: { position: "absolute", left: 0, top: 0, bottom: 0, width: "50%" },
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
    overflow: "visible",
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
  userName: {
    fontSize: 13,
    fontFamily: "SourceSerifPro-Bold",
    color: "#3B2A1A",
  },
  youBadge: {
    fontSize: 11,
    fontFamily: "SourceSerifPro-Semibold",
    color: "#8C6D4F",
  },
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
  likesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
  },
  likesCount: { fontSize: 12, color: "#8C6D4F" },
  likesCountActive: { color: "#6B4F2E", fontFamily: "SourceSerifPro-Bold" },
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
  moreText: { color: "#fff", fontSize: 16, fontFamily: "SourceSerifPro-Bold" },
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
    fontFamily: "SourceSerifPro-Bold",
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

const amenityStyles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontFamily: "SourceSerifPro-Bold",
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
  otherPillText: {
    fontSize: 11,
    color: "#5A3E28",
    fontFamily: "SourceSerifPro-Semibold",
  },
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

const amenityCardStyles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontFamily: "SourceSerifPro-Bold",
    color: "#8C6D4F",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: "SourceSerifPro-Bold",
    color: "#3B2A1A",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  optionPill: {
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D2BA94",
    backgroundColor: "transparent",
  },
  optionPillSelected: {
    backgroundColor: "#6B4F2E",
    borderColor: "#6B4F2E",
  },
  optionText: {
    fontSize: 12,
    color: "#6B4F2E",
    fontFamily: "SourceSerifPro-Regular",
  },
  optionTextSelected: {
    color: "#FFF7EA",
    fontFamily: "SourceSerifPro-Bold",
  },
});

const priceCoffeeStyles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  sectionCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 14,
  },
  sectionCardTitle: {
    fontSize: 16,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
    lineHeight: 20,
  },
  sectionCardSubtitle: {
    fontSize: 11,
    color: "#8C6D4F",
    marginTop: 1,
    fontFamily: "SourceSerifPro-Regular",
  },
  priceRow: {
    flexDirection: "row",
    gap: 8,
  },
  pricePill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D2BA94",
    backgroundColor: "transparent",
    gap: 2,
  },
  pricePillSelected: {
    backgroundColor: "#6B4F2E",
    borderColor: "#6B4F2E",
  },
  // No line-through by default — only the selected state should be visually distinct
  priceSymbol: {
    fontSize: 15,
    fontFamily: "SourceSerifPro-Bold",
    color: "#6B4F2E",
    textDecorationLine: "line-through",
    textDecorationColor: "#6B4F2E",
  },
  priceSymbolSelected: {
    color: "#FFF7EA",
  },
  priceLabel: {
    fontSize: 10,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
    textAlign: "center",
  },
  priceLabelSelected: {
    color: "#F0D8B8",
  },
  coffeeSubCard: {
    backgroundColor: "#F5ECD8",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  coffeeSubCardTitle: {
    fontSize: 12,
    fontFamily: "SourceSerifPro-Bold",
    color: "#3B2A1A",
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  coffeePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D2BA94",
    backgroundColor: "transparent",
  },
  coffeePillSelected: {
    backgroundColor: "#6B4F2E",
    borderColor: "#6B4F2E",
  },
  coffeePillText: {
    fontSize: 12,
    color: "#6B4F2E",
    fontFamily: "SourceSerifPro-Regular",
  },
  coffeePillTextSelected: {
    color: "#FFF7EA",
    fontFamily: "SourceSerifPro-Bold",
  },
});
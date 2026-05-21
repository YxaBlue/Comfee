import { RootStackParamList } from "@/App";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const MOCK_PROFILE = {
  name: "Hollander Café",
  city: "Cebu City",
  avatar_url: null,
  main_photo_url: null,
};

const MOCK_INFO = {
  info: "A cozy specialty café nestled in the heart of Cebu City, serving ethically sourced single-origin beans and freshly baked pastries every day.",
  address: "123 Osmena Blvd, Cebu City",
  city: "Cebu City",
  phone: "+63 912 345 6789",
  landline: "(032) 123-4567",
  email: "hello@brewandco.ph",
  branches: "IT Park Branch, Ayala Branch, SM Seaside Branch",
};
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

const MOCK_HOURS: Record<
  string,
  { opening_time: string; closing_time: string }
> = {
  Monday: { opening_time: "7:00 AM", closing_time: "9:00 PM" },
  Tuesday: { opening_time: "7:00 AM", closing_time: "9:00 PM" },
  Wednesday: { opening_time: "7:00 AM", closing_time: "9:00 PM" },
  Thursday: { opening_time: "7:00 AM", closing_time: "9:00 PM" },
  Friday: { opening_time: "7:00 AM", closing_time: "9:00 PM" },
  Saturday: { opening_time: "7:00 AM", closing_time: "9:00 PM" },
};

const MOCK_POSTS = [
  {
    id: 1,
    created_at: "2025-05-10T08:30:00Z",
    caption:
      "Our new Ube Latte is here just in time for the weekend! Made with fresh ube halaya and our signature oat milk blend. Come grab a cup ☕",
    likes: 42,
  },
  {
    id: 2,
    created_at: "2025-05-07T10:00:00Z",
    caption:
      "Happy to announce we're now open until 10 PM every Friday and Saturday. More time for good coffee and good company!",
    likes: 31,
  },
  {
    id: 3,
    created_at: "2025-05-03T09:15:00Z",
    caption:
      "Throwback to our soft opening last April. Thank you Cebu for the overwhelming love. We can't wait to see you all again!",
    likes: 88,
  },
];

const MOCK_REVIEWS = [
  {
    id: 1,
    reviewer: "Maria T.",
    cafeName: "Hollander Café",
    rating: 5,
    date: "May 9, 2025",
    text: "Absolutely love this place! The pour-over coffee is the best I've had in Cebu. The staff is super friendly too.",
    likes: 12,
  },
  {
    id: 2,
    reviewer: "Carlos M.",
    cafeName: "Hollander Café",
    rating: 4,
    date: "May 6, 2025",
    text: "Great ambiance and really good pastries. The matcha latte was a bit sweet for my taste but overall a solid spot.",
    likes: 8,
  },
  {
    id: 3,
    reviewer: "Anna R.",
    cafeName: "Hollander Café",
    rating: 5,
    date: "Apr 28, 2025",
    text: "My new go-to study café. Fast Wi-Fi, comfy seats, and the cold brew keeps me going for hours!",
    likes: 24,
  },
];

type NavProps = NativeStackNavigationProp<
  RootStackParamList,
  "BusinessPreview"
>;

export default function BusinessPreview() {
  const navigation = useNavigation<NavProps>();
  const [activeTab, setActiveTab] = useState<"info" | "posts" | "reviews">(
    "info",
  );

  const profile = MOCK_PROFILE;

  return (
    <ImageBackground
      source={require("../../../../../../assets/images/bg1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* ── Back Header ── */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios-new" size={18} color="#3B2A1A" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Profile Preview</Text>
      </View>

      {/* ── Business Profile ── */}
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.wrapper}>
          {/* Cover Photo */}
          <View style={styles.coverPhoto}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
              }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          </View>

          {/* Avatar */}
          <View style={styles.businessProf}>
            <MaterialIcons name="store" size={40} color="#8C6D4F" />
            <View style={styles.avatarBadge}>
              <MaterialIcons name="camera-alt" size={12} color="#fff" />
            </View>
          </View>

          <View style={styles.infoHolder}>
            <Text style={styles.cafeName}>{profile.name}</Text>
            <View style={styles.locRow}>
              <MaterialIcons name="location-on" size={12} color="#8C6D4F" />
              <Text style={styles.cafeLoc}>{profile.city}</Text>
            </View>
          </View>

          <View style={styles.line} />
          <View style={styles.divider} />

          {/* Tab nav */}
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

          {activeTab === "info" && <MockInfoTab />}
          {activeTab === "posts" && <MockPostsTab />}
          {activeTab === "reviews" && <MockReviewsTab />}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.editButton} onPress={() => {}}>
        <MaterialIcons
          name={activeTab === "posts" ? "add" : "edit"}
          size={activeTab === "posts" ? 25 : 20}
          color="#8C6D4F"
        />
      </TouchableOpacity>
    </ImageBackground>
  );
}
function MockInfoTab() {
  // Build grouped hours (same logic as CafeInfoTab)
  type Group = { hoursText: string; days: number[]; isOpen: boolean };
  const groupsMap = new Map<string, Group>();

  for (const day of DAYS_SUN_FIRST) {
    const dayName = DAY_FULL[day];
    const dayHours = MOCK_HOURS[dayName];
    const isOpen = Boolean(dayHours);
    const hoursText = isOpen
      ? `${dayHours.opening_time} - ${dayHours.closing_time}`
      : "Closed";
    const existing = groupsMap.get(hoursText);
    if (existing) existing.days.push(day);
    else groupsMap.set(hoursText, { hoursText, days: [day], isOpen });
  }

  return (
    <View>
      {/* Description */}
      <View style={infoStyles.section}>
        <Text style={infoStyles.sectionTitle}>Description</Text>
        <View style={infoStyles.line} />
        <Text style={infoStyles.sectionIntro}>{MOCK_INFO.info}</Text>
      </View>
      <View style={infoStyles.sectionDivider} />

      {/* Stats row */}
      <View style={infoStyles.statsRow}>
        <View style={infoStyles.statCard}>
          <Text style={infoStyles.statNum}>4.5</Text>
          <Text style={infoStyles.statLabel}>Rating</Text>
        </View>
        <View style={infoStyles.statCard}>
          <Text style={infoStyles.statNum}>38</Text>
          <Text style={infoStyles.statLabel}>Reviews</Text>
        </View>
        <View style={infoStyles.statCard}>
          <Text style={infoStyles.statNum}>21</Text>
          <Text style={infoStyles.statLabel}>Favorites</Text>
        </View>
      </View>

      {/* Operating Hours */}
      <Text style={infoStyles.sectionLabel}>Operating Hours</Text>
      {Array.from(groupsMap.values()).map((grp) => (
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
      ))}

      {/* Contact */}
      <Text style={[infoStyles.sectionLabel, { marginTop: 16 }]}>Contact</Text>
      <View style={infoStyles.infoRow}>
        <MaterialIcons name="smartphone" size={15} color="#8C6D4F" />
        <Text style={infoStyles.infoText}>{MOCK_INFO.phone}</Text>
      </View>
      <View style={infoStyles.infoRow}>
        <MaterialIcons name="phone" size={15} color="#8C6D4F" />
        <Text style={infoStyles.infoText}>{MOCK_INFO.landline}</Text>
      </View>
      <View style={infoStyles.infoRow}>
        <MaterialIcons name="email" size={15} color="#8C6D4F" />
        <Text style={infoStyles.infoText}>{MOCK_INFO.email}</Text>
      </View>
      <View style={infoStyles.infoRow}>
        <MaterialIcons name="place" size={15} color="#8C6D4F" />
        <Text style={[infoStyles.infoText, { flex: 1 }]}>
          {MOCK_INFO.address}
        </Text>
      </View>
    </View>
  );
}

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

function MockPostsTab() {
  const [likes, setLikes] = useState<Record<number, number>>(
    Object.fromEntries(MOCK_POSTS.map((p) => [p.id, p.likes])),
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {MOCK_POSTS.map((post) => (
          <View key={post.id} style={postStyles.postCont}>
            <View style={postStyles.postDetails}>
              <Text style={postStyles.postDate}>
                {new Date(post.created_at).toLocaleString()}
              </Text>
              <Text style={postStyles.postCaption}>{post.caption}</Text>
            </View>

            <View style={postStyles.photoPlaceholder}>
              <MaterialIcons name="image" size={28} color="#C4A882" />
              <Text style={postStyles.photoPlaceholderText}>
                Photo goes here
              </Text>
            </View>

            <TouchableOpacity
              style={postStyles.postLike}
              onPress={() =>
                setLikes((prev) => ({ ...prev, [post.id]: prev[post.id] + 1 }))
              }
            >
              <MaterialIcons
                name="thumb-up-off-alt"
                size={20}
                color="#8C6D4F"
                style={{ marginLeft: 15 }}
              />
              <Text style={{ marginLeft: 5, color: "#8C6D4F" }}>
                {likes[post.id]}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const postStyles = StyleSheet.create({
  postCont: {
    width: "100%",
    backgroundColor: "#FFFAF3",
    marginTop: 10,
    borderRadius: 8,
    paddingBottom: 48,
  },
  postDetails: {
    flexDirection: "column",
    padding: 10,
    marginLeft: 15,
    marginTop: 10,
  },
  postDate: {
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
    fontSize: 12,
    marginBottom: 5,
  },
  postCaption: {
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
    fontSize: 14,
    paddingRight: 10,
  },
  photoPlaceholder: {
    width: "90%",
    height: 100,
    marginTop: 10,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 5,
    backgroundColor: "#FAF2E6",
    borderWidth: 1,
    borderColor: "#E9D0A2",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  photoPlaceholderText: {
    color: "#C4A882",
    fontSize: 11,
    fontFamily: "SourceSerifPro-Regular",
  },
  postLike: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});
function StarRating({ rating }: { rating: number }) {
  return (
    <View style={reviewStyles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => {
        const iconName =
          rating >= star
            ? "star"
            : rating >= star - 0.5
              ? "star-half"
              : "star-border";
        return (
          <MaterialIcons
            key={star}
            name={iconName as any}
            size={18}
            color="#6B4F2E"
          />
        );
      })}
    </View>
  );
}

function MockReviewsTab() {
  const [likes, setLikes] = useState<
    Record<number, { count: number; liked: boolean }>
  >(
    Object.fromEntries(
      MOCK_REVIEWS.map((r) => [r.id, { count: r.likes, liked: false }]),
    ),
  );

  const toggleLike = (id: number) => {
    setLikes((prev) => ({
      ...prev,
      [id]: {
        count: prev[id].liked ? prev[id].count - 1 : prev[id].count + 1,
        liked: !prev[id].liked,
      },
    }));
  };

  const avg = (
    MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length
  ).toFixed(1);

  const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of MOCK_REVIEWS) {
    starCounts[Math.floor(r.rating)] =
      (starCounts[Math.floor(r.rating)] ?? 0) + 1;
  }

  const [starFilter, setStarFilter] = useState<number | null>(null);
  const filtered =
    starFilter === null
      ? MOCK_REVIEWS
      : MOCK_REVIEWS.filter((r) => Math.floor(r.rating) === starFilter);

  return (
    <View style={{ flex: 1 }}>
      {/* Summary strip — mirrors ReviewsSummaryStrip */}
      <View style={mockReviewStyles.summaryStrip}>
        <View style={mockReviewStyles.scoreBlock}>
          <Text style={mockReviewStyles.avgScore}>{avg}</Text>
          <View style={mockReviewStyles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <MaterialIcons
                key={s}
                name={s <= Math.round(Number(avg)) ? "star" : "star-border"}
                size={16}
                color="#6B4F2E"
              />
            ))}
          </View>
          <Text style={mockReviewStyles.reviewCount}>
            {MOCK_REVIEWS.length} reviews
          </Text>
        </View>

        {/* Star breakdown bars */}
        <View style={mockReviewStyles.barsBlock}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star] ?? 0;
            const pct =
              MOCK_REVIEWS.length > 0 ? count / MOCK_REVIEWS.length : 0;
            return (
              <View key={star} style={mockReviewStyles.barRow}>
                <Text style={mockReviewStyles.barLabel}>{star}</Text>
                <MaterialIcons name="star" size={10} color="#C8922A" />
                <View style={mockReviewStyles.barTrack}>
                  <View style={[mockReviewStyles.barFill, { flex: pct }]} />
                  <View style={{ flex: 1 - pct }} />
                </View>
                <Text style={mockReviewStyles.barCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Star filter bar — mirrors StarFilterBar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={mockReviewStyles.filterRow}
      >
        {[null, 5, 4, 3, 2, 1].map((star) => {
          const active = starFilter === star;
          return (
            <TouchableOpacity
              key={star ?? "all"}
              style={[
                mockReviewStyles.filterChip,
                active && mockReviewStyles.filterChipActive,
              ]}
              onPress={() => setStarFilter(star)}
            >
              {star !== null && (
                <MaterialIcons
                  name="star"
                  size={12}
                  color={active ? "#FDF6EC" : "#8C6D4F"}
                />
              )}
              <Text
                style={[
                  mockReviewStyles.filterChipText,
                  active && mockReviewStyles.filterChipTextActive,
                ]}
              >
                {star === null ? "All" : `${star}  (${starCounts[star] ?? 0})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Review cards — mirrors ReviewCard layout */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 100,
        }}
      >
        {filtered.map((review) => (
          <View key={review.id} style={mockReviewStyles.card}>
            {/* Header */}
            <View style={mockReviewStyles.cardHeader}>
              <View style={mockReviewStyles.avatar}>
                <MaterialIcons name="person" size={28} color="#C8A97A" />
              </View>
              <View style={mockReviewStyles.cardMeta}>
                <Text style={mockReviewStyles.reviewerLabel}>Review by</Text>
                <Text style={mockReviewStyles.reviewerName}>
                  {review.reviewer}
                </Text>
                <View style={mockReviewStyles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <MaterialIcons
                      key={s}
                      name={s <= review.rating ? "star" : "star-border"}
                      size={13}
                      color="#C8922A"
                    />
                  ))}
                </View>
                <Text style={mockReviewStyles.reviewDate}>{review.date}</Text>
              </View>
              <MaterialIcons name="more-vert" size={20} color="#6B4F2E" />
            </View>

            {/* Comment */}
            <Text style={mockReviewStyles.comment}>{`"${review.text}"`}</Text>

            {/* Likes */}
            <View style={mockReviewStyles.likesRow}>
              <TouchableOpacity onPress={() => toggleLike(review.id)}>
                <MaterialIcons
                  name={
                    likes[review.id].liked ? "thumb-up" : "thumb-up-off-alt"
                  }
                  size={18}
                  color={likes[review.id].liked ? "#6B4F2E" : "#8C6D4F"}
                />
              </TouchableOpacity>
              <Text
                style={[
                  mockReviewStyles.likesCount,
                  likes[review.id].liked && { color: "#6B4F2E" },
                ]}
              >
                {likes[review.id].count}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const mockReviewStyles = StyleSheet.create({
  summaryStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: "#F0E2D0",
  },
  scoreBlock: {
    alignItems: "center",
    gap: 4,
  },
  avgScore: {
    fontSize: 40,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
  },
  starsRow: {
    flexDirection: "row",
    gap: 1,
  },
  reviewCount: {
    fontSize: 11,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
  },
  barsBlock: {
    flex: 1,
    gap: 4,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  barLabel: {
    fontSize: 11,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
    width: 10,
    textAlign: "right",
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EDD9B8",
    flexDirection: "row",
    overflow: "hidden",
  },
  barFill: {
    backgroundColor: "#C8922A",
    borderRadius: 3,
  },
  barCount: {
    fontSize: 11,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
    width: 14,
    textAlign: "right",
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F0E2D0",
    borderWidth: 1,
    borderColor: "#E0C9A8",
  },
  filterChipActive: {
    backgroundColor: "#6B4F2E",
    borderColor: "#6B4F2E",
  },
  filterChipText: {
    fontSize: 12,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
  },
  filterChipTextActive: {
    color: "#FDF6EC",
    fontFamily: "SourceSerifPro-Bold",
  },
  card: {
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#F0E2D0",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 13,
    paddingTop: 13,
    paddingBottom: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F1E7DA",
    borderWidth: 1,
    borderColor: "#EADAC6",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardMeta: {
    flex: 1,
    gap: 1,
  },
  reviewerLabel: {
    fontSize: 11,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
  },
  reviewerName: {
    fontSize: 15,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
  },
  reviewDate: {
    fontSize: 10,
    color: "#A08060",
    fontFamily: "SourceSerifPro-Regular",
    marginTop: 1,
  },
  comment: {
    fontSize: 14,
    color: "#5C3D1E",
    lineHeight: 19,
    marginTop: 10,
    paddingHorizontal: 22,
    fontFamily: "SourceSerifPro-Regular",
  },
  likesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 13,
  },
  likesCount: {
    fontSize: 13,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
  },
});

const reviewStyles = StyleSheet.create({
  // ── Summary header ────────────────────────────────────────────────────────
  summaryRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F0D8B4",
    alignSelf: "center",
    width: "90%",
    justifyContent: "center",
    borderRadius: 8,
  },
  avgScore: {
    fontSize: 42,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
  },
  reviewCount: {
    fontSize: 12,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
    marginTop: 2,
  },

  // ── Review card — matches ProfileScreen.reviewCard ────────────────────────
  reviewCard: {
    backgroundColor: "#FFFAF3",
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

  // Café avatar — 66×66 circle, matches ProfileScreen.cafeAvatarSmall
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

  reviewMoreButton: { alignSelf: "flex-start", paddingTop: 2 },

  reviewLabel: {
    fontSize: 12,
    color: "#8C6D4F",
    marginBottom: 1,
    fontFamily: "SourceSerifPro-Regular",
  },
  reviewCafeName: {
    fontSize: 16,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
  },

  // Stars row — marginLeft: -2 matches ProfileScreen spacing offset
  starsRow: { flexDirection: "row", marginTop: 3, marginLeft: -2 },

  reviewDate: {
    fontSize: 10,
    color: "#A08060",
    marginTop: 1,
    fontFamily: "SourceSerifPro-Regular",
  },

  // Quoted comment — matches ProfileScreen.reviewComment
  reviewComment: {
    fontSize: 14,
    color: "#5C3D1E",
    lineHeight: 19,
    marginTop: 16,
    marginBottom: 0,
    paddingHorizontal: 22,
  },

  // Likes row — matches ProfileScreen.likesRow
  likesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 13,
  },
  likesCount: {
    fontSize: 14,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
  },
  likesCountActive: { color: "#6B4F2E" },
});

// ─── Shared styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  topBar: {
    height: 70,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9D0A2",
    shadowColor: "#7A5A37",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 20,
  },
  backButton: {
    position: "absolute",
    left: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backButtonText: {
    color: "#3B2A1A",
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "serif",
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "800",
    fontFamily: "serif",
    color: "#3B2A1A",
    alignSelf: "center",
  },
  wrapper: { position: "relative" },
  coverPhoto: {
    height: 158,
    backgroundColor: "#FAF2E6",
    width: "100%",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    position: "absolute",
    top: 0,
    zIndex: 2,
  },
  coverImage: {
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  divider: {
    height: 110,
    backgroundColor: "#E9D0A2",
    width: "100%",
    marginTop: 5,
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
    alignItems: "center",
    justifyContent: "center",
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
  infoHolder: {
    position: "relative",
    zIndex: 4,
    marginLeft: 140,
    top: 60,
  },
  cafeName: {
    fontSize: 22,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
  },
  locRow: { flexDirection: "row" },
  cafeLoc: {
    fontSize: 12,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
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
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: -32,
  },
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
});

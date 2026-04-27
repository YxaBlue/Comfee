import TopBar from "@/components/TopBar";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../../../App";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CafeProfile">;
};

type Tab = "info" | "reviews" | "posts" | "ammenities & menu";

type Review = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
  imageCount: number;
};

type Post = {
  id: string;
  caption: string;
  date: string;
  likes: number;
  imageCount: number;
};

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_CAFE = {
  name: "Cloud Nine Café",
  address: "123 Brewed St., Cebu City",
  cover_photo: null,
  logo: null,
  rating: 4.3,
  review_count: 128,
  opened_since: "March 2019",
  hours: "Mon–Sat · 7AM – 9PM",
  bio: "A cozy corner café nestled in the heart of Cebu. We serve specialty brews, house-made pastries, and good vibes. Whether you're here to work, read, or just breathe — you're welcome.",
};

const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    userName: "maricel_b",
    rating: 5,
    comment: "Best cold brew I've ever had. The cozy interior is perfect for working!",
    date: "07/03/2026 · 11AM",
    likes: 41,
    imageCount: 2,
  },
  {
    id: "2",
    userName: "jomar.explores",
    rating: 4,
    comment: "Great ambiance and friendly staff. Will definitely come back.",
    date: "06/28/2026 · 3PM",
    likes: 25,
    imageCount: 1,
  },
  {
    id: "3",
    userName: "ana_cafehop",
    rating: 3,
    comment: "Coffee was decent but the wait was a bit long on a Saturday.",
    date: "06/15/2026 · 1PM",
    likes: 8,
    imageCount: 0,
  },
];

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    caption: "New seasonal menu just dropped ☕ Try our Ube Latte this July!",
    date: "07/01/2026",
    likes: 134,
    imageCount: 3,
  },
  {
    id: "2",
    caption: "We're open on holidays 🎉 Come visit us even on long weekends.",
    date: "06/20/2026",
    likes: 89,
    imageCount: 1,
  },
  {
    id: "3",
    caption: "Grateful for 5 years of brews, stories, and good company. 🙏",
    date: "03/15/2026",
    likes: 210,
    imageCount: 2,
  },
];
// ──────────────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialIcons
          key={star}
          name={star <= Math.round(rating) ? "star" : "star-border"}
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
        <View style={styles.userAvatarSmall}>
          <MaterialIcons name="person" size={20} color="#C8A97A" />
        </View>
        <View style={styles.reviewCardMeta}>
          <Text style={styles.reviewUserName}>{review.userName}</Text>
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
            <View style={[styles.imagePlaceholder, { width: "100%", height: 90 }]} />
          )}
          {review.imageCount === 2 && (
            <>
              <View style={[styles.imagePlaceholder, { flex: 1, height: 80 }]} />
              <View style={[styles.imagePlaceholder, { flex: 1, height: 80 }]} />
            </>
          )}
          {review.imageCount >= 3 && (
            <>
              <View style={[styles.imagePlaceholder, { width: "48%", height: 90 }]} />
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

function PostCard({ post }: { post: Post }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewCardHeader}>
        <View style={styles.reviewCardMeta}>
          <Text style={styles.reviewDate}>{post.date}</Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={18} color="#8C6D4F" />
        </TouchableOpacity>
      </View>

      <Text style={styles.postCaption}>{post.caption}</Text>

      {post.imageCount > 0 && (
        <View style={styles.imageGrid}>
          {post.imageCount === 1 && (
            <View style={[styles.imagePlaceholder, { width: "100%", height: 90 }]} />
          )}
          {post.imageCount === 2 && (
            <>
              <View style={[styles.imagePlaceholder, { flex: 1, height: 80 }]} />
              <View style={[styles.imagePlaceholder, { flex: 1, height: 80 }]} />
            </>
          )}
          {post.imageCount >= 3 && (
            <>
              <View style={[styles.imagePlaceholder, { width: "48%", height: 90 }]} />
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
        <Text style={styles.likesCount}>{post.likes}</Text>
      </View>
    </View>
  );
}

export default function CafeProfileScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("reviews");

  const TAB_ICONS: { key: Tab; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: "info", icon: "info-outline" },
    { key: "reviews", icon: "rate-review" },
    { key: "posts", icon: "grid-on" },
  ];

  return (
    <View style={styles.wrapper}>
      <TopBar navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cover / Header band ── */}
        <View style={styles.headerBand}>
          {MOCK_CAFE.cover_photo ? (
            <Image
              source={{ uri: MOCK_CAFE.cover_photo }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : null}

          {/* Cafe logo avatar — positioned same as Profile's avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {MOCK_CAFE.logo ? (
                <Image
                  source={{ uri: MOCK_CAFE.logo }}
                  style={{ width: "100%", height: "100%", borderRadius: 53 }}
                />
              ) : (
                <MaterialIcons name="storefront" size={52} color="#C8A97A" />
              )}
            </View>
          </View>
        </View>

        {/* ── Cafe name & rating ── */}
        <View style={styles.userInfoSection}>
          <View style={styles.nameEditRow}>
            <Text style={styles.userName}>{MOCK_CAFE.name}</Text>
          </View>

          {/* Rating row */}
          <View style={styles.ratingRow}>
            <StarRating rating={MOCK_CAFE.rating} />
            <Text style={styles.ratingText}>
              {MOCK_CAFE.rating.toFixed(1)} · {MOCK_CAFE.review_count} reviews
            </Text>
          </View>

          {/* Address */}
          <View style={styles.metaRow}>
            <MaterialIcons name="place" size={13} color="#8C6D4F" />
            <Text style={styles.metaText}>{MOCK_CAFE.address}</Text>
          </View>

          {/* Hours */}
          <View style={styles.metaRow}>
            <MaterialIcons name="access-time" size={13} color="#8C6D4F" />
            <Text style={styles.metaText}>{MOCK_CAFE.hours}</Text>
          </View>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Icon tab bar ── */}
        <View style={styles.tabBar}>
          {TAB_ICONS.map(({ key, icon }) => (
            <TouchableOpacity
              key={key}
              style={styles.tabBtn}
              onPress={() => setActiveTab(key)}
            >
              <MaterialIcons
                name={icon}
                size={24}
                color={activeTab === key ? "#6B4F2E" : "#C4A882"}
              />
              {activeTab === key && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab content ── */}
        <View style={styles.tabContent}>

          {/* REVIEWS */}
          {activeTab === "reviews" && (
            <View>
              {MOCK_REVIEWS.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="rate-review" size={44} color="#D2BA94" />
                  <Text style={styles.emptyText}>No reviews yet</Text>
                  <Text style={styles.emptySubText}>
                    Be the first to leave a review for this café!
                  </Text>
                </View>
              ) : (
                MOCK_REVIEWS.map((r) => <ReviewCard key={r.id} review={r} />)
              )}
            </View>
          )}

          {/* POSTS */}
          {activeTab === "posts" && (
            <View>
              {MOCK_POSTS.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="grid-on" size={44} color="#D2BA94" />
                  <Text style={styles.emptyText}>No posts yet</Text>
                  <Text style={styles.emptySubText}>
                    This café hasn't posted anything yet.
                  </Text>
                </View>
              ) : (
                MOCK_POSTS.map((p) => <PostCard key={p.id} post={p} />)
              )}
            </View>
          )}

          {/* INFO */}
          {activeTab === "info" && (
            <View style={styles.infoSection}>
              <View style={styles.infoField}>
                <Text style={styles.infoLabel}>About</Text>
                <View style={[styles.infoValueBox, { minHeight: 80 }]}>
                  <Text style={styles.infoValue}>{MOCK_CAFE.bio}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Opened Since</Text>
                  <View style={styles.infoValueBox}>
                    <Text style={styles.infoValue}>{MOCK_CAFE.opened_since}</Text>
                  </View>
                </View>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Hours</Text>
                  <View style={styles.infoValueBox}>
                    <Text style={styles.infoValue}>{MOCK_CAFE.hours}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoField}>
                <Text style={styles.infoLabel}>Address</Text>
                <View style={styles.infoValueBox}>
                  <Text style={styles.infoValue}>{MOCK_CAFE.address}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#EDDEC7" },
  container: { flexGrow: 1, backgroundColor: "#EDDEC7" },

  /* Header */
  headerBand: {
    height: 100,
    backgroundColor: "#D4B896",
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  avatarWrapper: {
    marginBottom: -46,
    marginLeft: 150,
  },
  avatarCircle: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: "#E6D6BE",
    borderWidth: 3,
    borderColor: "#EDDEC7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  /* Cafe info */
  userInfoSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    gap: 4,
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
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: "row",
  },
  ratingText: {
    fontSize: 12,
    color: "#6B4F2E",
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: "#8C6D4F",
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
  userAvatarSmall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#D2BA94",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewCardMeta: { flex: 1 },
  reviewUserName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B2A1A",
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
  postCaption: {
    fontSize: 13,
    color: "#3B2A1A",
    lineHeight: 19,
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
});

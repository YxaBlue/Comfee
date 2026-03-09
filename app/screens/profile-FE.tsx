import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../App";

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
              {/* Left big image */}
              <View
                style={[styles.imagePlaceholder, { width: "48%", height: 90 }]}
              />
              {/* Right stacked */}
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
  const [description, setDescription] = useState("");

  const TAB_ICONS: { key: Tab; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: "info", icon: "info-outline" },
    { key: "reviews", icon: "rate-review" },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header band ── */}
        <View style={styles.headerBand}>
          <TouchableOpacity style={styles.menuDots}>
            <MaterialIcons name="more-vert" size={22} color="#6B4F2E" />
          </TouchableOpacity>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <MaterialIcons name="person" size={52} color="#C8A97A" />
            </View>
          </View>
        </View>

        {/* ── User info ── */}
        <View style={styles.userInfoSection}>
          <View style={styles.nameEditRow}>
            <Text style={styles.userName}>UserName123</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("EditProfile" as never)}
            >
              <MaterialIcons name="edit" size={16} color="#8C6D4F" />
            </TouchableOpacity>
          </View>
          <Text style={styles.joinedDate}>Joined since 03/2023</Text>
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
                  <View style={styles.infoValueBox}>
                    <Text style={styles.infoValue}>Hannah</Text>
                  </View>
                </View>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Last Name</Text>
                  <View style={styles.infoValueBox}>
                    <Text style={styles.infoValue}>Rivera</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Age</Text>
                  <View style={styles.infoValueBox}>
                    <Text style={styles.infoValue}>24</Text>
                  </View>
                </View>
                <View style={styles.infoField}>
                  <Text style={styles.infoLabel}>Birth Date</Text>
                  <View style={styles.infoValueBox}>
                    <Text style={styles.infoValue}>March 15, 2001</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoField}>
                <Text style={styles.infoLabel}>Bio</Text>
                <View style={[styles.infoValueBox, { minHeight: 80 }]}>
                  <Text style={styles.infoValue}>
                    Coffee lover exploring one café at a time ☕
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ── Bottom nav ── */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.profileNavAvatar}>
            <MaterialIcons name="person" size={18} color="#fff" />
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
  infoTextArea: {
    backgroundColor: "#E6D6BE",
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: "#3B2A1A",
    minHeight: 110,
    textAlignVertical: "top",
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
  },
});

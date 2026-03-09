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

type Review = {
  id: string;
  cafeName: string;
  cafeLocation: string;
  rating: number;
  comment: string;
  date: string;
  cafeImage?: string;
};

const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    cafeName: "Brewed Awakenings",
    cafeLocation: "123 Maple St, Springfield",
    rating: 5,
    comment:
      "Absolutely loved the ambiance! The latte art was stunning and the pastries were freshly baked. Will definitely come back.",
    date: "March 5, 2025",
  },
  {
    id: "2",
    cafeName: "The Daily Grind",
    cafeLocation: "456 Oak Ave, Shelbyville",
    rating: 4,
    comment:
      "Great coffee selection and friendly staff. A bit crowded on weekends but worth the wait.",
    date: "February 20, 2025",
  },
  {
    id: "3",
    cafeName: "Mocha & More",
    cafeLocation: "789 Pine Rd, Capital City",
    rating: 3,
    comment:
      "Decent coffee but the seating area was a little cramped. Nice vibe though.",
    date: "January 14, 2025",
  },
  {
    id: "4",
    cafeName: "Cloud Nine Café",
    cafeLocation: "321 Birch Blvd, Ogdenville",
    rating: 5,
    comment:
      "Hands down the best cold brew I've ever had. The cozy interior makes it a perfect study spot.",
    date: "December 30, 2024",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialIcons
          key={star}
          name={star <= rating ? "star" : "star-border"}
          size={16}
          color="#A97C4E"
        />
      ))}
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.reviewCard}>
      {/* Cafe avatar placeholder */}
      <View style={styles.cafeAvatarSmall} />

      <View style={styles.reviewContent}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewCafeName}>{review.cafeName}</Text>
          <Text style={styles.reviewDate}>{review.date}</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <MaterialIcons
            name="location-on"
            size={12}
            color="#A97C4E"
            style={{ marginTop: -5 }}
          />
          <Text style={styles.reviewLocation}>{review.cafeLocation}</Text>
        </View>

        <StarRating rating={review.rating} />

        <Text style={styles.reviewComment}>{review.comment}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<"reviews" | "saved">("reviews");

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header band */}
        <View style={styles.headerBand} />

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <MaterialIcons name="person" size={56} color="#C8A97A" />
          </View>
        </View>

        {/* Name + edit */}
        <View style={styles.nameRow}>
          <Text style={styles.userName}>Aira Uy</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("EditProfile" as never)}
          >
            <MaterialIcons name="edit" size={15} color="#A97C4E" />
            <Text style={styles.editLabel}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.userHandle}>@amberglennLover</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        {/* Tab selector */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "reviews" && styles.tabActive]}
            onPress={() => setActiveTab("reviews")}
          >
            <MaterialIcons
              name="rate-review"
              size={16}
              color={activeTab === "reviews" ? "#A97C4E" : "#C4A882"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "reviews" && styles.tabTextActive,
              ]}
            >
              My Reviews
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "saved" && styles.tabActive]}
            onPress={() => setActiveTab("saved")}
          >
            <MaterialIcons
              name="bookmark"
              size={16}
              color={activeTab === "saved" ? "#A97C4E" : "#C4A882"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "saved" && styles.tabTextActive,
              ]}
            >
              Saved
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reviews list */}
        {activeTab === "reviews" && (
          <View style={styles.reviewsList}>
            {MOCK_REVIEWS.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="rate-review" size={48} color="#D2BA94" />
                <Text style={styles.emptyText}>No reviews yet</Text>
                <Text style={styles.emptySubText}>
                  Start exploring cafés and share your thoughts!
                </Text>
              </View>
            ) : (
              MOCK_REVIEWS.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </View>
        )}

        {activeTab === "saved" && (
          <View style={styles.emptyState}>
            <MaterialIcons name="bookmark-border" size={48} color="#D2BA94" />
            <Text style={styles.emptyText}>No saved cafés yet</Text>
            <Text style={styles.emptySubText}>
              Bookmark your favourite spots to find them quickly!
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom nav */}
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
  wrapper: {
    flex: 1,
    backgroundColor: "#EDDEC7",
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#EDDEC7",
  },

  /* Header band */
  headerBand: {
    height: 140,
    backgroundColor: "#D4B896",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  /* Avatar */
  avatarWrapper: {
    alignItems: "center",
    marginTop: -60,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#E6D6BE",
    borderWidth: 4,
    borderColor: "#EDDEC7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  /* Name row */
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3B2A1A",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#E6D6BE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  editLabel: {
    fontSize: 11,
    color: "#A97C4E",
    fontWeight: "500",
  },
  userHandle: {
    textAlign: "center",
    fontSize: 13,
    color: "#8C6D4F",
    marginTop: 2,
    marginBottom: 16,
  },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6D6BE",
    marginHorizontal: 20,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3B2A1A",
  },
  statLabel: {
    fontSize: 11,
    color: "#8C6D4F",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#D2BA94",
  },

  /* Tabs */
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#E6D6BE",
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#EDDEC7",
    shadowColor: "#A97C4E",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: "#C4A882",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#A97C4E",
    fontWeight: "600",
  },

  /* Reviews */
  reviewsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  reviewCard: {
    backgroundColor: "#E6D6BE",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  cafeAvatarSmall: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#D2BA94",
    flexShrink: 0,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  reviewCafeName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3B2A1A",
    flex: 1,
    marginRight: 6,
  },
  reviewDate: {
    fontSize: 10,
    color: "#A08060",
    flexShrink: 0,
  },
  reviewLocation: {
    fontSize: 11,
    color: "#8C6D4F",
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  reviewComment: {
    fontSize: 14,
    color: "#5C3D1E",
    lineHeight: 18,
  },

  /* Empty state */
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8C6D4F",
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: "#B09070",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },

  /* Bottom nav */
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#D4B896",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 8,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
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

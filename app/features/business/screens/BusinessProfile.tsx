import { RootStackParamList } from "@/App";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Static mock data ────────────────────────────────────────────────────────
const MOCK_PROFILE = {
  name: "Hollander Café",
  city: "Cebu City",
  avatar_url: null,
  main_photo_url: null,
};

// ─── Mock info data ───────────────────────────────────────────────────────────
const MOCK_INFO = {
  info: "A cozy specialty café nestled in the heart of Cebu City, serving ethically sourced single-origin beans and freshly baked pastries every day.",
  address: "123 Osmena Blvd, Cebu City",
  city: "Cebu City",
  phone: "+63 912 345 6789",
  landline: "(032) 123-4567",
  email: "hello@brewandco.ph",
  branches: "IT Park Branch, Ayala Branch, SM Seaside Branch",
};

// ─── Mock posts data ──────────────────────────────────────────────────────────
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

// ─── Mock reviews data ────────────────────────────────────────────────────────
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
  "BusinessNavigation"
>;

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function BusinessProfile() {
  const navigation = useNavigation<NavProps>();
  const [activeTab, setActiveTab] = useState<"info" | "posts" | "reviews">(
    "info",
  );
  const [overlayVisible, setOverlayVisible] = useState(true);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const dismissOverlay = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      setOverlayVisible(false);
      Animated.spring(bannerAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();
    });
  };

  const profile = MOCK_PROFILE;

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  const bannerTranslateY = bannerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 0],
  });

  return (
    <ImageBackground
      source={require("../../../../assets/images/bg1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* ── Nav Header ── */}
      <View style={[styles.rectangle1, styles.shadow, styles.androidShadow]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
            <Image
              source={require("../../../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Image
              source={require("../../../../assets/images/profileHolder1.png")}
              style={styles.profHolder}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Coming Soon Banner ── */}
      {!overlayVisible && (
        <Animated.View
          style={[
            styles.comingSoonBanner,
            { transform: [{ translateY: bannerTranslateY }] },
          ]}
        >
          <MaterialIcons name="construction" size={14} color="#E9D0A2" />
          <Text style={styles.bannerText}>
            Coming Soon — you're previewing a mockup
          </Text>
        </Animated.View>
      )}

      {/* ── Business Profile ── */}
      <ScrollView
        scrollEnabled={!overlayVisible}
        style={{ flex: 1 }}
        contentContainerStyle={
          overlayVisible ? styles.teaserContent : undefined
        }
      >
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
            <TouchableOpacity
              onPress={() => !overlayVisible && setActiveTab("info")}
            >
              <MaterialIcons
                name="info"
                size={25}
                color={activeTab === "info" ? "#3B2A1A" : "#8C6D4F"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => !overlayVisible && setActiveTab("posts")}
            >
              <MaterialIcons
                name="article"
                size={25}
                color={activeTab === "posts" ? "#3B2A1A" : "#8C6D4F"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => !overlayVisible && setActiveTab("reviews")}
            >
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
      {!overlayVisible && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            Alert.alert(
              "Coming Soon ☕",
              "Editing will be available when this feature launches!",
              [{ text: "Got it" }],
            )
          }
        >
          <MaterialIcons
            name={activeTab === "posts" ? "add" : "edit"}
            size={activeTab === "posts" ? 25 : 20}
            color="#8C6D4F"
          />
        </TouchableOpacity>
      )}

      {/* ── Coming Soon Overlay Sheet ── */}
      {overlayVisible && (
        <>
          <View style={styles.teaserVeil} pointerEvents="none" />

          <Animated.View
            style={[
              styles.overlaySheet,
              { transform: [{ translateY: sheetTranslateY }] },
            ]}
          >
            <View style={styles.dragHandle} />

            <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
              <View style={styles.iconRing}>
                <MaterialIcons name="storefront" size={48} color="#8C6D4F" />
              </View>
            </Animated.View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>COMING SOON</Text>
            </View>

            <Text style={styles.overlayTitle}>Business Profiles</Text>
            <Text style={styles.overlaySubtitle}>
              Set up your café page, post updates, and collect reviews — all in
              one place. We're putting the finishing touches on it now.
            </Text>

            <View style={styles.chipsRow}>
              {["📋 Business Info", "📰 Posts", "⭐ Reviews"].map((chip) => (
                <View key={chip} style={styles.chip}>
                  <Text style={styles.chipText}>{chip}</Text>
                </View>
              ))}
            </View>

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={styles.notifyBtn}
                onPress={() =>
                  Alert.alert(
                    "You're on the list! ☕",
                    "We'll notify you as soon as Business Profiles launch.",
                    [{ text: "Awesome!" }],
                  )
                }
              >
                <MaterialIcons
                  name="notifications-none"
                  size={18}
                  color="#FAF2E6"
                />
                <Text style={styles.notifyBtnText}>Notify Me When Ready</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity onPress={dismissOverlay} style={styles.peekLink}>
              <Text style={styles.peekLinkText}>Preview what's coming →</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </ImageBackground>
  );
}

// ─── Mock Info Tab ────────────────────────────────────────────────────────────
function MockInfoTab() {
  return (
    <View style={infoStyles.container}>
      <View style={infoStyles.section}>
        <Text style={infoStyles.sectionTitle}>Description</Text>
        <View style={infoStyles.line} />
        <Text style={infoStyles.sectionIntro}>{MOCK_INFO.info}</Text>
      </View>
      <View style={infoStyles.divider} />

      <View style={infoStyles.section}>
        <Text style={infoStyles.sectionTitle}>Location</Text>
        <View style={infoStyles.line} />
        <InfoRow icon="location-on" value={MOCK_INFO.address} />
        <InfoRow icon="location-city" value={MOCK_INFO.city} />
      </View>
      <View style={infoStyles.divider} />

      <View style={infoStyles.section}>
        <Text style={infoStyles.sectionTitle}>Contact</Text>
        <View style={infoStyles.line} />
        <InfoRow icon="smartphone" value={MOCK_INFO.phone} />
        <InfoRow icon="phone" value={MOCK_INFO.landline} />
        <InfoRow icon="email" value={MOCK_INFO.email} />
      </View>
      <View style={infoStyles.divider} />

      <View style={infoStyles.section}>
        <Text style={infoStyles.sectionTitle}>Branches</Text>
        <View style={infoStyles.line} />
        {MOCK_INFO.branches.split(",").map((b, i) => (
          <InfoRow key={i} icon="store" value={b.trim()} />
        ))}
      </View>
    </View>
  );
}

function InfoRow({ icon, value }: { icon: string; value: string | null }) {
  return (
    <View style={infoStyles.row}>
      <MaterialIcons name={icon as any} size={16} color="#8C6D4F" />
      <Text style={[infoStyles.sectionBody, !value && infoStyles.unavailable]}>
        {value ?? "Not available"}
      </Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  container: { paddingTop: 12, paddingBottom: 100 },
  section: { paddingVertical: 12, backgroundColor: "#FFF7ED", width: "100%" },
  sectionTitle: {
    fontSize: 16,
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
  },
  sectionBody: {
    fontSize: 14,
    color: "#3B2A1A",
    marginLeft: 5,
    fontFamily: "SourceSerifPro-Regular",
    marginTop: 8,
  },
  unavailable: { color: "#aaa", fontStyle: "italic" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    marginLeft: 15,
  },
  divider: { height: 10, backgroundColor: "#FFEFD5" },
  line: {
    height: 1,
    backgroundColor: "#4b2c1148",
    marginVertical: 4,
    width: "98%",
    alignSelf: "center",
  },
});

// ─── Mock Posts Tab ───────────────────────────────────────────────────────────
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

// ─── Star Rating — mirrors ProfileScreen exactly ───────────────────────────────
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

// ─── Mock Reviews Tab — card layout mirrors ProfileScreen.ReviewCard ──────────
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

  return (
    <View style={{ flex: 1 }}>
      {/* Summary header */}
      <View style={reviewStyles.summaryRow}>
        <Text style={reviewStyles.avgScore}>4.8</Text>
        <View>
          <View style={reviewStyles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <MaterialIcons key={s} name="star" size={20} color="#6B4F2E" />
            ))}
          </View>
          <Text style={reviewStyles.reviewCount}>
            {MOCK_REVIEWS.length} reviews
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 100,
        }}
      >
        {MOCK_REVIEWS.map((review) => (
          <View key={review.id} style={reviewStyles.reviewCard}>
            {/* ── Card header: café avatar + meta + three-dot ── */}
            <View style={reviewStyles.reviewCardHeader}>
              {/* Café avatar circle */}
              <View style={reviewStyles.cafeAvatarSmall}>
                <MaterialIcons name="store" size={24} color="#C8A97A" />
              </View>

              {/* Meta column */}
              <View style={reviewStyles.reviewCardMeta}>
                <Text style={reviewStyles.reviewLabel}>Review For</Text>
                <Text style={reviewStyles.reviewCafeName}>
                  {review.cafeName}
                </Text>
                <StarRating rating={review.rating} />
                <Text style={reviewStyles.reviewDate}>{review.date}</Text>
              </View>

              {/* Three-dot (non-interactive in mock) */}
              <TouchableOpacity style={reviewStyles.reviewMoreButton}>
                <MaterialIcons name="more-vert" size={22} color="#6B4F2E" />
              </TouchableOpacity>
            </View>

            {/* Quoted comment */}
            <Text style={reviewStyles.reviewComment}>{`"${review.text}"`}</Text>

            {/* Likes row */}
            <View style={reviewStyles.likesRow}>
              <TouchableOpacity onPress={() => toggleLike(review.id)}>
                <MaterialIcons
                  name={
                    likes[review.id].liked ? "thumb-up" : "thumb-up-off-alt"
                  }
                  size={20}
                  color={likes[review.id].liked ? "#6B4F2E" : "#8C6D4F"}
                />
              </TouchableOpacity>
              <Text
                style={[
                  reviewStyles.likesCount,
                  likes[review.id].liked && reviewStyles.likesCountActive,
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

  rectangle1: {
    backgroundColor: "#E9D0A2",
    borderRadius: 0,
    padding: 0,
    marginBottom: 1,
    width: "100%",
    height: 79,
    shadowColor: "#0b0b0b",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 5,
  },
  shadow: {
    shadowColor: "#00000040",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.75,
    shadowRadius: 7,
  },
  androidShadow: { elevation: 15 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 79,
  },
  logo: { top: 15, width: 40, height: 40 },
  profHolder: { top: 15, width: 40, height: 40 },

  comingSoonBanner: {
    backgroundColor: "#3B2A1A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 30,
  },
  bannerText: {
    color: "#E9D0A2",
    fontSize: 12,
    fontFamily: "SourceSerifPro-Bold",
    letterSpacing: 0.3,
  },

  teaserContent: { maxHeight: SCREEN_HEIGHT * 0.42, overflow: "hidden" },
  wrapper: { position: "relative" },
  coverPhoto: {
    height: 158,
    backgroundColor: "#FAF2E6",
    alignItems: "center",
    justifyContent: "flex-end",
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
    marginLeft: 15,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: -32,
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
  coverPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 1,
  },
  coverPlaceholderText: {
    fontSize: 12,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
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

  teaserVeil: {
    position: "absolute",
    left: 0,
    right: 0,
    top: SCREEN_HEIGHT * 0.28,
    height: 80,
    backgroundColor: "#FAF2E6",
    opacity: 0.55,
    zIndex: 10,
  },

  overlaySheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.65,
    backgroundColor: "#FAF2E6",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 14,
    paddingBottom: 36,
    shadowColor: "#3B2A1A",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 24,
    zIndex: 20,
    gap: 14,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#C4A882",
    marginBottom: 6,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E9D0A2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#C4A882",
    shadowColor: "#8C6D4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  badge: {
    backgroundColor: "#3B2A1A",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  badgeText: {
    color: "#E9D0A2",
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "SourceSerifPro-Bold",
  },
  overlayTitle: {
    fontSize: 26,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
    textAlign: "center",
    lineHeight: 32,
  },
  overlaySubtitle: {
    fontSize: 13,
    color: "#8C6D4F",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "SourceSerifPro-Regular",
    paddingHorizontal: 8,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  chip: {
    backgroundColor: "#E9D0A2",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#C4A882",
  },
  chipText: {
    fontSize: 12,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
  },
  notifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3B2A1A",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: "#3B2A1A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  notifyBtnText: {
    color: "#FAF2E6",
    fontSize: 15,
    fontFamily: "SourceSerifPro-Bold",
  },
  peekLink: { marginTop: 2 },
  peekLinkText: {
    color: "#8C6D4F",
    fontSize: 13,
    fontFamily: "SourceSerifPro-Regular",
    textDecorationLine: "underline",
  },
});

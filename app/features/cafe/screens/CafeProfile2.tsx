import { RootStackParamList } from "@/App";
import TopBar from "@/components/TopBar";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRoute } from "@react-navigation/native";
import { ActivityIndicator } from "react-native";
import { CafeDetail, getCafeById } from "../services/cafeService";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CafeProfile">;
};

type Tab = "Cafe-Info" | "Cafe-Reviews" | "Cafe-Posts" | "Cafe-Ammenities-Menu";

type Review = {
  id: string;
  userName: string;
  avatarURL: string;
  rating: number;
  comment: string;
  dateCreated: string;
  imageURL: string[];
  likes: number;
  tags: string[];
};

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

const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    userName: "Juan de la Cruz",
    avatarURL: "",
    rating: 4,
    comment: "Great ambiance and really good coffee. Perfect for studying!",
    dateCreated: "2026-02-05",
    imageURL: [],
    likes: 25,
    tags: ["Cozy", "Good Coffee", "Study Spot"],
  },
  {
    id: "2",
    userName: "Maria Santos",
    avatarURL: "",
    rating: 5,
    comment: "Absolutely loved their pastries! Will definitely come back.",
    dateCreated: "2026-02-03",
    imageURL: [
      "https://picsum.photos/200/200",
      "https://picsum.photos/201/200",
    ],
    likes: 42,
    tags: ["Pastries", "Desserts", "Favorite"],
  },
  {
    id: "3",
    userName: "Carlos Reyes",
    avatarURL: "",
    rating: 3,
    comment: "Coffee was decent but service was a bit slow.",
    dateCreated: "2026-01-30",
    imageURL: [],
    likes: 10,
    tags: ["Slow Service"],
  },
  {
    id: "4",
    userName: "Angela Cruz",
    avatarURL: "",
    rating: 5,
    comment: "Best cafe in Cebu! Love the vibe and music.",
    dateCreated: "2026-01-28",
    imageURL: ["https://picsum.photos/202/200"],
    likes: 67,
    tags: ["Music", "Vibes", "Top Rated"],
  },
  {
    id: "5",
    userName: "Mark Villanueva",
    avatarURL: "",
    rating: 4,
    comment: "Nice place to hang out with friends. Spacious seating.",
    dateCreated: "2026-01-25",
    imageURL: [],
    likes: 18,
    tags: ["Spacious", "Friends"],
  },
  {
    id: "6",
    userName: "Sophia Lim",
    avatarURL: "",
    rating: 5,
    comment: "Instagram-worthy place! Loved every corner.",
    dateCreated: "2026-01-20",
    imageURL: [
      "https://picsum.photos/203/200",
      "https://picsum.photos/204/200",
      "https://picsum.photos/205/200",
    ],
    likes: 55,
    tags: ["Instagrammable", "Aesthetic"],
  },
  {
    id: "7",
    userName: "David Tan",
    avatarURL: "",
    rating: 2,
    comment: "Too crowded during peak hours. Hard to find seats.",
    dateCreated: "2026-01-18",
    imageURL: [],
    likes: 5,
    tags: ["Crowded"],
  },
  {
    id: "8",
    userName: "Ella Gomez",
    avatarURL: "",
    rating: 4,
    comment: "Friendly staff and fast service. Coffee is solid.",
    dateCreated: "2026-01-15",
    imageURL: [],
    likes: 22,
    tags: ["Friendly Staff", "Fast Service"],
  },
];

const MOCK_CAFE: CafeProfileInformation = {
  name: "Cafe Coffee Friends Co.",
  address:
    "Unit 3, F. Ramos Street, Cogon Ramos, Camputhaw, Cebu City, Central Visayas, 6000, Philippines",
  email: "support@goodcup.ph",
  phone: "(032) 380 2362",
  avatarURL: null,
  coverPhotoURL: null,
  menuURLs: null,

  averageRating: 5.0,
  reviewCount: 100,
  favoritesCount: 67,
  openingTime: "8:00 AM",
  closingTime: "6:00 PM",
  openingDays: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
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

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialIcons
          key={star}
          name={star <= rating ? "star" : "star-border"}
          size={13}
          color="#C8863A"
        />
      ))}
    </View>
  );
}

// ─── Review Card ─────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const imageCount = review.imageURL.length;

  return (
    <View style={reviewCardStyles.container}>
      {/* Header */}
      <View style={reviewCardStyles.header}>
        <View style={reviewCardStyles.avatar}>
          {review.avatarURL ? (
            <Image
              source={{ uri: review.avatarURL }}
              style={{ width: "100%", height: "100%", borderRadius: 17 }}
            />
          ) : (
            <MaterialIcons name="person" size={20} color="#C8A97A" />
          )}
        </View>
        <View style={reviewCardStyles.meta}>
          <Text style={reviewCardStyles.userName}>{review.userName}</Text>
          <StarRating rating={review.rating} />
          <Text style={reviewCardStyles.date}>
            {new Date(review.dateCreated).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>
        <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="more-vert" size={18} color="#8C6D4F" />
        </TouchableOpacity>
      </View>

      {/* Comment */}
      <Text style={reviewCardStyles.comment}>"{review.comment}"</Text>

      {/* Image Grid */}
      {imageCount === 1 && (
        <Image
          source={{ uri: review.imageURL[0] }}
          style={reviewCardStyles.imageSingle}
          resizeMode="cover"
        />
      )}
      {imageCount === 2 && (
        <View style={reviewCardStyles.imageRow}>
          {review.imageURL.map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              style={reviewCardStyles.imageHalf}
              resizeMode="cover"
            />
          ))}
        </View>
      )}
      {imageCount >= 3 && (
        <View style={reviewCardStyles.imageRow}>
          <Image
            source={{ uri: review.imageURL[0] }}
            style={reviewCardStyles.imageMain}
            resizeMode="cover"
          />
          <View style={reviewCardStyles.imageSubCol}>
            <Image
              source={{ uri: review.imageURL[1] }}
              style={reviewCardStyles.imageSub}
              resizeMode="cover"
            />
            <View style={{ position: "relative" }}>
              <Image
                source={{ uri: review.imageURL[2] }}
                style={[
                  reviewCardStyles.imageSub,
                  imageCount > 3 && { opacity: 0.4 },
                ]}
                resizeMode="cover"
              />
              {imageCount > 3 && (
                <View style={reviewCardStyles.moreOverlay}>
                  <Text style={reviewCardStyles.moreText}>
                    +{imageCount - 3}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Tags */}
      {review.tags.length > 0 && (
        <View style={reviewCardStyles.tagsRow}>
          {review.tags.map((tag) => (
            <View key={tag} style={reviewCardStyles.tag}>
              <Text style={reviewCardStyles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Likes */}
      <View style={reviewCardStyles.likesRow}>
        <MaterialIcons name="thumb-up-off-alt" size={16} color="#8C6D4F" />
        <Text style={reviewCardStyles.likesCount}>{review.likes}</Text>
      </View>
    </View>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  const imageCount = post.imageURL.length;

  return (
    <View style={postCardStyles.container}>
      {/* Image Grid */}
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

      {/* Body */}
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
      {/* Stats Row */}
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

      {/* Hours */}
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

      {/* Contact */}
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

      {/* Others */}
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

      {/* Menu */}
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

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CafeProfileScreen({ navigation }: Props) {
  const route = useRoute();
  const params = route.params as { cafeId?: string } | undefined;
  const cafeId = params?.cafeId ?? "";

  const [activeTab, setActiveTab] = useState<Tab>("Cafe-Info");

  const TAB_ICONS: { key: Tab; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: "Cafe-Info", icon: "info" },
    { key: "Cafe-Reviews", icon: "rate-review" },
    { key: "Cafe-Posts", icon: "view-compact" },
    { key: "Cafe-Ammenities-Menu", icon: "list" },
  ];

  // Replace MOCK_CAFE with real state
  const [cafe, setCafe] = useState<CafeDetail | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#EDDEC7",
        }}
      >
        <ActivityIndicator size="large" color="#8C6D4F" />
      </View>
    );
  }

  if (!cafe) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#EDDEC7",
        }}
      >
        <Text style={{ color: "#8C6D4F" }}>Café not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TopBar navigation={navigation} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
      >
        {/* ── CAFE HEADER BLOCK ── */}
        <View style={{ backgroundColor: "#EDDEC7" }}>
          {/* Cover Photo */}
          <View style={avatarStyles.headerBand}>
            {cafe.cover_photo_url ? (
              <Image
                source={{ uri: cafe.cover_photo_url }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            ) : null}
          </View>

          {/* Avatar + Name Row */}
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

          {/* Divider */}
          <View style={styles.divider} />

          {/* Tab Bar */}
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

        {/* ── TAB CONTENT ── */}
        <View style={{ backgroundColor: "#FFEFD5" }}>
          <View style={cafeProfileNavStyles.tabContent}>
            {/* CAFE INFO */}
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

            {/* REVIEWS */}
            {activeTab === "Cafe-Reviews" && (
              <View>
                <WriteReviewCTA navigation={navigation} cafeName={MOCK_CAFE.name} />
                {MOCK_REVIEWS.length === 0 ? (
                  <EmptyState
                    icon="rate-review"
                    title="No reviews yet..."
                    subtitle="Be the first to leave a review for this café!"
                  />
                ) : (
                  MOCK_REVIEWS.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                )}
              </View>
            )}

            {/* POSTS */}
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

            {/* AMENITIES & MENU */}
            {activeTab === "Cafe-Ammenities-Menu" && (
              <AmenitiesMenuTab
                amenities={MOCK_AMENITIES}
                menuURLs={cafe.menu_urls}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function WriteReviewCTA({
  navigation,
  cafeName,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList, "CafeProfile">;
  cafeName: string;
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
            initialRating: rating,
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

    const setHalf = () => onChange(Math.max(1, Math.min(5, index - 0.5)));
    const setFull = () => onChange(Math.max(1, Math.min(5, index)));

    return (
      <View key={index} style={starInputStyles.starBox}>
        <MaterialIcons name={name} size={30} color="#3B2A1A" />
        <Pressable style={starInputStyles.leftHalf} onPress={setHalf} />
        <Pressable style={starInputStyles.rightHalf} onPress={setFull} />
      </View>
    );
  };

  return (
    <View style={writeReviewStyles.starsRow}>
      {[1, 2, 3, 4, 5].map(renderStar)}
    </View>
  );
}

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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#EDDEC7" },
  container: { flexGrow: 1, backgroundColor: "#EDDEC7" },

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
  },
});

const avatarStyles = StyleSheet.create({
  headerBand: {
    height: 125,
    backgroundColor: "#D4B896",
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
    backgroundColor: "#E6D6BE",
    borderWidth: 2,
    borderColor: "#EDDEC7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
});

const starStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 1,
    marginTop: 1,
  },
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
    padding: 12,
    marginBottom: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
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

  meta: {
    flex: 1,
    gap: 1,
  },

  userName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3B2A1A",
  },

  date: {
    fontSize: 11,
    color: "#8C6D4F",
    marginTop: 1,
  },

  comment: {
    fontSize: 12,
    color: "#4A3220",
    lineHeight: 18,
    fontStyle: "italic",
    marginBottom: 8,
  },

  imageSingle: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#D2BA94",
  },

  imageRow: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 8,
  },

  imageHalf: {
    flex: 1,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#D2BA94",
  },

  imageMain: {
    width: "48%",
    height: 120,
    borderRadius: 8,
    backgroundColor: "#C8A97A",
  },

  imageSubCol: {
    width: "48%",
    gap: 5,
  },

  imageSub: {
    height: 57,
    borderRadius: 8,
    backgroundColor: "#BFA080",
  },

  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  moreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 6,
  },

  tag: {
    backgroundColor: "#D2BA94",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  tagText: {
    fontSize: 10,
    color: "#5A3E28",
    fontWeight: "500",
  },

  likesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },

  likesCount: {
    fontSize: 12,
    color: "#8C6D4F",
  },
});

const postCardStyles = StyleSheet.create({
  container: {
    backgroundColor: "#E6D6BE",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },

  imageSingle: {
    width: "100%",
    height: 200,
    backgroundColor: "#C8A97A",
  },

  imageRow: {
    flexDirection: "row",
  },

  imageHalf: {
    flex: 1,
    height: 160,
    backgroundColor: "#C8A97A",
  },

  imageGrid3: {
    flexDirection: "row",
    height: 180,
  },

  imageGrid3Main: {
    flex: 2,
    height: "100%",
    backgroundColor: "#C8A97A",
  },

  imageGrid3Sub: {
    flex: 1,
    flexDirection: "column",
  },

  imageGrid3SubItem: {
    flex: 1,
    backgroundColor: "#BFA080",
  },

  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  moreText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  body: {
    padding: 10,
  },

  caption: {
    fontSize: 13,
    color: "#4A3220",
    lineHeight: 19,
    marginBottom: 8,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  date: {
    fontSize: 11,
    color: "#8C6D4F",
  },

  likesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  likesCount: {
    fontSize: 12,
    color: "#8C6D4F",
  },
});

const infoStyles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#E6D6BE",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },

  statNum: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6B4F2E",
  },

  statLabel: {
    fontSize: 10,
    color: "#8C6D4F",
    marginTop: 2,
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
    backgroundColor: "#E6D6BE",
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },

  infoText: {
    fontSize: 13,
    color: "#4A3220",
    lineHeight: 18,
  },

  infoSubText: {
    fontSize: 11,
    color: "#8C6D4F",
    marginTop: 2,
  },

  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 4,
  },

  dayPill: {
    backgroundColor: "#D2BA94",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  dayPillClosed: {
    backgroundColor: "#EDE0CE",
  },

  dayPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#5A3E28",
  },

  dayPillTextClosed: {
    color: "#B09070",
    textDecorationLine: "line-through",
  },
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

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  item: {
    width: "47.5%",
    backgroundColor: "#E6D6BE",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  itemOff: {
    backgroundColor: "#EDE0CE",
  },

  itemLabel: {
    fontSize: 12,
    color: "#4A3220",
    flex: 1,
  },

  itemLabelOff: {
    color: "#B09070",
    textDecorationLine: "line-through",
  },

  othersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 4,
  },

  otherPill: {
    backgroundColor: "#D2BA94",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  otherPillText: {
    fontSize: 11,
    color: "#5A3E28",
    fontWeight: "500",
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

  menuPlaceholderText: {
    fontSize: 12,
    color: "#B09070",
  },
});

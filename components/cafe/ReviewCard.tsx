import { formatReviewDate, ReviewWithMeta } from "@/app/shared/modals/reviewService";
import { useRef, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { StarRating } from "./StarRating";


export function ReviewCard({
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

  const columns = cardWidth < 480 ? 1 : cardWidth < 800 ? 2 : 3;
  const gap = 6;
  const imageWidth =
    cardWidth > 0 ? Math.floor((cardWidth - gap * (columns - 1)) / columns) : 0;
  const imageHeight = Math.round(imageWidth * 0.68);
  const isNarrow = columns === 1;

  const displayDate = formatReviewDate(review.created_at, review.updated_at);

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
      <View style={reviewCardStyles.header}>
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
          <View style={reviewCardStyles.nameRatingRow}>
            <TouchableOpacity
              onPress={() =>
                review.user_id ? onNavigateToProfile(review.user_id) : undefined
              }
              disabled={!review.user_id}
              activeOpacity={0.75}
              style={reviewCardStyles.userNameWrapper}
            >
              <Text
                style={reviewCardStyles.userName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {review.profile?.username ?? "Anonymous"}
                {isOwn && <Text style={reviewCardStyles.youBadge}> (you)</Text>}
              </Text>
            </TouchableOpacity>
            <StarRating rating={review.rating} />
          </View>
          <Text style={reviewCardStyles.date}>{displayDate}</Text>
        </View>

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
                { opacity: menuAnim, transform: [{ scale: menuScale }] },
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

      {review.comment ? (
        <Text style={reviewCardStyles.comment}>"{review.comment}"</Text>
      ) : null}

      {hasImages && cardWidth > 0 && (
        <View style={reviewCardStyles.mediaWrapper}>
          {isNarrow ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) =>
                  setActiveIndex(
                    Math.round(e.nativeEvent.contentOffset.x / cardWidth),
                  )
                }
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

      <View style={reviewCardStyles.footer}>
        <Pressable
          style={reviewCardStyles.likeBtn}
          onPress={() => onToggleLike(review.id, review.isLiked)}
          accessibilityRole="button"
          accessibilityLabel={review.isLiked ? "Remove like" : "Like review"}
        >
          <MaterialIcons
            name={review.isLiked ? "thumb-up" : "thumb-up-off-alt"}
            size={20}
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
    </View>
  );
}


const reviewCardStyles = StyleSheet.create({
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
    position: "relative",
    zIndex: 1,
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
  meta: { flex: 1, gap: 1 },
  // Row that holds the truncated username and star rating side by side
  nameRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  // Bounded width so numberOfLines + ellipsizeMode kick in at ~12 chars (fontSize 15)
  userNameWrapper: {
    maxWidth: 96,
    flexShrink: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3B2A1A",
    flexShrink: 1,
  },
  youBadge: { fontSize: 11, fontWeight: "400", color: "#8C6D4F" },
  date: { fontSize: 11, color: "#8C6D4F", marginTop: 0 },
  comment: {
    fontSize: 14,
    color: "#4A3220",
    lineHeight: 18,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 15,
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
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  likesCount: { fontSize: 14, color: "#8C6D4F" },
  likesCountActive: { color: "#6B4F2E" },
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
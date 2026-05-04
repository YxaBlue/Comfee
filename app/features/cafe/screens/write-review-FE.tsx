import { RootStackParamList } from "@/App";
import { supabase } from "@/app/shared/lib/supabaseClient";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  createReview,
  editReview,
  uploadReviewImage,
} from "../../../shared/modals/reviewService";

type Props = NativeStackScreenProps<RootStackParamList, "WriteReviewFE">;

export default function WriteReviewFEScreen({ navigation, route }: Props) {
  const cafeName = route.params?.cafeName ?? "Cafe Name";
  const cafeId = route.params?.cafeId;
  const onReviewPosted = route.params?.onReviewPosted;

  // Store the pre-filled rating separately so we can detect actual user edits
  const initialRating = route.params?.initialRating ?? 0;

  const [rating, setRating] = useState<number>(initialRating);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  const reviewId = route.params?.reviewId;
  const isEditMode = typeof reviewId === "number";

  // Profile state — loaded from Supabase
  const [username, setUsername] = useState(route.params?.username ?? "");
  const [avatarURL, setAvatarURL] = useState(route.params?.avatarURL ?? "");
  const [profileLoading, setProfileLoading] = useState(!route.params?.username);

  // Load current user's profile if not passed via params
  useEffect(() => {
    if (route.params?.username) return;
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from("profile")
          .select("username, profile_picture")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        if (data) {
          setUsername(data.username ?? "");
          setAvatarURL(data.profile_picture ?? "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setProfileLoading(false);
      }
    })();
  }, []);

  const charCount = text.length;

  const canPost = useMemo(
    () => rating > 0 && cafeId != null && !submitting && !reviewLoading,
    [rating, cafeId, submitting, reviewLoading],
  );

  // Only considered dirty if the user actually changed something inside this screen
  const isDirty =
    rating !== initialRating || text.trim().length > 0 || images.length > 0;

  const handleClose = () => navigation.goBack();

  useEffect(() => {
    if (!isEditMode) return;
    setReviewLoading(true);

    (async () => {
      try {
        const { data, error } = await supabase
          .from("review")
          .select("rating, comment, images_url")
          .eq("id", reviewId)
          .single();

        if (error) throw error;
        if (data) {
          setRating(data.rating ?? 0);
          setText(data.comment ?? "");
          setImages(Array.isArray(data.images_url) ? data.images_url : []);
        }
      } catch (err) {
        console.error("Failed to load review for editing:", err);
      } finally {
        setReviewLoading(false);
      }
    })();
  }, [isEditMode, reviewId]);

  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const remaining = 5 - images.length;
    if (remaining <= 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: remaining,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, 5));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!canPost || cafeId == null) return;
    setSubmitting(true);
    try {
      if (isEditMode && reviewId != null) {
        const existingRemoteUrls = images.filter((uri) =>
          uri.startsWith("http"),
        );
        const localUris = images.filter((uri) => !uri.startsWith("http"));

        const uploadedUrls = [
          ...existingRemoteUrls,
          ...(localUris.length > 0
            ? await Promise.all(
                localUris.map((uri) => uploadReviewImage(reviewId, uri)),
              )
            : []),
        ];

        await editReview(String(reviewId), {
          rating,
          comment: text.trim(),
          images_url: uploadedUrls,
        });
      } else {
        const review = await createReview({
          cafe_id: cafeId,
          rating,
          comment: text.trim(),
        });

        let uploadedUrls: string[] = [];
        if (images.length > 0) {
          uploadedUrls = await Promise.all(
            images.map((uri) => uploadReviewImage(review.id, uri)),
          );

          await supabase
            .from("review")
            .update({ images_url: uploadedUrls })
            .eq("id", review.id);
        }
      }

      onReviewPosted?.();
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={handleClose}
          style={styles.headerIconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="close" size={22} color="#3B2A1A" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {cafeName}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEditMode ? "Edit your review" : "Rate this cafe"}
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          disabled={!canPost}
          onPress={handlePost}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#3B2A1A" />
          ) : (
            <Text
              style={[styles.postText, !canPost && styles.postTextDisabled]}
            >
              Post
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── User Row ── */}
        <View style={styles.userRow}>
          <View style={styles.avatarCircle}>
            {profileLoading ? (
              <ActivityIndicator size="small" color="#C8A97A" />
            ) : avatarURL ? (
              <Image source={{ uri: avatarURL }} style={styles.avatarImg} />
            ) : (
              <MaterialIcons name="person" size={28} color="#C8A97A" />
            )}
          </View>
          <View style={styles.userMeta}>
            {profileLoading ? (
              <View style={styles.skeletonName} />
            ) : (
              <Text style={styles.userName}>{username || "Anonymous"}</Text>
            )}
            <Text style={styles.userHint}>
              Reviews are public and include your account info.
            </Text>
          </View>
        </View>

        {/* ── Stars ── */}
        <View style={styles.starsWrap}>
          <StarRatingInput value={rating} onChange={setRating} size={34} />
        </View>

        {/* ── Review Text ── */}
        <View style={styles.inputCard}>
          <TextInput
            value={text}
            onChangeText={(next) => {
              if (next.length <= 500) setText(next);
            }}
            placeholder="Describe your experience (optional)"
            placeholderTextColor="#C2B39B"
            multiline
            textAlignVertical="top"
            style={styles.textInput}
          />
          <Text style={styles.counterText}>{charCount}/500</Text>
        </View>

        {/* ── Photos ── */}
        <View style={styles.photosSection}>
          <Text style={styles.photosLabel}>
            Photos ({images.length}/5) — optional
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photosRow}
          >
            {images.map((uri, index) => (
              <View key={index} style={styles.thumbWrap}>
                <Image
                  source={{ uri }}
                  style={styles.thumbImg}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.thumbRemoveBtn}
                  onPress={() => handleRemoveImage(index)}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <MaterialIcons name="close" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < 5 && (
              <TouchableOpacity
                style={styles.addPhotoBtn}
                onPress={handlePickImages}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="add-photo-alternate"
                  size={28}
                  color="#A97C4E"
                />
                <Text style={styles.addPhotoText}>Add</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Star Rating Input ─────────────────────────────────────────────────────────

function StarRatingInput({
  value,
  onChange,
  size,
}: {
  value: number;
  onChange: (next: number) => void;
  size: number;
}) {
  const renderStar = (index: number) => {
    const full = value >= index;
    const half = !full && value >= index - 0.5;

    const name: keyof typeof MaterialIcons.glyphMap = full
      ? "star"
      : half
        ? "star-half"
        : "star-border";

    const setHalf = () => onChange(Math.max(0, Math.min(5, index - 0.5)));
    const setFull = () => onChange(Math.max(0, Math.min(5, index)));

    return (
      <View
        key={index}
        style={[starStyles.starBox, { width: size + 6, height: size + 6 }]}
      >
        <MaterialIcons name={name} size={size} color="#3B2A1A" />
        <Pressable style={starStyles.leftHalf} onPress={setHalf} />
        <Pressable style={starStyles.rightHalf} onPress={setFull} />
      </View>
    );
  };

  return <View style={styles.starsRow}>{[1, 2, 3, 4, 5].map(renderStar)}</View>;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#FFEFD5" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E3D3B7",
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerTitleWrap: { flex: 1, minWidth: 0 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3B2A1A",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#8C6D4F",
  },
  postText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3B2A1A",
  },
  postTextDisabled: { opacity: 0.35 },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },

  // User row
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#D2BA94",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarImg: { width: "100%", height: "100%" },
  userMeta: { flex: 1, minWidth: 0 },
  skeletonName: {
    height: 14,
    width: 100,
    borderRadius: 7,
    backgroundColor: "#D2BA94",
    marginBottom: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B2A1A",
    marginBottom: 2,
  },
  userHint: {
    fontSize: 11,
    color: "#8C6D4F",
    lineHeight: 15,
  },

  // Stars
  starsWrap: { marginBottom: 14 },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 10 },

  // Text input
  inputCard: {
    backgroundColor: "#F7F0E2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3D3B7",
    padding: 12,
    minHeight: 200,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 18,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#3B2A1A",
    lineHeight: 20,
  },
  counterText: {
    alignSelf: "flex-end",
    marginTop: 6,
    fontSize: 12,
    color: "#8C6D4F",
  },

  // Photos
  photosSection: { gap: 10 },
  photosLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B4F2E",
  },
  photosRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  thumbWrap: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  thumbImg: { width: "100%", height: "100%" },
  thumbRemoveBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
    padding: 3,
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#C8A97A",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F0E2",
    gap: 2,
  },
  addPhotoText: {
    fontSize: 11,
    color: "#A97C4E",
    fontWeight: "600",
  },
});

const starStyles = StyleSheet.create({
  starBox: {
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

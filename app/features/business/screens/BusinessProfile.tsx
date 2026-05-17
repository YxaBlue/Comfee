import { RootStackParamList } from "@/App";
import TopBar from "@/components/TopBar";
import { ReviewCard } from "@/components/cafe/ReviewCard";
import { ReviewsSummaryStrip } from "@/components/cafe/ReviewsSummaryStrip";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "@/app/shared/lib/supabaseClient";
import {
  CafeInfoTab,
  StarFilterBar,
} from "@/app/features/cafe/screens/cafeProfile";
import {
  CafeDetail,
  getCafeById,
} from "@/app/features/cafe/services/cafeService";
import { getProfile } from "@/app/features/profile/services/profileService";
import {
  formatReviewDate,
  getReviewsByCafe,
  ReviewWithMeta,
  toggleCafeReviewUpvote,
} from "@/app/shared/modals/reviewService";
import { CafePost, useCafePosts } from "@/hooks/useCafePosts";

type NavProps = NativeStackNavigationProp<RootStackParamList, "ProfileBusi">;
type Tab = "info" | "posts" | "reviews";

type LoadStatus =
  | "loading"
  | "ready"
  | "not_authenticated"
  | "no_owner"
  | "cafe_load_failed";

export default function BusinessProfile() {
  const navigation = useNavigation<NavProps>();
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [cafe, setCafe] = useState<CafeDetail | null>(null);
  const [cafeId, setCafeId] = useState<string>("");
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [loadErrorDetail, setLoadErrorDetail] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const [cafeReviews, setCafeReviews] = useState<ReviewWithMeta[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [createPostVisible, setCreatePostVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.warn(
            "[BusinessProfile] Not authenticated:",
            authError?.message,
          );
          setLoadStatus("not_authenticated");
          return;
        }

        setCurrentUserId(user.id);
        console.log("[BusinessProfile] Authenticated user id:", user.id);

        try {
          const profile = await getProfile(user.id);
          setCurrentUserProfile(profile);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        }

        const { data: ownerRows, error: ownerError } = await supabase
          .from("cafe_owners")
          .select("cafe_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (ownerError) {
          console.error(
            "[BusinessProfile] cafe_owners query error:",
            ownerError,
          );
          setLoadErrorDetail(ownerError.message);
          setLoadStatus("no_owner");
          return;
        }

        const ownerCafeId = ownerRows?.[0]?.cafe_id;
        console.log("[BusinessProfile] cafe_owners result:", ownerRows);

        if (!ownerCafeId) {
          setLoadStatus("no_owner");
          return;
        }

        const id = String(ownerCafeId);
        setCafeId(id);

        let cafeData: CafeDetail | null = null;
        try {
          cafeData = await getCafeById(id);
        } catch (cafeErr: any) {
          console.error("[BusinessProfile] getCafeById error:", cafeErr);
          setLoadErrorDetail(cafeErr?.message ?? "Failed to load café details");
          setLoadStatus("cafe_load_failed");
          return;
        }

        if (!cafeData) {
          console.warn("[BusinessProfile] Café not found for id:", id);
          setLoadStatus("cafe_load_failed");
          return;
        }

        const { count, error: countError } = await supabase
          .from("favorite_cafes")
          .select("*", { count: "exact", head: true })
          .eq("cafe_id", Number(id));

        setCafe(cafeData);
        if (!countError) setFavoritesCount(count ?? 0);
        setLoadStatus("ready");
      } catch (err: any) {
        console.error("Failed to load business profile:", err);
        setLoadErrorDetail(err?.message ?? "Unknown error");
        setLoadStatus("no_owner");
      }
    })();
  }, []);

  const reloadCafe = useCallback(async () => {
    if (!cafeId) return;
    try {
      const cafeData = await getCafeById(cafeId);
      if (cafeData) setCafe(cafeData);
    } catch (err) {
      console.error("[BusinessProfile] Failed to refresh café:", err);
    }
  }, [cafeId]);

  useFocusEffect(
    useCallback(() => {
      if (loadStatus === "ready") {
        void reloadCafe();
      }
    }, [loadStatus, reloadCafe]),
  );

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

  const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of cafeReviews) {
    const bucket = Math.floor(r.rating);
    if (bucket >= 1 && bucket <= 5) {
      starCounts[bucket] = (starCounts[bucket] ?? 0) + 1;
    }
  }

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

  const handleFabPress = () => {
    if (activeTab === "posts") {
      setCreatePostVisible(true);
      return;
    }
    if (activeTab === "info" && cafeId) {
      navigation.navigate("EditCafeProfile", { cafeId });
      return;
    }
  };

  if (loadStatus === "loading") {
    return (
      <ImageBackground
        source={require("../../../../assets/images/bg1.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <TopBar
          navigation={navigation}
          profilePicture={currentUserProfile?.profile_picture}
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8C6D4F" />
        </View>
      </ImageBackground>
    );
  }

  if (loadStatus !== "ready" || !cafe) {
    const emptyCopy =
      loadStatus === "not_authenticated"
        ? {
            title: "Sign in required",
            subtitle: "Log in to view your business profile.",
          }
        : loadStatus === "cafe_load_failed"
          ? {
              title: "Could not load your café",
              subtitle:
                loadErrorDetail ??
                `Café #${cafeId || "?"} is linked but details could not be loaded.`,
            }
          : {
              title: "No café linked to your account",
              subtitle: "Café needs to be linked.",
            };

    return (
      <ImageBackground
        source={require("../../../../assets/images/bg1.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <TopBar
          navigation={navigation}
          profilePicture={currentUserProfile?.profile_picture}
        />
        <View style={styles.centered}>
          <MaterialIcons name="store" size={48} color="#C4A882" />
          <Text style={styles.emptyTitle}>{emptyCopy.title}</Text>
          <Text style={styles.emptySubtitle}>{emptyCopy.subtitle}</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../../../assets/images/bg1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <TopBar
        navigation={navigation}
        profilePicture={currentUserProfile?.profile_picture}
      />

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.wrapper}>
          <View style={styles.coverPhoto}>
            {cafe.cover_photo_url ? (
              <Image
                source={{ uri: cafe.cover_photo_url }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <MaterialIcons name="image" size={32} color="#C4A882" />
                <Text style={styles.coverPlaceholderText}>No cover photo</Text>
              </View>
            )}
          </View>

          <View style={styles.businessProf}>
            {cafe.avatar_url ? (
              <Image
                source={{ uri: cafe.avatar_url }}
                style={{ width: "100%", height: "100%", borderRadius: 50 }}
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons name="store" size={40} color="#8C6D4F" />
            )}
          </View>

          <View style={styles.infoHolder}>
            <Text style={styles.cafeName}>{cafe.name}</Text>
            <View style={styles.locRow}>
              <MaterialIcons name="location-on" size={12} color="#8C6D4F" />
              <Text style={styles.cafeLoc} numberOfLines={1}>
                {cafe.address}
              </Text>
            </View>
          </View>

          <View style={styles.line} />
          <View style={styles.divider} />

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

          {activeTab === "info" && (
            <CafeInfoTab cafe={{ ...cafe, favoritesCount }} />
          )}
          {activeTab === "posts" && (
            <OwnerPostsTab
              cafeId={Number(cafeId)}
              cafeName={cafe.name}
              cafeAvatarUrl={cafe.avatar_url}
              createPostVisible={createPostVisible}
              onCloseCreatePost={() => setCreatePostVisible(false)}
            />
          )}
          {activeTab === "reviews" && (
            <OwnerReviewsTab
              cafe={cafe}
              reviews={filteredReviews}
              allReviews={cafeReviews}
              loading={reviewsLoading}
              starFilter={starFilter}
              starCounts={starCounts}
              onSelectStar={setStarFilter}
              onToggleLike={handleToggleLike}
              onNavigateToProfile={(userId) => {
                if (userId) navigation.navigate("Profile", { userId });
              }}
            />
          )}
        </View>
      </ScrollView>

      {activeTab !== "reviews" && (
        <TouchableOpacity style={styles.editButton} onPress={handleFabPress}>
          <MaterialIcons
            name={activeTab === "posts" ? "add" : "edit"}
            size={activeTab === "posts" ? 25 : 20}
            color="#8C6D4F"
          />
        </TouchableOpacity>
      )}
    </ImageBackground>
  );
}

function OwnerPostsTab({
  cafeId,
  cafeName,
  cafeAvatarUrl,
  createPostVisible,
  onCloseCreatePost,
}: {
  cafeId: number;
  cafeName: string;
  cafeAvatarUrl: string | null;
  createPostVisible: boolean;
  onCloseCreatePost: () => void;
}) {
  const { posts, loading, addPost, updatePost, deletePost } =
    useCafePosts(cafeId);
  const [caption, setCaption] = useState("");
  const [selectedPhotoUris, setSelectedPhotoUris] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [editingPost, setEditingPost] = useState<CafePost | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editPhotoUris, setEditPhotoUris] = useState<string[]>([]);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [pendingDeletePostId, setPendingDeletePostId] = useState<number | null>(
    null,
  );
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [postDeleteErrors, setPostDeleteErrors] = useState<
    Record<number, string>
  >({});

  const canSubmit = caption.trim().length > 0 || selectedPhotoUris.length > 0;
  const canSaveEdit = editCaption.trim().length > 0 || editPhotoUris.length > 0;

  const resetCreateForm = () => {
    setCaption("");
    setSelectedPhotoUris([]);
    setSubmitError(null);
  };

  const closeCreatePost = () => {
    if (submitting) return;
    resetCreateForm();
    onCloseCreatePost();
  };

  const handlePickPhoto = async () => {
    setSubmitError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setSubmitError(
        "The app does not have permission to read your photo library. Please allow photo access and try again.",
      );
      return;
    }

    const remainingSlots = 5 - selectedPhotoUris.length;
    if (remainingSlots <= 0) {
      setSubmitError("You can add up to 5 photos.");
      return;
    }

    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.85,
      });
    } catch (err: any) {
      setSubmitError(err?.message ?? "The photo picker could not be opened.");
      return;
    }

    if (!result.canceled) {
      const pickedUris = result.assets
        .map((asset) => asset.uri)
        .filter(Boolean);

      if (pickedUris.length === 0) {
        setSubmitError("No photo URI was returned by the photo picker.");
        return;
      }

      setSelectedPhotoUris((prev) => [...prev, ...pickedUris].slice(0, 5));
    }
  };

  const handleSubmitPost = async () => {
    if (!canSubmit || submitting) return;

    setSubmitError(null);
    setSubmitting(true);
    try {
      const { error } = await addPost(caption, selectedPhotoUris);

      if (error) {
        setSubmitError(error);
        return;
      }

      resetCreateForm();
      onCloseCreatePost();
    } catch (err: any) {
      setSubmitError(
        err?.message ?? "Something went wrong while creating the post.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeCaption = (value: string) => {
    setSubmitError(null);
    setCaption(value);
  };

  const handleRemovePhoto = (index: number) => {
    setSubmitError(null);
    setSelectedPhotoUris((prev) => prev.filter((_, i) => i !== index));
  };

  const openEditPost = (post: CafePost) => {
    setEditingPost(post);
    setEditCaption(post.caption ?? "");
    setEditPhotoUris(post.photo_url?.filter(Boolean) ?? []);
    setEditError(null);
  };

  const closeEditPost = () => {
    if (editSubmitting) return;
    setEditingPost(null);
    setEditCaption("");
    setEditPhotoUris([]);
    setEditError(null);
  };

  const handlePickEditPhoto = async () => {
    setEditError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setEditError(
        "The app does not have permission to read your photo library. Please allow photo access and try again.",
      );
      return;
    }

    const remainingSlots = 5 - editPhotoUris.length;
    if (remainingSlots <= 0) {
      setEditError("You can add up to 5 photos.");
      return;
    }

    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.85,
      });
    } catch (err: any) {
      setEditError(err?.message ?? "The photo picker could not be opened.");
      return;
    }

    if (!result.canceled) {
      const pickedUris = result.assets
        .map((asset) => asset.uri)
        .filter(Boolean);
      setEditPhotoUris((prev) => [...prev, ...pickedUris].slice(0, 5));
    }
  };

  const handleRemoveEditPhoto = (index: number) => {
    setEditError(null);
    setEditPhotoUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEditPost = async () => {
    if (!editingPost || !canSaveEdit || editSubmitting) return;

    setEditError(null);
    setEditSubmitting(true);
    try {
      const { error } = await updatePost(
        editingPost.id,
        editCaption,
        editPhotoUris,
      );

      if (error) {
        setEditError(error);
        return;
      }

      setEditingPost(null);
      setEditCaption("");
      setEditPhotoUris([]);
      setEditError(null);
    } catch (err: any) {
      setEditError(
        err?.message ?? "Something went wrong while saving the post.",
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const requestDeletePost = (postId: number) => {
    setPostDeleteErrors((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    setPendingDeletePostId(postId);
  };

  const cancelDeletePost = () => {
    setPendingDeletePostId(null);
  };

  const confirmDeletePost = async (postId: number) => {
    console.log("[BusinessProfile] confirmDeletePost", { postId });
    setDeletingPostId(postId);
    setPostDeleteErrors((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });

    const result = await deletePost(postId);
    console.log("[BusinessProfile] deletePost result", result);

    setDeletingPostId(null);
    setPendingDeletePostId(null);

    if (result.error) {
      setPostDeleteErrors((prev) => ({ ...prev, [postId]: result.error! }));
    }
  };

  const editPostSheet = (
    <EditPostModal
      visible={!!editingPost}
      cafeName={cafeName}
      caption={editCaption}
      photoUris={editPhotoUris}
      submitError={editError}
      submitting={editSubmitting}
      canSave={canSaveEdit}
      onChangeCaption={(value) => {
        setEditError(null);
        setEditCaption(value);
      }}
      onPickPhoto={handlePickEditPhoto}
      onRemovePhoto={handleRemoveEditPhoto}
      onSave={handleSaveEditPost}
      onClose={closeEditPost}
    />
  );

  const deleteConfirmModal = (
    <DeletePostConfirmModal
      visible={pendingDeletePostId !== null}
      deleting={deletingPostId !== null}
      onCancel={cancelDeletePost}
      onConfirm={() => {
        if (pendingDeletePostId !== null) {
          void confirmDeletePost(pendingDeletePostId);
        }
      }}
    />
  );

  if (loading) {
    return (
      <>
        {editPostSheet}
        {deleteConfirmModal}
        <CreatePostSheet
          visible={createPostVisible}
          caption={caption}
          selectedPhotoUris={selectedPhotoUris}
          submitError={submitError}
          submitting={submitting}
          canSubmit={canSubmit}
          onChangeCaption={handleChangeCaption}
          onPickPhoto={handlePickPhoto}
          onRemovePhoto={handleRemovePhoto}
          onSubmit={handleSubmitPost}
          onClose={closeCreatePost}
        />
        <ActivityIndicator
          size="small"
          color="#8C6D4F"
          style={{ marginTop: 20 }}
        />
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <>
        {editPostSheet}
        {deleteConfirmModal}
        <CreatePostSheet
          visible={createPostVisible}
          caption={caption}
          selectedPhotoUris={selectedPhotoUris}
          submitError={submitError}
          submitting={submitting}
          canSubmit={canSubmit}
          onChangeCaption={handleChangeCaption}
          onPickPhoto={handlePickPhoto}
          onRemovePhoto={handleRemovePhoto}
          onSubmit={handleSubmitPost}
          onClose={closeCreatePost}
        />
        <View style={styles.emptyTab}>
          <MaterialIcons name="article" size={40} color="#C4A882" />
          <Text style={styles.emptyTabTitle}>No posts yet</Text>
          <Text style={styles.emptyTabSubtitle}>
            Tap + to share your first update.
          </Text>
        </View>
      </>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {editPostSheet}
      {deleteConfirmModal}
      <CreatePostSheet
        visible={createPostVisible}
        caption={caption}
        selectedPhotoUris={selectedPhotoUris}
        submitError={submitError}
        submitting={submitting}
        canSubmit={canSubmit}
        onChangeCaption={handleChangeCaption}
        onPickPhoto={handlePickPhoto}
        onRemovePhoto={handleRemovePhoto}
        onSubmit={handleSubmitPost}
        onClose={closeCreatePost}
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 100,
        }}
      >
        {posts.map((post) => {
          const postId = Number(post.id);
          return (
            <View key={postId} style={postListStyles.postWrap}>
              <OwnerPostCard
                post={post}
                cafeName={cafeName}
                cafeAvatarUrl={cafeAvatarUrl}
                isDeleting={deletingPostId === postId}
                onEdit={() => openEditPost(post)}
                onDelete={() => requestDeletePost(postId)}
              />

              {postDeleteErrors[postId] ? (
                <View style={postListStyles.errorBar}>
                  <MaterialIcons
                    name="error-outline"
                    size={16}
                    color="#C0392B"
                  />
                  <Text style={postListStyles.errorText}>
                    {postDeleteErrors[postId]}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function CreatePostSheet({
  visible,
  caption,
  selectedPhotoUris,
  submitError,
  submitting,
  canSubmit,
  onChangeCaption,
  onPickPhoto,
  onRemovePhoto,
  onSubmit,
  onClose,
}: {
  visible: boolean;
  caption: string;
  selectedPhotoUris: string[];
  submitError: string | null;
  submitting: boolean;
  canSubmit: boolean;
  onChangeCaption: (value: string) => void;
  onPickPhoto: () => void;
  onRemovePhoto: (index: number) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={sheetStyles.overlay}
      >
        <Pressable style={sheetStyles.backdrop} onPress={onClose} />
        <View style={sheetStyles.sheet}>
          <View style={sheetStyles.grabber} />
          <View style={sheetStyles.header}>
            <Text style={sheetStyles.title}>Create Post</Text>
            <TouchableOpacity
              style={sheetStyles.closeButton}
              onPress={onClose}
              disabled={submitting}
            >
              <MaterialIcons name="close" size={20} color="#6B4F2E" />
            </TouchableOpacity>
          </View>

          <TextInput
            value={caption}
            onChangeText={onChangeCaption}
            placeholder={"What's new at your caf\u00e9?"}
            placeholderTextColor="#9C7A56"
            multiline
            textAlignVertical="top"
            style={sheetStyles.captionInput}
            editable={!submitting}
          />

          <Text style={sheetStyles.sectionLabel}>
            Photos ({selectedPhotoUris.length}/5)
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={sheetStyles.photoRow}
          >
            {selectedPhotoUris.map((uri, index) => (
              <View key={`${uri}-${index}`} style={sheetStyles.previewWrap}>
                <Image
                  source={{ uri }}
                  style={sheetStyles.preview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={sheetStyles.removePhotoButton}
                  onPress={() => onRemovePhoto(index)}
                  disabled={submitting}
                >
                  <Text style={sheetStyles.removePhotoText}>{"\u2715"}</Text>
                </TouchableOpacity>
              </View>
            ))}
            {selectedPhotoUris.length < 5 && (
              <TouchableOpacity
                style={sheetStyles.photoPicker}
                onPress={onPickPhoto}
                disabled={submitting}
              >
                <MaterialIcons
                  name="add-photo-alternate"
                  size={28}
                  color="#B08354"
                />
                <Text style={sheetStyles.photoPickerText}>Add</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          {submitError ? (
            <Text style={sheetStyles.errorText}>{submitError}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              sheetStyles.submitButton,
              (!canSubmit || submitting) && sheetStyles.submitButtonDisabled,
            ]}
            onPress={onSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFF7ED" />
            ) : (
              <Text style={sheetStyles.submitButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function EditPostModal({
  visible,
  cafeName,
  caption,
  photoUris,
  submitError,
  submitting,
  canSave,
  onChangeCaption,
  onPickPhoto,
  onRemovePhoto,
  onSave,
  onClose,
}: {
  visible: boolean;
  cafeName: string;
  caption: string;
  photoUris: string[];
  submitError: string | null;
  submitting: boolean;
  canSave: boolean;
  onChangeCaption: (value: string) => void;
  onPickPhoto: () => void;
  onRemovePhoto: (index: number) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={editModalStyles.overlay}
      >
        <Pressable style={editModalStyles.backdrop} onPress={onClose} />
        <View style={editModalStyles.card}>
          <Text style={editModalStyles.title}>Edit Post</Text>
          <Text style={editModalStyles.cafeName}>{cafeName}</Text>

          <TextInput
            value={caption}
            onChangeText={onChangeCaption}
            placeholder="What's new at your café?"
            placeholderTextColor="#B09070"
            multiline
            textAlignVertical="top"
            style={editModalStyles.captionInput}
            editable={!submitting}
          />

          <Text style={editModalStyles.sectionLabel}>
            Photos ({photoUris.length}/5)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={editModalStyles.photoRow}>
              {photoUris.map((uri, index) => (
                <View key={`${uri}-${index}`} style={editModalStyles.thumbWrap}>
                  <Image
                    source={{ uri }}
                    style={editModalStyles.thumbImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={editModalStyles.removePhotoBtn}
                    onPress={() => onRemovePhoto(index)}
                    disabled={submitting}
                  >
                    <MaterialIcons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {photoUris.length < 5 && (
                <TouchableOpacity
                  style={editModalStyles.addPhotoBtn}
                  onPress={onPickPhoto}
                  disabled={submitting}
                >
                  <MaterialIcons
                    name="add-photo-alternate"
                    size={28}
                    color="#A97C4E"
                  />
                  <Text style={editModalStyles.addPhotoText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {submitError ? (
            <Text style={editModalStyles.errorText}>{submitError}</Text>
          ) : null}

          <View style={editModalStyles.actionsRow}>
            <TouchableOpacity
              style={editModalStyles.cancelBtn}
              onPress={onClose}
              disabled={submitting}
            >
              <Text style={editModalStyles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                editModalStyles.saveBtn,
                (!canSave || submitting) && editModalStyles.saveBtnDisabled,
              ]}
              onPress={onSave}
              disabled={!canSave || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FDF6EC" />
              ) : (
                <Text style={editModalStyles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function DeletePostConfirmModal({
  visible,
  deleting,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={deleting ? undefined : onCancel}
    >
      <View style={deleteModalStyles.overlay}>
        <Pressable
          style={deleteModalStyles.backdrop}
          onPress={deleting ? undefined : onCancel}
        />
        <View style={deleteModalStyles.card}>
          <Text style={deleteModalStyles.title}>
            Are you sure you want to delete this post?
          </Text>
          <View style={deleteModalStyles.actionsRow}>
            <TouchableOpacity
              style={deleteModalStyles.cancelBtn}
              onPress={onCancel}
              disabled={deleting}
            >
              <Text style={deleteModalStyles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                deleteModalStyles.deleteBtn,
                deleting && deleteModalStyles.deleteBtnDisabled,
              ]}
              onPress={onConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FFF7ED" />
              ) : (
                <Text style={deleteModalStyles.deleteBtnText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function OwnerPostCard({
  post,
  cafeName,
  cafeAvatarUrl,
  isDeleting,
  onEdit,
  onDelete,
}: {
  post: CafePost;
  cafeName: string;
  cafeAvatarUrl: string | null;
  isDeleting?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const menuAnim = useRef(new Animated.Value(0)).current;
  const displayDate = formatReviewDate(post.created_at, null);
  const postPhotoUrls = post.photo_url?.filter(Boolean) ?? [];
  const postImageHeight = Math.round(cardWidth * 0.68);

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
      style={postStyles.container}
      onLayout={(event) => setCardWidth(event.nativeEvent.layout.width)}
    >
      <View style={postStyles.header}>
        <View style={postStyles.avatar}>
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

        <View style={postStyles.meta}>
          <Text
            style={postStyles.cafeName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {cafeName}
          </Text>
          <Text style={postStyles.date}>{displayDate}</Text>
        </View>

        <View style={postStyles.menuAnchor}>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={menuOpen ? closeMenu : openMenu}
            disabled={isDeleting}
          >
            <MaterialIcons name="more-vert" size={18} color="#8C6D4F" />
          </TouchableOpacity>
          {menuOpen ? (
            <Animated.View
              style={[
                postStyles.dropdownMenu,
                { opacity: menuAnim, transform: [{ scale: menuScale }] },
              ]}
            >
              <TouchableOpacity
                style={postStyles.dropdownItem}
                activeOpacity={0.7}
                onPress={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
              >
                <MaterialIcons name="edit" size={15} color="#6B4F2E" />
                <Text style={postStyles.dropdownItemText}>Edit</Text>
              </TouchableOpacity>
              <View style={postStyles.dropdownDivider} />
              <TouchableOpacity
                style={postStyles.dropdownItem}
                activeOpacity={0.7}
                onPress={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
              >
                <MaterialIcons name="delete" size={15} color="#C0392B" />
                <Text
                  style={[postStyles.dropdownItemText, { color: "#C0392B" }]}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : null}
        </View>
      </View>

      {post.caption ? (
        <Text style={postStyles.caption}>{post.caption}</Text>
      ) : null}

      {postPhotoUrls.length > 0 && cardWidth > 0 ? (
        <View style={postStyles.mediaWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / cardWidth,
              );
              setActivePhotoIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {postPhotoUrls.map((photoUrl, index) => (
              <Image
                key={`${photoUrl}-${index}`}
                source={{ uri: photoUrl }}
                style={{ width: cardWidth, height: postImageHeight }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {postPhotoUrls.length > 1 && (
            <View style={postStyles.dotsRow}>
              {postPhotoUrls.map((_, index) => (
                <View
                  key={index}
                  style={[
                    postStyles.dot,
                    index === activePhotoIndex && postStyles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      ) : null}

      <View style={postStyles.footer}>
        {isDeleting ? (
          <ActivityIndicator size="small" color="#8C6D4F" />
        ) : (
          <View style={postStyles.likeBtn}>
            <MaterialIcons name="thumb-up-off-alt" size={20} color="#8C6D4F" />
            <Text style={postStyles.likesCount}>{post.likes}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function OwnerReviewsTab({
  cafe,
  reviews,
  allReviews,
  loading,
  starFilter,
  starCounts,
  onSelectStar,
  onToggleLike,
  onNavigateToProfile,
}: {
  cafe: CafeDetail;
  reviews: ReviewWithMeta[];
  allReviews: ReviewWithMeta[];
  loading: boolean;
  starFilter: number | null;
  starCounts: Record<number, number>;
  onSelectStar: (star: number | null) => void;
  onToggleLike: (id: number, currentlyLiked: boolean) => void;
  onNavigateToProfile: (userId: string) => void;
}) {
  return (
    <View style={{ flex: 1 }}>
      {!loading && allReviews.length > 0 && (
        <View style={reviewStyles.reviewsHeader}>
          <ReviewsSummaryStrip
            averageRating={cafe.average_rating}
            reviewCount={allReviews.length}
            starCounts={starCounts}
          />
          <StarFilterBar
            selected={starFilter}
            counts={starCounts}
            onSelect={onSelectStar}
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator
          size="small"
          color="#8C6D4F"
          style={{ marginTop: 20 }}
        />
      ) : allReviews.length === 0 ? (
        <View style={styles.emptyTab}>
          <MaterialIcons name="rate-review" size={40} color="#C4A882" />
          <Text style={styles.emptyTabTitle}>No reviews yet</Text>
          <Text style={styles.emptyTabSubtitle}>
            Reviews from customers will appear here.
          </Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyTab}>
          <MaterialIcons name="filter-list" size={40} color="#C4A882" />
          <Text style={styles.emptyTabTitle}>No matching reviews</Text>
          <Text style={styles.emptyTabSubtitle}>
            No reviews with a {starFilter}-star rating yet.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 100,
          }}
        >
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwn={false}
              onToggleLike={onToggleLike}
              onReport={() => {}}
              onNavigateToProfile={onNavigateToProfile}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const deleteModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FAF2E6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E9D0A2",
    zIndex: 1,
  },
  title: {
    fontSize: 16,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#E6D6BE",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C4A882",
  },
  cancelBtnText: {
    fontSize: 14,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Bold",
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#C0392B",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
  },
  deleteBtnDisabled: {
    opacity: 0.75,
  },
  deleteBtnText: {
    fontSize: 14,
    color: "#FFF7ED",
    fontFamily: "SourceSerifPro-Bold",
  },
});

const postListStyles = StyleSheet.create({
  postWrap: {
    marginBottom: 4,
  },
  errorBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FDEDEC",
    borderWidth: 1,
    borderColor: "#F5C6C0",
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#C0392B",
    fontFamily: "SourceSerifPro-Regular",
  },
});

const postStyles = StyleSheet.create({
  menuAnchor: {
    position: "relative",
    zIndex: 20,
  },
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
  mediaWrapper: {
    overflow: "hidden",
  },
  postPhoto: {
    width: "100%",
    height: 200,
    backgroundColor: "#C8A97A",
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
  },
  likesCount: {
    fontSize: 14,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
  },
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
    marginHorizontal: 5,
    backgroundColor: "#E6D6BE",
  },
});

const reviewStyles = StyleSheet.create({
  reviewsHeader: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
});

const editModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FDF6EC",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E9D0A2",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
    marginBottom: 4,
  },
  cafeName: {
    fontSize: 13,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
    marginBottom: 12,
  },
  captionInput: {
    minHeight: 80,
    borderWidth: 1.5,
    borderColor: "#CBA875",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
    fontSize: 15,
    lineHeight: 20,
    backgroundColor: "#FFF7ED",
    textAlignVertical: "top",
  },
  sectionLabel: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 14,
    color: "#A26F3B",
    fontFamily: "SourceSerifPro-Bold",
  },
  photoRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  thumbWrap: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  removePhotoBtn: {
    position: "absolute",
    top: 3,
    right: 3,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
    padding: 3,
  },
  addPhotoBtn: {
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#C8A97A",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDF6EC",
    gap: 2,
  },
  addPhotoText: {
    fontSize: 11,
    color: "#A97C4E",
    fontFamily: "SourceSerifPro-Regular",
  },
  errorText: {
    marginTop: 10,
    color: "#C0392B",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "SourceSerifPro-Regular",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#E6D6BE",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C4A882",
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: "SourceSerifPro-Bold",
    color: "#8C6D4F",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#6B4F2E",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: "SourceSerifPro-Bold",
    color: "#FDF6EC",
  },
});

const sheetStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  sheet: {
    backgroundColor: "#FFF7ED",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: "#E9D0A2",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 10,
    elevation: 10,
  },
  grabber: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D2BA94",
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EAD8BC",
    alignItems: "center",
    justifyContent: "center",
  },
  captionInput: {
    minHeight: 116,
    borderWidth: 1.5,
    borderColor: "#CBA875",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
    fontSize: 15,
    lineHeight: 20,
    backgroundColor: "#FFF7ED",
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 16,
    color: "#A26F3B",
    fontFamily: "SourceSerifPro-Bold",
  },
  photoRow: {
    gap: 12,
    paddingTop: 10,
    paddingRight: 18,
    paddingBottom: 2,
  },
  photoPicker: {
    width: 104,
    height: 96,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#D3A66F",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7ED",
  },
  photoPickerText: {
    marginTop: 6,
    color: "#A26F3B",
    fontFamily: "SourceSerifPro-Bold",
    fontSize: 14,
  },
  previewWrap: {
    width: 112,
    height: 112,
  },
  preview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#D2BA94",
  },
  removePhotoButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#77736B",
    alignItems: "center",
    justifyContent: "center",
  },
  removePhotoText: {
    color: "#FFF7ED",
    fontSize: 16,
    lineHeight: 18,
    fontFamily: "SourceSerifPro-Bold",
  },
  errorText: {
    marginTop: 10,
    color: "#C0392B",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "SourceSerifPro-Regular",
  },
  submitButton: {
    height: 58,
    borderRadius: 12,
    backgroundColor: "#7B582F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },
  submitButtonDisabled: {
    opacity: 0.45,
  },
  submitButtonText: {
    color: "#FFF7ED",
    fontSize: 17,
    fontFamily: "SourceSerifPro-Bold",
  },
});

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", height: "100%" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
    marginTop: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
  },
  emptyTab: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTabTitle: {
    fontSize: 16,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
    marginTop: 10,
  },
  emptyTabSubtitle: {
    fontSize: 13,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
    marginTop: 4,
    textAlign: "center",
  },
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
    overflow: "hidden",
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
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 16,
  },
  cafeLoc: {
    fontSize: 12,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
    flexShrink: 1,
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
});

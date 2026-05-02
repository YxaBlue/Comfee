import { RootStackParamList } from "@/App";
import { MaterialIcons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import {
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

import { FILTER_CATEGORIES } from "../services/filtering";

type Props = NativeStackScreenProps<RootStackParamList, "WriteReviewFE">;

export default function WriteReviewFEScreen({ navigation, route }: Props) {
  const cafeName = route.params?.cafeName ?? "Cafe Name";
  const username = route.params?.username ?? "Username";
  const avatarURL = route.params?.avatarURL ?? "";

  const [rating, setRating] = useState<number>(
    route.params?.initialRating ?? 0,
  );
  const [text, setText] = useState("");

  const [selectedByCategory, setSelectedByCategory] = useState<
    Record<string, string[]>
  >({});

  const TAG_CATEGORIES = useMemo(
    () => FILTER_CATEGORIES.filter((c) => c.id !== "ratings"),
    [],
  );

  const charCount = text.length;

  const toggleChip = (categoryId: string, optionId: string) => {
    setSelectedByCategory((prev) => {
      const current = prev[categoryId] ?? [];
      const category = TAG_CATEGORIES.find((c) => c.id === categoryId);
      const selectionMode = category?.selectionMode ?? "multiple";

      const isSelected = current.includes(optionId);
      if (selectionMode === "single") {
        return {
          ...prev,
          [categoryId]: isSelected ? [] : [optionId],
        };
      }

      return {
        ...prev,
        [categoryId]: isSelected
          ? current.filter((x) => x !== optionId)
          : [...current, optionId],
      };
    });
  };

  const canPost = useMemo(() => rating > 0, [rating]);

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.headerIconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="close" size={22} color="#3B2A1A" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {cafeName}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            Rate this cafe
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          disabled={!canPost}
          onPress={() => Alert.alert("Post", "Submit review coming soon.")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.postText, !canPost && styles.postTextDisabled]}>
            Post
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Row */}
        <View style={styles.userRow}>
          <View style={styles.avatarCircle}>
            {avatarURL ? (
              <Image source={{ uri: avatarURL }} style={styles.avatarImg} />
            ) : null}
          </View>
          <View style={styles.userMeta}>
            <Text style={styles.userName}>{username}</Text>
            <Text style={styles.userHint}>
              Reviews are public and include your account info.
            </Text>
          </View>
        </View>

        {/* Stars */}
        <View style={styles.starsWrap}>
          <StarRatingInput value={rating} onChange={setRating} size={34} />
        </View>

        {/* Review Text */}
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

        <Text style={styles.moreTitle}>Tell us more (optional)</Text>

        {/* Tags */}
        <View style={styles.tagsSection}>
          {TAG_CATEGORIES.map((category) => {
            const selected = selectedByCategory[category.id] ?? [];
            return (
              <View key={category.id} style={styles.categoryBlock}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <View style={styles.chipsWrap}>
                  {category.options.map((opt) => {
                    const isSelected = selected.includes(opt.id);
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => toggleChip(category.id, opt.id)}
                        style={[
                          styles.chip,
                          isSelected
                            ? styles.chipSelected
                            : styles.chipUnselected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected
                              ? styles.chipTextSelected
                              : styles.chipTextUnselected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

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
    paddingBottom: 28,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#D2BA94",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  userMeta: { flex: 1, paddingTop: 8, minWidth: 0 },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B2A1A",
  },
  userHint: {
    marginTop: 4,
    fontSize: 11,
    color: "#8C6D4F",
    lineHeight: 15,
  },

  starsWrap: { marginBottom: 14 },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 10 },

  inputCard: {
    backgroundColor: "#F7F0E2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3D3B7",
    padding: 12,
    minHeight: 300,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
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

  moreTitle: {
    marginTop: 18,
    fontSize: 14,
    fontWeight: "700",
    color: "#3B2A1A",
  },

  tagsSection: { marginTop: 10 },
  categoryBlock: { marginTop: 12 },
  categoryTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B4F2E",
    marginBottom: 8,
  },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  chipSelected: {
    backgroundColor: "#A97C4E",
    borderWidth: 1,
    borderColor: "#A97C4E",
  },
  chipUnselected: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#A97C4E",
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  chipTextSelected: { color: "#2C1E13" },
  chipTextUnselected: { color: "#2C1E13" },
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

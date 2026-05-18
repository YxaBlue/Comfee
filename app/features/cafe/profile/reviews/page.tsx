import { RootStackParamList } from "@/App";
import { ReviewCard } from "@/components/cafe/ReviewCard";
import { WriteReviewCTA } from "@/components/cafe/WriteReview";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ReviewWithMeta } from "../../../../shared/modals/reviewService";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CafeProfile">;
  cafeName: string;
  cafeId: string | number;
  onReviewPosted: () => void;
  reviewsLoading: boolean;
  filteredReviews: ReviewWithMeta[];
  totalReviews: number;
  starFilter: number | null;
  currentUserId: string;
  onToggleLike: (reviewId: number, currentlyLiked: boolean) => void;
  onReport: (r: ReviewWithMeta) => void;
  onDelete: (reviewId: number) => void;
  onEdit: (r: ReviewWithMeta) => void;
  onNavigateToProfile: (userId: string) => void;
};

function EmptyState({ icon, title, subtitle }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; subtitle: string; }) {
  return (
    <View style={styles.emptyState}>
      <MaterialIcons name={icon} size={44} color="#D2BA94" />
      <Text style={styles.emptyText}>{title}</Text>
      <Text style={styles.emptySubText}>{subtitle}</Text>
    </View>
  );
}

export default function CafeReviewsTab({
  navigation,
  cafeName,
  cafeId,
  onReviewPosted,
  reviewsLoading,
  filteredReviews,
  totalReviews,
  starFilter,
  currentUserId,
  onToggleLike,
  onReport,
  onDelete,
  onEdit,
  onNavigateToProfile,
}: Props) {
  return (
    <View>
      <WriteReviewCTA
        navigation={navigation}
        cafeName={cafeName}
        cafeId={String(cafeId)}
        onReviewPosted={onReviewPosted}
      />

      {reviewsLoading ? (
        <ActivityIndicator size="small" color="#8C6D4F" style={{ marginTop: 20 }} />
      ) : totalReviews === 0 ? (
        <EmptyState
          icon="rate-review"
          title="No reviews yet..."
          subtitle="Be the first to leave a review for this café!"
        />
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          icon="filter-list"
          title="No matching reviews"
          subtitle={`No reviews with a ${starFilter}-star rating yet.`}
        />
      ) : (
        filteredReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwn={review.user_id === currentUserId}
            onToggleLike={onToggleLike}
            onReport={() => onReport(review)}
            onDelete={() => onDelete(review.id)}
            onEdit={() => onEdit(review)}
            onNavigateToProfile={onNavigateToProfile}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 70,
    paddingBottom: 120,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "SourceSerifPro-Bold",
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

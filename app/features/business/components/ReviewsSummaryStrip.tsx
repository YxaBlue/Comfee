import { StyleSheet, Text, View } from "react-native";
import { StarRating } from "../../cafe/components/StarRating";

type ReviewsSummaryStripProps = {
  averageRating: number;
  reviewCount: number;
  starCounts?: Record<number, number>;
};

export function ReviewsSummaryStrip({
  averageRating,
  reviewCount,
  starCounts,
}: ReviewsSummaryStripProps) {
  const avgLabel =
    averageRating > 0 ? averageRating.toFixed(1) : "—";
  const maxCount = starCounts
    ? Math.max(1, ...[1, 2, 3, 4, 5].map((s) => starCounts[s] ?? 0))
    : 1;
  const showBars =
    Boolean(starCounts) && reviewCount > 0;

  return (
    <View style={styles.strip}>
      <View style={styles.left}>
        <Text style={styles.score}>{avgLabel}</Text>
        <StarRating rating={averageRating} size={16} color="#6B4F2E" />
      </View>

      <View style={styles.divider} />

      <View style={styles.right}>
        <Text style={styles.reviewCount}>
          {reviewCount} review{reviewCount !== 1 ? "s" : ""}
        </Text>
        {showBars && starCounts ? (
          <View style={styles.bars}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starCounts[star] ?? 0;
              const widthPct = (count / maxCount) * 100;
              return (
                <View key={star} style={styles.barRow}>
                  <Text style={styles.barLabel}>{star}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${widthPct}%` as `${number}%` },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#F0D8B4",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 6,
  },
  left: {
    flex: 1,
    gap: 5,
    marginLeft:10,
  },
  score: {
    fontSize: 32,
    fontFamily: "SourceSerifPro-Bold",
    color: "#3B2A1A",
    lineHeight: 36,
  },
  divider: {
    width: 1,
    height: 95,
    marginRight:20,
    backgroundColor: "#D2BA94",
    alignSelf: "center",
    marginHorizontal: 24,
  },
  right: {
    flex: 2,
    gap: 6,
    marginRight:10,
    justifyContent: "center",
  },
  reviewCount: {
    fontSize: 13,
    color: "#6B4F2E",
    fontFamily: "SourceSerifPro-Bold",
  },
  bars: {
    gap: 3,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  barLabel: {
    width: 10,
    fontSize: 9,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Bold",
    textAlign: "center",
  },
  barTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "#E6D0B0",
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#6B4F2E",
    borderRadius: 2,
  },
});

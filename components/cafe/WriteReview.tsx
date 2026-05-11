import { RootStackParamList } from "@/App";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export function WriteReviewCTA({
  navigation,
  cafeName,
  cafeId,
  onReviewPosted,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList, "CafeProfile">;
  cafeName: string;
  cafeId: string;
  onReviewPosted: () => void;
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
            cafeId: Number(cafeId),
            initialRating: rating,
            onReviewPosted,
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
    return (
      <View key={index} style={starInputStyles.starBox}>
        <MaterialIcons name={name} size={30} color="#3B2A1A" />
        <Pressable
          style={starInputStyles.leftHalf}
          onPress={() => onChange(index === 1 ? 1 : Math.max(1, index - 0.5))}
        />
        <Pressable
          style={starInputStyles.rightHalf}
          onPress={() => onChange(index)}
        />
      </View>
    );
  };
  return (
    <View style={writeReviewStyles.starsRow}>
      {[1, 2, 3, 4, 5].map(renderStar)}
    </View>
  );
}

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
  buttonText: { color: "#FFF7EA", fontSize: 18, fontWeight: "700" },
});

const starInputStyles = StyleSheet.create({
  starBox: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  leftHalf: { position: "absolute", left: 0, top: 0, bottom: 0, width: "50%" },
  rightHalf: { position: "absolute", right: 0, top: 0, bottom: 0, width: "50%" },
});

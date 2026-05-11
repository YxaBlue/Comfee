import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

export function StarRating({
  rating,
  size = 15,
  color = "#C8863A",
}: {
  rating: number;
  size?: number;
  color?: string;
}) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const name =
          rating >= star
            ? "star"
            : rating >= star - 0.5
              ? "star-half"
              : "star-border";
        return (
          <MaterialIcons key={star} name={name} size={size} color={color} />
        );
      })}
    </View>
  );
}

const starStyles = StyleSheet.create({
  row: { 
    flexDirection: "row",
    gap: 0.2,
    marginTop: 0,
  },
});

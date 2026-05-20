import { amenityEditStyles } from "@/app/shared/styles/styles";
import { Pressable, Text, View } from "react-native";

interface AmenityPillRowProps {
  label: string;
  options: string[];
  selected: string[];
  single?: boolean;
  onToggle: (val: string) => void;
}

export default function AmenityPillRow({
  label,
  options,
  selected,
  single = false,
  onToggle,
}: AmenityPillRowProps) {
  return (
    <View style={amenityEditStyles.rowWrap}>
      <Text style={amenityEditStyles.rowLabel}>{label}</Text>
      <View style={amenityEditStyles.pillsRow}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <Pressable
              key={opt}
              style={[
                amenityEditStyles.pill,
                isSelected && amenityEditStyles.pillSelected,
              ]}
              onPress={() => onToggle(opt)}
            >
              <Text
                style={[
                  amenityEditStyles.pillText,
                  isSelected && amenityEditStyles.pillTextSelected,
                ]}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {single && (
        <Text style={amenityEditStyles.singleHint}>Tap to select one</Text>
      )}
    </View>
  );
}
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

type Props = {
  icon: string;
  onPress?: () => void;
  disabled?: boolean;
  size?: number;
  variant?: "primary" | "secondary" | "ghost";
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
};

export default function IconCircleButton({
  icon,
  onPress,
  disabled = false,
  size = 20,
  variant = "primary",
  style,
  accessibilityLabel,
}: Props) {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.button,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        variant === "ghost" && styles.ghost,
        disabled && styles.disabled,
        style,
      ]}
    >
      <MaterialIcons
        name={icon as any}
        size={size}
        color={isPrimary ? "#FFF7ED" : "#6B4F2E"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: "#6B4F2E",
  },
  secondary: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
    borderColor: "#CBA875",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.6,
  },
});

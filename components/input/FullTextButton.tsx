import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from "react-native";

type Props = {
    title: string;
    onPress?: () => void;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle | TextStyle[];
    variant?: "primary" | "secondary" | "ghost";
};

export function FullTextButton({
    title,
    onPress,
    disabled = false,
    loading = false,
    style,
    textStyle,
    variant = "primary",
}: Props) {
    const primaryBg = variant === "primary";
    const secondary = variant === "secondary";

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                primaryBg && styles.primary,
                secondary && styles.secondary,
                variant === "ghost" && styles.ghost,
                disabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={primaryBg ? "#FFF7ED" : "#6B4F2E"} />
            ) : (
                <Text style={[styles.text, primaryBg && styles.textPrimary, secondary && styles.textSecondary, textStyle]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: "100%",
        height: 48,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
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
    text: {
        fontSize: 16,
        fontFamily: "SourceSerifPro-Bold",
        color: "#6B4F2E",
    },
    textPrimary: {
        color: "#FFF7ED",
    },
    textSecondary: {
        color: "#6B4F2E",
    },
    disabled: {
        opacity: 0.6,
    },
});

export default FullTextButton;
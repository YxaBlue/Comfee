import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
  navigation?: any;
  onBack?: () => void;
  showBack?: boolean;
};

export default function Header({
  title,
  navigation,
  onBack,
  showBack = true,
}: Props) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) return onBack();
    if (navigation?.canGoBack && navigation.canGoBack()) return navigation.goBack();
    return undefined;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {showBack ? (
          <Pressable style={styles.backIconButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back-ios-new" size={20} color={stylesVars.text} />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.backIconButtonPlaceholder} />
        )}

        <Text style={styles.pageTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const stylesVars = {
  header: "#E9D0A2",
  text: "#3b1f0e",
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: stylesVars.header,
    zIndex: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: "#7A5A37",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: stylesVars.header,
    height: 72,
  },
  backIconButton: {
    position: "absolute",
    left: 18,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backIconButtonPlaceholder: {
    position: "absolute",
    left: 18,
    bottom: 16,
    width: 60,
  },
  backButtonText: {
    color: stylesVars.text,
    fontSize: 16,
    fontWeight: "500",
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "serif",
    color: stylesVars.text,
  },
});

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Shadow } from "react-native-shadow-2";

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
    <Shadow
      distance={10}           // blur/spread of shadow
      startColor="#683a0a48" // shadow color + opacity in hex (last 2 digits)
      offset={[0, 0.5]}        // [x, y] placement
      style={{ width: "100%" }}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          {showBack ? (
            <Pressable style={styles.backIconButton} onPress={handleBack}>
              <MaterialIcons name="arrow-back-ios-new" size={20} color={"#3b1f0e"} />
            </Pressable>
          ) : (
            <View style={styles.backIconButtonPlaceholder} />
          )}

          <Text style={styles.pageTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>
    </Shadow>
  );
}


const styles = StyleSheet.create({
  container: {
    width: "auto",
    backgroundColor: "#E9D0A2",
    zIndex: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  header: {
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 55,
  },
  backIconButton: {
    position: "absolute",
    left: 15,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  backIconButtonPlaceholder: {
    position: "absolute",
    left: 18,
    top: 0,
    bottom: 0,
    width: 60,
  },
  pageTitle: {
    fontSize: 20,
    fontFamily: "SourceSerifPro-Bold",
    color: "#3b1f0e",
  },
});

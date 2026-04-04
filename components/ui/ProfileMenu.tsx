import { MaterialIcons } from "@expo/vector-icons";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type ProfileMenuRoute =
  | "Profile"
  | "Settings"
  | "Dashboard"
  | "ProfileBusi";

type ProfileMenuProps = {
  visible: boolean;
  profilePicture?: string | null;
  onToggle: () => void;
  onClose: () => void;
  onNavigate: (route: ProfileMenuRoute) => void;
};

const MENU_ITEMS: {
  label: string;
  route: ProfileMenuRoute;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { label: "Profile", route: "Profile", icon: "person-outline" },
  { label: "Settings", route: "Settings", icon: "settings" },
  { label: "Dashboard", route: "Dashboard", icon: "dashboard" },
  { label: "Business", route: "ProfileBusi", icon: "storefront" },
];

export default function ProfileMenu({
  visible,
  profilePicture,
  onToggle,
  onClose,
  onNavigate,
}: ProfileMenuProps) {
  return (
    <>
      <Pressable style={styles.trigger} onPress={onToggle}>
        <View style={styles.avatarShell}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.image} />
          ) : (
            <MaterialIcons name="person" size={28} color="#C8A97A" />
          )}
        </View>
        <View style={styles.badge}>
          <MaterialIcons name="expand-more" size={12} color="#FFFAF3" />
        </View>
      </Pressable>

      <Modal visible={visible} transparent onRequestClose={onClose}>
        <View style={styles.root} pointerEvents="box-none">
          <Pressable style={styles.overlay} onPress={onClose} />
          <View style={styles.dropdown}>
            {MENU_ITEMS.map((item, index) => (
              <View key={item.route}>
                <Pressable
                  style={({ pressed }) => [
                    styles.item,
                    pressed && styles.itemPressed,
                  ]}
                  onPress={() => {
                    onClose();
                    onNavigate(item.route);
                  }}
                >
                  <MaterialIcons name={item.icon} size={18} color="#6B4F2E" />
                  <Text style={styles.label}>{item.label}</Text>
                </Pressable>

                {/* Divider (only if NOT last item) */}
                {index < MENU_ITEMS.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 40,
    height: 40,
    position: "relative",
  },
  avatarShell: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    backgroundColor: "#A97C4E",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  badge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#8C6D4F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFAF3",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5D7C3",
    marginHorizontal: 12,
  },
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-start",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  dropdown: {
    position: "absolute",
    top: 62,
    right: 16,
    minWidth: 188,
    backgroundColor: "#FFFAF3",
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: "#2A1B0F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemPressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B2C11",
  },
});

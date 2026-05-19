import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { RootStackParamList } from "../../../../../App";

import { supabase } from "@/app/shared/lib/supabaseClient";
import { getOwnedCafes, OwnedCafe } from "../../services/cafeOwner";

const COLORS = {
  background: "#F3E6CF",
  header: "#E9D0A2",
  card: "#e4d1b5",
  inset: "#FDF0DC",
  text: "#3b1f0e",
  secondary: "#74451F",
  muted: "#7A5230",
  accent: "#A0713A",
  accentLight: "#C8A97A",
  border: "#DFC392",
  iconFg: "#FDF0DC",
};

interface BusinessNavigationProps {
  onSelectCafe?: (cafe: OwnedCafe) => void;
  onVerify?: () => void;
}

function StatusBadge({ status }: { status: OwnedCafe["status"] }) {
  const isVerified = status === "verified";
  return (
    <View
      style={[
        styles.badge,
        isVerified ? styles.badgeVerified : styles.badgePending,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          isVerified ? styles.badgeTextVerified : styles.badgeTextPending,
        ]}
      >
        {isVerified ? "Verified" : "Pending"}
      </Text>
    </View>
  );
}

function CafeCard({
  cafe,
  onSelect,
}: {
  cafe: OwnedCafe;
  onSelect: (cafe: OwnedCafe) => void;
}) {
  const isPending = cafe.status === "pending";

  const handlePress = () => {
    if (isPending) {
      Alert.alert(
        "Verification pending",
        "Your ownership request for this café is still being reviewed. You'll be able to manage it once verified.",
        [{ text: "OK" }],
      );
      return;
    }
    onSelect(cafe);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cafeCard,
        isPending && styles.cafeCardPending,
        pressed && !isPending && styles.cafeCardPressed,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${cafe.name}`}
    >
      {cafe.avatarUrl ? (
        <Image
          source={{ uri: cafe.avatarUrl }}
          style={[styles.cafeAvatar, isPending && styles.cafeAvatarDimmed]}
        />
      ) : (
        <View
          style={[
            styles.cafeAvatar,
            styles.cafeAvatarFallback,
            isPending && styles.cafeAvatarDimmed,
          ]}
        >
          <MaterialIcons name="storefront" size={22} color="#7A5230" />
        </View>
      )}

      <View style={styles.cafeInfo}>
        <Text
          style={[styles.cafeName, isPending && styles.cafeNameMuted]}
          numberOfLines={1}
        >
          {cafe.name}
        </Text>
        <Text style={styles.cafeAddress} numberOfLines={1}>
          {cafe.address}, {cafe.city}
        </Text>
      </View>

      <StatusBadge status={cafe.status} />
      <MaterialIcons
        name={isPending ? "hourglass-empty" : "chevron-right"}
        size={20}
        color={isPending ? COLORS.accentLight : COLORS.accent}
      />
    </Pressable>
  );
}

export default function BusinessNavigation({
  onSelectCafe,
  onVerify,
}: BusinessNavigationProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [cafes, setCafes] = useState<OwnedCafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCafes = async (cancelled?: { current: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const data = await getOwnedCafes(user.id);
      if (!cancelled?.current) setCafes(data);
    } catch (err: any) {
      if (!cancelled?.current) setError(err.message ?? "Failed to load cafés");
    } finally {
      if (!cancelled?.current) setLoading(false);
    }
  };

  useEffect(() => {
    const cancelled = { current: false };
    loadCafes(cancelled);
    return () => {
      cancelled.current = true;
    };
  }, []);

  // Refresh list when returning from OwnerVerification
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadCafes();
    });
    return unsubscribe;
  }, [navigation]);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const handleVerify = () => {
    if (onVerify) {
      onVerify();
      return;
    }
    navigation.navigate("OwnerVerification");
  };

  return (
    <ImageBackground
      source={require("../../../../../assets/images/bg1.png")}
      style={styles.app}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable style={styles.backIconButton} onPress={handleBack}>
            <MaterialIcons
              name="arrow-back-ios-new"
              size={20}
              color={COLORS.text}
            />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.pageTitle}>My Cafés</Text>
        </View>

        {/* Cafes section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Cafés you manage</Text>
        </View>

        {/* States: loading / error / empty / list */}
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={COLORS.accent} />
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : cafes.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="storefront" size={36} color={COLORS.accent} />
            <Text style={styles.emptyTitle}>No cafés linked</Text>
            <Text style={styles.emptyDesc}>
              Verify ownership of a café below to link it to your account and
              unlock management tools.
            </Text>
          </View>
        ) : (
          <View style={styles.cafeList}>
            {cafes.map((cafe) => (
              <CafeCard
                key={cafe.id}
                cafe={cafe}
                onSelect={
                  onSelectCafe ??
                  ((c) =>
                    navigation.navigate("BusinessProfile", {
                      cafeId: String(c.cafeId),
                    }))
                }
              />
            ))}
          </View>
        )}

        {/* Connector */}
        <View style={styles.connectorRow}>
          <View style={styles.connectorLine} />
          <View style={styles.connectorDot} />
          <View style={styles.connectorLine} />
        </View>

        {/* Verify strip */}
        <View style={styles.verifyStrip}>
          <View style={styles.verifyIconRow}>
            <View style={styles.verifyIconBadge}>
              <MaterialIcons name="verified" size={20} color={COLORS.accent} />
            </View>
            <Text style={styles.verifyEyebrow}>Owner verification</Text>
          </View>

          <View style={styles.verifyTextBlock}>
            <Text style={styles.verifyHeading}>Link a café you own</Text>
            <Text style={styles.verifySub}>
              Submit ownership documents to connect your account to a café. You
              will need to verify separately for each café you own.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.verifyCta}
            onPress={handleVerify}
            activeOpacity={0.85}
          >
            <MaterialIcons
              name="link"
              size={16}
              color={COLORS.iconFg}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.verifyCtaText}>Verify & link a café</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("BusinessPreview")}
            activeOpacity={0.7}
            style={{ alignItems: "center" }}
          >
            <Text
              style={{
                fontFamily: "serif",
                fontSize: 13,
                color: COLORS.muted,
                textDecorationLine: "underline",
              }}
            >
              Launch Cafe Preview
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 40,
  },
  topBar: {
    height: 70,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9D0A2",
    shadowColor: "#7A5A37",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 20,
  },
  backIconButton: {
    position: "absolute",
    left: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontFamily: "serif",
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "800",
    fontFamily: "serif",
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 28,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 18,
    fontFamily: "serif",
    fontWeight: "700",
    color: COLORS.text,
  },
  sectionHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionHintText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.accent,
    fontFamily: "serif",
    fontStyle: "italic",
  },
  cafeList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  cafeCard: {
    backgroundColor: "#e4d1b5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cafeCardPending: {
    opacity: 0.7,
  },
  cafeCardPressed: {
    backgroundColor: "#FDECC0",
  },
  cafeAvatar: {
    width: 46,
    height: 46,
    borderRadius: 10,
  },
  cafeAvatarFallback: {
    backgroundColor: "#E8C98A",
    alignItems: "center",
    justifyContent: "center",
  },
  cafeAvatarDimmed: {
    opacity: 0.6,
  },
  cafeInfo: {
    flex: 1,
  },
  cafeName: {
    fontSize: 15,
    fontWeight: "800",
    fontFamily: "serif",
    color: "#3B1F08",
  },
  cafeNameMuted: {
    color: COLORS.muted,
  },
  cafeAddress: {
    fontSize: 12,
    fontFamily: "serif",
    color: "#7A5230",
    marginTop: 3,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeVerified: {
    backgroundColor: "#E7F6EC",
  },
  badgePending: {
    backgroundColor: "#F0EDE8",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  badgeTextVerified: {
    color: "#2E7D32",
  },
  badgeTextPending: {
    color: "#7A7A7A",
  },
  centerState: {
    marginTop: 48,
    alignItems: "center",
  },
  errorText: {
    fontSize: 13,
    color: COLORS.accent,
    fontFamily: "serif",
  },
  emptyState: {
    marginHorizontal: 16,
    backgroundColor: "#e4d1b5",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: "serif",
    color: "#3B1F08",
    marginTop: 4,
  },
  emptyDesc: {
    fontSize: 13,
    fontFamily: "serif",
    color: "#7A5230",
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 240,
  },
  connectorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 36,
    marginTop: 20,
    marginBottom: 4,
  },
  connectorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  connectorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accentLight,
    marginHorizontal: 6,
  },
  verifyStrip: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#e4d1b5",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  verifyIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  verifyIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#F5E6C8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  verifyEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#74451F",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: "serif",
  },
  verifyTextBlock: {
    gap: 6,
  },
  verifyHeading: {
    fontFamily: "serif",
    fontSize: 18,
    fontWeight: "800",
    color: "#3B1F08",
  },
  verifySub: {
    fontFamily: "serif",
    fontSize: 13,
    color: "#7A5230",
    lineHeight: 19,
  },
  verifyCta: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  verifyCtaText: {
    fontSize: 15,
    fontFamily: "serif",
    color: COLORS.iconFg,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});

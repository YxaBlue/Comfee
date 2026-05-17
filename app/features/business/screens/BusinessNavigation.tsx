import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import type { RootStackParamList } from "../../../../App";

import { supabase } from "@/app/shared/lib/supabaseClient";
import { getOwnedCafes, OwnedCafe } from "../services/cafeOwner";

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
  return (
    <Pressable
      style={({ pressed }) => [
        styles.cafeCard,
        pressed && styles.cafeCardPressed,
      ]}
      onPress={() => onSelect(cafe)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${cafe.name}`}
    >
      {cafe.avatarUrl ? (
        <Image source={{ uri: cafe.avatarUrl }} style={styles.cafeAvatar} />
      ) : (
        <View style={[styles.cafeAvatar, styles.cafeAvatarFallback]}>
          <MaterialIcons name="storefront" size={22} color="#7A5230" />
        </View>
      )}

      <View style={styles.cafeInfo}>
        <Text style={styles.cafeName} numberOfLines={1}>
          {cafe.name}
        </Text>
        <Text style={styles.cafeAddress} numberOfLines={1}>
          {cafe.address}, {cafe.city}
        </Text>
      </View>

      <StatusBadge status={cafe.status} />
      <MaterialIcons name="chevron-right" size={20} color="#B8894A" />
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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const data = await getOwnedCafes(user.id);
        if (!cancelled) setCafes(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Failed to load cafés");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <ScrollView style={styles.app} contentContainerStyle={styles.content}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.backIconButton} onPress={handleBack}>
          <MaterialIcons name="arrow-back-ios-new" size={20} color="#4A2A0D" />
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
          <ActivityIndicator color="#C4A36F" />
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : cafes.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="storefront" size={36} color="#C4A36F" />
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
              onSelect={onSelectCafe ?? (() => {})}
            />
          ))}
        </View>
      )}

      {/* Connector line hinting at the relationship */}
      <View style={styles.connectorRow}>
        <View style={styles.connectorLine} />
        <View style={styles.connectorDot} />
        <View style={styles.connectorLine} />
      </View>

      {/* Verify strip */}
      <View style={styles.verifyStrip}>
        <View style={styles.verifyIconRow}>
          <View style={styles.verifyIconBadge}>
            <MaterialIcons name="verified" size={20} color="#B8894A" />
          </View>
          <Text style={styles.verifyEyebrow}>Owner verification</Text>
        </View>

        <View style={styles.verifyTextBlock}>
          <Text style={styles.verifyHeading}>Link a café you own</Text>
          <Text style={styles.verifySub}>
            Submit ownership documents to connect your account to a café. You'll
            need to verify separately for each café you own.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.verifyCta}
          onPress={onVerify}
          activeOpacity={0.85}
        >
          <MaterialIcons
            name="link"
            size={16}
            color="#FFF1D6"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.verifyCtaText}>Verify & link a café</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#FDF6EE",
  },
  content: {
    paddingBottom: 40,
  },

  // Top bar
  topBar: {
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E4C79E",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  backIconButton: {
    position: "absolute",
    left: 18,
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backButtonText: {
    color: "#4A2A0D",
    fontSize: 16,
    fontWeight: "500",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    fontFamily: "serif",
    color: "#4A2A0D",
  },

  // Section header row
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
    color: "#4A2A0D",
  },
  sectionHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionHintText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#B8894A",
    fontFamily: "serif",
    fontStyle: "italic",
  },

  // Cafe list
  cafeList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  cafeCard: {
    backgroundColor: "#FFF1D6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7CDA3",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  cafeInfo: {
    flex: 1,
  },
  cafeName: {
    fontSize: 15,
    fontWeight: "800",
    fontFamily: "serif",
    color: "#3B1F08",
  },
  cafeAddress: {
    fontSize: 12,
    fontFamily: "serif",
    color: "#7A5230",
    marginTop: 3,
  },

  // Badge
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

  // States
  centerState: {
    marginTop: 48,
    alignItems: "center",
  },
  errorText: {
    fontSize: 13,
    color: "#A97845",
    fontFamily: "serif",
  },
  emptyState: {
    marginHorizontal: 16,
    backgroundColor: "#FFF1D6",
    borderWidth: 1,
    borderColor: "#E7CDA3",
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

  // Connector between list and verify strip
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
    backgroundColor: "#E7CDA3",
  },
  connectorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C4A36F",
    marginHorizontal: 6,
  },

  // Verify strip
  verifyStrip: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#FFF1D6",
    borderWidth: 1,
    borderColor: "#E7CDA3",
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
    borderColor: "#E7CDA3",
  },
  verifyEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B8894A",
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
    backgroundColor: "#3B1F08",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  verifyCtaText: {
    fontSize: 15,
    fontFamily: "serif",
    color: "#FFF1D6",
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});

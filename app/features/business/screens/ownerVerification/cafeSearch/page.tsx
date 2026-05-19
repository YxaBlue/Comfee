import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../../../../../App";
import StepShell from "../../../components/StepWizardShell";
import { VerificationFormData, searchCafes } from "../../../services/cafeOwner";

const COLORS = {
  background: "#e8dcc8",
  header: "#E9D0A2",
  card: "#e4d1b5",
  inset: "#FDF0DC",
  text: "#3b1f0e",
  secondary: "#74451F",
  muted: "#7A5230",
  accent: "#A0713A",
  accentLight: "#C8A97A",
  border: "#DFC392",
  borderStrong: "#3B1F08",
  iconFg: "#FDF0DC",
};

interface Props {
  formData: VerificationFormData;
  onNext: (data: Partial<VerificationFormData>) => void;
  onBack: () => void;
  currentStep: number;
}

interface CafeResult {
  id: string;
  name: string;
  address: string;
  city: string;
  avatar_url?: string | null;
}

type NavProps = NativeStackNavigationProp<RootStackParamList>;

export default function CafeSearch({
  formData,
  onNext,
  onBack,
  currentStep,
}: Props) {
  const navigation = useNavigation<NavProps>();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CafeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<CafeResult | null>(
    formData.cafe_id
      ? {
          id: formData.cafe_id,
          name: formData.cafe_name ?? "",
          address: "",
          city: "",
        }
      : null,
  );

  const handleSearch = async (text: string) => {
    setQuery(text);
    setSelected(null);
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await searchCafes(text);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (cafe: CafeResult) => {
    setSelected(selected?.id === cafe.id ? null : cafe);
  };

  const handleNext = () => {
    if (!selected) return;
    onNext({
      cafe_id: selected.id === "new" ? undefined : selected.id,
      cafe_name: selected.name,
      is_new_cafe: selected.id === "new",
    });
  };

  return (
    <StepShell
      currentStep={currentStep}
      title="Start"
      onBack={onBack}
      onNext={handleNext}
      nextDisabled={!selected}
    >
      {/* Guidelines */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="menu-book" size={17} color={COLORS.iconFg} />
          </View>
          <Text style={styles.cardTitle}>Guidelines</Text>
        </View>
        {[
          {
            prefix: "You must",
            bold: " submit the requested documents",
            rest: " to confirm your ownership/authorization to manage the café.",
          },
          {
            prefix: "All information provided",
            bold: " must be accurate and truthful.",
            rest: " False/misleading details may result in rejection/account suspension.",
          },
          {
            bold: "Registered user account is required",
            rest: " to link and manage a business profile.",
          },
          {
            prefix: "Our team",
            bold: " will contact you for a short interview",
            rest: " to further verify your submission.",
          },
          {
            prefix: "Verification may take up to",
            bold: " 3 or more business days",
            rest: ".",
          },
        ].map((item, i) => (
          <View key={i} style={styles.guideItem}>
            <Text style={styles.guideBullet}>•</Text>
            <Text style={styles.guideText}>
              {item.prefix}
              <Text style={styles.guideBold}>{item.bold}</Text>
              {item.rest}
            </Text>
          </View>
        ))}
      </View>

      {/* Search */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="storefront" size={17} color={COLORS.iconFg} />
          </View>
          <Text style={styles.cardTitle}>Search for the café</Text>
        </View>
        <Text style={styles.cardSub}>
          Check if the café exists. Click on the café you own to verify.
        </Text>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={18} color={COLORS.accent} />
          <TextInput
            style={styles.searchInput}
            placeholder="Type the café name to search"
            placeholderTextColor={COLORS.accentLight}
            value={query}
            onChangeText={handleSearch}
            autoCorrect={false}
          />
          {searching && (
            <ActivityIndicator size="small" color={COLORS.accent} />
          )}
        </View>
      </View>

      {/* Results */}
      {results.length > 0 && (
        <View style={styles.resultsList}>
          <Text style={styles.resultsLabel}>
            Found {results.length} similar café(s):
          </Text>
          {results.map((cafe) => {
            const isSelected = selected?.id === cafe.id;
            return (
              <Pressable
                key={cafe.id}
                style={[styles.resultItem]}
                onPress={() => handleSelect(cafe)}
              >
                {cafe.avatar_url ? (
                  <Image
                    source={{ uri: cafe.avatar_url }}
                    style={styles.resultAvatar}
                    resizeMode="cover"
                    onError={(e) =>
                      console.log("Avatar load error:", e.nativeEvent.error)
                    }
                  />
                ) : (
                  <View
                    style={[styles.resultAvatar, styles.resultAvatarFallback]}
                  >
                    <MaterialIcons
                      name="storefront"
                      size={20}
                      color={COLORS.muted}
                    />
                  </View>
                )}
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{cafe.name}</Text>
                  <Text style={styles.resultAddress}>
                    {cafe.address}, {cafe.city}
                  </Text>
                </View>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <MaterialIcons
                      name="check"
                      size={14}
                      color={COLORS.iconFg}
                    />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* New cafe CTA */}
      <TouchableOpacity
        style={styles.newCafeRow}
        onPress={() => navigation.navigate("SubmitCafe")}
        activeOpacity={0.7}
      >
        <Text style={styles.newCafeText}>
          Can't find it? Submit a{" "}
          <Text style={styles.newCafeLink}>new café</Text>!
        </Text>
      </TouchableOpacity>
    </StepShell>
  );
}

const styles = StyleSheet.create({
  // Shared card
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 2,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    fontFamily: "serif",
    color: COLORS.text,
  },
  cardSub: {
    fontSize: 12,
    fontFamily: "serif",
    color: COLORS.muted,
    marginBottom: 4,
  },

  // Guidelines
  guideItem: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  guideBullet: {
    fontSize: 13,
    color: COLORS.accent,
    marginTop: 1,
  },
  guideText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "serif",
    color: COLORS.text,
    lineHeight: 19,
  },
  guideBold: {
    fontWeight: "700",
    color: COLORS.text,
  },

  // Search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inset,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "serif",
    color: COLORS.text,
  },

  // Results
  resultsList: {
    marginTop: 6,
    gap: 8,
  },
  resultsLabel: {
    fontSize: 12,
    fontFamily: "serif",
    color: COLORS.muted,
    marginBottom: 4,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.inset,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  resultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  resultAvatarFallback: {
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "serif",
    color: COLORS.text,
  },
  resultAddress: {
    fontSize: 12,
    fontFamily: "serif",
    color: COLORS.muted,
    marginTop: 2,
  },

  // New cafe
  newCafeRow: {
    marginTop: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  newCafeText: {
    fontSize: 13,
    fontFamily: "serif",
    color: COLORS.muted,
  },
  newCafeLink: {
    fontWeight: "800",
    color: COLORS.borderStrong,
    textDecorationLine: "underline",
  },
});

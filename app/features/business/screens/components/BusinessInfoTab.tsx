import type { BusinessProfile } from "@/hooks/useBusinessProfile";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  profile: BusinessProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (
    updates: Partial<BusinessProfile>,
  ) => Promise<{ error: string | null }>;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  onSaveRef?: (fn: () => Promise<void>) => void;
};

// ─── Read-only row ───────────────────────────────────────────────────────────
function InfoRow({
  icon,
  value,
  isEditing,
  onChange,
}: {
  icon: string;
  value: string | null;
  isEditing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.row}>
      <MaterialIcons name={icon as any} size={16} color="#8C6D4F" />
      {isEditing ? (
        <TextInput
          style={styles.inlineInput}
          value={value ?? ""}
          onChangeText={onChange}
          placeholder="Not available"
          placeholderTextColor="#bbb"
        />
      ) : (
        <Text style={[styles.sectionBody, !value && styles.unavailable]}>
          {value ?? "Not available"}
        </Text>
      )}
    </View>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function BusinessInfoTab({
  profile,
  loading,
  error,
  updateProfile,
  isEditing,
  setIsEditing,
  onSaveRef,
}: Props) {
  const [saving, setSaving] = useState(false);

  // Local draft state
  const [draft, setDraft] = useState<Partial<BusinessProfile>>({});

  useEffect(() => {
    if (isEditing && profile) {
      setDraft({
        info: profile.info,
        address: profile.address,
        city: profile.city,
        phone: profile.phone,
        landline: profile.landline,
        email: profile.email,
        branches: profile.branches,
      });
    }
  }, [isEditing]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile(draft);
    setSaving(false);

    if (error) {
      Alert.alert("Save failed", error);
    } else {
      setIsEditing(false);
      setDraft({});
    }
  };

  useEffect(() => {
    if (onSaveRef) onSaveRef(handleSave);
  }, [draft]);

  const cancelEditing = () => {
    setDraft({});
    setIsEditing(false);
  };

  const set = (field: keyof BusinessProfile) => (value: string) =>
    setDraft((prev) => ({ ...prev, [field]: value || null }));

  const val = (field: keyof BusinessProfile) =>
    isEditing
      ? (draft[field] as string | null)
      : (profile?.[field] as string | null);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8C6D4F" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load business info.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <View style={styles.line} />
        {isEditing ? (
          <TextInput
            style={[styles.inlineInput, styles.multilineInput]}
            value={val("info") ?? ""}
            onChangeText={set("info")}
            multiline
            placeholder="Write something about your cafe..."
            placeholderTextColor="#bbb"
          />
        ) : (
          <Text style={styles.sectionIntro}>{val("info")}</Text>
        )}
      </View>
      <View style={styles.divider} />

      {/* ── Location ──────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.line} />
        <InfoRow
          icon="location-on"
          value={val("address")}
          isEditing={isEditing}
          onChange={set("address")}
        />
        <InfoRow
          icon="location-city"
          value={val("city")}
          isEditing={isEditing}
          onChange={set("city")}
        />
      </View>
      <View style={styles.divider} />

      {/* ── Contact ───────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.line} />
        <InfoRow
          icon="smartphone"
          value={val("phone")}
          isEditing={isEditing}
          onChange={set("phone")}
        />
        <InfoRow
          icon="phone"
          value={val("landline")}
          isEditing={isEditing}
          onChange={set("landline")}
        />
        <InfoRow
          icon="email"
          value={val("email")}
          isEditing={isEditing}
          onChange={set("email")}
        />
      </View>
      <View style={styles.divider} />

      {/* ── Branches ──────────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Branches</Text>
        <View style={styles.line} />
        {isEditing ? (
          <InfoRow
            icon="store"
            value={val("branches")}
            isEditing={isEditing}
            onChange={set("branches")}
          />
        ) : val("branches") ? (
          val("branches")!
            .split(",")
            .map((b, i) => (
              <InfoRow
                key={i}
                icon="store"
                value={b.trim()}
                isEditing={false}
                onChange={() => {}}
              />
            ))
        ) : (
          <InfoRow
            icon="store"
            value={null}
            isEditing={false}
            onChange={() => {}}
          />
        )}
        {isEditing && (
          <Text style={styles.hint}>
            Separate multiple branches with commas
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 12, paddingBottom: 100 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  section: { paddingVertical: 12, backgroundColor: "#FFF7ED", width: "100%" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B2A1A",
    marginBottom: 2,
    marginLeft: 10,
    fontFamily: "SourceSerifPro-Regular",
  },
  sectionIntro: {
    fontSize: 14,
    color: "#3B2A1A",
    marginLeft: 20,
    fontFamily: "SourceSerifPro-Regular",
    marginTop: 8,
  },
  sectionBody: {
    fontSize: 14,
    color: "#3B2A1A",
    marginLeft: 5,
    fontFamily: "SourceSerifPro-Regular",
    marginTop: 8,
  },
  unavailable: { color: "#aaa", fontStyle: "italic" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    marginLeft: 15,
  },
  divider: { height: 10, backgroundColor: "#FFEFD5" },
  line: {
    height: 1,
    backgroundColor: "#4b2c1148",
    marginVertical: 4,
    width: "98%",
    alignSelf: "center",
  },
  errorText: { color: "red", fontSize: 14 },
  hint: {
    fontSize: 11,
    color: "#aaa",
    fontStyle: "italic",
    marginLeft: 20,
    marginTop: 2,
  },

  inlineInput: {
    fontSize: 14,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
    borderBottomWidth: 1,
    borderBottomColor: "#8C6D4F",
    paddingVertical: 2,
    marginTop: 4,
    width: "100%",
  },
  multilineInput: {
    flex: 0,
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#8C6D4F",
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 8,
  },

  // FAB buttons
  fabRow: {
    flexDirection: "row",
    gap: 12,
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  editButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E9D0A2",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cancelButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#f5dede",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  saveButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#d4edda",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

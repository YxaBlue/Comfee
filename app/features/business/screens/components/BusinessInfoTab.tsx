import type { BusinessProfile } from "@/hooks/useBusinessProfile";
import { MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type Props = {
  profile: BusinessProfile | null;
  loading: boolean;
  error: string | null;
};

export default function BusinessInfoTab({ profile, loading, error }: Props) {
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
      {/* Intro */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intro</Text>
        <View style={styles.line} />
        <Text style={styles.sectionIntro}>{profile.info}</Text>{" "}
        {/* ✅ was profile.intro */}
      </View>
      <View style={styles.divider} />

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.line} />
        <View style={styles.row}>
          <MaterialIcons name="location-on" size={16} color="#8C6D4F" />
          <Text style={styles.sectionBody}>{profile.address}</Text>{" "}
          {/* ✅ was profile.location */}
        </View>
        <View style={styles.row}>
          <MaterialIcons name="location-city" size={16} color="#8C6D4F" />
          <Text style={styles.sectionBody}>{profile.city}</Text>{" "}
          {/* ✅ added city */}
        </View>
      </View>
      <View style={styles.divider} />

      {/* Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.line} />
        {profile.phone ? (
          <View style={styles.row}>
            <MaterialIcons name="smartphone" size={16} color="#8C6D4F" />
            <Text style={styles.sectionBody}>{profile.phone}</Text>
          </View>
        ) : null}
        {/* ❌ removed landline — not in your cafe table */}
        {profile.email ? (
          <View style={styles.row}>
            <MaterialIcons name="email" size={16} color="#8C6D4F" />
            <Text style={styles.sectionBody}>{profile.email}</Text>
          </View>
        ) : null}
      </View>
      {/* ❌ removed Branches section — no branches table yet */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 12 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  section: {
    paddingVertical: 12,
    backgroundColor: "#FFF7ED",
    width: "100%",
    height: "auto",
  },
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
    marginLeft: 15,
  },
  divider: {
    height: 10,
    backgroundColor: "#FFEFD5",
  },
  line: {
    height: 1,
    backgroundColor: "#4b2c1148",
    marginVertical: 4,
    width: "98%",
    alignSelf: "center",
  },
  errorText: { color: "red", fontSize: 14 },
});

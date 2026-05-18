import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { pickImage, VerificationFormData } from "../services/cafeOwner";
import StepShell from "./StepWizardShell";

const COLORS = {
  card: "#e4d1b5",
  inset: "#FDF0DC",
  text: "#3b1f0e",
  muted: "#7A5230",
  accent: "#A0713A",
  accentLight: "#C8A97A",
  border: "#DFC392",
};

interface Props {
  formData: VerificationFormData;
  onSubmit: (data: Partial<VerificationFormData>) => void;
  onBack: () => void;
  currentStep: number;
  submitting: boolean;
}

export default function BusinessLocation({
  formData,
  onSubmit,
  onBack,
  currentStep,
  submitting,
}: Props) {
  const [leaseImage, setLeaseImage] = useState<string | undefined>(
    formData.lease_or_title_image,
  );
  const [interiorImage, setInteriorImage] = useState<string | undefined>(
    formData.interior_images?.[0],
  );

  const pickLease = async () => {
    const uri = await pickImage();
    if (uri) setLeaseImage(uri);
  };

  const pickInterior = async () => {
    const uri = await pickImage();
    if (uri) setInteriorImage(uri);
  };

  const isValid = !!leaseImage && !!interiorImage;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      lease_or_title_image: leaseImage,
      interior_images: interiorImage ? [interiorImage] : [],
    });
  };

  return (
    <StepShell
      currentStep={currentStep}
      title="Proof of Business Location"
      onBack={onBack}
      onSubmit={handleSubmit}
      nextDisabled={!isValid}
      submitting={submitting}
    >
      <Text style={styles.sectionLabel}>Lease of Contract / Land Title</Text>

      <View style={styles.previewBox}>
        {leaseImage ? (
          <Image
            source={{ uri: leaseImage }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        ) : (
          <>
            <MaterialIcons name="image" size={44} color={COLORS.accentLight} />
            <Text style={styles.previewLabel}>Preview</Text>
          </>
        )}
      </View>

      <Pressable style={styles.uploadBox} onPress={pickLease}>
        <MaterialIcons name="image" size={44} color={COLORS.accentLight} />
        <Text style={styles.uploadText}>Click to upload</Text>
        <Text style={styles.uploadHint}>JPG, PNG, WebP up to 5MB</Text>
      </Pressable>

      {leaseImage && (
        <Pressable
          style={styles.removeBtn}
          onPress={() => setLeaseImage(undefined)}
        >
          <MaterialIcons name="close" size={14} color={COLORS.accent} />
          <Text style={styles.removeBtnText}>Remove</Text>
        </Pressable>
      )}

      <View style={styles.divider} />

      <View style={styles.sectionRow}>
        <Text style={[styles.sectionLabel, styles.flexLabel]}>
          Cafe Interior / Exterior / Signage
        </Text>
        <Text style={styles.sectionCount}>{interiorImage ? "1/1" : "0/1"}</Text>
      </View>

      <View style={styles.previewBox}>
        {interiorImage ? (
          <Image
            source={{ uri: interiorImage }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        ) : (
          <>
            <MaterialIcons name="image" size={44} color={COLORS.accentLight} />
            <Text style={styles.previewLabel}>Preview</Text>
          </>
        )}
      </View>

      <Pressable style={styles.uploadBox} onPress={pickInterior}>
        <MaterialIcons name="image" size={44} color={COLORS.accentLight} />
        <Text style={styles.uploadText}>Click to upload</Text>
        <Text style={styles.uploadHint}>JPG, PNG, WebP up to 5MB</Text>
      </Pressable>

      {interiorImage && (
        <Pressable
          style={styles.removeBtn}
          onPress={() => setInteriorImage(undefined)}
        >
          <MaterialIcons name="close" size={14} color={COLORS.accent} />
          <Text style={styles.removeBtnText}>Remove</Text>
        </Pressable>
      )}
    </StepShell>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: "serif",
    color: COLORS.text,
    marginBottom: 4,
  },
  flexLabel: {
    flex: 1,
    marginBottom: 0,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionCount: {
    fontSize: 8,
    fontFamily: "serif",
    color: COLORS.muted,
    fontWeight: "600",
  },
  sectionSub: {
    fontSize: 9,
    fontFamily: "serif",
    color: COLORS.muted,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  previewBox: {
    width: "100%",
    height: 160,
    backgroundColor: COLORS.inset,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    overflow: "hidden",
    gap: 8,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "serif",
    color: COLORS.accentLight,
  },
  uploadBox: {
    width: "100%",
    height: 82,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "serif",
    color: COLORS.accentLight,
  },
  uploadHint: {
    fontSize: 8,
    fontFamily: "serif",
    color: COLORS.accentLight,
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  removeBtnText: {
    fontSize: 12,
    fontFamily: "serif",
    color: COLORS.accent,
  },
});

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import StepShell from "../../../components/StepWizardShell";
import { pickImage, VerificationFormData } from "../../../services/cafeOwner";

const COLORS = {
  card: "#e4d1b5",
  inset: "#FDF0DC",
  text: "#3b1f0e",
  muted: "#7A5230",
  accent: "#A0713A",
  accentLight: "#C8A97A",
  border: "#DFC392",
  uploadBg: "#F0D3A0",
  uploadBorder: "#C9A66E",
  uploadText: "#C19B61",
};

interface Props {
  formData: VerificationFormData;
  onNext: (data: Partial<VerificationFormData>) => void;
  onBack: () => void;
  currentStep: number;
}

export default function ProofOfRegistration({
  formData,
  onNext,
  onBack,
  currentStep,
}: Props) {
  const [image, setImage] = useState<string | undefined>(
    formData.registration_certificate_image,
  );

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) setImage(uri);
  };

  const handleNext = () => {
    if (!image) return;
    onNext({ registration_certificate_image: image });
  };

  return (
    <StepShell
      currentStep={currentStep}
      title="Proof of Registration"
      onBack={onBack}
      onNext={handleNext}
      nextDisabled={!image}
    >
      {/* Info card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          Submit any Registration Certificate
        </Text>
        {[
          "DTI Certificate (Single owner)",
          "SEC registration (Partnerships/Corporations)",
          "CDA Registration (Cooperative)",
        ].map((item) => (
          <View key={item} style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Field label with required star */}
      <Text style={styles.fieldLabel}>
        Registration Certificate<Text style={styles.requiredStar}> *</Text>
      </Text>

      {/* Preview */}
      <View style={styles.previewBox}>
        {image ? (
          <Image
            source={{ uri: image }}
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

      {/* Upload */}
      <Pressable style={styles.uploadBox} onPress={handlePickImage}>
        <MaterialIcons name="image" size={44} color={COLORS.uploadText} />
        <Text style={styles.uploadText}>Click to upload</Text>
        <Text style={styles.uploadHint}>JPG, PNG, WebP up to 20MB</Text>
      </Pressable>

      {image && (
        <Pressable style={styles.removeBtn} onPress={() => setImage(undefined)}>
          <MaterialIcons name="close" size={14} color={COLORS.accent} />
          <Text style={styles.removeBtnText}>Remove image</Text>
        </Pressable>
      )}
    </StepShell>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: "serif",
    color: "#3b1f0e",
    marginBottom: 8,
  },
  requiredStar: {
    color: "#C0392B",
    fontSize: 14,
    fontWeight: "800",
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 7,
    padding: 10,
    marginBottom: 18,
    gap: 3,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: "serif",
    color: COLORS.text,
    marginBottom: 1,
  },
  infoItem: {
    flexDirection: "row",
    gap: 5,
  },
  infoBullet: {
    fontSize: 10,
    color: COLORS.text,
  },
  infoText: {
    fontSize: 10,
    fontFamily: "serif",
    color: COLORS.text,
    flex: 1,
  },
  previewBox: {
    width: "100%",
    height: 180,
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
    height: 86,
    backgroundColor: COLORS.uploadBg,
    borderWidth: 1.5,
    borderColor: COLORS.uploadBorder,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "serif",
    color: COLORS.uploadText,
  },
  uploadHint: {
    fontSize: 9,
    fontFamily: "serif",
    color: COLORS.uploadText,
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 8,
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

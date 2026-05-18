import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
  onNext: (data: Partial<VerificationFormData>) => void;
  onBack: () => void;
  currentStep: number;
}

export default function OwnerDetails({
  formData,
  onNext,
  onBack,
  currentStep,
}: Props) {
  const [ownerName, setOwnerName] = useState(formData.owner_name ?? "");
  const [email, setEmail] = useState(formData.email ?? "");
  const [phone, setPhone] = useState(formData.phone ?? "");
  const [telephone, setTelephone] = useState(formData.telephone ?? "");
  const [idImage, setIdImage] = useState<string | undefined>(
    formData.valid_id_image,
  );

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) setIdImage(uri);
  };

  const isValid =
    ownerName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    !!idImage;

  const handleNext = () => {
    if (!isValid) return;
    onNext({
      owner_name: ownerName.trim(),
      valid_id_image: idImage,
      email: email.trim(),
      phone: phone.trim(),
      telephone: telephone.trim() || undefined,
    });
  };

  return (
    <StepShell
      currentStep={currentStep}
      title="Owner Details"
      onBack={onBack}
      onNext={handleNext}
      nextDisabled={!isValid}
    >
      <View style={styles.section}>
        <Text style={styles.fieldLabel}>Owner/Representative Name</Text>
        <Text style={styles.cardSub}>
          If the cafe is a corporation, choose the name of the representative.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="First Name, Last Name"
          placeholderTextColor={COLORS.accentLight}
          value={ownerName}
          onChangeText={setOwnerName}
          autoCapitalize="words"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.fieldLabel}>Valid ID Picture</Text>
        <View style={styles.uploadRow}>
          <Pressable style={styles.uploadBox} onPress={handlePickImage}>
            <MaterialIcons name="image" size={40} color={COLORS.accentLight} />
            <Text style={styles.uploadText}>Click to upload</Text>
            <Text style={styles.uploadHint}>JPG, PNG, WebP up to 5MB</Text>
          </Pressable>

          <View style={styles.previewBox}>
            {idImage ? (
              <Image
                source={{ uri: idImage }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <>
                <MaterialIcons
                  name="account-circle"
                  size={40}
                  color={COLORS.accentLight}
                />
                <Text style={styles.previewLabel}>Preview</Text>
              </>
            )}
          </View>
        </View>

        {idImage && (
          <Pressable
            style={styles.removeBtn}
            onPress={() => setIdImage(undefined)}
          >
            <MaterialIcons name="close" size={14} color={COLORS.accent} />
            <Text style={styles.removeBtnText}>Remove</Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.section, styles.contactSection]}>
        <Text style={styles.fieldLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor={COLORS.accentLight}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.fieldLabel, styles.spacedLabel]}>Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 0912 345 6789"
          placeholderTextColor={COLORS.accentLight}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={[styles.fieldLabel, styles.spacedLabel]}>
          Telephone (optional)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 123-4567"
          placeholderTextColor={COLORS.accentLight}
          value={telephone}
          onChangeText={setTelephone}
          keyboardType="phone-pad"
        />
      </View>
    </StepShell>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 14,
  },
  cardSub: {
    fontSize: 10,
    fontFamily: "serif",
    color: COLORS.muted,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: "serif",
    color: COLORS.text,
    marginBottom: 3,
  },
  spacedLabel: {
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    fontFamily: "serif",
    color: COLORS.text,
  },
  contactSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  uploadRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginTop: 10,
  },
  uploadBox: {
    width: "42%",
    aspectRatio: 0.72,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  uploadText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "serif",
    color: COLORS.accentLight,
  },
  uploadHint: {
    fontSize: 8,
    fontFamily: "serif",
    color: COLORS.accentLight,
    textAlign: "center",
  },
  previewBox: {
    width: "42%",
    aspectRatio: 0.72,
    backgroundColor: COLORS.inset,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: "700",
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

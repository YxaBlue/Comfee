import { changePassword } from "@/app/features/settings/ChangePassword-BE";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../../../App";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ChangePassword">;
};

type FormErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function ChangePasswordScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!currentPassword.trim()) {
      nextErrors.currentPassword = "Current password is required.";
    }

    if (!newPassword.trim()) {
      nextErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = "Password must be at least 8 characters.";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Please confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword =
        "New password and confirm password must match.";
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      nextErrors.newPassword =
        "New password must be different from your current password.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert("Success", "Your password was updated successfully.", [
        {
          text: "OK",
          onPress: () => {
            if (navigation.canGoBack()) {
              navigation.goBack();
              return;
            }

            navigation.navigate("Settings");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Update failed",
        error?.message || "Unable to update your password.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Settings");
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 16,
            paddingBottom: 20,
          },
        ]}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios-new" size={20} color="#4A2A0D" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Change Password</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Update your password</Text>
            <Text style={styles.cardSubtitle}>
              Enter your current password, then type your new password.
            </Text>

            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.currentPassword && styles.inputError,
              ]}
              value={currentPassword}
              onChangeText={(value) => {
                setCurrentPassword(value);
                setErrors((prev) => ({ ...prev, currentPassword: undefined }));
              }}
              placeholder="Enter current password"
              placeholderTextColor="#9F856B"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.currentPassword ? (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            ) : null}

            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={[styles.input, errors.newPassword && styles.inputError]}
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                setErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              placeholder="Enter new password"
              placeholderTextColor="#9F856B"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.newPassword ? (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            ) : null}

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
              ]}
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              placeholder="Confirm new password"
              placeholderTextColor="#9F856B"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#F7F3EC" />
              ) : (
                <Text style={styles.submitButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#EFE2CC",
  },
  header: {
    backgroundColor: "#E4C79E",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#7A5A37",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    position: "absolute",
    left: 18,
    bottom: 23,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backButtonText: {
    color: "#4A2A0D",
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4A2A0D",
    letterSpacing: 0.3,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#F3E2B8",
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: "#7A5A37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4A2A0D",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#7A5A37",
    marginBottom: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5A3720",
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F8EDCF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: "#4A2A0D",
    borderWidth: 1.5,
    borderColor: "#E0C9A2",
  },
  inputError: {
    borderColor: "#B23A2A",
  },
  errorText: {
    fontSize: 13,
    color: "#B23A2A",
    marginTop: 6,
    marginBottom: 6,
  },
  submitButton: {
    marginTop: 22,
    backgroundColor: "#5A3414",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#F7F3EC",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

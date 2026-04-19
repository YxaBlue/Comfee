import { resetPassword } from "@/app/features/auth/services/authService";
import { supabase } from "@/app/shared/lib/supabaseClient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../../../App";
import { validateResetPassword } from "../utils/authValidation";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<NavProp>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  // Listen for PASSWORD_RECOVERY event from Supabase.
  // This fires when the user arrives via the reset email link.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit() {
    setError("");

    const validationError = validateResetPassword(password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await resetPassword(password);
      setSuccess(true);
      setTimeout(() => navigation.navigate("Login"), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // User arrived without a valid reset link
  if (!isValidSession) {
    return (
      <ImageBackground
        source={require("../../../../assets/images/bg1.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.centeredContent}>
          <Text style={styles.title}>Invalid or expired link</Text>
          <Text style={styles.subtitle}>
            This link is no longer valid. Please request a new one.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.resetText}>Request new link</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  // Success state
  if (success) {
    return (
      <ImageBackground
        source={require("../../../../assets/images/bg1.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.centeredContent}>
          <Text style={styles.title2}>Password updated!</Text>
          <Text style={styles.subtitle}>Redirecting you to login...</Text>
        </View>
      </ImageBackground>
    );
  }

  //Set new pass
  return (
    <ImageBackground
      source={require("../../../../assets/images/bg1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <Text style={styles.title}>Set a new password</Text>
      <Text style={styles.subtitle}>Must be at least 8 characters.</Text>

      {/* New password */}
      <Text style={styles.label}>New password</Text>
      <TextInput
        style={[styles.input, error && { borderColor: "#670718" }]}
        placeholder="Enter new password"
        placeholderTextColor="#C8AA7A"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Confirm password */}
      <Text style={styles.label}>Confirm new password</Text>
      <TextInput
        style={[styles.input, error && { borderColor: "#670718" }]}
        placeholder="Confirm new password"
        placeholderTextColor="#C8AA7A"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Error message */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Submit button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update password</Text>
        )}
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  // Shared centered layout for invalid-link and success states
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 38,
    fontWeight: "700",
    color: "#4B2C11",
    marginBottom: 6,
    fontFamily: "SourceSerifPro-Regular",
    textAlign: "center",
    marginTop: 56,
  },
  title2: {
    fontSize: 38,
    fontWeight: "700",
    color: "#4B2C11",
    marginBottom: 6,
    fontFamily: "SourceSerifPro-Regular",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#4B2C11",
    marginBottom: 30,
    fontFamily: "SourceSerifPro-Regular",
    alignSelf: "center",
    marginTop: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B2C11",
    marginTop: 20,
    marginLeft: 42,
    fontFamily: "SourceSerifPro-Regular",
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#4B2C11",
    backgroundColor: "#F0D8B4",
    marginLeft: 40,
    marginRight: 40,
    marginTop: 7,
    borderColor: "#C8AA7A",
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    color: "#670718",
    textAlign: "left",
    marginLeft: 42,
    fontFamily: "SourceSerifPro-Regular",
    marginTop: 7,
  },
  button: {
    backgroundColor: "#A97C4E",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 15,
    marginLeft: 40,
    marginRight: 40,
  },
  buttonDisabled: {
    backgroundColor: "#C8A87A",
  },
  buttonText: {
    color: "#FFEFD5",
    fontWeight: "500",
    fontSize: 20,
    fontFamily: "SourceSerifPro-Regular",
  },
  resetText: {
    color: "#FFEFD5",
    fontWeight: "500",
    fontSize: 15,
    fontFamily: "SourceSerifPro-Regular",
    paddingHorizontal: 50,
  },
});

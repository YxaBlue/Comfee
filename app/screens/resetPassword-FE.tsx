"use client";

import { resetPassword } from "@/services/auth-service";
import { supabase } from "@/services/supabase-client";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { RootStackParamList } from "../../App";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ResetPasswordPage() {
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

    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
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
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconCircleYellow}>
            <Text style={styles.iconText}>!</Text>
          </View>
          <Text style={styles.title}>Invalid or expired link</Text>
          <Text style={styles.subtitle}>
            This link is no longer valid. Please request a new one.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.buttonText}>Request new link</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Success state
  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconCircleGreen}>
            <Text style={styles.iconText}>✓</Text>
          </View>
          <Text style={styles.title}>Password updated!</Text>
          <Text style={styles.subtitle}>Redirecting you to login...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Set a new password</Text>
        <Text style={styles.subtitle}>Must be at least 8 characters.</Text>

        {/* New password */}
        <Text style={styles.label}>New password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Confirm password */}
        <Text style={styles.label}>Confirm new password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Error message */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    color: "#ef4444",
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  iconCircleGreen: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  iconCircleYellow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fef9c3",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
    color: "#16a34a",
  },
});

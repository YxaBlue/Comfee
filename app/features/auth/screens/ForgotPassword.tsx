import { forgotPassword } from "@/app/features/auth/services/authService";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
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

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavProp>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Success state
  if (sent) {
    return (
      <ImageBackground
        source={require("../../../../assets/images/bg1.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.centeredContent}>
          <Text style={styles.title2}>Check your email</Text>
          <Text style={styles.subtitle}>
            We sent a password reset link to{" "}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <Text style={styles.linkText}>Didn't receive it?</Text>
          <TouchableOpacity onPress={() => setSent(false)}>
            <Text style={styles.linkTextBold}>Try again</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../../../assets/images/bg1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <Text style={styles.title}>Forgot your password?</Text>

      {/* Email input */}
      <Text style={styles.label}>Enter email address</Text>

      <TextInput
        style={[styles.input, error && { borderColor: "#670718" }]}
        placeholder="you@example.com"
        placeholderTextColor="#C8AA7A"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
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
          <Text style={styles.buttonText}>Send reset link</Text>
        )}
      </TouchableOpacity>

      {/* Back to login */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.backButtonText}>Back to Login</Text>
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

  // Used only in the sent/success state
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 15,
    color: "#4B2C11",
    fontFamily: "SourceSerifPro-Regular",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 35,
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
    marginBottom: 20,
    fontFamily: "SourceSerifPro-Regular",
    textAlign: "center",
    marginTop: 15,
  },
  emailHighlight: {
    fontWeight: "500",
    color: "#4B2C11",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4B2C11",
    marginTop: 80,
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
  linkText: {
    fontSize: 13,
    color: "#4B2C11",
    textAlign: "center",
    marginTop: 18,
    marginBottom: 7,
    fontFamily: "SourceSerifPro-Regular",
  },
  linkTextBold: {
    color: "#4B2C11",
    fontWeight: "600",
    textAlign: "center",
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: "#F0D8B4",
    marginLeft: 100,
    marginRight: 100,
    fontFamily: "SourceSerifPro-Regular",
    fontSize: 15,
  },
});

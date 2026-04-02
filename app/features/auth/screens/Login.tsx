import { signIn } from "@/app/features/auth/services/authService";
import { validateLogin } from "@/app/features/auth/utils/validation";
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../../../App";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async () => {
    setErrors({});
    setSuccessMessage("");

    const validationErrors = validateLogin(email, password);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // do not try to sign in if any field is empty
    if (Object.keys(errors).length > 0) return;

    // try to sign in and return results
    try {
      const { user } = await signIn(email.trim(), password);
      if (!user) throw new Error("User not found");
      navigation.navigate("Profile");
    } catch (error: any) {
      setErrors({ general: error.message || "Invalid login credentials." });
    }
  };

  return (
    <ImageBackground
      source={require("../../../../assets/images/bg1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require("../../../../assets/images/logo-name.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>

          <View
            style={[styles.input, errors.email && { borderColor: "#670718" }]}
          >
            <MaterialIcons
              name="email"
              size={24}
              color="#C8AA7A"
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Enter your email address"
              placeholderTextColor="#C8AA7A"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>

          <View
            style={[styles.input, errors.email && { borderColor: "#670718" }]}
          >
            <MaterialIcons
              name="lock"
              size={24}
              color="#C8AA7A"
              style={{ marginRight: 10 }}
            />

            <TextInput
              style={styles.inputWithIcon}
              placeholder="Enter your password"
              placeholderTextColor="#C8AA7A"
              secureTextEntry={!showPassword} // toggle visibility
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={24}
                color="#C8AA7A"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.forgotLabel}>Forgot Password?</Text>
        </TouchableOpacity>

        {errors.general && (
          <Text style={styles.errorText}>{errors.general}</Text>
        )}

        {successMessage ? (
          <Text style={styles.successText}>{successMessage}</Text>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <Text style={styles.dont}>Don't have account?</Text>

        <TouchableOpacity onPress={() => navigation.navigate("CreateAccount")}>
          <Text style={styles.sign}>Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },

  inputGroup: { marginBottom: 10 },

  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
    color: "#4B2C11",
    fontFamily: "SourceSerifPro-Regular",
    marginLeft: 40,
  },

  forgotLabel: {
    fontSize: 11,
    fontWeight: "400",
    marginBottom: 7,
    alignSelf: "flex-end",
    color: "#4B2C11",
    fontFamily: "SourceSerifPro-Regular",
    marginRight: 40,
    marginTop: -15,
  },

  input: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6D6BE",
    backgroundColor: "#F0D8B4",
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 5,
    marginLeft: 40,
    marginRight: 40,
    height: 55,
    marginBottom: 20,
  },

  inputWithIcon: { flex: 1, fontSize: 14, color: "#000", padding: 0 },

  button: {
    backgroundColor: "#A97C4E",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 55,
    marginLeft: 40,
    marginRight: 40,
    height: 40,
  },

  buttonText: {
    color: "#FFEFD5",
    fontWeight: "bold",
    fontSize: 20,
    fontFamily: "SourceSerifPro-Regular",
    alignSelf: "center",
  },

  dont: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 4,
    marginTop: 20,
    fontFamily: "SourceSerifPro-Regular",
    color: "#4B2C11",
  },

  sign: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 1,
    textAlign: "center",
    fontFamily: "SourceSerifPro-Regular",
    color: "#4B2C11",
  },

  errorText: {
    color: "#670718",
    textAlign: "left",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 40,
    fontFamily: "SourceSerifPro-Regular",
  },

  successText: {
    color: "green",
    textAlign: "center",
    marginBottom: 10,
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  logo: {
    width: 250,
    height: 200,
    alignSelf: "center",
    marginBottom: 50,
  },
});

import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";

import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcome}>WELCOME!</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>

        <View style={styles.input}>
          <MaterialIcons
            name="email"
            size={24}
            color="#D2BA94"
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Enter your email address"
            placeholderTextColor="#D2BA94"
            value={email}
            onChangeText={setEmail}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.input}>
          <MaterialIcons
            name="lock"
            size={24}
            color="#D2BA94"
            style={{ marginRight: 10 }}
          />

          <TextInput
            style={styles.inputWithIcon}
            placeholder="Enter your password"
            placeholderTextColor="#D2BA94"
            secureTextEntry={!showPassword} // toggle visibility
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={24}
              color="#D2BA94"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => console.log("Forgot Password clicked")}>
        <Text style={styles.forgotLabel}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      <Text style={styles.dont}>Don't have account?</Text>

      <TouchableOpacity onPress={() => console.log("Sign In Clicked")}>
        <Text style={styles.sign}>Sign In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#EDDEC7",
    justifyContent: "center", // can adjust vertical centering slightly
  },

  welcome: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 40,
    textAlign: "center",
  },

  inputGroup: {
    marginBottom: 10,
  },

  label: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 2,
  },

  forgotLabel: {
    fontSize: 11,
    fontWeight: "300",
    marginBottom: 7,
    marginTop: 0,
    alignSelf: "flex-end",
  },

  input: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6D6BE",
    backgroundColor: "#E6D6BE",
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 5,
  },

  inputWithIcon: {
    flex: 1,
    fontSize: 14,
    color: "#000",
    padding: 0,
  },

  button: {
    backgroundColor: "#A97C4E",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 25,
  },

  buttonText: {
    color: "#EDDEC7",
    fontWeight: "bold",
    fontSize: 16,
  },

  dont: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 7,
    marginTop: 100,
  },

  sign: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 7,
    marginTop: 1,
    textAlign: "center",
  },
});

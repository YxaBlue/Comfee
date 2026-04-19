import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
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
import { signUp } from "../services/authService";
import { validateSignUp } from "../utils/authValidation";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CreateAccount">;
};

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function CreateAccountScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConPass, setShowConPass] = useState(false);

  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigation.navigate("Login");
      }, 1000); // 1 second after

      return () => clearTimeout(timer); // cleanup if component unmounts
    }
  }, [successMessage]);

  const handleCreateAccount = async () => {
    setErrors({});
    setSuccessMessage("");

    const { errors: validationErrors, birthDate } = await validateSignUp({
      firstName,
      lastName,
      username,
      email,
      password,
      confirmPassword,
      birthMonth,
      birthDay,
      birthYear,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await signUp({
        firstName,
        lastName,
        username,
        email,
        password,
        birthDate: birthDate!,
      });
      setSuccessMessage("Account created successfully!");
    } catch (error: any) {
      setErrors({ general: error.message || "Signup failed." });
    }
  };

  return (
    <ImageBackground
      source={require("../../../../assets/images/bg2.png")}
      style={styles.background}
      resizeMode="stretch"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoCont}>
          <Image
            source={require("../../../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>reate Account</Text>
        </View>

        {/* Name Inputs */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <View style={styles.nameRow}>
            <View style={styles.wrap1}>
              <TextInput
                style={[
                  styles.nameInput,
                  errors.firstName && { borderColor: "#670718" },
                ]}
                placeholder="First name"
                placeholderTextColor="#C8AA7A"
                value={firstName}
                onChangeText={setFirstName}
              />
              {errors.firstName && (
                <Text style={styles.errorText1}>{errors.firstName}</Text>
              )}
            </View>
            <View style={styles.wrap2}>
              <TextInput
                style={[
                  styles.nameInput,
                  errors.lastName && { borderColor: "#670718" },
                ]}
                placeholder="Last name"
                placeholderTextColor="#C8AA7A"
                value={lastName}
                onChangeText={setLastName}
              />
              {errors.lastName && (
                <Text style={styles.errorText1}>{errors.lastName}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Username */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[
              styles.input,
              errors.username && { borderColor: "#670718" },
            ]}
            placeholder="Enter username"
            placeholderTextColor="#C8AA7A"
            value={username}
            onChangeText={setUsername}
          />
          {errors.username && (
            <Text style={styles.errorText2}>{errors.username}</Text>
          )}
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && { borderColor: "#670718" }]}
            placeholder="Enter email address"
            placeholderTextColor="#C8AA7A"
            value={email}
            onChangeText={setEmail}
          />
          {errors.email && (
            <Text style={styles.errorText2}>{errors.email}</Text>
          )}
        </View>

        {/* Password */}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View
            style={[
              styles.passCtnr,
              errors.password && { borderColor: "#670718" },
            ]}
          >
            <TextInput
              style={styles.passInput}
              placeholder="Enter password"
              placeholderTextColor="#C8AA7A"
              secureTextEntry={!showPassword} // toggle visibility
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={22}
                color="#C8AA7A"
              />
            </TouchableOpacity>
          </View>

          {errors.password && (
            <Text style={styles.errorText2}>{errors.password}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>

          <View
            style={[
              styles.passCtnr,
              errors.confirmPassword && { borderColor: "#670718" },
            ]}
          >
            <TextInput
              style={styles.passInput}
              placeholder="Enter password again"
              placeholderTextColor="#C8AA7A"
              secureTextEntry={!showConPass} // toggle visibility
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity onPress={() => setShowConPass(!showConPass)}>
              <MaterialIcons
                name={showConPass ? "visibility" : "visibility-off"}
                size={22}
                color="#C8AA7A"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText2}>{errors.confirmPassword}</Text>
          )}
        </View>

        {/* Birthdate Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Birth date</Text>
          <View style={styles.birthRow}>
            <View style={[styles.birthCtnr, styles.mnth]}>
              <Picker
                selectedValue={birthMonth}
                style={[
                  styles.birthPicker,
                  errors.birthDate && { borderColor: "#670718" },
                ]}
                onValueChange={(itemValue) => setBirthMonth(itemValue)}
                mode="dropdown"
                dropdownIconColor="#A97C4E"
              >
                <Picker.Item label="Month" value="" />
                {months.map((month, i) => (
                  <Picker.Item key={i} label={month} value={month} />
                ))}
              </Picker>
            </View>

            <View style={styles.birthCtnr}>
              <Picker
                selectedValue={birthDay}
                style={[
                  styles.birthPicker,
                  errors.birthDate && { borderColor: "#670718" },
                ]}
                onValueChange={(itemValue) => setBirthDay(itemValue)}
              >
                <Picker.Item label="Day" value="" />
                {Array.from({ length: 31 }, (_, i) => (
                  <Picker.Item key={i} label={`${i + 1}`} value={`${i + 1}`} />
                ))}
              </Picker>
            </View>

            <View style={[styles.birthCtnr, styles.year]}>
              <Picker
                selectedValue={birthYear}
                style={[
                  styles.birthPicker,
                  errors.birthDate && { borderColor: "#670718" },
                ]}
                onValueChange={(itemValue) => setBirthYear(itemValue)}
              >
                <Picker.Item label="Year" value="" />
                {Array.from({ length: 100 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <Picker.Item key={i} label={`${year}`} value={`${year}`} />
                  );
                })}
              </Picker>
            </View>
          </View>
          {errors.birthDate && (
            <Text style={styles.errorText3}>{errors.birthDate}</Text>
          )}
        </View>
        {errors.general && (
          <Text style={styles.errorText3}>{errors.general}</Text>
        )}
        {successMessage && (
          <Text style={styles.successText}>{successMessage}</Text>
        )}
        <Text style={styles.label2}>
          By clicking Sign Up, you agree to our Terms, {"\n"}
          Privacy Policy and Cookies Policy.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
          <Text style={styles.buttonText}>SIGN UP</Text>
        </TouchableOpacity>

        <Text style={styles.haveAcc}>Have an account?</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.back}>Log In</Text>
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

  title: {
    fontSize: 38,
    fontWeight: "700",
    marginBottom: 40,
    textAlign: "center",
    color: "#4B2C11",
    fontFamily: "SourceSerifPro-Regular",
    marginLeft: -5,
  },

  inputContainer: {
    marginBottom: 5,
    width: "100%",
    alignSelf: "center",
  },

  passCtnr: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0D8B4",
    backgroundColor: "#F0D8B4",
    borderRadius: 9,
    marginLeft: 40,
    marginRight: 40,
    marginBottom: 15,
    paddingHorizontal: 15,
  },

  passInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#4B2C11",
    fontFamily: "SourceSerifPro-Regular",
  },

  passIcon: {
    position: "absolute",
    right: 60,
    top: 15,
  },

  label: {
    marginBottom: 5,
    fontWeight: "700",
    color: "#4B2C11",
    fontFamily: "SourceSerifPro-Regular",
    marginLeft: 40,
  },
  label2: {
    marginTop: 40,
    marginBottom: 1,
    fontSize: 12,
    color: "#BD9165",
    fontWeight: "200",
    textAlign: "center",
    fontFamily: "SourceSerifPro-Regular",
  },
  nameRow: {
    flexDirection: "row",
    gap: 10,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#F0D8B4",
    backgroundColor: "#F0D8B4",
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: "#C8AA7A",
    fontFamily: "SourceSerifPro-Regular",
    marginBottom: 15,
  },

  input: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#F0D8B4",
    backgroundColor: "#F0D8B4",
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: "#C8AA7A",
    marginBottom: 15,
    fontFamily: "SourceSerifPro-Regular",
    marginLeft: 40,
    marginRight: 40,
  },

  birthRow: {
    flexDirection: "row",
    gap: 5,
  },

  birthCtnr: {
    flex: 1,
    backgroundColor: "#F0D8B4",
    borderColor: "#F0D8B4",
    borderRadius: 9,
  },

  mnth: {
    flex: 1,
    marginLeft: 40,
  },

  year: {
    flex: 1,
    marginRight: 40,
  },

  birthPicker: {
    height: 50,
    width: "100%",
    backgroundColor: "transparent",
    borderColor: "#F0D8B4",
    color: "#C8AA7A",
    fontFamily: "SourceSerifPro-Regular",
  },

  haveAcc: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 3,
    marginTop: 25,
    fontFamily: "SourceSerifPro-Regular",
    color: "#4B2C11",
  },

  button: {
    // flex: 1,
    backgroundColor: "#A97C4E",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginLeft: 40,
    marginRight: 40,
  },

  buttonText: {
    color: "#FFEFD5",
    fontWeight: "bold",
    fontSize: 20,
    fontFamily: "SourceSerifPro-Regular",
  },

  back: {
    marginTop: 1,
    fontSize: 17,
    textAlign: "center",
    fontWeight: "700",
    fontFamily: "SourceSerifPro-Regular",
    color: "#4B2C11",
  },

  errorText1: {
    color: "#670718",
    textAlign: "left",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    marginLeft: 5,
    fontFamily: "SourceSerifPro-Regular",
  },

  errorText2: {
    color: "#670718",
    textAlign: "left",
    fontSize: 12,
    marginBottom: 5,
    marginTop: -10,
    fontFamily: "SourceSerifPro-Regular",
    marginLeft: 43,
  },

  errorText3: {
    color: "#670718",
    textAlign: "left",
    fontSize: 12,
    marginBottom: 5,
    marginTop: 5,
    fontFamily: "SourceSerifPro-Regular",
    marginLeft: 43,
  },

  successText: {
    color: "green",
    fontSize: 12,
    marginVertical: 3,
    textAlign: "center",
  },

  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  logoCont: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "center",
    marginTop: 10,
  },

  logo: {
    width: 50,
    height: 50,
    marginBottom: 50,
  },

  wrap1: {
    flex: 1,
    marginLeft: 40,
  },

  wrap2: {
    flex: 1,
    marginRight: 40, // adds margin on the very left
  },
});

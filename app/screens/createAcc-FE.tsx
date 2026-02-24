import { signUp } from "@/services/auth-service";
import { formatDate } from "@/utils/date-utils";
import { validateSignUp } from "@/utils/validation";
import { Picker } from "@react-native-picker/picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../../App";

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

export default function CreateAcc({ navigation }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    const formData = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      birthMonth,
      birthDay,
      birthYear,
    };
    const validationErrors = validateSignUp(formData);

    try {
      formatDate({
        birthMonth,
        birthDay,
        birthYear,
      });
    } catch (error: any) {
      validationErrors.birthDate = error.message;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const birthDate = formatDate({ birthMonth, birthDay, birthYear })
      .toISOString()
      .split("T")[0];

    try {
      await signUp({
        firstName,
        lastName,
        email,
        confirmPassword,
        password,
        birthDate,
      });
      setSuccessMessage("Account created successfully!");
    } catch (error: any) {
      setErrors({ general: error.message || "Signup failed." });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* Name Inputs */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <View style={styles.nameRow}>
          <View>
            <TextInput
              style={styles.nameInput}
              placeholder="First name"
              placeholderTextColor="#D2BA94"
              value={firstName}
              onChangeText={setFirstName}
            />
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}
          </View>
          <View>
            <TextInput
              style={styles.nameInput}
              placeholder="Last name"
              placeholderTextColor="#D2BA94"
              value={lastName}
              onChangeText={setLastName}
            />
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Email & Password Inputs */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <View style={{ gap: 0 }}>
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            placeholderTextColor="#D2BA94"
            value={email}
            onChangeText={setEmail}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="#D2BA94"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password again"
          placeholderTextColor="#D2BA94"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}
      </View>

      {/* Birthdate Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Birth date</Text>
        <View style={styles.birthRow}>
          <View style={styles.birthCtnr}>
            <Picker
              selectedValue={birthMonth}
              style={styles.birthPicker}
              onValueChange={(itemValue) => setBirthMonth(itemValue)}
              //dropdownIconColor="#A97C4E" // arrow color
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
              style={styles.birthPicker}
              onValueChange={(itemValue) => setBirthDay(itemValue)}
            >
              <Picker.Item label="Day" value="" />
              {Array.from({ length: 31 }, (_, i) => (
                <Picker.Item key={i} label={`${i + 1}`} value={`${i + 1}`} />
              ))}
            </Picker>
          </View>

          <View style={styles.birthCtnr}>
            <Picker
              selectedValue={birthYear}
              style={styles.birthPicker}
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
          <Text style={styles.errorText}>{errors.birthDate}</Text>
        )}
      </View>
      {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
      {successMessage && (
        <Text style={styles.successText}>{successMessage}</Text>
      )}
      <Text style={styles.label2}>
        By clicking Sign Up, you agree to our Terms, Privacy Policy and Cookies
        Policy.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
        <Text style={styles.buttonText}>SIGN UP</Text>
      </TouchableOpacity>

      <Text style={styles.haveAcc}>Have an account?</Text>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>Log In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#EDDEC7",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 40,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
    width: "100%",
    // maxWidth: 400, // keeps all inputs same max width
    alignSelf: "center",
  },
  label: {
    marginBottom: 5,
    fontWeight: "300",
  },
  label2: {
    marginTop: 25,
    marginBottom: 1,
    fontSize: 12,
    color: "#BD9165",
    fontWeight: "200",
    textAlign: "center",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E6D6BE",
    backgroundColor: "#E6D6BE",
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000",
    marginRight: 10, // spacing between first and last name
  },
  input: {
    width: "100%", // full width inside container
    borderWidth: 1,
    borderColor: "#E6D6BE",
    backgroundColor: "#E6D6BE",
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000",
    marginBottom: 15,
  },

  birthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  birthCtnr: {
    flex: 1,
    backgroundColor: "#E6D6BE",
    borderColor: "#E6D6BE",
    borderRadius: 9,
    marginHorizontal: 5,
  },
  birthPicker: {
    height: 50,
    width: "100%",
    backgroundColor: "transparent",
    borderColor: "#E6D6BE",
    color: "#D2BA94",
  },

  haveAcc: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 3,
    marginTop: 100,
  },

  button: {
    backgroundColor: "#A97C4E",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#EDDEC7", fontWeight: "bold", fontSize: 16 },
  back: {
    marginTop: 5,
    fontSize: 14,
    color: "black",
    textAlign: "center",
    fontWeight: "500",
  },
  errorText: {
    color: "#B00020",
    fontSize: 12,
    marginVertical: 3,
    textAlign: "center",
  },
  successText: {
    color: "green",
    fontSize: 12,
    marginVertical: 3,
    textAlign: "center",
  },
});

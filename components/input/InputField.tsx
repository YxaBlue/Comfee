import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";


type Props = TextInputProps & {
    label: string;
    placeholder: string;
    icon?: keyof typeof MaterialIcons.glyphMap;
    error?: string;
    isPassword?: boolean;
    value: string;
    onChangeText: (text: string) => void;
};

export default function InputField({
    label,
    placeholder = "",
    icon,
    error,
    isPassword = false,
    value,
    defaultValue = "",
    onChangeText,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.input, error ? { borderColor: "#670718" } : null]}>
        {icon && (
          <MaterialIcons
            name={icon}
            size={24}
            color="#C8AA7A"
            style={{ marginRight: 10 }}
          />
        )}

        <TextInput
          style={styles.inputWithIcon}
          placeholder={placeholder}
          placeholderTextColor="#C8AA7A"
          secureTextEntry={isPassword && !showPassword}
          value={value}
          onChangeText={onChangeText}
          defaultValue={defaultValue}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={24}
              color="#C8AA7A"
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}


const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: "#A26F3B",
    fontFamily: "SourceSerifPro-Bold",
    marginLeft: 5,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f5e4cc",
    backgroundColor: "#fdf6eb",
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 5,
    margin: 5,
    height: 45,
    marginBottom: 4,
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 14,
    color: "#4B2C11",
    padding: 0,
    fontFamily: "SourceSerifPro-Regular",
  },
  errorText: {
    color: "#670718",
    fontSize: 12,
    marginLeft: 40,
    fontFamily: "SourceSerifPro-Regular",
  },
});
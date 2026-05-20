import { styles } from "@/app/shared/styles/styles";
import InputField from "@/components/input/InputField";
import { MaterialIcons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface FieldErrors {
  [key: string]: string;
}

interface Page0BasicInfoProps {
  coverUri: string | null;
  avatarUri: string | null;
  name: string;
  info: string;
  address: string;
  phone: string;
  email: string;
  fieldErrors: FieldErrors;
  onPickCover: () => void;
  onPickAvatar: () => void;
  onChangeName: (v: string) => void;
  onChangeInfo: (v: string) => void;
  onChangeAddress: (v: string) => void;
  onChangePhone: (v: string) => void;
  onChangeEmail: (v: string) => void;
}

export default function Page0BasicInfo({
  coverUri,
  avatarUri,
  name,
  info,
  address,
  phone,
  email,
  fieldErrors,
  onPickCover,
  onPickAvatar,
  onChangeName,
  onChangeInfo,
  onChangeAddress,
  onChangePhone,
  onChangeEmail,
}: Page0BasicInfoProps) {
  return (
    <>
      <TouchableOpacity
        style={[
          styles.coverPicker,
          fieldErrors.cover && styles.inputErrorBorder,
        ]}
        onPress={onPickCover}
        activeOpacity={0.85}
      >
        {coverUri ? (
          <Image
            source={{ uri: coverUri }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <MaterialIcons
              name="add-photo-alternate"
              size={32}
              color="#B08354"
            />
            <Text style={styles.pickerHint}>Tap to add cover photo</Text>
          </View>
        )}
      </TouchableOpacity>
      {fieldErrors.cover ? (
        <Text style={styles.errorText}>{fieldErrors.cover}</Text>
      ) : null}

      <Text style={styles.sectionLabel}>Profile Photo</Text>
      <TouchableOpacity
        style={[
          styles.avatarPicker,
          fieldErrors.avatar && styles.inputErrorBorder,
        ]}
        onPress={onPickAvatar}
        activeOpacity={0.85}
      >
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <MaterialIcons name="store" size={35} color="#C8A97A" />
        )}
        <View style={styles.avatarBadge}>
          <MaterialIcons name="camera-alt" size={14} color="#fff" />
        </View>
      </TouchableOpacity>
      {fieldErrors.avatar ? (
        <Text style={styles.errorText}>{fieldErrors.avatar}</Text>
      ) : null}

      <InputField
        label="Café Name"
        placeholder="Enter café name"
        value={name}
        onChangeText={onChangeName}
        error={fieldErrors.name}
      />
      <InputField
        label="Description"
        placeholder="Enter a short description"
        value={info}
        onChangeText={onChangeInfo}
        error={fieldErrors.info}
        multiline
      />
      <InputField
        label="Address"
        placeholder="Enter address"
        value={address}
        onChangeText={onChangeAddress}
        error={fieldErrors.address}
      />
      <InputField
        label="Phone"
        placeholder="Enter phone number"
        value={phone}
        onChangeText={onChangePhone}
        error={fieldErrors.phone}
        keyboardType="phone-pad"
      />
      <InputField
        label="Email"
        placeholder="Enter email address"
        value={email}
        onChangeText={onChangeEmail}
        error={fieldErrors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </>
  );
}
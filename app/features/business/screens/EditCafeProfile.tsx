import { RootStackParamList } from "@/App";
import TopBar from "@/components/TopBar";
import {
  buildHoursFromCafe,
  EditCafeDayHours,
  saveCafeProfile,
} from "@/app/features/business/services/editCafeService";
import {
  CafeDetail,
  getCafeById,
} from "@/app/features/cafe/services/cafeService";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type NavProps = NativeStackNavigationProp<
  RootStackParamList,
  "EditCafeProfile"
>;
type RouteProps = RouteProp<RootStackParamList, "EditCafeProfile">;

const TIME_OPTIONS = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
  "12:00 AM",
];

type FieldErrors = Record<string, string>;

export default function EditCafeProfile() {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<RouteProps>();
  const cafeId = route.params.cafeId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [name, setName] = useState("");
  const [info, setInfo] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [newCoverLocalUri, setNewCoverLocalUri] = useState<string | null>(null);
  const [newAvatarLocalUri, setNewAvatarLocalUri] = useState<string | null>(
    null,
  );
  const [hours, setHours] = useState<EditCafeDayHours[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const cafe = await getCafeById(cafeId);
        if (!cafe) {
          Alert.alert("Error", "Café not found.", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
          return;
        }
        populateForm(cafe);
      } catch (err: any) {
        Alert.alert("Error", err?.message ?? "Failed to load café.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [cafeId, navigation]);

  const populateForm = (cafe: CafeDetail) => {
    setName(cafe.name ?? "");
    setInfo(cafe.info ?? "");
    setAddress(cafe.address ?? "");
    setPhone(cafe.phone ?? "");
    setEmail(cafe.email ?? "");
    setCoverUri(cafe.cover_photo_url);
    setAvatarUri(cafe.avatar_url);
    setHours(buildHoursFromCafe(cafe.opening_hours));
  };

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const pickImage = async (type: "cover" | "avatar") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to upload images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    const uri = result.assets[0].uri;
    if (type === "cover") {
      setCoverUri(uri);
      setNewCoverLocalUri(uri);
      clearFieldError("cover");
    } else {
      setAvatarUri(uri);
      setNewAvatarLocalUri(uri);
      clearFieldError("avatar");
    }
  };

  const updateDay = (index: number, patch: Partial<EditCafeDayHours>) => {
    setHours((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
    clearFieldError(`hours_${index}`);
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};

    if (!name.trim()) errors.name = "Café name is required.";
    if (!info.trim()) errors.info = "Description is required.";
    if (!address.trim()) errors.address = "Address is required.";
    if (!phone.trim()) errors.phone = "Phone is required.";
    if (!email.trim()) errors.email = "Email is required.";
    if (!coverUri) errors.cover = "Cover photo is required.";
    if (!avatarUri) errors.avatar = "Profile photo is required.";

    hours.forEach((day, index) => {
      if (!day.isOpen) return;
      if (!day.openTime.trim()) {
        errors[`hours_${index}_open`] = `Opening time required for ${day.day}.`;
      }
      if (!day.closeTime.trim()) {
        errors[`hours_${index}_close`] =
          `Closing time required for ${day.day}.`;
      }
    });

    const hasOpenDay = hours.some((d) => d.isOpen);
    if (!hasOpenDay) {
      errors.hours = "At least one day must be open.";
    }

    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    const result = await saveCafeProfile({
      cafeId: Number(cafeId),
      name,
      info,
      address,
      phone,
      email,
      coverUri: coverUri!,
      avatarUri: avatarUri!,
      newCoverLocalUri,
      newAvatarLocalUri,
      hours,
    });
    setSaving(false);

    if (result.error) {
      Alert.alert("Could not save", result.error);
      return;
    }

    navigation.navigate("ProfileBusi");
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../../../../assets/images/bg1.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <TopBar navigation={navigation} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8C6D4F" />
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
      <TopBar navigation={navigation} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.screenTitle}>Edit Café Profile</Text>

          <Text style={styles.sectionLabel}>Cover Photo</Text>
          <TouchableOpacity
            style={[
              styles.coverPicker,
              fieldErrors.cover && styles.inputErrorBorder,
            ]}
            onPress={() => pickImage("cover")}
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
            onPress={() => pickImage("avatar")}
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

          <Field
            label="Café Name"
            value={name}
            onChangeText={(v) => {
              setName(v);
              clearFieldError("name");
            }}
            error={fieldErrors.name}
          />
          <Field
            label="Description"
            value={info}
            onChangeText={(v) => {
              setInfo(v);
              clearFieldError("info");
            }}
            error={fieldErrors.info}
            multiline
          />
          <Field
            label="Address"
            value={address}
            onChangeText={(v) => {
              setAddress(v);
              clearFieldError("address");
            }}
            error={fieldErrors.address}
          />
          <Field
            label="Phone"
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              clearFieldError("phone");
            }}
            error={fieldErrors.phone}
            keyboardType="phone-pad"
          />
          <Field
            label="Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              clearFieldError("email");
            }}
            error={fieldErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.sectionLabel}>Operating Hours</Text>
          {fieldErrors.hours ? (
            <Text style={styles.errorText}>{fieldErrors.hours}</Text>
          ) : null}

          {hours.map((day, index) => (
            <View
              key={day.day}
              style={[
                styles.dayCard,
                (fieldErrors[`hours_${index}_open`] ||
                  fieldErrors[`hours_${index}_close`]) &&
                  styles.inputErrorBorder,
              ]}
            >
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{day.day}</Text>
                <View style={styles.openToggleRow}>
                  <Text style={styles.openToggleLabel}>
                    {day.isOpen ? "Open" : "Closed"}
                  </Text>
                  <Switch
                    value={day.isOpen}
                    onValueChange={(isOpen) => {
                      updateDay(index, {
                        isOpen,
                        openTime: day.openTime || "9:00 AM",
                        closeTime: day.closeTime || "5:00 PM",
                      });
                    }}
                    trackColor={{ false: "#D2BA94", true: "#8C6D4F" }}
                    thumbColor="#FFF7ED"
                  />
                </View>
              </View>

              {day.isOpen ? (
                <View style={styles.timeRow}>
                  <TimePickerField
                    label="Opens"
                    value={day.openTime}
                    onChange={(openTime) => updateDay(index, { openTime })}
                  />
                  <TimePickerField
                    label="Closes"
                    value={day.closeTime}
                    onChange={(closeTime) => updateDay(index, { closeTime })}
                  />
                </View>
              ) : null}

              {fieldErrors[`hours_${index}_open`] ? (
                <Text style={styles.errorText}>
                  {fieldErrors[`hours_${index}_open`]}
                </Text>
              ) : null}
              {fieldErrors[`hours_${index}_close`] ? (
                <Text style={styles.errorText}>
                  {fieldErrors[`hours_${index}_close`]}
                </Text>
              ) : null}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={() => void handleSave()}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFF7ED" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

function Field({
  label,
  value,
  onChangeText,
  error,
  multiline,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  multiline?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences";
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error && styles.inputErrorBorder,
        ]}
        placeholderTextColor="#B09070"
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "sentences"}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function TimePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.timePickerWrap}>
      <Text style={styles.timePickerLabel}>{label}</Text>
      <View style={styles.pickerShell}>
        <Picker
          selectedValue={value || TIME_OPTIONS[0]}
          onValueChange={onChange}
          dropdownIconColor="#8C6D4F"
          style={styles.picker}
        >
          {TIME_OPTIONS.map((time) => (
            <Picker.Item key={time} label={time} value={time} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 22,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#A26F3B",
    fontFamily: "SourceSerifPro-Bold",
    marginBottom: 8,
    marginTop: 8,
  },
  coverPicker: {
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FAF2E6",
    borderWidth: 1,
    borderColor: "#E9D0A2",
    marginBottom: 4,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  pickerHint: {
    fontSize: 12,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
  },
  avatarPicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FAF2E6",
    borderWidth: 1,
    borderColor: "#E9D0A2",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    marginBottom: 4,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#8C6D4F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E9D0A2",
  },
  fieldWrap: {
    marginTop: 12,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#6B4F2E",
    fontFamily: "SourceSerifPro-Bold",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#CBA875",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
    fontSize: 15,
    backgroundColor: "#FFF7ED",
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 12,
  },
  inputErrorBorder: {
    borderColor: "#C0392B",
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "#C0392B",
    fontFamily: "SourceSerifPro-Regular",
  },
  dayCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9D0A2",
    padding: 12,
    marginBottom: 10,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dayName: {
    fontSize: 15,
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Bold",
  },
  openToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  openToggleLabel: {
    fontSize: 12,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
  },
  timeRow: {
    gap: 8,
  },
  timePickerWrap: {
    flex: 1,
  },
  timePickerLabel: {
    fontSize: 11,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Bold",
    marginBottom: 4,
  },
  pickerShell: {
    borderWidth: 1,
    borderColor: "#D2BA94",
    borderRadius: 8,
    backgroundColor: "#FFFAF3",
    overflow: "hidden",
  },
  picker: {
    height: Platform.OS === "ios" ? 120 : 48,
  },
  saveButton: {
    marginTop: 24,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#6B4F2E",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: "#FFF7ED",
    fontSize: 17,
    fontFamily: "SourceSerifPro-Bold",
  },
});

import { RootStackParamList } from "@/App";
import {
  AmenitiesFormState,
  buildAmenitiesFromCafe,
  buildHoursFromCafe,
  EditCafeDayHours,
  saveAmenities,
  saveCafeProfile,
} from "@/app/features/business/services/editCafeService";
import {
  CafeDetail,
  getCafeById,
} from "@/app/features/cafe/services/cafeService";
import FullTextButton from "@/components/input/FullTextButton";
import Header from "@/components/navigation/Header";
import IconCircleButton from "@/components/navigation/IconCircleButton";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert, Dimensions, Image,
  ImageBackground,
  KeyboardAvoidingView, Modal, Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
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
  const [page, setPage] = useState<number>(0);
  const [menuUris, setMenuUris] = useState<string[]>([]);
  const [newMenuLocalUris, setNewMenuLocalUris] = useState<string[]>([]);
  const [menuPreviewVisible, setMenuPreviewVisible] = useState<boolean>(false);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const previewCarouselRef = useRef<ScrollView | null>(null);
  const modalCarouselRef = useRef<ScrollView | null>(null);
  const windowWidth = Dimensions.get("window").width - 32;

  // ── Amenities state ──
  const [amenities, setAmenities] = useState<AmenitiesFormState>({
    wifi_speed: null,
    sockets: null,
    parking: null,
    lighting: null,
    music: null,
    price_level: null,
    pet_friendly: false,
    seating: [],
    tables_type: [],
    coffee_bean_type: [],
    coffee_brew_method: [],
    suitable_for: [],
  });

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
    setAmenities(buildAmenitiesFromCafe(cafe));
    setMenuUris(cafe.menu_urls ?? []);
  };

  useEffect(() => {
    const initial = (route.params as any)?.initialPage;
    if (typeof initial === "number") setPage(initial);
  }, [route.params]);

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

  const pickMenuImages = async () => {
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
      allowsMultipleSelection: true,
    } as any);

    if (result.canceled || !result.assets?.length) return;

    const uris = result.assets.map((a: any) => a.uri).filter(Boolean) as string[];
    if (!uris.length) return;

    // Append up to 5
    setMenuUris((prev) => {
      const next = [...prev];
      for (const u of uris) {
        if (next.length >= 5) break;
        next.push(u);
      }
      return next;
    });
    setNewMenuLocalUris((prev) => {
      const next = [...prev];
      for (const u of uris) {
        if (next.length + menuUris.filter((x) => !x.startsWith("http")).length >= 5) break;
        next.push(u);
      }
      return next;
    });
  };

  const removeMenuImage = (index: number) => {
    setMenuUris((prev) => prev.filter((_, i) => i !== index));
    setNewMenuLocalUris((prev) => prev.filter((u) => !menuUris[index] || u !== menuUris[index]));
  };

  const openPreviewAt = (index: number) => {
    setPreviewIndex(index);
    setMenuPreviewVisible(true);
    // scroll will be handled in Modal content via ref
  };

  const closePreview = () => setMenuPreviewVisible(false);

  useEffect(() => {
    if (menuPreviewVisible && modalCarouselRef.current) {
      setTimeout(() => {
        try {
          modalCarouselRef.current?.scrollTo({ x: previewIndex * windowWidth, animated: false } as any);
        } catch {
          // ignore
        }
      }, 50);
    }
  }, [menuPreviewVisible, previewIndex, windowWidth]);

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

  const validatePage = (p: number): FieldErrors => {
    const errs: FieldErrors = {};
    if (p === 0) {
      if (!name.trim()) errs.name = "Café name is required.";
      if (!info.trim()) errs.info = "Description is required.";
      if (!address.trim()) errs.address = "Address is required.";
      if (!phone.trim()) errs.phone = "Phone is required.";
      if (!email.trim()) errs.email = "Email is required.";
      if (!coverUri) errs.cover = "Cover photo is required.";
      if (!avatarUri) errs.avatar = "Profile photo is required.";
    }
    if (p === 1) {
      hours.forEach((day, index) => {
        if (!day.isOpen) return;
        if (!day.openTime || !day.openTime.trim()) {
          errs[`hours_${index}_open`] = `Opening time required for ${day.day}.`;
        }
        if (!day.closeTime || !day.closeTime.trim()) {
          errs[`hours_${index}_close`] = `Closing time required for ${day.day}.`;
        }
      });
      if (!hours.some((d) => d.isOpen)) errs.hours = "At least one day must be open.";
    }
    return errs;
  };

  const goNext = () => {
    const errs = validatePage(page);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setPage((p) => Math.min(4, p + 1));
  };

  const goPrev = () => setPage((p) => Math.max(0, p - 1));

  const handleSave = async () => {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    const [profileResult, amenitiesResult] = await Promise.all([
      saveCafeProfile({
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
        newMenuLocalUris,
        menuExistingUrls: menuUris.filter((u) => typeof u === "string" && u.startsWith("http")),
      }),
      saveAmenities(Number(cafeId), amenities),
    ]);
    setSaving(false);

    const saveError = profileResult.error ?? amenitiesResult.error;
    if (saveError) {
      Alert.alert("Could not save", saveError);
      return;
    }

    navigation.navigate("ProfileBusi");
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../../../../../../../assets/images/bg1.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <Header title={"Edit Café Profile"} navigation={navigation} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8C6D4F" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../../../../../../../assets/images/bg1.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <Header title={"Edit Café Profile"} navigation={navigation} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {page === 4 && (
            <>
              <Text style={styles.sectionLabel}>Amenities</Text>

              <AmenityPillRow
                label="WiFi"
                options={["None", "Slow", "Moderate", "Fast"]}
                single
                selected={amenities.wifi_speed ? [amenities.wifi_speed] : []}
                onToggle={(val) =>
                  setAmenities((prev) => ({
                    ...prev,
                    wifi_speed: prev.wifi_speed === val ? null : (val as AmenitiesFormState["wifi_speed"]),
                  }))
                }
              />
              <AmenityPillRow
                label="Sockets"
                options={["None", "Some", "Many"]}
                single
                selected={amenities.sockets ? [amenities.sockets] : []}
                onToggle={(val) =>
                  setAmenities((prev) => ({
                    ...prev,
                    sockets: prev.sockets === val ? null : (val as AmenitiesFormState["sockets"]),
                  }))
                }
              />
              <AmenityPillRow
                label="Parking"
                options={["None", "Limited", "Plenty"]}
                single
                selected={amenities.parking ? [amenities.parking] : []}
                onToggle={(val) =>
                  setAmenities((prev) => ({
                    ...prev,
                    parking: prev.parking === val ? null : (val as AmenitiesFormState["parking"]),
                  }))
                }
              />
              <AmenityPillRow
                label="Lighting"
                options={["Dim", "Balanced", "Bright"]}
                single
                selected={amenities.lighting ? [amenities.lighting] : []}
                onToggle={(val) =>
                  setAmenities((prev) => ({
                    ...prev,
                    lighting: prev.lighting === val ? null : (val as AmenitiesFormState["lighting"]),
                  }))
                }
              />
              <AmenityPillRow
                label="Music"
                options={["Quiet", "Normal", "Blaring"]}
                single
                selected={amenities.music ? [amenities.music] : []}
                onToggle={(val) =>
                  setAmenities((prev) => ({
                    ...prev,
                    music: prev.music === val ? null : (val as AmenitiesFormState["music"]),
                  }))
                }
              />
              <AmenityPillRow
                label="Seating"
                options={["Inside", "Outside"]}
                selected={amenities.seating}
                onToggle={(val) =>
                  setAmenities((prev) => ({
                    ...prev,
                    seating: prev.seating.includes(val)
                      ? prev.seating.filter((s) => s !== val)
                      : [...prev.seating, val],
                  }))
                }
              />
              <AmenityPillRow
                label="Tables"
                options={["Bar Type", "Individual Tables", "Large Tables"]}
                selected={amenities.tables_type}
                onToggle={(val) =>
                  setAmenities((prev) => ({
                    ...prev,
                    tables_type: prev.tables_type.includes(val)
                      ? prev.tables_type.filter((t) => t !== val)
                      : [...prev.tables_type, val],
                  }))
                }
              />
              <AmenityPillRow
                label="Pet Friendly"
                options={["Yes", "No"]}
                single
                selected={[amenities.pet_friendly ? "Yes" : "No"]}
                onToggle={(val) =>
                  setAmenities((prev) => ({ ...prev, pet_friendly: val === "Yes" }))
                }
              />

              <Text style={styles.sectionLabel}>Suitable For</Text>
              <AmenityPillRow
                label="Suitable Conditions"
                options={["Student", "Work", "Group", "Vibes"]}
                selected={amenities.suitable_for}
                onToggle={(val) =>
                  setAmenities((prev) => ({
                    ...prev,
                    suitable_for: prev.suitable_for.includes(val)
                      ? prev.suitable_for.filter((s) => s !== val)
                      : [...prev.suitable_for, val],
                  }))
                }
              />
            </>
          )}

          {page === 0 && ( <>
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

            </>
          )}

          {page === 1 && (
            <>
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
            </>
          )}

          {page === 2 && (
            <>
              <Text style={styles.sectionLabel}>Menu Images</Text>

              {menuUris.length > 0 ? (
                <>
                  <View style={{ height: 220, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" }}>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      ref={(r) => { previewCarouselRef.current = r; }}
                      onMomentumScrollEnd={(e) => {
                        const idx = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
                        setPreviewIndex(idx);
                      }}
                    >
                      {menuUris.map((uri, idx) => (
                        <TouchableOpacity key={idx} activeOpacity={0.95} onPress={() => openPreviewAt(idx)}>
                          <Image
                            source={{ uri }}
                            style={{ width: windowWidth, height: 220 }}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <View style={{ position: "absolute", bottom: 8, left: 0, right: 0, alignItems: "center" }}>
                      <Text style={{ color: "#FFF7ED" }}>{previewIndex + 1} / {menuUris.length}</Text>
                    </View>
                  </View>

                  <Modal visible={menuPreviewVisible} animationType="slide" onRequestClose={() => closePreview()}>
                    <View style={{ flex: 1, backgroundColor: "#000" }}>
                      <View style={{ position: "absolute", top: 40, right: 16, zIndex: 10 }}>
                        <TouchableOpacity onPress={() => closePreview()}>
                          <MaterialIcons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                      </View>
                      <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        ref={(r) => { modalCarouselRef.current = r; }}
                        contentOffset={{ x: previewIndex * windowWidth, y: 0 }}
                      >
                        {menuUris.map((uri, idx) => (
                          <View key={idx} style={{ width: windowWidth, height: "100%", alignItems: "center", justifyContent: "center" }}>
                            <Image source={{ uri }} style={{ width: windowWidth, height: "80%" }} resizeMode="contain" />
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </Modal>
                </>
              ) : (
                <View style={{ height: 220, borderRadius: 12, overflow: "hidden", backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#E9D0A2", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#8C6D4F" }}>No menu images yet</Text>
                </View>
              )}

              <View style={{ height: 12 }} />
              <Text style={{ color: "#6B4F2E", marginBottom: 8 }}>Upload up to 5 images to display as your menu.</Text>
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {Array.from({ length: 5 }).map((_, idx) => {
                  const uri = menuUris[idx];
                  return (
                    <View key={idx} style={{ width: 90, height: 90, borderRadius: 8, overflow: "hidden", backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#E9D0A2", alignItems: "center", justifyContent: "center" }}>
                      {uri ? (
                        <>
                          <TouchableOpacity onPress={() => openPreviewAt(idx)} style={{ width: "100%", height: "100%" }}>
                            <Image source={{ uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => removeMenuImage(idx)} style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: "#C0392B", alignItems: "center", justifyContent: "center" }}>
                            <MaterialIcons name="close" size={12} color="#fff" />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity onPress={() => pickMenuImages()} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                          <MaterialIcons name="add-photo-alternate" size={28} color="#B08354" />
                          <Text style={{ fontSize: 11, color: "#8C6D4F" }}>Add</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {page === 3 && (
            <>
              <Text style={styles.sectionLabel}>Coffee</Text>
              <AmenityPillRow
                label="Bean Type"
                options={["Arabica", "Robusta", "Liberica", "Excelsa"]}
                selected={amenities.coffee_bean_type}
                onToggle={(val) =>
                  setAmenities((prev) => ({
                    ...prev,
                    coffee_bean_type: prev.coffee_bean_type.includes(val)
                      ? prev.coffee_bean_type.filter((b) => b !== val)
                      : [...prev.coffee_bean_type, val],
                  }))
                }
              />
              <AmenityPillRow
                label="Brew Method"
                options={["Espresso", "Drip", "French Press", "Pour Over", "Cold Brew"]}
                selected={amenities.coffee_brew_method}
                onToggle={(val) =>
                  setAmenities((prev) => ({
                    ...prev,
                    coffee_brew_method: prev.coffee_brew_method.includes(val)
                      ? prev.coffee_brew_method.filter((b) => b !== val)
                      : [...prev.coffee_brew_method, val],
                  }))
                }
              />
              <Text style={styles.sectionLabel}>Price Level</Text>
              <AmenityPillRow
                label="Price Range"
                options={["P", "PP", "PPP"]}
                single
                selected={amenities.price_level ? [amenities.price_level] : []}
                onToggle={(val) =>
                  setAmenities((prev) => ({
                    ...prev,
                    price_level: prev.price_level === val ? null : (val as AmenitiesFormState["price_level"]),
                  }))
                }
              />
            </>
          )}

          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
              {page > 0 ? (
                <View style={{ flex: 1, alignItems: "flex-start" }}>
                  <IconCircleButton icon="arrow-back" variant="secondary" onPress={goPrev} />
                </View>
              ) : (
                <View style={{ flex: 1 }} />
              )}

              <View style={{ flex: 1, alignItems: "flex-end" }}>
                {page < 4 ? (
                  <IconCircleButton icon="arrow-forward" onPress={goNext} />
                ) : null}
              </View>
            </View>

            <View style={{ marginTop: 8, alignItems: "center" }}>
              <Text style={{ color: "#8C6D4F" }}>{page + 1} / 5</Text>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <FullTextButton title="Finish editing" onPress={() => void handleSave()} loading={saving} />
            <View style={{ marginTop: 8 }}>
              <FullTextButton title="Cancel editing" variant="ghost" onPress={() => navigation.goBack()} />
            </View>
          </View>
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
  finishButton: {
    marginTop: 6,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#3B2A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  finishButtonText: {
    color: "#FFF7ED",
    fontSize: 15,
    fontFamily: "SourceSerifPro-Bold",
  },
  cancelButton: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#8C6D4F",
    fontSize: 14,
    fontFamily: "SourceSerifPro-Regular",
    textDecorationLine: "underline",
  },
});

function AmenityPillRow({
  label,
  options,
  selected,
  single = false,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  single?: boolean;
  onToggle: (val: string) => void;
}) {
  return (
    <View style={amenityEditStyles.rowWrap}>
      <Text style={amenityEditStyles.rowLabel}>{label}</Text>
      <View style={amenityEditStyles.pillsRow}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <Pressable
              key={opt}
              style={[
                amenityEditStyles.pill,
                isSelected && amenityEditStyles.pillSelected,
              ]}
              onPress={() => onToggle(opt)}
            >
              <Text
                style={[
                  amenityEditStyles.pillText,
                  isSelected && amenityEditStyles.pillTextSelected,
                ]}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {single && (
        <Text style={amenityEditStyles.singleHint}>Tap to select one</Text>
      )}
    </View>
  );
}

const amenityEditStyles = StyleSheet.create({
  rowWrap: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9D0A2",
    padding: 12,
    marginBottom: 10,
  },
  rowLabel: {
    fontSize: 13,
    color: "#6B4F2E",
    fontFamily: "SourceSerifPro-Bold",
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D2BA94",
    backgroundColor: "transparent",
  },
  pillSelected: {
    backgroundColor: "#6B4F2E",
    borderColor: "#6B4F2E",
  },
  pillText: {
    fontSize: 13,
    color: "#6B4F2E",
    fontFamily: "SourceSerifPro-Regular",
  },
  pillTextSelected: {
    color: "#FFF7EA",
    fontWeight: "600",
  },
  singleHint: {
    marginTop: 6,
    fontSize: 10,
    color: "#B09070",
    fontFamily: "SourceSerifPro-Regular",
  },
});
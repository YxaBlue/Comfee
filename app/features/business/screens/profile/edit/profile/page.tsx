import { RootStackParamList } from "@/App";
import {
  AmenitiesFormState,
  EditCafeDayHours,
  buildAmenitiesFromCafe,
  buildHoursFromCafe,
  saveAmenities,
  saveCafeProfile,
} from "@/app/features/business/services/editCafeService";
import {
  CafeDetail,
  getCafeById,
} from "@/app/features/cafe/services/cafeService";
import { styles } from "@/app/shared/styles/styles";
import FullTextButton from "@/components/input/FullTextButton";
import Header from "@/components/navigation/Header";
import IconCircleButton from "@/components/navigation/IconCircleButton";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import Page4Amenities from "./amenities/page";
import Page0BasicInfo from "./basicInfo/page";
import Page3Coffee from "./coffee/page";
import Page2Menu from "./menu/page";
import Page1Hours from "./operatingHours/page";

type NavProps = NativeStackNavigationProp<
  RootStackParamList,
  "EditCafeProfile"
>;
type RouteProps = RouteProp<RootStackParamList, "EditCafeProfile">;
type FieldErrors = Record<string, string>;

export default function EditCafeProfile() {
  const navigation = useNavigation<NavProps>();
  const route = useRoute<RouteProps>();
  const cafeId = route.params.cafeId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [page, setPage] = useState<number>(0);

  // ── Basic info ──
  const [name, setName] = useState("");
  const [info, setInfo] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // ── Photos ──
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [newCoverLocalUri, setNewCoverLocalUri] = useState<string | null>(null);
  const [newAvatarLocalUri, setNewAvatarLocalUri] = useState<string | null>(null,);

  // ── Hours ──
  const [hours, setHours] = useState<EditCafeDayHours[]>([]);

  // ── Menu ──
  const [menuUris, setMenuUris] = useState<string[]>([]);
  const [newMenuLocalUris, setNewMenuLocalUris] = useState<string[]>([]);

  // ── Amenities ──
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

  // ── Image pickers ──
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
    const uris = result.assets
      .map((a: any) => a.uri)
      .filter(Boolean) as string[];
    if (!uris.length) return;
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
        if (
          next.length + menuUris.filter((x) => !x.startsWith("http")).length >=
          5
        )
          break;
        next.push(u);
      }
      return next;
    });
  };

  const removeMenuImage = (index: number) => {
    setMenuUris((prev) => prev.filter((_, i) => i !== index));
    setNewMenuLocalUris((prev) =>
      prev.filter((u) => !menuUris[index] || u !== menuUris[index]),
    );
  };

  // ── Hours helpers ──
  const updateDay = (index: number, patch: Partial<EditCafeDayHours>) => {
    setHours((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
    clearFieldError(`hours_${index}`);
  };

  // ── Validation ──
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
      if (!day.openTime.trim())
        errors[`hours_${index}_open`] = `Opening time required for ${day.day}.`;
      if (!day.closeTime.trim())
        errors[`hours_${index}_close`] =
          `Closing time required for ${day.day}.`;
    });
    if (!hours.some((d) => d.isOpen))
      errors.hours = "At least one day must be open.";
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
        if (!day.openTime || !day.openTime.trim())
          errs[`hours_${index}_open`] = `Opening time required for ${day.day}.`;
        if (!day.closeTime || !day.closeTime.trim())
          errs[`hours_${index}_close`] =
            `Closing time required for ${day.day}.`;
      });
      if (!hours.some((d) => d.isOpen))
        errs.hours = "At least one day must be open.";
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
        menuExistingUrls: menuUris.filter(
          (u) => typeof u === "string" && u.startsWith("http"),
        ),
      }),
      saveAmenities(Number(cafeId), amenities),
    ]);
    setSaving(false);

    const saveError = profileResult.error ?? amenitiesResult.error;
    if (saveError) {
      Alert.alert("Could not save", saveError);
      return;
    }

    navigation.navigate("BusinessProfile", { cafeId });
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
          {page === 0 && (
            <Page0BasicInfo
              coverUri={coverUri}
              avatarUri={avatarUri}
              name={name}
              info={info}
              address={address}
              phone={phone}
              email={email}
              fieldErrors={fieldErrors}
              onPickCover={() => pickImage("cover")}
              onPickAvatar={() => pickImage("avatar")}
              onChangeName={(v) => {
                setName(v);
                clearFieldError("name");
              }}
              onChangeInfo={(v) => {
                setInfo(v);
                clearFieldError("info");
              }}
              onChangeAddress={(v) => {
                setAddress(v);
                clearFieldError("address");
              }}
              onChangePhone={(v) => {
                setPhone(v);
                clearFieldError("phone");
              }}
              onChangeEmail={(v) => {
                setEmail(v);
                clearFieldError("email");
              }}
            />
          )}

          {page === 1 && (
            <Page1Hours
              hours={hours}
              fieldErrors={fieldErrors}
              onUpdateDay={updateDay}
            />
          )}

          {page === 2 && (
            <Page2Menu
              menuUris={menuUris}
              onPickMenuImages={pickMenuImages}
              onRemoveMenuImage={removeMenuImage}
            />
          )}

          {page === 3 && (
            <Page3Coffee amenities={amenities} onSetAmenities={setAmenities} />
          )}

          {page === 4 && (
            <Page4Amenities
              amenities={amenities}
              onSetAmenities={setAmenities}
            />
          )}

          {/* ── Navigation ── */}
          <View style={{ marginTop: 12 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              {page > 0 ? (
                <View style={{ flex: 1, alignItems: "flex-start" }}>
                  <IconCircleButton
                    icon="arrow-back"
                    variant="secondary"
                    onPress={goPrev}
                  />
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
            <FullTextButton
              title="Finish editing"
              onPress={() => void handleSave()}
              loading={saving}
            />
            <View style={{ marginTop: 8 }}>
              <FullTextButton
                title="Cancel editing"
                variant="ghost"
                onPress={() => navigation.goBack()}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

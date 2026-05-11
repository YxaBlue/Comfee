import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ScrollView as ScrollViewType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../../../../App";
import {
  ExistingCafeSearchResult,
  ExistingCafeSubmissionDefaults,
  SUPABASE_PROJECT_URL,
  getExistingCafeSubmissionDefaults,
  searchExistingCafes,
  submitCafeSubmission,
} from "../services/submissionServices";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "SubmitCafe">;
};

type DayHours = {
  day: string;
  is24Hours: boolean;
  isClosed: boolean;
  start: string;
  end: string;
};

type ToggleGroupProps = {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  error?: boolean;
};

const COLORS = {
  background: "#e8dcc8",
  header: "#E9D0A2",
  card: "#e4d1b5",
  inset: "#FFF0D5",
  text: "#3b1f0e",
  secondary: "#74451F",
  button: "#3b1f0e",
  buttonAlt: "#A97845",
  border: "#DFC392",
  teal: "#1E8A78",
  required: "#C0392B",
};

const STEPS = ["Start", "Cafe Details", "Opening Time", "Amenities & Menu"];
const SINGLE_SELECT_AMENITIES = new Set([
  "WiFi",
  "Sockets",
  "Parking",
  "Lighting",
  "Suitable Conditions",
  "Music",
]);
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

const initialHours: DayHours[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
].map((day) => ({
  day,
  is24Hours: false,
  isClosed: false,
  start: "8:00 AM",
  end: "8:00 PM",
}));

export default function SubmitCafeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewType>(null);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<
    ExistingCafeSearchResult[]
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [didSearch, setDidSearch] = useState(false);
  const [selectedExistingCafe, setSelectedExistingCafe] =
    useState<ExistingCafeSearchResult | null>(null);
  const [existingCafeDefaults, setExistingCafeDefaults] =
    useState<ExistingCafeSubmissionDefaults | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [cafeName, setCafeName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [telephone, setTelephone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [open247, setOpen247] = useState(false);
  const [hours, setHours] = useState<DayHours[]>(initialHours);
  const [priceLevel, setPriceLevel] = useState("PHP");
  const [beanTypes, setBeanTypes] = useState<string[]>([]);
  const [brewMethods, setBrewMethods] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<Record<string, string[]>>({});
  const [petFriendly, setPetFriendly] = useState<boolean | null>(null);
  const [conditionTags, setConditionTags] = useState("");
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null);
  const [menuImageUris, setMenuImageUris] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [missingFields, setMissingFields] = useState<Record<string, boolean>>(
    {},
  );

  const characterCount = useMemo(
    () => Math.max(0, 500 - description.length),
    [description.length],
  );
  const isEditSuggestion = Boolean(existingCafeDefaults);

  const normalizeString = (value: string) => value.trim();
  const arraysEqual = (first: string[], second: string[]) =>
    first.length === second.length &&
    first.every((value, index) => value === second[index]);
  const hoursEqual = (first: DayHours[], second: DayHours[]) =>
    first.length === second.length &&
    first.every((item, index) => {
      const other = second[index];
      return (
        other &&
        item.is24Hours === other.is24Hours &&
        item.isClosed === other.isClosed &&
        item.start === other.start &&
        item.end === other.end
      );
    });

  const hasEditChanges = useMemo(() => {
    if (!existingCafeDefaults) return true;
    return (
      Boolean(cafeName.trim()) ||
      Boolean(description.trim()) ||
      Boolean(email.trim()) ||
      Boolean(phone.trim()) ||
      Boolean(telephone.trim()) ||
      priceLevel !== existingCafeDefaults.priceLevel ||
      open247 !== existingCafeDefaults.open247 ||
      !hoursEqual(hours, existingCafeDefaults.hours) ||
      !arraysEqual(beanTypes, existingCafeDefaults.beanTypes) ||
      !arraysEqual(brewMethods, existingCafeDefaults.brewMethods) ||
      !arraysEqual(
        amenities.WiFi ?? [],
        existingCafeDefaults.amenities.WiFi ?? [],
      ) ||
      !arraysEqual(
        amenities.Sockets ?? [],
        existingCafeDefaults.amenities.Sockets ?? [],
      ) ||
      !arraysEqual(
        amenities.Parking ?? [],
        existingCafeDefaults.amenities.Parking ?? [],
      ) ||
      !arraysEqual(
        amenities.Lighting ?? [],
        existingCafeDefaults.amenities.Lighting ?? [],
      ) ||
      !arraysEqual(
        amenities.Seating ?? [],
        existingCafeDefaults.amenities.Seating ?? [],
      ) ||
      !arraysEqual(
        amenities.Tables ?? [],
        existingCafeDefaults.amenities.Tables ?? [],
      ) ||
      !arraysEqual(
        amenities["Suitable Conditions"] ?? [],
        existingCafeDefaults.amenities["Suitable Conditions"] ?? [],
      ) ||
      !arraysEqual(
        amenities.Music ?? [],
        existingCafeDefaults.amenities.Music ?? [],
      ) ||
      Boolean(conditionTags.trim()) ||
      Boolean(profileImageUri) ||
      Boolean(coverImageUri) ||
      menuImageUris.length > 0
    );
  }, [
    amenities,
    beanTypes,
    brewMethods,
    cafeName,
    conditionTags,
    coverImageUri,
    description,
    email,
    existingCafeDefaults,
    hours,
    menuImageUris.length,
    open247,
    phone,
    priceLevel,
    profileImageUri,
    telephone,
  ]);

  useEffect(() => {
    const normalizedQuery = search.trim();
    if (normalizedQuery.length < 2) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      setDidSearch(false);
      return;
    }

    let isActive = true;
    setSearchLoading(true);
    setSearchError("");

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchExistingCafes(normalizedQuery);
        if (!isActive) return;
        setSearchResults(results);
        setDidSearch(true);
      } catch {
        if (!isActive) return;
        setSearchResults([]);
        setSearchError("Unable to search cafes right now.");
      } finally {
        if (isActive) setSearchLoading(false);
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [search]);

  const goBack = () => {
    if (step > 1) {
      setStep((current) => current - 1);
      return;
    }
    navigation.goBack();
  };

  const handleHeaderBack = () => {
    navigation.navigate("Settings");
  };

  const goNext = async () => {
    if (submitting) return;
    if (step === 4 && isEditSuggestion && !hasEditChanges) return;
    setSubmissionMessage("");

    if (step === 2 && !isEditSuggestion) {
      // Required: cafeName, email, phone, address, city, profileImage, coverImage
      // Optional: description, telephone
      const nextMissingFields = {
        cafeName: !cafeName.trim(),
        email: !email.trim(),
        phone: !phone.trim(),
        address: !address.trim(),
        city: !city.trim(),
        profileImage: !profileImageUri,
        coverImage: !coverImageUri,
      };

      if (Object.values(nextMissingFields).some(Boolean)) {
        setMissingFields(nextMissingFields);
        Alert.alert(
          "Missing required fields",
          "Please fill in all required (*) fields before continuing.",
        );
        return;
      }

      setMissingFields({});
    }

    if (step === 3 && !open247) {
      const hasInvalidDay = hours.some((item) => {
        if (item.is24Hours || item.isClosed) return false;
        return !item.start || !item.end;
      });

      if (hasInvalidDay) {
        setMissingFields({ hours: true });
        Alert.alert(
          "Missing required fields",
          "Please complete all Opening Time fields before continuing.",
        );
        return;
      }

      setMissingFields({});
    }

    if (step === 4 && !isEditSuggestion) {
      // All fields on final page are optional
      setMissingFields({});
    }

    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }

    if (!isEditSuggestion && (!profileImageUri || !coverImageUri)) return;

    const base = existingCafeDefaults;

    try {
      setSubmitting(true);
      setSubmissionMessage("Submitting cafe...");
      await submitCafeSubmission({
        existingCafeId: selectedExistingCafe?.id ?? null,
        cafeName: normalizeString(cafeName) || base?.cafeName || cafeName,
        description:
          normalizeString(description) || base?.description || description,
        email: normalizeString(email) || base?.email || email,
        phone: normalizeString(phone) || base?.phone || phone,
        telephone: normalizeString(telephone) || base?.telephone || telephone,
        address: normalizeString(address) || base?.address || address,
        city: normalizeString(city) || base?.city || city,
        priceLevel,
        conditionTags,
        open247,
        hours,
        amenities,
        beanTypes,
        brewMethods,
        petFriendly: petFriendly ?? false,
        profileImageUri,
        coverImageUri,
        menuImageUris,
      });

      setSubmissionMessage("Cafe submitted.");
      Alert.alert("Cafe submitted", "Thanks for sharing this cafe listing.");
      navigation.navigate("Settings");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to submit this cafe right now.";
      setSubmissionMessage(message);
      Alert.alert("Submission failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateDay = (index: number, patch: Partial<DayHours>) => {
    setHours((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const toggleValue = (
    value: string,
    selected: string[],
    setSelected: (next: string[]) => void,
  ) => {
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  };

  const toggleAmenity = (name: string, value: string) => {
    setAmenities((current) => {
      const selected = current[name] ?? [];
      if (SINGLE_SELECT_AMENITIES.has(name)) {
        return { ...current, [name]: selected.includes(value) ? [] : [value] };
      }
      return {
        ...current,
        [name]: selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value],
      };
    });
  };

  const ensurePhotoPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to upload images.",
      );
      return false;
    }
    return true;
  };

  const pickSingleImage = async (onSelected: (uri: string) => void) => {
    const hasPermission = await ensurePhotoPermission();
    if (!hasPermission) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) return;
    onSelected(result.assets[0].uri);
  };

  const pickMenuImages = async () => {
    if (menuImageUris.length >= 10) {
      Alert.alert("Limit reached", "You can upload up to 10 menu photos.");
      return;
    }
    const hasPermission = await ensurePhotoPermission();
    if (!hasPermission) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 10 - menuImageUris.length,
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) return;
    setMenuImageUris((current) => {
      const merged = [...current, ...result.assets.map((asset) => asset.uri)];
      return Array.from(new Set(merged)).slice(0, 10);
    });
  };

  const removeMenuImage = (uri: string) => {
    setMenuImageUris((current) => current.filter((item) => item !== uri));
  };

  const updateSearch = (value: string) => {
    setSearch(value);
    setSelectedExistingCafe(null);
    setExistingCafeDefaults(null);
    setCafeName("");
    setDescription("");
    setEmail("");
    setPhone("");
    setTelephone("");
    setOpen247(false);
    setHours(initialHours);
    setPriceLevel("PHP");
    setBeanTypes([]);
    setBrewMethods([]);
    setAmenities({});
    setPetFriendly(null);
    setConditionTags("");
    setProfileImageUri(null);
    setCoverImageUri(null);
    setMenuImageUris([]);
  };

  const handleEditCafe = async (cafe: ExistingCafeSearchResult) => {
    try {
      setEditLoading(true);
      setSubmissionMessage("");
      const defaults = await getExistingCafeSubmissionDefaults(cafe.id);
      setSelectedExistingCafe(cafe);
      setExistingCafeDefaults(defaults);
      setCafeName("");
      setDescription("");
      setEmail("");
      setPhone("");
      setTelephone("");
      setAddress(defaults.address);
      setCity(defaults.city);
      setPriceLevel(defaults.priceLevel);
      setOpen247(defaults.open247);
      setHours(defaults.hours);
      setAmenities(defaults.amenities);
      setPetFriendly(defaults.petFriendly);
      setBeanTypes(defaults.beanTypes);
      setBrewMethods(defaults.brewMethods);
      setConditionTags("");
      setProfileImageUri(null);
      setCoverImageUri(null);
      setMenuImageUris([]);
      setMissingFields({});
      setStep(2);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load this cafe for editing.";
      Alert.alert("Unable to edit cafe", message);
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 16, paddingBottom: 20 },
        ]}
      >
        <Pressable
          style={[styles.backIconButton, { top: insets.top + 18 }]}
          onPress={handleHeaderBack}
        >
          <MaterialIcons name="arrow-back-ios-new" size={20} color="#4A2A0D" />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Submit Cafe</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 34 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Progress currentStep={step} />
          <Text style={styles.title}>{STEPS[step - 1]}</Text>
          <View style={styles.titleRule} />

          {step === 1 ? (
            <StartStep
              search={search}
              setSearch={updateSearch}
              results={searchResults}
              loading={searchLoading}
              errorMessage={searchError}
              didSearch={didSearch}
              selectedCafeId={selectedExistingCafe?.id ?? null}
              onEditCafe={handleEditCafe}
              editLoading={editLoading}
            />
          ) : null}
          {step === 2 ? (
            <DetailsStep
              cafeName={cafeName}
              setCafeName={setCafeName}
              description={description}
              setDescription={setDescription}
              characterCount={characterCount}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              telephone={telephone}
              setTelephone={setTelephone}
              address={address}
              setAddress={setAddress}
              city={city}
              setCity={setCity}
              profileImageUri={profileImageUri}
              coverImageUri={coverImageUri}
              onPickProfile={() => pickSingleImage(setProfileImageUri)}
              onPickCover={() => pickSingleImage(setCoverImageUri)}
              missingFields={missingFields}
              placeholders={existingCafeDefaults}
              optional={isEditSuggestion}
            />
          ) : null}
          {step === 3 ? (
            <OpeningStep
              open247={open247}
              setOpen247={setOpen247}
              hours={hours}
              updateDay={updateDay}
              missingFields={missingFields}
            />
          ) : null}
          {step === 4 ? (
            <AmenitiesStep
              priceLevel={priceLevel}
              setPriceLevel={setPriceLevel}
              beanTypes={beanTypes}
              brewMethods={brewMethods}
              amenities={amenities}
              conditionTags={conditionTags}
              setConditionTags={setConditionTags}
              petFriendly={petFriendly}
              setPetFriendly={setPetFriendly}
              menuImageUris={menuImageUris}
              onPickMenuImages={pickMenuImages}
              onRemoveMenuImage={removeMenuImage}
              toggleBeanType={(value) =>
                toggleValue(value, beanTypes, setBeanTypes)
              }
              toggleBrewMethod={(value) =>
                toggleValue(value, brewMethods, setBrewMethods)
              }
              toggleAmenity={toggleAmenity}
              missingFields={missingFields}
              optional={isEditSuggestion}
            />
          ) : null}

          <View style={styles.footerRule} />
          <View style={styles.footer}>
            <TouchableOpacity onPress={goBack} style={styles.previousButton}>
              <Text style={styles.previousText}>{"< Previous"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goNext}
              style={[
                styles.nextButton,
                (submitting ||
                  (step === 4 && isEditSuggestion && !hasEditChanges)) &&
                  styles.nextButtonDisabled,
              ]}
              disabled={
                submitting ||
                (step === 4 && isEditSuggestion && !hasEditChanges)
              }
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF6E8" />
              ) : (
                <Text style={styles.nextText}>
                  {step === 4 ? "Submit" : "Next >"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {submissionMessage ? (
            <Text style={styles.submissionMessage}>{submissionMessage}</Text>
          ) : null}
          {submissionMessage ? (
            <Text style={styles.debugMessage}>
              Supabase:{" "}
              {SUPABASE_PROJECT_URL || "missing EXPO_PUBLIC_SUPABASE_URL"}
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Progress({ currentStep }: { currentStep: number }) {
  return (
    <View style={styles.progressRow}>
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={styles.progressItem}>
          <View
            style={[
              styles.progressCircle,
              currentStep === item && styles.progressCircleActive,
            ]}
          >
            <Text
              style={[
                styles.progressText,
                currentStep === item && styles.progressTextActive,
              ]}
            >
              {item}
            </Text>
          </View>
          {item < 4 ? <View style={styles.progressLine} /> : null}
        </View>
      ))}
    </View>
  );
}

function StartStep({
  search,
  setSearch,
  results,
  loading,
  errorMessage,
  didSearch,
  selectedCafeId,
  onEditCafe,
  editLoading,
}: {
  search: string;
  setSearch: (value: string) => void;
  results: ExistingCafeSearchResult[];
  loading: boolean;
  errorMessage: string;
  didSearch: boolean;
  selectedCafeId: number | null;
  onEditCafe: (cafe: ExistingCafeSearchResult) => void;
  editLoading: boolean;
}) {
  return (
    <>
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <View style={styles.roundIcon}>
            <MaterialCommunityIcons
              name="coffee-outline"
              size={24}
              color={COLORS.text}
            />
          </View>
          <Text style={styles.cardTitle}>Qualifications of a Cafe</Text>
        </View>
        <Qualification
          valid
          text="Mall or outdoor cafe with seating areas where customers can sit and enjoy their drinks"
        />
        <Qualification valid text="Serves freshly prepared coffee" />
        <Qualification text="Stalls, kiosks, grab-and-go counters, no seats" />
        <Qualification text="Convenience stores with coffee machines" />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Search for the cafe</Text>
        <Text style={styles.helperText}>
          Check if the cafe exists before proceeding
        </Text>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={22} color="#DAB878" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Type the cafe name to search"
            placeholderTextColor="#DAB878"
          />
        </View>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={COLORS.secondary} />
            <Text style={styles.loadingText}>Searching cafes...</Text>
          </View>
        ) : null}
        {!loading && errorMessage ? (
          <Text style={styles.inlineMessage}>{errorMessage}</Text>
        ) : null}
        {!loading && !errorMessage && didSearch ? (
          <>
            <Text style={styles.resultTitle}>
              Found {results.length} similar cafe(s):
            </Text>
            {results.length > 0 ? (
              results.map((cafe) => {
                const isSelected = cafe.id === selectedCafeId;
                return (
                  <Pressable
                    key={cafe.id}
                    style={[
                      styles.resultRow,
                      isSelected && styles.resultRowSelected,
                    ]}
                    onPress={() => onEditCafe(cafe)}
                    disabled={editLoading}
                  >
                    {cafe.avatar_url ? (
                      <Image
                        source={{ uri: cafe.avatar_url }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.thumbnail} />
                    )}
                    <View style={styles.resultCopy}>
                      <Text style={styles.resultName}>{cafe.name}</Text>
                      <Text style={styles.resultAddress}>
                        {cafe.address || "No address available"}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={
                        isSelected ? "check-circle-outline" : "pencil-outline"
                      }
                      size={22}
                      color={isSelected ? COLORS.teal : COLORS.secondary}
                    />
                  </Pressable>
                );
              })
            ) : (
              <Text style={styles.inlineMessage}>No matching cafes found.</Text>
            )}
          </>
        ) : null}
      </View>
    </>
  );
}

function Qualification({ valid, text }: { valid?: boolean; text: string }) {
  return (
    <View style={styles.qualificationRow}>
      <View style={styles.qualificationIcon}>
        <MaterialIcons
          name={valid ? "check" : "block"}
          size={22}
          color={valid ? "#27BD3D" : "#ED1B14"}
        />
      </View>
      <Text style={styles.qualificationText}>{text}</Text>
    </View>
  );
}

function DetailsStep({
  cafeName,
  setCafeName,
  description,
  setDescription,
  characterCount,
  email,
  setEmail,
  phone,
  setPhone,
  telephone,
  setTelephone,
  address,
  setAddress,
  city,
  setCity,
  profileImageUri,
  coverImageUri,
  onPickProfile,
  onPickCover,
  missingFields,
  placeholders,
  optional,
}: {
  cafeName: string;
  setCafeName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  characterCount: number;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  telephone: string;
  setTelephone: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  profileImageUri: string | null;
  coverImageUri: string | null;
  onPickProfile: () => void;
  onPickCover: () => void;
  missingFields: Record<string, boolean>;
  placeholders: ExistingCafeSubmissionDefaults | null;
  optional: boolean;
}) {
  return (
    <>
      <Field
        label="Cafe Name"
        required={!optional}
        note={
          <Text style={styles.counter}>
            For chain brands, add the location. Brand - Branch (e.g. Starbucks -
            IT Park)
          </Text>
        }
        value={cafeName}
        onChangeText={setCafeName}
        placeholder={placeholders?.cafeName || "Cafe Name"}
        error={missingFields.cafeName}
      />
      {/* Description — always optional */}
      <Text style={styles.label}>
        Description
        <Text style={styles.optionalTag}>
          (optional - leave blank if unsure)
        </Text>
        {"  "}
        <Text style={styles.counter}>
          {characterCount} characters remaining
        </Text>
      </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={(value) => setDescription(value.slice(0, 500))}
        placeholder={
          placeholders?.description ||
          "Describe your cafe. What makes it special?"
        }
        placeholderTextColor="#B9966D"
        multiline
        textAlignVertical="top"
      />
      <View style={styles.divider} />
      <Field
        label="Email Address"
        required={!optional}
        value={email}
        onChangeText={setEmail}
        placeholder={placeholders?.email || "Email Address"}
        keyboardType="email-address"
        error={missingFields.email}
      />
      <Field
        label="Phone"
        required={!optional}
        value={phone}
        onChangeText={setPhone}
        placeholder={placeholders?.phone || "e.g. 0912 345 6789"}
        keyboardType="phone-pad"
        error={missingFields.phone}
      />
      {/* Telephone / landline — always optional */}
      <Field
        label="Landline/Telephone"
        required={false}
        note={
          <Text style={styles.counter}>
            Leave blank if the cafe doesn't have a landline
          </Text>
        }
        value={telephone}
        onChangeText={setTelephone}
        placeholder={placeholders?.telephone || "e.g. 123-4567 (optional)"}
        keyboardType="phone-pad"
      />
      <Field
        label="Address"
        required={!optional}
        value={address}
        onChangeText={setAddress}
        placeholder={placeholders?.address || "Street address"}
        error={missingFields.address}
      />
      <Field
        label="City"
        required={!optional}
        value={city}
        onChangeText={setCity}
        placeholder={placeholders?.city || "City"}
        error={missingFields.city}
      />
      <View style={styles.divider} />
      <UploadPair
        title="Profile Picture"
        required={!optional}
        uploaded={Boolean(profileImageUri)}
        previewUri={profileImageUri}
        onUpload={onPickProfile}
        error={!optional && missingFields.profileImage}
      />
      <UploadWide
        title="Cover Picture"
        required={!optional}
        uploaded={Boolean(coverImageUri)}
        previewUri={coverImageUri}
        onUpload={onPickCover}
        error={!optional && missingFields.coverImage}
      />
    </>
  );
}

function Field({
  label,
  required,
  note,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
}: {
  label: string;
  required?: boolean;
  note?: ReactNode;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  error?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}{" "}
        {required ? (
          <Text style={styles.requiredStar}>*</Text>
        ) : (
          <Text style={styles.optionalTag}>(optional)</Text>
        )}
      </Text>
      {note ? <View style={styles.fieldNote}>{note}</View> : null}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B9966D"
        keyboardType={keyboardType}
      />
      {error ? (
        <Text style={styles.fieldError}>This field is required.</Text>
      ) : null}
    </View>
  );
}

function UploadPair({
  title,
  required,
  uploaded,
  previewUri,
  onUpload,
  error,
}: {
  title: string;
  required?: boolean;
  uploaded: boolean;
  previewUri: string | null;
  onUpload: () => void;
  error?: boolean;
}) {
  return (
    <View style={styles.uploadGroup}>
      <Text style={styles.label}>
        {title}{" "}
        {required ? (
          <Text style={styles.requiredStar}>*</Text>
        ) : (
          <Text style={styles.optionalTag}>(optional)</Text>
        )}
      </Text>
      <View style={styles.uploadPair}>
        <UploadBox
          compact
          uploaded={uploaded}
          onPress={onUpload}
          error={error}
        />
        <View style={[styles.previewBox, error && styles.inputError]}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.previewImage} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={42}
                color="#C9A66E"
              />
              <Text style={styles.uploadText}>Preview</Text>
            </>
          )}
        </View>
      </View>
      {error ? (
        <Text style={styles.fieldError}>This image is required.</Text>
      ) : null}
    </View>
  );
}

function UploadWide({
  title,
  required,
  uploaded,
  previewUri,
  onUpload,
  error,
}: {
  title: string;
  required?: boolean;
  uploaded: boolean;
  previewUri: string | null;
  onUpload: () => void;
  error?: boolean;
}) {
  return (
    <View style={styles.uploadGroup}>
      <Text style={styles.label}>
        {title}{" "}
        {required ? (
          <Text style={styles.requiredStar}>*</Text>
        ) : (
          <Text style={styles.optionalTag}>(optional)</Text>
        )}
      </Text>
      <View style={[styles.previewWide, error && styles.inputError]}>
        {previewUri ? (
          <Image
            source={{ uri: previewUri }}
            style={styles.previewWideImage}
            resizeMode="cover"
          />
        ) : (
          <>
            <MaterialCommunityIcons
              name="image-outline"
              size={44}
              color="#C9A66E"
            />
            <Text style={styles.uploadText}>Preview</Text>
          </>
        )}
      </View>
      <UploadBox uploaded={uploaded} onPress={onUpload} error={error} />
      {error ? (
        <Text style={styles.fieldError}>This image is required.</Text>
      ) : null}
    </View>
  );
}

function UploadBox({
  compact,
  uploaded,
  onPress,
  error,
}: {
  compact?: boolean;
  uploaded?: boolean;
  onPress: () => void;
  error?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.uploadBox,
        compact && styles.uploadBoxCompact,
        error && styles.inputError,
      ]}
      onPress={onPress}
    >
      <MaterialCommunityIcons name="image-outline" size={40} color="#C9A66E" />
      <Text style={styles.uploadText}>
        {uploaded ? "Image attached" : "Click to upload"}
      </Text>
      <Text style={styles.uploadHint}>
        {uploaded ? "Tap to replace/add" : "JPG, PNG, up to 5MB"}
      </Text>
    </Pressable>
  );
}

function OpeningStep({
  open247,
  setOpen247,
  hours,
  updateDay,
  missingFields,
}: {
  open247: boolean;
  setOpen247: (value: boolean) => void;
  hours: DayHours[];
  updateDay: (index: number, patch: Partial<DayHours>) => void;
  missingFields?: Record<string, boolean>;
}) {
  return (
    <>
      <View style={styles.cardRow}>
        <View>
          <Text style={styles.sectionTitle}>Daily Operating Hours</Text>
          <Text style={styles.bodyText}>Open 24/7</Text>
        </View>
        <Switch
          value={open247}
          onValueChange={setOpen247}
          trackColor={{ false: "#D8C7B0", true: COLORS.teal }}
          thumbColor="#FFF6E8"
          ios_backgroundColor="#D8C7B0"
        />
      </View>
      <Text style={styles.subheading}>Custom Operating Hours</Text>
      {hours.map((item, index) => (
        <View
          key={item.day}
          style={[styles.dayCard, missingFields?.hours && styles.inputError]}
        >
          <Text style={styles.dayName}>{item.day}</Text>
          <View style={styles.dayOptions}>
            <CheckRow
              label="24 Hours"
              checked={item.is24Hours}
              disabled={open247}
              onPress={() => {
                if (open247) return;
                if (item.is24Hours) {
                  updateDay(index, {
                    is24Hours: false,
                    start: "8:00 AM",
                    end: "8:00 PM",
                  });
                  return;
                }
                updateDay(index, {
                  is24Hours: true,
                  isClosed: false,
                  start: "",
                  end: "",
                });
              }}
            />
            <CheckRow
              label="Closed"
              checked={item.isClosed}
              disabled={open247}
              onPress={() => {
                if (open247) return;
                if (item.isClosed) {
                  updateDay(index, {
                    isClosed: false,
                    start: "8:00 AM",
                    end: "8:00 PM",
                  });
                  return;
                }
                updateDay(index, {
                  isClosed: true,
                  is24Hours: false,
                  start: "",
                  end: "",
                });
              }}
            />
          </View>
          <View style={styles.timeColumn}>
            <TimePicker
              label="Start"
              value={item.start}
              disabled={open247 || item.is24Hours || item.isClosed}
              onChange={(value) => updateDay(index, { start: value })}
            />
            <TimePicker
              label="End"
              value={item.end}
              disabled={open247 || item.is24Hours || item.isClosed}
              onChange={(value) => updateDay(index, { end: value })}
            />
          </View>
        </View>
      ))}
    </>
  );
}

function CheckRow({
  label,
  checked,
  disabled,
  onPress,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.checkRow, disabled && styles.disabledRow]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? (
          <MaterialIcons name="check" size={13} color="#FFF6E8" />
        ) : null}
      </View>
      <Text style={styles.bodyText}>{label}</Text>
    </Pressable>
  );
}

function TimePicker({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <View style={[styles.timeRow, disabled && styles.disabledRow]}>
      <Text style={styles.timeLabel}>{label}</Text>
      <View style={styles.pickerShell}>
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          enabled={!disabled}
          dropdownIconColor={COLORS.secondary}
          style={styles.picker}
        >
          <Picker.Item label="Select time" value="" />
          {TIME_OPTIONS.map((time) => (
            <Picker.Item key={time} label={time} value={time} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

function AmenitiesStep({
  priceLevel,
  setPriceLevel,
  beanTypes,
  brewMethods,
  amenities,
  conditionTags,
  setConditionTags,
  petFriendly,
  setPetFriendly,
  menuImageUris,
  onPickMenuImages,
  onRemoveMenuImage,
  toggleBeanType,
  toggleBrewMethod,
  toggleAmenity,
  missingFields,
  optional,
}: {
  priceLevel: string;
  setPriceLevel: (value: string) => void;
  beanTypes: string[];
  brewMethods: string[];
  amenities: Record<string, string[]>;
  conditionTags: string;
  setConditionTags: (value: string) => void;
  petFriendly: boolean | null;
  setPetFriendly: (value: boolean | null) => void;
  menuImageUris: string[];
  onPickMenuImages: () => void;
  onRemoveMenuImage: (uri: string) => void;
  toggleBeanType: (value: string) => void;
  toggleBrewMethod: (value: string) => void;
  toggleAmenity: (name: string, value: string) => void;
  missingFields: Record<string, boolean>;
  optional: boolean;
}) {
  return (
    <>
      <Text style={styles.subheading}>Amenities & Features</Text>
      <FeatureCard
        icon="tag"
        title="Price Level"
        subtitle="Based on average drink prices"
      >
        <ToggleGroup
          options={["₱", "₱₱", "₱₱₱"]}
          selected={[priceLevel]}
          onToggle={setPriceLevel}
        />
      </FeatureCard>
      <FeatureCard
        icon="coffee-outline"
        title="Coffee"
        subtitle="Bean type, brewing methods, etc."
      >
        <Text style={styles.miniLabel}>
          Bean Type <Text style={styles.optionalTag}>(optional)</Text>
        </Text>
        <ToggleGroup
          options={["Arabica", "Robusta", "Liberica (Barako)", "Excelsa"]}
          selected={beanTypes}
          onToggle={toggleBeanType}
          error={false}
        />
        <Text style={styles.miniLabel}>
          Brew Method <Text style={styles.optionalTag}>(optional)</Text>
        </Text>
        <ToggleGroup
          options={[
            "Espresso",
            "Drip",
            "French Press",
            "Pour Over",
            "Cold Brew",
          ]}
          selected={brewMethods}
          onToggle={toggleBrewMethod}
          error={false}
        />
      </FeatureCard>
      <FeatureCard
        icon="silverware-fork-knife"
        title="Amenities"
        subtitle="WiFi, sockets, parking, etc."
      >
        <AmenityGroup
          name="WiFi"
          icon="wifi"
          options={["None", "Slow", "Moderate", "Fast"]}
          selected={amenities.WiFi ?? []}
          onToggle={toggleAmenity}
          required={false}
          error={false}
        />
        <AmenityGroup
          name="Sockets"
          icon="power-socket-us"
          options={["None", "Some", "Many"]}
          selected={amenities.Sockets ?? []}
          onToggle={toggleAmenity}
          required={false}
          error={false}
        />
        <AmenityGroup
          name="Parking"
          icon="car"
          options={["None", "Limited", "Plenty"]}
          selected={amenities.Parking ?? []}
          onToggle={toggleAmenity}
          required={false}
          error={false}
        />
        <AmenityGroup
          name="Lighting"
          icon="lightbulb-on-outline"
          options={["Dim", "Balanced", "Bright"]}
          selected={amenities.Lighting ?? []}
          onToggle={toggleAmenity}
          required={false}
          error={false}
        />
        <AmenityGroup
          name="Seating"
          icon="sofa-outline"
          options={["Inside", "Outside"]}
          selected={amenities.Seating ?? []}
          onToggle={toggleAmenity}
          required={false}
          error={false}
        />
        <AmenityGroup
          name="Tables"
          icon="table-furniture"
          options={["Bar type", "Individual Tables", "Large tables (>6)"]}
          selected={amenities.Tables ?? []}
          onToggle={toggleAmenity}
          required={false}
          error={false}
        />
        <AmenityGroup
          name="Suitable Conditions"
          icon="account-group-outline"
          options={["Student", "Work", "Group", "Vibes"]}
          selected={amenities["Suitable Conditions"] ?? []}
          onToggle={toggleAmenity}
          required={false}
          error={false}
        >
          <TextInput
            style={styles.smallInput}
            value={conditionTags}
            onChangeText={setConditionTags}
            placeholder="Suggest tags to add (comma-separated)"
            placeholderTextColor="#B9966D"
          />
        </AmenityGroup>
        <AmenityGroup
          name="Music"
          icon="music"
          options={["Quiet", "Normal", "Blaring"]}
          selected={amenities.Music ?? []}
          onToggle={toggleAmenity}
          required={false}
          error={false}
        />
        <AmenityGroup
          name="Pet Friendly"
          icon="dog-side"
          options={["Yes", "No"]}
          selected={petFriendly === null ? [] : [petFriendly ? "Yes" : "No"]}
          onToggle={(_, value) => {
            const currentValue =
              petFriendly === null ? null : petFriendly ? "Yes" : "No";
            setPetFriendly(currentValue === value ? null : value === "Yes");
          }}
          required={!optional}
          error={!optional && missingFields.PetFriendly}
        />
      </FeatureCard>
      <View style={styles.divider} />
      {/* Menu images — always optional */}
      <Text style={styles.label}>
        Menu <Text style={styles.optionalTag}>(optional)</Text>
        {"  "}
        <Text style={styles.counter}>{menuImageUris.length}/10 uploaded</Text>
      </Text>
      <UploadBox
        uploaded={menuImageUris.length > 0}
        onPress={onPickMenuImages}
      />
      {menuImageUris.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.menuPreviewRow}
        >
          {menuImageUris.map((uri) => (
            <View key={uri} style={styles.menuPreviewCard}>
              <Image source={{ uri }} style={styles.menuPreviewImage} />
              <Pressable
                style={styles.menuPreviewRemove}
                onPress={() => onRemoveMenuImage(uri)}
              >
                <MaterialIcons name="close" size={12} color="#FFF8EC" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}
      <Text style={styles.noteText}>
        Note: Be sure to check if all details are correct before submitting.
      </Text>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureHeader}>
        <MaterialCommunityIcons name={icon} size={20} color={COLORS.text} />
        <View>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function ToggleGroup({ options, selected, onToggle, error }: ToggleGroupProps) {
  return (
    <View style={[styles.toggleWrap, error && styles.toggleWrapError]}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <Pressable
            key={option}
            style={[styles.choiceChip, isSelected && styles.choiceChipActive]}
            onPress={() => onToggle(option)}
          >
            <Text
              style={[styles.choiceText, isSelected && styles.choiceTextActive]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function AmenityGroup({
  name,
  icon,
  options,
  selected,
  onToggle,
  children,
  required,
  error,
}: {
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  options: string[];
  selected: string[];
  onToggle: (name: string, value: string) => void;
  children?: ReactNode;
  required?: boolean;
  error?: boolean;
}) {
  return (
    <View style={styles.amenityBlock}>
      <View style={styles.amenityTitleRow}>
        <MaterialCommunityIcons name={icon} size={16} color={COLORS.text} />
        <Text style={styles.miniLabel}>
          {name}{" "}
          {required ? (
            <Text style={styles.requiredStar}>*</Text>
          ) : (
            <Text style={styles.optionalTag}>(optional)</Text>
          )}
        </Text>
      </View>
      <ToggleGroup
        options={options}
        selected={selected}
        onToggle={(value) => onToggle(name, value)}
        error={error}
      />
      {error ? (
        <Text style={styles.fieldError}>Please select an option.</Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: "#E4C79E",
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#7A5A37",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
  },
  backIconButton: {
    position: "absolute",
    left: 18,
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backButtonText: { color: "#4A2A0D", fontSize: 16, fontWeight: "500" },
  headerTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: "#4A2A0D",
    letterSpacing: 0.3,
  },
  keyboardContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 24 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  progressItem: { flexDirection: "row", alignItems: "center" },
  progressCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9D8B9",
  },
  progressCircleActive: { backgroundColor: "#C4A36F" },
  progressText: {
    color: "#C7B28D",
    fontFamily: "serif",
    fontSize: 16,
    fontWeight: "700",
  },
  progressTextActive: { color: "#FFF8EB" },
  progressLine: {
    width: 38,
    height: 3,
    backgroundColor: "#E0C493",
    marginHorizontal: 7,
  },
  title: {
    color: COLORS.text,
    fontFamily: "serif",
    fontSize: 38,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 46,
  },
  titleRule: {
    height: 2,
    backgroundColor: COLORS.border,
    marginTop: 14,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 2,
  },
  roundIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D0AE77",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    flex: 1,
    color: COLORS.text,
    fontFamily: "serif",
    fontSize: 20,
    fontWeight: "700",
  },
  qualificationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 14,
  },
  qualificationIcon: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  qualificationText: {
    flex: 1,
    color: COLORS.secondary,
    fontFamily: "serif",
    fontSize: 15,
    lineHeight: 21,
  },
  sectionTitle: {
    color: COLORS.text,
    fontFamily: "serif",
    fontSize: 21,
    fontWeight: "800",
  },
  helperText: {
    color: COLORS.secondary,
    fontFamily: "serif",
    fontSize: 15,
    marginBottom: 10,
    marginTop: 4,
  },
  searchBox: {
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: "#fff1db",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontFamily: "serif",
    fontSize: 16,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  loadingText: { color: COLORS.secondary, fontFamily: "serif", fontSize: 13 },
  inlineMessage: {
    color: COLORS.secondary,
    fontFamily: "serif",
    fontSize: 13,
    marginBottom: 8,
  },
  resultTitle: {
    color: COLORS.text,
    fontFamily: "serif",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  resultRow: {
    minHeight: 66,
    borderRadius: 6,
    backgroundColor: "#FFF8EC",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 12,
    marginBottom: 10,
  },
  resultRowSelected: { borderWidth: 1.5, borderColor: COLORS.teal },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: "#E1E1DE",
  },
  resultCopy: { flex: 1 },
  resultName: {
    color: COLORS.secondary,
    fontFamily: "serif",
    fontSize: 15,
    fontWeight: "800",
  },
  resultAddress: {
    color: COLORS.secondary,
    fontFamily: "serif",
    fontSize: 12,
    marginTop: 2,
  },
  label: {
    color: COLORS.text,
    fontFamily: "serif",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 5,
  },
  requiredStar: { color: COLORS.required, fontSize: 15, fontWeight: "800" },
  optionalTag: { color: "#A97845", fontSize: 12, fontWeight: "400" },
  fieldError: {
    color: COLORS.required,
    fontFamily: "serif",
    fontSize: 12,
    marginTop: 4,
  },
  counter: { color: "#A97845", fontSize: 10 },
  fieldGroup: { marginBottom: 12 },
  fieldNote: {
    color: COLORS.text,
    fontFamily: "serif",
    fontSize: 10,
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    color: COLORS.text,
    fontFamily: "serif",
    fontSize: 14,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  inputError: { borderWidth: 1.5, borderColor: "rgb(209, 145, 138)" },
  textArea: { minHeight: 132, marginBottom: 18 },
  divider: { height: 2, backgroundColor: COLORS.border, marginVertical: 18 },
  uploadGroup: { marginBottom: 18 },
  uploadPair: {
    flexDirection: "row",
    gap: 20,
    alignItems: "stretch",
    justifyContent: "center",
  },
  uploadBox: {
    minHeight: 104,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C9A66E",
    borderRadius: 10,
    backgroundColor: "#F0D3A0",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    marginTop: 10,
  },
  uploadBoxCompact: { width: 126, minHeight: 116, marginTop: 0 },
  previewBox: {
    width: 126,
    minHeight: 116,
    borderWidth: 1,
    borderColor: "#E7CDA3",
    borderRadius: 8,
    backgroundColor: "#FFF8EC",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: { width: "100%", height: "100%" },
  previewWide: {
    height: 120,
    borderWidth: 1,
    borderColor: "#D8B783",
    borderRadius: 8,
    backgroundColor: "#FFF8EC",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    overflow: "hidden",
  },
  previewWideImage: { ...StyleSheet.absoluteFillObject },
  uploadText: {
    color: "#C19B61",
    fontFamily: "serif",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  uploadHint: {
    color: "#C19B61",
    fontFamily: "serif",
    fontSize: 10,
    textAlign: "center",
  },
  cardRow: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  bodyText: { color: COLORS.secondary, fontFamily: "serif", fontSize: 16 },
  subheading: {
    color: COLORS.text,
    fontFamily: "serif",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
  },
  dayCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dayName: {
    width: 112,
    color: COLORS.text,
    fontFamily: "serif",
    fontSize: 18,
    fontWeight: "800",
  },
  dayOptions: { flex: 1, gap: 10, marginRight: 80 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  disabledRow: { opacity: 0.5 },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#BF9B62",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF6E8",
  },
  checkboxChecked: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  timeColumn: { width: 130, gap: 8 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  timeLabel: {
    width: 42,
    color: COLORS.secondary,
    fontFamily: "serif",
    fontSize: 15,
    fontWeight: "800",
  },
  pickerShell: {
    flex: 1,
    height: 38,
    borderWidth: 1.5,
    borderColor: "#C5A06A",
    borderRadius: 7,
    backgroundColor: "#FFF8EC",
    overflow: "hidden",
    justifyContent: "center",
  },
  picker: {
    color: COLORS.secondary,
    fontFamily: "serif",
    height: 48,
    marginVertical: -5,
  },
  featureCard: {
    backgroundColor: COLORS.card,
    borderRadius: 9,
    padding: 12,
    marginBottom: 6,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  featureTitle: {
    color: COLORS.text,
    fontFamily: "serif",
    fontSize: 18,
    fontWeight: "800",
  },
  featureSubtitle: {
    color: "#A97845",
    fontFamily: "serif",
    fontSize: 12,
    marginTop: 2,
  },
  miniLabel: {
    color: COLORS.text,
    fontFamily: "serif",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 5,
  },
  toggleWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  toggleWrapError: {
    borderWidth: 1.5,
    borderColor: "rgb(209, 145, 138)",
    borderRadius: 6,
    padding: 6,
  },
  choiceChip: {
    minHeight: 28,
    borderWidth: 1,
    borderColor: "#E4C492",
    borderRadius: 5,
    backgroundColor: "#FFF8EC",
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceChipActive: {
    backgroundColor: COLORS.buttonAlt,
    borderColor: COLORS.buttonAlt,
  },
  choiceText: { color: COLORS.secondary, fontFamily: "serif", fontSize: 13 },
  choiceTextActive: { color: "#FFF8EC", fontWeight: "800" },
  amenityBlock: {
    backgroundColor: COLORS.inset,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingTop: 8,
    marginBottom: 4,
  },
  amenityTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  smallInput: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: "#C5A06A",
    borderRadius: 5,
    color: COLORS.secondary,
    fontFamily: "serif",
    fontSize: 14,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  noteText: {
    color: COLORS.secondary,
    fontFamily: "serif",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
  },
  menuPreviewRow: { gap: 10, marginTop: 12, paddingRight: 4 },
  menuPreviewCard: {
    width: 88,
    height: 88,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D8B783",
    backgroundColor: "#FFF8EC",
  },
  menuPreviewImage: { width: "100%", height: "100%" },
  menuPreviewRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(59,31,14,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  footerRule: {
    height: 2,
    backgroundColor: COLORS.border,
    marginTop: 14,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previousButton: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  previousText: {
    color: COLORS.text,
    fontFamily: "serif",
    fontSize: 20,
    fontWeight: "800",
  },
  nextButton: {
    minWidth: 102,
    minHeight: 46,
    borderRadius: 6,
    backgroundColor: COLORS.buttonAlt,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  nextButtonDisabled: { backgroundColor: "#D8B783", opacity: 0.75 },
  nextText: {
    color: "#FFF6E8",
    fontFamily: "serif",
    fontSize: 18,
    fontWeight: "800",
  },
  submissionMessage: {
    color: COLORS.secondary,
    fontFamily: "serif",
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
  debugMessage: {
    color: "#A97845",
    fontFamily: "serif",
    fontSize: 10,
    marginTop: 6,
    textAlign: "center",
  },
});

import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CAROUSEL_HEIGHT = 220;

export type Amenities = {
  WiFi: "None" | "Slow" | "Moderate" | "Fast" | null;
  Sockets: "None" | "Some" | "Many" | null;
  Parking: "None" | "Limited" | "Plenty" | null;
  Lighting: "Dim" | "Balanced" | "Bright" | null;
  Seating: string[];
  Tables: string[];
  Music: "Quiet" | "Normal" | "Blaring" | null;
  PetFriendly: boolean;
  SuitableConditions: ("Student" | "Work" | "Group" | "Vibes")[];
};

export type Coffee = {
  BeanType: ("Arabica" | "Robusta" | "Liberica" | "Excelsa")[];
  BrewMethod: (
    | "Espresso"
    | "Drip"
    | "French Press"
    | "Pour Over"
    | "Cold Brew"
  )[];
};

export type PriceLevel = {
  PriceRange: "P" | "PP" | "PPP" | null;
};

export type AmenitiesMenuTabProps = {
  amenities: Amenities;
  menuURLs: string[] | null;
  coffee: Coffee;
  price: PriceLevel;
};




function AmenityCard({
  label,
  icon,
  options,
  selected,
}: {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  options: string[];
  selected: string | string[] | null;
}) {
  return (
    <View style={amenityCardStyles.card}>
      <View style={amenityCardStyles.cardHeader}>
        <MaterialIcons name={icon} size={17} color="#6B4F2E" />
        <Text style={amenityCardStyles.cardTitle}>{label}</Text>
      </View>
      <View style={amenityCardStyles.optionsRow}>
        {options.map((opt) => {
          const isSelected = Array.isArray(selected)
            ? selected.includes(opt)
            : selected === opt;
          return (
            <View
              key={opt}
              style={[
                amenityCardStyles.optionPill,
                isSelected && amenityCardStyles.optionPillSelected,
              ]}
            >
              <Text
                style={[
                  amenityCardStyles.optionText,
                  isSelected && amenityCardStyles.optionTextSelected,
                ]}
              >
                {opt}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={priceCoffeeStyles.sectionCard}>
      <View style={priceCoffeeStyles.sectionCardHeader}>
        <MaterialIcons name={icon} size={22} color="#6B4F2E" />
        <View>
          <Text style={priceCoffeeStyles.sectionCardTitle}>{title}</Text>
          {subtitle ? (
            <Text style={priceCoffeeStyles.sectionCardSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function PricePill({
  symbol,
  label,
  selected,
}: {
  symbol: string;
  label: string;
  selected: boolean;
}) {
  return (
    <View
      style={[
        priceCoffeeStyles.pricePill,
        selected && priceCoffeeStyles.pricePillSelected,
      ]}
    >
      <Text
        style={[
          priceCoffeeStyles.priceSymbol,
          selected && priceCoffeeStyles.priceSymbolSelected,
        ]}
      >
        {symbol}
      </Text>
      <Text
        style={[
          priceCoffeeStyles.priceLabel,
          selected && priceCoffeeStyles.priceLabelSelected,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function CoffeeSubCard({
  label,
  options,
  selected,
}: {
  label: string;
  options: string[];
  selected: string[];
}) {
  return (
    <View style={priceCoffeeStyles.coffeeSubCard}>
      <Text style={priceCoffeeStyles.coffeeSubCardTitle}>{label}</Text>
      <View style={priceCoffeeStyles.optionsRow}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <View
              key={opt}
              style={[
                priceCoffeeStyles.coffeePill,
                isSelected && priceCoffeeStyles.coffeePillSelected,
              ]}
            >
              <Text
                style={[
                  priceCoffeeStyles.coffeePillText,
                  isSelected && priceCoffeeStyles.coffeePillTextSelected,
                ]}
              >
                {opt}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function MenuCarousel({ menuURLs }: { menuURLs: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainRef = useRef<FlatList>(null);
  const modalRef = useRef<FlatList>(null);

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setModalVisible(true);
    setTimeout(() => {
      modalRef.current?.scrollToIndex({ index, animated: false });
    }, 50);
  };

  return (
    <View>
      {/* ── Carousel ── */}
      <FlatList
        ref={mainRef}
        data={menuURLs}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / SCREEN_WIDTH
          );
          setActiveIndex(index);
        }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => openModal(index)}
            style={menuCarouselStyles.slide}
          >
            <Image
              source={{ uri: item }}
              style={menuCarouselStyles.image}
              resizeMode="cover"
            />
            <View style={menuCarouselStyles.expandHint}>
              <MaterialIcons name="fullscreen" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ── Dot indicators ── */}
      {menuURLs.length > 1 && (
        <View style={menuCarouselStyles.dotsRow}>
          {menuURLs.map((_, i) => (
            <View
              key={i}
              style={[
                menuCarouselStyles.dot,
                i === activeIndex && menuCarouselStyles.dotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* ── Expanded modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={menuCarouselStyles.modalBackdrop}>
          <StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />

          {/* Close button */}
          <TouchableOpacity
            style={menuCarouselStyles.closeBtn}
            onPress={() => setModalVisible(false)}
          >
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Counter */}
          <Text style={menuCarouselStyles.counter}>
            {selectedIndex + 1} / {menuURLs.length}
          </Text>

          {/* Full-screen swipeable list */}
          <FlatList
            ref={modalRef}
            data={menuURLs}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            initialScrollIndex={selectedIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setSelectedIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={menuCarouselStyles.modalSlide}>
                <Image
                  source={{ uri: item }}
                  style={menuCarouselStyles.modalImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}


export function AmenitiesMenuTab({ amenities, menuURLs, coffee, price }: AmenitiesMenuTabProps) {
  const AMENITY_ROWS: {
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    options: string[];
    value: string | string[] | null;
  }[] = [
    {
      label: "WiFi",
      icon: "wifi",
      options: ["None", "Slow", "Moderate", "Fast"],
      value: amenities.WiFi,
    },
    {
      label: "Sockets",
      icon: "electrical-services",
      options: ["None", "Some", "Many"],
      value: amenities.Sockets,
    },
    {
      label: "Parking",
      icon: "local-parking",
      options: ["None", "Limited", "Plenty"],
      value: amenities.Parking,
    },
    {
      label: "Lighting",
      icon: "light-mode",
      options: ["Dim", "Balanced", "Bright"],
      value: amenities.Lighting,
    },
    {
      label: "Seating",
      icon: "chair",
      options: ["Inside", "Outside"],
      value: amenities.Seating,
    },
    {
      label: "Tables",
      icon: "table-bar",
      options: ["Bar Type", "Individual Tables", "Large Tables"],
      value: amenities.Tables,
    },
    {
      label: "Music",
      icon: "music-note",
      options: ["Quiet", "Normal", "Blaring"],
      value: amenities.Music,
    },
  ];

  const PRICE_OPTIONS: {
    symbol: string;
    value: "P" | "PP" | "PPP";
    label: string;
  }[] = [
    { symbol: "₱", value: "P", label: "Below ₱150" },
    { symbol: "₱₱", value: "PP", label: "₱150–300" },
    { symbol: "₱₱₱", value: "PPP", label: "Above ₱300" },
  ];

  return (
    <View>
      {/* ── Menu ── */}
        <Text style={amenityCardStyles.sectionLabel}>Menu</Text>
        {menuURLs && menuURLs.length > 0 ? (
        <MenuCarousel menuURLs={menuURLs} />
        ) : (
        <View style={amenityStyles.menuPlaceholder}>
            <MaterialIcons name="menu-book" size={32} color="#C4A882" />
            <Text style={amenityStyles.menuPlaceholderText}>No menu uploaded yet</Text>
        </View>
        )}

      {/* ── Price Level ── */}
      <SectionCard
        icon="local-offer"
        title="Price Level"
        subtitle="Based on average drink prices"
      >
        <View style={priceCoffeeStyles.priceRow}>
          {PRICE_OPTIONS.map((opt) => (
            <PricePill
              key={opt.value}
              symbol={opt.symbol}
              label={opt.label}
              selected={price.PriceRange === opt.value}
            />
          ))}
        </View>
      </SectionCard>

      {/* ── Coffee ── */}
      <SectionCard
        icon="coffee"
        title="Coffee"
        subtitle="Bean type, brewing methods, etc."
      >
        <CoffeeSubCard
          label="Bean Type"
          options={["Arabica", "Robusta", "Liberica", "Excelsa"]}
          selected={coffee.BeanType}
        />
        <CoffeeSubCard
          label="Brew Method"
          options={["Espresso", "Drip", "French Press", "Pour Over", "Cold Brew"]}
          selected={coffee.BrewMethod}
        />
      </SectionCard>

      {/* ── Amenities ── */}
      <Text style={[amenityCardStyles.sectionLabel, { marginTop: 20 }]}>
        Amenities
      </Text>
      {AMENITY_ROWS.map((row) => (
        <AmenityCard
          key={row.label}
          label={row.label}
          icon={row.icon}
          options={row.options}
          selected={row.value}
        />
      ))}

      {/* ── Suitable Conditions ── */}
      {amenities.SuitableConditions?.length > 0 && (
        <View style={amenityCardStyles.card}>
          <View style={amenityCardStyles.cardHeader}>
            <MaterialIcons name="group" size={17} color="#6B4F2E" />
            <Text style={amenityCardStyles.cardTitle}>Suitable Conditions</Text>
          </View>
          <View style={amenityCardStyles.optionsRow}>
            {(["Student", "Work", "Group", "Vibes"] as const).map((cond) => {
              const isSelected = amenities.SuitableConditions.includes(cond);
              return (
                <View
                  key={cond}
                  style={[
                    amenityCardStyles.optionPill,
                    isSelected && amenityCardStyles.optionPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      amenityCardStyles.optionText,
                      isSelected && amenityCardStyles.optionTextSelected,
                    ]}
                  >
                    {cond}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Pet Friendly ── */}
      <View style={amenityCardStyles.card}>
        <View style={amenityCardStyles.cardHeader}>
          <MaterialIcons name="pets" size={17} color="#6B4F2E" />
          <Text style={amenityCardStyles.cardTitle}>Pet Friendly</Text>
        </View>
        <View style={amenityCardStyles.optionsRow}>
          {(["Yes", "No"] as const).map((opt) => {
            const isSelected =
              (opt === "Yes" && amenities.PetFriendly) ||
              (opt === "No" && !amenities.PetFriendly);
            return (
              <View
                key={opt}
                style={[
                  amenityCardStyles.optionPill,
                  isSelected && amenityCardStyles.optionPillSelected,
                ]}
              >
                <Text
                  style={[
                    amenityCardStyles.optionText,
                    isSelected && amenityCardStyles.optionTextSelected,
                  ]}
                >
                  {opt}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}




const priceCoffeeStyles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  sectionCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 14,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
    lineHeight: 20,
  },
  sectionCardSubtitle: {
    fontSize: 11,
    color: "#8C6D4F",
    marginTop: 1,
    fontFamily: "SourceSerifPro-Regular",
  },
  priceRow: {
    flexDirection: "row",
    gap: 8,
  },
  pricePill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D2BA94",
    backgroundColor: "transparent",
    gap: 2,
  },
  pricePillSelected: {
    backgroundColor: "#6B4F2E",
    borderColor: "#6B4F2E",
  },
  // No line-through by default — only the selected state should be visually distinct
  priceSymbol: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B4F2E",
    fontFamily: "SourceSerifPro-Regular",
  },
  priceSymbolSelected: {
    color: "#FFF7EA",
  },
  priceLabel: {
    fontSize: 10,
    color: "#8C6D4F",
    fontFamily: "SourceSerifPro-Regular",
    textAlign: "center",
  },
  priceLabelSelected: {
    color: "#F0D8B8",
  },
  coffeeSubCard: {
    backgroundColor: "#F5ECD8",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  coffeeSubCardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3B2A1A",
    marginBottom: 8,
    fontFamily: "SourceSerifPro-Regular",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  coffeePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D2BA94",
    backgroundColor: "transparent",
  },
  coffeePillSelected: {
    backgroundColor: "#6B4F2E",
    borderColor: "#6B4F2E",
  },
  coffeePillText: {
    fontSize: 12,
    color: "#6B4F2E",
    fontFamily: "SourceSerifPro-Regular",
  },
  coffeePillTextSelected: {
    color: "#FFF7EA",
    fontWeight: "600",
  },
});

const amenityCardStyles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8C6D4F",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  optionPill: {
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D2BA94",
    backgroundColor: "transparent",
  },
  optionPillSelected: {
    backgroundColor: "#6B4F2E",
    borderColor: "#6B4F2E",
  },
  optionText: {
    fontSize: 12,
    color: "#6B4F2E",
    fontFamily: "SourceSerifPro-Regular",
  },
  optionTextSelected: {
    color: "#FFF7EA",
    fontWeight: "600",
  },
});

const amenityStyles = StyleSheet.create({
  menuImage: {
    width: "100%",
    height: 200,
    objectFit:"cover",
    borderRadius: 10,
    backgroundColor: "#E6D6BE",
    marginBottom: 8,
  },
  menuPlaceholder: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    backgroundColor: "#E6D6BE",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  menuPlaceholderText: { fontSize: 12, color: "#B09070" },
});

const menuCarouselStyles = StyleSheet.create({
  slide: {
    width: SCREEN_WIDTH - 32, // account for parent padding
    height: CAROUSEL_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E6D6BE",
    marginRight: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  expandHint: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 6,
    padding: 5,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D2BA94",
  },
  dotActive: {
    backgroundColor: "#6B4F2E",
    width: 16,
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 52,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  counter: {
    position: "absolute",
    top: 56,
    alignSelf: "center",
    color: "#fff",
    fontSize: 14,
    zIndex: 10,
  },
  modalSlide: {
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: "80%",
  },
});
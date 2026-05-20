import AmenityPillRow from "@/app/features/business/components/AmenityPillRow";
import {
    AmenitiesFormState,
} from "@/app/features/business/services/editCafeService";
import { styles } from "@/app/shared/styles/styles";
import { Text } from "react-native";

interface Page3CoffeeProps {
  amenities: AmenitiesFormState;
  onSetAmenities: (updater: (prev: AmenitiesFormState) => AmenitiesFormState) => void;
}

export default function Page3Coffee({
  amenities,
  onSetAmenities,
}: Page3CoffeeProps) {
  return (
    <>
      <Text style={styles.sectionLabel}>Coffee</Text>
      <AmenityPillRow
        label="Bean Type"
        options={["Arabica", "Robusta", "Liberica", "Excelsa"]}
        selected={amenities.coffee_bean_type}
        onToggle={(val) =>
          onSetAmenities((prev) => ({
            ...prev,
            coffee_bean_type: prev.coffee_bean_type.includes(val)
              ? prev.coffee_bean_type.filter((b) => b !== val)
              : [...prev.coffee_bean_type, val],
          }))
        }
      />
      <AmenityPillRow
        label="Brew Method"
        options={[
          "Espresso",
          "Drip",
          "French Press",
          "Pour Over",
          "Cold Brew",
        ]}
        selected={amenities.coffee_brew_method}
        onToggle={(val) =>
          onSetAmenities((prev) => ({
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
          onSetAmenities((prev) => ({
            ...prev,
            price_level:
              prev.price_level === val
                ? null
                : (val as AmenitiesFormState["price_level"]),
          }))
        }
      />
    </>
  );
}
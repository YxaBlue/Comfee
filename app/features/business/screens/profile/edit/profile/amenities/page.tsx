import AmenityPillRow from "@/app/features/business/components/AmenityPillRow";
import {
    AmenitiesFormState,
} from "@/app/features/business/services/editCafeService";
import { styles } from "@/app/shared/styles/styles";
import { Text } from "react-native";

interface Page4AmenitiesProps {
  amenities: AmenitiesFormState;
  onSetAmenities: (updater: (prev: AmenitiesFormState) => AmenitiesFormState) => void;
}

export default function Page4Amenities({
  amenities,
  onSetAmenities,
}: Page4AmenitiesProps) {
  return (
    <>
      <Text style={styles.sectionLabel}>Amenities</Text>

      <AmenityPillRow
        label="WiFi"
        options={["None", "Slow", "Moderate", "Fast"]}
        single
        selected={amenities.wifi_speed ? [amenities.wifi_speed] : []}
        onToggle={(val) =>
          onSetAmenities((prev) => ({
            ...prev,
            wifi_speed:
              prev.wifi_speed === val
                ? null
                : (val as AmenitiesFormState["wifi_speed"]),
          }))
        }
      />
      <AmenityPillRow
        label="Sockets"
        options={["None", "Some", "Many"]}
        single
        selected={amenities.sockets ? [amenities.sockets] : []}
        onToggle={(val) =>
          onSetAmenities((prev) => ({
            ...prev,
            sockets:
              prev.sockets === val
                ? null
                : (val as AmenitiesFormState["sockets"]),
          }))
        }
      />
      <AmenityPillRow
        label="Parking"
        options={["None", "Limited", "Plenty"]}
        single
        selected={amenities.parking ? [amenities.parking] : []}
        onToggle={(val) =>
          onSetAmenities((prev) => ({
            ...prev,
            parking:
              prev.parking === val
                ? null
                : (val as AmenitiesFormState["parking"]),
          }))
        }
      />
      <AmenityPillRow
        label="Lighting"
        options={["Dim", "Balanced", "Bright"]}
        single
        selected={amenities.lighting ? [amenities.lighting] : []}
        onToggle={(val) =>
          onSetAmenities((prev) => ({
            ...prev,
            lighting:
              prev.lighting === val
                ? null
                : (val as AmenitiesFormState["lighting"]),
          }))
        }
      />
      <AmenityPillRow
        label="Music"
        options={["Quiet", "Normal", "Blaring"]}
        single
        selected={amenities.music ? [amenities.music] : []}
        onToggle={(val) =>
          onSetAmenities((prev) => ({
            ...prev,
            music:
              prev.music === val
                ? null
                : (val as AmenitiesFormState["music"]),
          }))
        }
      />
      <AmenityPillRow
        label="Seating"
        options={["Inside", "Outside"]}
        selected={amenities.seating}
        onToggle={(val) =>
          onSetAmenities((prev) => ({
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
          onSetAmenities((prev) => ({
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
          onSetAmenities((prev) => ({
            ...prev,
            pet_friendly: val === "Yes",
          }))
        }
      />

      <Text style={styles.sectionLabel}>Suitable For</Text>
      <AmenityPillRow
        label="Suitable Conditions"
        options={["Student", "Work", "Group", "Vibes"]}
        selected={amenities.suitable_for}
        onToggle={(val) =>
          onSetAmenities((prev) => ({
            ...prev,
            suitable_for: prev.suitable_for.includes(val)
              ? prev.suitable_for.filter((s) => s !== val)
              : [...prev.suitable_for, val],
          }))
        }
      />
    </>
  );
}
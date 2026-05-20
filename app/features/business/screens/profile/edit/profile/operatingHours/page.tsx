import TimePickerField from "@/app/features/business/components/TimePickerField";
import { EditCafeDayHours } from "@/app/features/business/services/editCafeService";
import { styles } from "@/app/shared/styles/styles";
import { Switch, Text, View } from "react-native";

interface FieldErrors {
  [key: string]: string;
}

interface Page1HoursProps {
  hours: EditCafeDayHours[];
  fieldErrors: FieldErrors;
  onUpdateDay: (index: number, patch: Partial<EditCafeDayHours>) => void;
}

export default function Page1Hours({
  hours,
  fieldErrors,
  onUpdateDay,
}: Page1HoursProps) {
  return (
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
                  onUpdateDay(index, {
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
                onChange={(openTime) => onUpdateDay(index, { openTime })}
              />
              <TimePickerField
                label="Closes"
                value={day.closeTime}
                onChange={(closeTime) => onUpdateDay(index, { closeTime })}
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
  );
}
import { styles } from "@/app/shared/styles/styles";
import { Picker } from "@react-native-picker/picker";
import { Text, View } from "react-native";

export const TIME_OPTIONS = [
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

interface TimePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function TimePickerField({
  label,
  value,
  onChange,
}: TimePickerFieldProps) {
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

import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
});

export const amenityEditStyles = StyleSheet.create({
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
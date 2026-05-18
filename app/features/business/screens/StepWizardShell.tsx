import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  background: "transparent",
  header: "#E9D0A2",
  text: "#3b1f0e",
  muted: "#7A5230",
  button: "#A0713A",
  buttonDisabled: "#D8B783",
  dot: "#E2CFA8",
  dotBorder: "#E9D8B9",
  border: "#DFC392",
  iconFg: "#FDF0DC",
};

const TOTAL_STEPS = 5;

interface StepShellProps {
  currentStep: number;
  title: string;
  onBack: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  nextDisabled?: boolean;
  submitting?: boolean;
  children: ReactNode;
}

export default function StepShell({
  currentStep,
  title,
  onBack,
  onNext,
  onSubmit,
  nextDisabled = false,
  submitting = false,
  children,
}: StepShellProps) {
  const isLast = currentStep === TOTAL_STEPS;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={onBack} hitSlop={12}>
            <MaterialIcons
              name="keyboard-backspace"
              size={26}
              color={COLORS.muted}
            />
          </Pressable>
        </View>

        <View style={styles.stepHeader}>
          <View style={styles.stepper}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const n = i + 1;
              const active = n === currentStep;
              return (
                <View key={n} style={styles.stepItem}>
                  <View
                    style={[styles.stepDot, active && styles.stepDotActive]}
                  >
                    <Text
                      style={[
                        styles.stepDotText,
                        active && styles.stepDotTextActive,
                      ]}
                    >
                      {n}
                    </Text>
                  </View>
                  {n < TOTAL_STEPS && <View style={styles.stepLine} />}
                </View>
              );
            })}
          </View>

          <Text style={styles.pageTitle}>{title}</Text>
        </View>

        <View style={styles.contentDivider} />

        <View style={styles.formContent}>{children}</View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.prevBtn}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={styles.prevBtnText}>{"< Previous"}</Text>
          </TouchableOpacity>

          {isLast ? (
            <TouchableOpacity
              style={[
                styles.nextBtn,
                (submitting || nextDisabled) && styles.nextBtnDisabled,
              ]}
              onPress={onSubmit}
              disabled={submitting || nextDisabled}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.iconFg} />
              ) : (
                <Text style={styles.nextBtnText}>Submit</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, nextDisabled && styles.nextBtnDisabled]}
              onPress={onNext}
              disabled={nextDisabled}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>{"Next >"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  topBar: {
    backgroundColor: COLORS.header,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: "#7A5A37",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
  },
  backBtn: {
    alignSelf: "flex-start",
  },
  stepHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: "transparent",
    gap: 16,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.dot,
    borderWidth: 1,
    borderColor: COLORS.dotBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: COLORS.button,
    borderColor: COLORS.button,
  },
  stepDotText: {
    fontFamily: "serif",
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
  },
  stepDotTextActive: {
    color: COLORS.iconFg,
  },
  stepLine: {
    width: 28,
    height: 2,
    backgroundColor: "#E2CFA8",
    marginHorizontal: 3,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    fontFamily: "serif",
    color: COLORS.text,
    textAlign: "center",
  },
  contentDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 20,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: "auto",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  prevBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  prevBtnText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "serif",
    color: COLORS.text,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.button,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  nextBtnDisabled: { backgroundColor: COLORS.buttonDisabled, opacity: 0.75 },
  nextBtnText: {
    fontSize: 14,
    fontWeight: "800",
    fontFamily: "serif",
    color: COLORS.iconFg,
  },
});

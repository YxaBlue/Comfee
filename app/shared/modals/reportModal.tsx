import { supabase } from "@/app/shared/lib/supabaseClient";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export type ReportTargetType = "review" | "cafe" | "user";

type Props = {
  visible: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  /** Display label shown in the modal header e.g. "review by @username" */
  targetLabel?: string;
};

const REASONS: Record<ReportTargetType, string[]> = {
  review: [
    "Spam or misleading",
    "Inappropriate content",
    "Hate speech",
    "Harassment",
    "Fake review",
    "Other",
  ],
  cafe: [
    "Incorrect information",
    "Spam",
    "Fraudulent listing",
    "Inappropriate content",
    "Other",
  ],
  user: [
    "Harassment or bullying",
    "Spam",
    "Impersonation",
    "Inappropriate content",
    "Other",
  ],
};

type Status = "idle" | "submitting" | "success" | "error";

export default function ReportModal({
  visible,
  onClose,
  targetType,
  targetId,
  targetLabel,
}: Props) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSelectedReason(null);
      setDetails("");
      setStatus("idle");
      setErrorMsg("");
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { error } = await supabase.from("report").insert({
        user_id: session?.user?.id ?? null,
        target_type: targetType,
        target_id: targetId,
        reason: selectedReason,
        details: details.trim() || null,
        status: "pending",
      });

      if (error) throw error;
      setStatus("success");
    } catch (err: any) {
      console.error("Failed to submit report:", err);
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const reasons = REASONS[targetType];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <Animated.View
            style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
          >
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Report</Text>
                {targetLabel ? (
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {targetLabel}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={20} color="#8C6D4F" />
              </TouchableOpacity>
            </View>

            {status === "success" ? (
              <View style={styles.successState}>
                <View style={styles.successIconWrap}>
                  <MaterialIcons
                    name="check-circle"
                    size={44}
                    color="#6B4F2E"
                  />
                </View>
                <Text style={styles.successTitle}>Report Submitted</Text>
                <Text style={styles.successSub}>
                  Thank you. Our team will review this shortly.
                </Text>
                <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.sectionLabel}>
                  Why are you reporting this?
                </Text>

                <View style={styles.reasonsGrid}>
                  {reasons.map((reason) => {
                    const active = selectedReason === reason;
                    return (
                      <TouchableOpacity
                        key={reason}
                        style={[
                          styles.reasonPill,
                          active && styles.reasonPillActive,
                        ]}
                        onPress={() => setSelectedReason(reason)}
                        activeOpacity={0.75}
                      >
                        {active && (
                          <MaterialIcons
                            name="check"
                            size={13}
                            color="#FDF6EC"
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text
                          style={[
                            styles.reasonPillText,
                            active && styles.reasonPillTextActive,
                          ]}
                        >
                          {reason}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
                  Additional details{" "}
                  <Text style={styles.optionalTag}>(optional)</Text>
                </Text>
                <TextInput
                  style={styles.detailsInput}
                  value={details}
                  onChangeText={setDetails}
                  placeholder="Describe what you observed..."
                  placeholderTextColor="#B09070"
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{details.length}/500</Text>

                {status === "error" && (
                  <Text style={styles.errorText}>{errorMsg}</Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (!selectedReason || status === "submitting") &&
                      styles.submitBtnDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!selectedReason || status === "submitting"}
                  activeOpacity={0.85}
                >
                  <MaterialIcons
                    name="flag"
                    size={16}
                    color="#FDF6EC"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.submitBtnText}>
                    {status === "submitting" ? "Submitting…" : "Submit Report"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(30,18,10,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FDF6EC",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 8,
    // Shadow
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D2BA94",
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3B2A1A",
    fontFamily: "SourceSerifPro-Regular",
  },
  subtitle: {
    fontSize: 12,
    color: "#8C6D4F",
    marginTop: 2,
    maxWidth: 260,
    fontFamily: "SourceSerifPro-Regular",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8C6D4F",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  optionalTag: {
    fontSize: 11,
    fontWeight: "400",
    color: "#B09070",
    textTransform: "none",
    letterSpacing: 0,
  },
  reasonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  reasonPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDE0CE",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  reasonPillActive: {
    backgroundColor: "#6B4F2E",
    borderColor: "#6B4F2E",
  },
  reasonPillText: {
    fontSize: 13,
    color: "#5A3E28",
    fontFamily: "SourceSerifPro-Regular",
  },
  reasonPillTextActive: {
    color: "#FDF6EC",
    fontWeight: "600",
  },
  detailsInput: {
    backgroundColor: "#F6F0E8",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D2BA94",
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 13,
    color: "#3B2A1A",
    minHeight: 80,
    fontFamily: "SourceSerifPro-Regular",
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 11,
    color: "#B09070",
    marginTop: 4,
    marginBottom: 2,
  },
  errorText: {
    fontSize: 12,
    color: "#C0392B",
    marginTop: 6,
    marginBottom: 2,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6B4F2E",
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 14,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FDF6EC",
    fontFamily: "SourceSerifPro-Regular",
  },
  // Success state
  successState: {
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 10,
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E6D6BE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3B2A1A",
    marginBottom: 6,
    fontFamily: "SourceSerifPro-Regular",
  },
  successSub: {
    fontSize: 13,
    color: "#8C6D4F",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
    fontFamily: "SourceSerifPro-Regular",
  },
  doneBtn: {
    backgroundColor: "#6B4F2E",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FDF6EC",
    fontFamily: "SourceSerifPro-Regular",
  },
});

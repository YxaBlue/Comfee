import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { useState } from "react";
import { Alert, ImageBackground, StyleSheet } from "react-native";
import type { RootStackParamList } from "../../../../../App";
import {
  submitOwnerVerification,
  VerificationFormData,
} from "../../services/cafeOwner";

import CafeSearch from "../ownerVerification/cafeSearch/page";
import OperationalLegitimacy from "../ownerVerification/operationalLegitimacy/page";
import OwnerDetails from "../ownerVerification/ownerDetails/page";
import BusinessLocation from "../profile/edit/location/page";
import ProofOfRegistration from "./proofOfRegistration/page";

export default function VerificationWizard() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<VerificationFormData>({});
  const [submitting, setSubmitting] = useState(false);

  const handleNext = (stepData: Partial<VerificationFormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      if (navigation.canGoBack()) navigation.goBack();
    } else {
      setStep((s) => s - 1);
    }
  };

  const handleSubmit = async (stepData: Partial<VerificationFormData>) => {
    if (submitting) return;

    const finalData = { ...formData, ...stepData };
    setFormData(finalData);
    setSubmitting(true);

    try {
      await submitOwnerVerification(finalData);
      // Navigate first, then show the alert on the previous screen
      // so the wizard is gone before the dialog appears
      navigation.goBack();
      setTimeout(() => {
        Alert.alert(
          "Submission received",
          "Your verification request has been submitted. We'll review it within 3 business days.",
          [{ text: "Got it" }],
        );
      }, 400);
    } catch (err: any) {
      Alert.alert(
        "Submission failed",
        err.message ?? "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <CafeSearch
            formData={formData}
            onNext={handleNext}
            onBack={handleBack}
            currentStep={step}
          />
        );
      case 2:
        return (
          <OwnerDetails
            formData={formData}
            onNext={handleNext}
            onBack={handleBack}
            currentStep={step}
          />
        );
      case 3:
        return (
          <ProofOfRegistration
            formData={formData}
            onNext={handleNext}
            onBack={handleBack}
            currentStep={step}
          />
        );
      case 4:
        return (
          <OperationalLegitimacy
            formData={formData}
            onNext={handleNext}
            onBack={handleBack}
            currentStep={step}
          />
        );
      case 5:
        return (
          <BusinessLocation
            formData={formData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            currentStep={step}
            submitting={submitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ImageBackground
      source={require("../../../../../assets/images/bg1.png")}
      style={styles.root}
      resizeMode="cover"
    >
      {renderStep()}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#F3E6CF",
  },
});

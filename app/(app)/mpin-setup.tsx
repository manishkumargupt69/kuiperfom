import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import FormField from "@/src/components/ui/FormField";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { configureMpin } from "@/src/features/auth/data/mpin.service";
import { useAuthStore } from "@/src/features/auth/state/auth-store";
import { COLORS, SPACING } from "@/src/theme/tokens";

const MPIN_PATTERN = /^\d{4}$/;

export default function MpinSetupScreen(): ReactElement {
  const userId = useAuthStore((state) => state.session?.user.id ?? "");
  const [mpin, setMpin] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const saveMpin = useCallback(async (): Promise<void> => {
    if (!MPIN_PATTERN.test(mpin)) {
      setErrorMessage("Choose a 4-digit MPIN.");
      return;
    }
    if (mpin !== confirmation) {
      setErrorMessage("The MPIN values do not match.");
      return;
    }

    setIsSaving(true);
    try {
      await configureMpin(userId, mpin);
      router.replace("/(app)/home");
    } finally {
      setIsSaving(false);
    }
  }, [confirmation, mpin, userId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.content}
      >
        <Text style={styles.eyebrow}>QUICK SIGN-IN</Text>
        <Text style={styles.title}>Set up your MPIN</Text>
        <Text style={styles.subtitle}>
          Use four digits that are easy for you to remember and hard for others
          to guess.
        </Text>
        <View style={styles.form}>
          <FormField
            errorMessage={errorMessage}
            isSecure
            keyboardType="number-pad"
            label="New MPIN"
            maxLength={4}
            onChangeText={(value) => {
              setMpin(value);
              setErrorMessage(undefined);
            }}
            placeholder="4 digits"
            value={mpin}
          />
          <FormField
            isSecure
            keyboardType="number-pad"
            label="Confirm MPIN"
            maxLength={4}
            onChangeText={(value) => {
              setConfirmation(value);
              setErrorMessage(undefined);
            }}
            placeholder="Repeat MPIN"
            value={confirmation}
          />
          <PrimaryButton
            isLoading={isSaving}
            label="Save MPIN"
            onPress={saveMpin}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: SPACING.extraLarge,
  },
  eyebrow: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: SPACING.small,
  },
  title: {
    color: COLORS.ink,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: COLORS.inkMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: SPACING.section,
    marginTop: SPACING.small,
  },
  form: {
    gap: SPACING.large,
  },
});

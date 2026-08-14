import type { ReactElement } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthModeSelector from "@/src/features/auth/presentation/AuthModeSelector";
import RememberMeControl from "@/src/features/auth/presentation/RememberMeControl";
import SignInForm from "@/src/features/auth/presentation/SignInForm";
import { useSignIn } from "@/src/features/auth/hooks/use-sign-in";
import { COLORS, RADII, SPACING } from "@/src/theme/tokens";

export default function SignInScreen(): ReactElement {
  const signIn = useSignIn();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.keyboardArea}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>FO</Text>
            </View>
            <Text style={styles.brandName}>Field Operations</Text>
          </View>

          <View style={styles.introduction}>
            <Text style={styles.eyebrow}>MOBILE WORKSPACE</Text>
            <Text style={styles.title}>Sign in and get to work.</Text>
            <Text style={styles.subtitle}>
              Your assignments and tools will match your role.
            </Text>
          </View>

          <View style={styles.panel}>
            <AuthModeSelector
              isMpinAvailable={signIn.isMpinAvailable}
              onSelectMode={signIn.selectMode}
              selectedMode={signIn.mode}
            />
            <SignInForm
              errors={signIn.errors}
              fields={signIn.fields}
              isOtpRequested={signIn.isOtpRequested}
              isSubmitting={signIn.isSubmitting}
              mode={signIn.mode}
              onChangeField={signIn.updateField}
              onForgotPassword={signIn.showForgotPasswordNotice}
              onRequestOtp={signIn.requestOtp}
              onSubmit={signIn.submit}
            />
            {signIn.mode !== "mpin" ? (
              <RememberMeControl
                isSelected={signIn.isRemembered}
                onToggle={signIn.toggleRemembered}
              />
            ) : null}
            {signIn.notice ? (
              <Text accessibilityLiveRegion="polite" style={styles.notice}>
                {signIn.notice}
              </Text>
            ) : null}
          </View>

          <Text style={styles.developmentLabel}>
            Development preview - Backend not connected
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  keyboardArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING.extraLarge,
    gap: SPACING.section,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.medium,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: COLORS.ink,
    borderRadius: RADII.medium,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  brandMarkText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },
  brandName: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: "700",
  },
  introduction: {
    gap: SPACING.small,
  },
  eyebrow: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    color: COLORS.ink,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
    lineHeight: 39,
  },
  subtitle: {
    color: COLORS.inkMuted,
    fontSize: 16,
    lineHeight: 23,
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.large,
    borderWidth: 1,
    gap: SPACING.large,
    padding: SPACING.extraLarge,
  },
  notice: {
    color: COLORS.inkMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  developmentLabel: {
    color: COLORS.inkMuted,
    fontSize: 12,
    textAlign: "center",
  },
});

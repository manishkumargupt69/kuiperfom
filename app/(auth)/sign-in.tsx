import type { ReactElement } from "react";
import { useCallback } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ScreenContainer from "@/src/components/ui/ScreenContainer";
import type { AuthMode } from "@/src/features/auth/domain/auth.types";
import { useSignIn } from "@/src/features/auth/hooks/use-sign-in";
import AuthModeSelector from "@/src/features/auth/presentation/AuthModeSelector";
import RememberMeControl from "@/src/features/auth/presentation/RememberMeControl";
import SignInForm from "@/src/features/auth/presentation/SignInForm";
import { COLORS, RADII, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { runAfterKeyboardDismissed } from "@/src/utils/run-after-keyboard-dismissed";

export default function SignInScreen(): ReactElement {
  const signIn = useSignIn();
  const { selectMode } = signIn;
  const handleModeSelect = useCallback((mode: AuthMode): void => {
    runAfterKeyboardDismissed(() => selectMode(mode));
  }, [selectMode]);

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior="height"
        enabled={Platform.OS === "android"}
        style={styles.keyboardArea}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          style={styles.scroll}
        >
          <View style={styles.header}>
            <View style={styles.brandMarkContainer}>
              <View style={styles.brandMark}>
                <Text accessibilityRole="header" style={styles.brandMarkText}>FOM</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>Field Operations Management</Text>
            <Text style={styles.title}>Welcome back</Text>
          </View>
          
          <View style={styles.panel}>
            <AuthModeSelector
              isMpinAvailable={signIn.isMpinAvailable}
              onSelectMode={handleModeSelect}
              selectedMode={signIn.mode}
            />
            <View style={styles.formContainer}>
              <SignInForm
                errors={signIn.errors}
                fields={signIn.fields}
                isSubmitting={signIn.isSubmitting}
                mode={signIn.mode}
                onChangeField={signIn.updateField}
                onSubmit={signIn.submit}
              />
              {signIn.mode !== "mpin" ? (
                <View style={styles.rememberMeContainer}>
                  <RememberMeControl isSelected={signIn.isRemembered} onToggle={signIn.toggleRemembered} />
                </View>
              ) : null}
            </View>
            {signIn.notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{signIn.notice}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingVertical: SPACING.extraLarge },
  header: { alignItems: "center", marginBottom: SPACING.extraLarge },
  brandMarkContainer: {
    padding: SPACING.small,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.sheet,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
    marginBottom: SPACING.large,
  },
  brandMark: { 
    alignItems: "center", 
    backgroundColor: COLORS.accent, 
    borderRadius: RADII.large, 
    height: 80, 
    justifyContent: "center", 
    width: 80 
  },
  brandMarkText: { color: COLORS.white, fontSize: 24, fontWeight: "900", letterSpacing: 2 },
  brandSubtitle: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: "600", marginBottom: SPACING.medium },
  title: { color: COLORS.ink, ...TYPOGRAPHY.screenTitle, fontWeight: "800", letterSpacing: -0.5 },
  panel: { gap: SPACING.large },
  formContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.large,
    borderRadius: RADII.sheet,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rememberMeContainer: {
    marginTop: SPACING.medium,
    paddingTop: SPACING.medium,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  notice: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, textAlign: "center" },
});

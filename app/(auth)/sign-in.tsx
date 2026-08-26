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
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Text accessibilityRole="header" style={styles.brandMarkText}>FOM</Text>
            </View>
            <Text style={styles.brandSubtitle}>Field Operations Management</Text>
          </View>
          <Text style={styles.title}>Sign in</Text>
          <View style={styles.panel}>
            <AuthModeSelector
              isMpinAvailable={signIn.isMpinAvailable}
              onSelectMode={handleModeSelect}
              selectedMode={signIn.mode}
            />
            <SignInForm
              errors={signIn.errors}
              fields={signIn.fields}
              isSubmitting={signIn.isSubmitting}
              mode={signIn.mode}
              onChangeField={signIn.updateField}
              onSubmit={signIn.submit}
            />
            {signIn.mode !== "mpin" ? <RememberMeControl isSelected={signIn.isRemembered} onToggle={signIn.toggleRemembered} /> : null}
            {signIn.notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{signIn.notice}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardArea: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingVertical: SPACING.extraLarge },
  brand: { alignItems: "center", marginBottom: SPACING.section },
  brandMark: { alignItems: "center", backgroundColor: COLORS.accent, borderRadius: RADII.large, height: 64, justifyContent: "center", marginBottom: SPACING.medium, width: 64 },
  brandMarkText: { color: COLORS.white, fontSize: 19, fontWeight: "800", letterSpacing: 1 },
  brandSubtitle: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, letterSpacing: 0.2 },
  title: { color: COLORS.ink, ...TYPOGRAPHY.screenTitle, fontWeight: "700" },
  panel: { gap: SPACING.large, marginTop: SPACING.extraLarge },
  notice: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
});

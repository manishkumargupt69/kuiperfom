import type { ReactElement } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import ScreenContainer from "@/src/components/ui/ScreenContainer";
import { useSignIn } from "@/src/features/auth/hooks/use-sign-in";
import AuthModeSelector from "@/src/features/auth/presentation/AuthModeSelector";
import RememberMeControl from "@/src/features/auth/presentation/RememberMeControl";
import SignInForm from "@/src/features/auth/presentation/SignInForm";
import { COLORS, RADII, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

export default function SignInScreen(): ReactElement {
  const signIn = useSignIn();

  return (
    <ScreenContainer>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
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
            onSelectMode={signIn.selectMode}
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingVertical: SPACING.extraLarge },
  brand: { alignItems: "center", marginBottom: SPACING.section },
  brandMark: { alignItems: "center", backgroundColor: COLORS.accent, borderRadius: RADII.large, height: 64, justifyContent: "center", marginBottom: SPACING.medium, width: 64 },
  brandMarkText: { color: COLORS.white, fontSize: 19, fontWeight: "800", letterSpacing: 1 },
  brandSubtitle: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, letterSpacing: 0.2 },
  title: { color: COLORS.ink, ...TYPOGRAPHY.screenTitle, fontWeight: "700" },
  panel: { gap: SPACING.large, marginTop: SPACING.extraLarge },
  notice: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
});

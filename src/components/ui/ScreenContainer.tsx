import type { PropsWithChildren, ReactElement } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFloatingNavigationVisibility } from "@/src/components/navigation/use-floating-navigation-visibility";
import { COLORS, FLOATING_TAB_BAR_CONTENT_CLEARANCE, MAX_CONTENT_WIDTH } from "@/src/theme/tokens";

export default function ScreenContainer({ children }: PropsWithChildren): ReactElement {
  const showFloatingNavigation = useFloatingNavigationVisibility();
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior="padding"
        enabled={Platform.OS === "ios"}
        style={styles.keyboardArea}
      >
        <View style={[styles.content, showFloatingNavigation && styles.withFloatingNavigation]}>{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.background, flex: 1 },
  keyboardArea: { flex: 1 },
  content: { alignSelf: "center", flex: 1, maxWidth: MAX_CONTENT_WIDTH, width: "100%" },
  withFloatingNavigation: { paddingBottom: FLOATING_TAB_BAR_CONTENT_CLEARANCE },
});

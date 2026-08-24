import type { PropsWithChildren, ReactElement } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS, MAX_CONTENT_WIDTH } from "@/src/theme/tokens";

export default function ScreenContainer({ children }: PropsWithChildren): ReactElement {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: "height" })}
        style={styles.keyboardArea}
      >
        <View style={styles.content}>{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.background, flex: 1 },
  keyboardArea: { flex: 1 },
  content: { alignSelf: "center", flex: 1, maxWidth: MAX_CONTENT_WIDTH, width: "100%" },
});

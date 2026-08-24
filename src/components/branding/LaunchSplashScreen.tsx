import type { ReactElement } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface LaunchSplashScreenProps {
  iconScale: Animated.Value;
  opacity: Animated.Value;
}

export default function LaunchSplashScreen({
  iconScale,
  opacity,
}: LaunchSplashScreenProps): ReactElement {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Animated.View style={[styles.content, { opacity }]}>
        <Animated.View style={[styles.icon, { transform: [{ scale: iconScale }] }]}>
          <View style={styles.iconAccent} />
          <Text style={styles.iconLabel}>FOM</Text>
        </Animated.View>
        <View style={styles.copy}>
          <Text accessibilityRole="header" style={styles.title}>Welcome to FOM</Text>
          <Text style={styles.subtitle}>Field Operations Management</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.background, flex: 1 },
  content: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: SPACING.extraLarge },
  icon: { alignItems: "center", backgroundColor: COLORS.accent, borderRadius: RADII.large, height: 104, justifyContent: "center", overflow: "hidden", width: 104 },
  iconAccent: { backgroundColor: COLORS.white, height: 3, left: 24, opacity: 0.75, position: "absolute", right: 24, top: 24 },
  iconLabel: { color: COLORS.white, fontSize: 30, fontWeight: "800", letterSpacing: 1.5 },
  copy: { alignItems: "center", gap: SPACING.small, marginTop: SPACING.extraLarge },
  title: { color: COLORS.ink, ...TYPOGRAPHY.screenTitle, fontWeight: "700", textAlign: "center" },
  subtitle: { color: COLORS.inkMuted, ...TYPOGRAPHY.body, textAlign: "center" },
});

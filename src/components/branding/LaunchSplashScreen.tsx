import type { ReactElement } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import BrandLogo from "./BrandLogo";
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
          <BrandLogo fontSize={32} />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: COLORS.background, flex: 1 },
  content: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: SPACING.extraLarge },
  icon: { alignItems: "center", height: 104, justifyContent: "center", width: "100%" },
});

import type { ReactElement } from "react";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppNavigation } from "@/src/components/navigation/AppNavigationContext";
import { useFloatingNavigationVisibility } from "@/src/components/navigation/use-floating-navigation-visibility";
import {
  COLORS,
  FLOATING_TAB_BAR_HEIGHT,
  FLOATING_TAB_BAR_MINIMUM_BOTTOM_OFFSET,
  FLOATING_TAB_BAR_SAFE_AREA_GAP,
  MAX_CONTENT_WIDTH,
} from "@/src/theme/tokens";

const NAVIGATION_HORIZONTAL_INSET = 40;

export default function FloatingNavigationBar(): ReactElement | null {
  const isVisible = useFloatingNavigationVisibility();
  const { requestNavigation } = useAppNavigation();
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(
    insets.bottom + FLOATING_TAB_BAR_SAFE_AREA_GAP,
    FLOATING_TAB_BAR_MINIMUM_BOTTOM_OFFSET,
  );
  const openHome = useCallback((): void => {
    requestNavigation(() => router.navigate("/(app)/(tabs)/dashboard"));
  }, [requestNavigation]);
  const openProjects = useCallback((): void => {
    requestNavigation(() => router.navigate("/(app)/(tabs)/city-list"));
  }, [requestNavigation]);
  const openProfile = useCallback((): void => {
    requestNavigation(() => router.navigate("/(app)/(tabs)/profile"));
  }, [requestNavigation]);

  if (!isVisible) return null;

  return (
    <View pointerEvents="box-none" style={[styles.position, { bottom: bottomOffset }]}>
      <View style={styles.bar}>
        <Pressable accessibilityLabel="Home dashboard" accessibilityRole="tab" accessibilityState={{ selected: false }} onPress={openHome} style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
          <Ionicons color={COLORS.inkMuted} name="home-outline" size={23} />
          <Text style={styles.label}>Home</Text>
        </Pressable>
        <Pressable accessibilityLabel="Projects by city" accessibilityRole="tab" accessibilityState={{ selected: false }} onPress={openProjects} style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
          <Ionicons color={COLORS.inkMuted} name="location-outline" size={23} />
          <Text style={styles.label}>Projects</Text>
        </Pressable>
        <Pressable accessibilityLabel="Profile" accessibilityRole="tab" accessibilityState={{ selected: false }} onPress={openProfile} style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
          <Ionicons color={COLORS.inkMuted} name="person-outline" size={23} />
          <Text style={styles.label}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  position: { left: 0, paddingHorizontal: NAVIGATION_HORIZONTAL_INSET, position: "absolute", right: 0 },
  bar: {
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 30,
    elevation: 6,
    flexDirection: "row",
    height: FLOATING_TAB_BAR_HEIGHT,
    maxWidth: MAX_CONTENT_WIDTH - NAVIGATION_HORIZONTAL_INSET * 2,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    width: "100%",
  },
  tab: { alignItems: "center", borderRadius: 30, flex: 1, justifyContent: "center" },
  pressed: { backgroundColor: COLORS.accentSoft },
  label: { color: COLORS.inkMuted, fontSize: 11, fontWeight: "700" },
});

import type { ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  COLORS,
  FLOATING_TAB_BAR_CONTENT_CLEARANCE,
  FLOATING_TAB_BAR_HEIGHT,
  FLOATING_TAB_BAR_MINIMUM_BOTTOM_OFFSET,
  FLOATING_TAB_BAR_SAFE_AREA_GAP,
} from "@/src/theme/tokens";

export default function AppTabsLayout(): ReactElement {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(
    insets.bottom + FLOATING_TAB_BAR_SAFE_AREA_GAP,
    FLOATING_TAB_BAR_MINIMUM_BOTTOM_OFFSET,
  );

  return (
    <Tabs
      backBehavior="history"
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        sceneStyle: styles.scene,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.inkMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [styles.tabBar, { bottom: bottomOffset }],
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarAccessibilityLabel: "Home dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.icon, focused && styles.activeIcon]}>
              <Ionicons color={color} name={focused ? "home" : "home-outline"} size={size} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="city-list"
        options={{
          title: "Projects",
          tabBarAccessibilityLabel: "Projects by city",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.icon, focused && styles.activeIcon]}>
              <Ionicons color={color} name={focused ? "location" : "location-outline"} size={size} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="incidents"
        options={{
          title: "Incidents",
          tabBarAccessibilityLabel: "Incidents",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.icon, focused && styles.activeIcon]}>
              <Ionicons color={color} name={focused ? "document-text" : "document-text-outline"} size={size} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarAccessibilityLabel: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.icon, focused && styles.activeIcon]}>
              <Ionicons color={color} name={focused ? "person" : "person-outline"} size={size} />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="home" options={{ href: null, sceneStyle: styles.hiddenScene, tabBarStyle: styles.hiddenBar }} />
      <Tabs.Screen name="project-master" options={{ href: null, sceneStyle: styles.hiddenScene, tabBarStyle: styles.hiddenBar }} />
      <Tabs.Screen name="work-assigned" options={{ href: null, sceneStyle: styles.hiddenScene, tabBarStyle: styles.hiddenBar }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: { backgroundColor: COLORS.background, paddingBottom: FLOATING_TAB_BAR_CONTENT_CLEARANCE },
  hiddenScene: { backgroundColor: COLORS.background },
  hiddenBar: { display: "none" },
  tabBar: {
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 30,
    borderTopWidth: 0,
    elevation: 6,
    height: FLOATING_TAB_BAR_HEIGHT,
    marginHorizontal: 40,
    paddingBottom: 5,
    paddingTop: 5,
    position: "absolute",
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  tabLabel: { fontSize: 11, fontWeight: "700" },
  icon: { alignItems: "center", borderRadius: 16, height: 32, justifyContent: "center", width: 48 },
  activeIcon: { backgroundColor: COLORS.accentSoft },
});

import type { ReactElement } from "react";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/src/features/auth/state/auth-store";
import {
  COLORS,
  FLOATING_TAB_BAR_CONTENT_CLEARANCE,
  FLOATING_TAB_BAR_HEIGHT,
  FLOATING_TAB_BAR_MINIMUM_BOTTOM_OFFSET,
  FLOATING_TAB_BAR_SAFE_AREA_GAP,
} from "@/src/theme/tokens";

export default function TabsLayout(): ReactElement {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.inkMuted,
        sceneStyle: {
          paddingBottom: FLOATING_TAB_BAR_CONTENT_CLEARANCE,
        },
        tabBarStyle: {
          position: "absolute",
          alignSelf: "center",
          bottom: Math.max(
            insets.bottom + FLOATING_TAB_BAR_SAFE_AREA_GAP,
            FLOATING_TAB_BAR_MINIMUM_BOTTOM_OFFSET,
          ),
          marginHorizontal: 40,
          borderRadius: 30,
          height: FLOATING_TAB_BAR_HEIGHT,
          paddingBottom: 5,
          paddingTop: 5,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          shadowColor: COLORS.ink,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 6,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Modules",
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

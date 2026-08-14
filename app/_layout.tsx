import type { ReactElement } from "react";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useAuthStore } from "@/src/features/auth/state/auth-store";
import AppProviders from "@/src/providers/AppProviders";
import { COLORS } from "@/src/theme/tokens";

function RootNavigator(): ReactElement | null {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!isHydrated) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: COLORS.background },
          headerShown: false,
        }}
      />
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout(): ReactElement {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

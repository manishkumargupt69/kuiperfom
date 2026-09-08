import type { ReactElement } from "react";
import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/src/features/auth/state/auth-store";

export default function AppLayout(): ReactElement {
  const session = useAuthStore((state) => state.session);

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

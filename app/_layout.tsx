import type { ReactElement } from "react";
import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import LaunchSplashScreen from "@/src/components/branding/LaunchSplashScreen";
import { useAuthStore } from "@/src/features/auth/state/auth-store";
import { useFonts } from "expo-font";
import { IBMPlexSans_700Bold } from "@expo-google-fonts/ibm-plex-sans";
import { useLaunchSplash } from "@/src/hooks/use-launch-splash";
import AppProviders from "@/src/providers/AppProviders";
import { COLORS } from "@/src/theme/tokens";

void SplashScreen.preventAutoHideAsync();

function RootNavigator(): ReactElement | null {
  const hydrate = useAuthStore((state) => state.hydrate);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const [fontsLoaded] = useFonts({
    Pecita: require("@/assets/fonts/Pecita.otf"),
    IBMPlexSans_700Bold,
  });
  const launchSplash = useLaunchSplash(isHydrated && fontsLoaded);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (launchSplash.isVisible) {
    return (
      <LaunchSplashScreen
        iconScale={launchSplash.iconScale}
        opacity={launchSplash.opacity}
      />
    );
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

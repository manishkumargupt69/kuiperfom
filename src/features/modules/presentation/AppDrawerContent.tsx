import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { router, usePathname } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { useAppNavigation } from "@/src/components/navigation/AppNavigationContext";
import { useAuthStore } from "@/src/features/auth/state/auth-store";
import { clientRepository } from "@/src/features/client/data/client.repository";
import type { ModuleKey, ModuleViewModel } from "@/src/features/modules/domain/module.types";
import { usePermittedModules } from "@/src/features/modules/hooks/use-permitted-modules";
import AppDrawerView from "@/src/features/modules/presentation/AppDrawerView";
import { showMessage } from "@/src/utils/show-success-message";

const CLIENT_QUERY_KEY = "current-client";
const MODULE_ROUTES: Record<ModuleKey, "/(app)/(tabs)/work-assigned" | "/(app)/incidents"> = {
  "work-assigned": "/(app)/(tabs)/work-assigned",
  incidents: "/(app)/incidents",
};

interface AppDrawerContentProps { onClose: () => void; }

export default function AppDrawerContent({ onClose }: AppDrawerContentProps): ReactElement {
  const session = useAuthStore((store) => store.session);
  const signOut = useAuthStore((store) => store.signOut);
  const pathname = usePathname();
  const { requestNavigation } = useAppNavigation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const clientId = session?.user.clientId;
  const { viewState: modulesState, reload: reloadModules } = usePermittedModules(session);
  const clientQuery = useQuery({
    queryKey: [CLIENT_QUERY_KEY, session?.user.id, clientId],
    queryFn: () => session && clientId !== undefined
      ? clientRepository.getClientName(session, clientId)
      : Promise.resolve(null),
    enabled: Boolean(session && clientId !== undefined),
  });
  const clientName = clientQuery.data ?? session?.user.company[0]?.name ?? "";
  const selectedRoute = pathname.split("/").at(-1);

  const openProfile = useCallback((): void => { onClose(); requestNavigation(() => router.navigate("/(app)/(tabs)/profile")); }, [onClose, requestNavigation]);
  const openDashboard = useCallback((): void => { onClose(); requestNavigation(() => router.navigate("/(app)/(tabs)/dashboard")); }, [onClose, requestNavigation]);
  const openProjectMaster = useCallback((): void => { onClose(); requestNavigation(() => router.navigate("/(app)/(tabs)/project-master")); }, [onClose, requestNavigation]);
  const openModule = useCallback((module: ModuleViewModel): void => {
    onClose();
    const moduleKey = module.key;
    if (!moduleKey) {
      showMessage("Module not implemented yet.");
      return;
    }
    requestNavigation(() => router.push(MODULE_ROUTES[moduleKey]));
  }, [onClose, requestNavigation]);
  const retryModules = useCallback((): void => { void reloadModules(); }, [reloadModules]);
  const handleLogout = useCallback(async (): Promise<void> => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch {
      setIsLoggingOut(false);
      Alert.alert("Unable to log out", "Please try again.");
    }
  }, [isLoggingOut, signOut]);
  const requestLogout = useCallback((): void => { onClose(); requestNavigation(() => { void handleLogout(); }); }, [handleLogout, onClose, requestNavigation]);

  return (
    <AppDrawerView
      clientName={clientName}
      isLoggingOut={isLoggingOut}
      modulesState={modulesState}
      onClose={onClose}
      onDashboard={openDashboard}
      onLogout={requestLogout}
      onModulePress={openModule}
      onProfile={openProfile}
      onProjectMaster={openProjectMaster}
      onRetryModules={retryModules}
      selectedRoute={selectedRoute}
      userEmail={session?.user.email ?? ""}
      userName={session?.user.name ?? ""}
    />
  );
}

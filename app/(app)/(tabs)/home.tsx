import type { ReactElement } from "react";
import { useCallback } from "react";
import type { ListRenderItemInfo } from "react-native";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import AppHeader from "@/src/components/ui/AppHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import { useAuthStore } from "@/src/features/auth/state/auth-store";
import type { ModuleKey, ModuleViewModel } from "@/src/features/modules/domain/module.types";
import { usePermittedModules } from "@/src/features/modules/hooks/use-permitted-modules";
import ModuleCard from "@/src/features/modules/presentation/ModuleCard";
import { SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY, COLORS } from "@/src/theme/tokens";
import { showMessage } from "@/src/utils/show-success-message";

const MODULE_GRID_COLUMNS = 2;
const MODULE_ROUTES: Record<ModuleKey, "/(app)/work-assigned" | "/(app)/incidents"> = { "work-assigned": "/(app)/work-assigned", incidents: "/(app)/incidents" };
const MODULE_ACTIONS: Record<ModuleKey, () => void> = {
  "work-assigned": () => router.push(MODULE_ROUTES["work-assigned"]),
  incidents: () => router.push(MODULE_ROUTES.incidents),
};

const openModule = (module: ModuleViewModel): void => {
  if (module.children && module.children.length > 0) {
    router.push(`/(app)/module/${module.id}` as any);
    return;
  }
  if (module.key) {
    MODULE_ACTIONS[module.key]();
    return;
  }
  showMessage("Module not implemented yet.");
};

const renderModule = ({ item }: ListRenderItemInfo<ModuleViewModel>): ReactElement => {
  const handlePress = (): void => openModule(item);
  return (
    <ModuleCard
      accessibilityHint={item.key ? "Double tap to open module" : "Double tap to check module availability"}
      description={item.description}
      iconName={item.iconName}
      id={item.id}
      onPress={handlePress}
      title={item.title}
    />
  );
};

const getModuleKey = (module: ModuleViewModel): string => module.id;
const renderModulesHeader = (): ReactElement => <Text style={styles.title}>Modules</Text>;

export default function HomeScreen(): ReactElement {
  const session = useAuthStore((state) => state.session);
  const { viewState, reload } = usePermittedModules(session);
  const handleRetry = useCallback((): void => { void reload(); }, [reload]);
  return (
    <ScreenContainer>
      <AppHeader title="SiteGuard247" showMenu={true} />
      {viewState.status === "success" ? <FlatList columnWrapperStyle={styles.moduleRow} contentContainerStyle={styles.list} data={viewState.data} keyExtractor={getModuleKey} ListHeaderComponent={renderModulesHeader} numColumns={MODULE_GRID_COLUMNS} renderItem={renderModule} showsVerticalScrollIndicator={false} /> : <View style={styles.state}>{renderModulesHeader()}<AsyncStateView emptyMessage="No mobile modules are assigned to your role." message={viewState.status === "error" ? viewState.message : undefined} onRetry={handleRetry} status={viewState.status} variant="list" /></View>}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: SPACING.section, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  moduleRow: { gap: SPACING.medium },
  state: { flex: 1, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  title: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle, fontWeight: "800", letterSpacing: -0.3, paddingBottom: SPACING.large, paddingTop: SPACING.extraLarge },
});

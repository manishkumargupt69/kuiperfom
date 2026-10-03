import type { ReactElement } from "react";
import { useCallback, useMemo } from "react";
import type { ListRenderItemInfo } from "react-native";
import { FlatList, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import AsyncStateView from "@/src/components/ui/AsyncStateView";
import DetailHeader from "@/src/components/ui/DetailHeader";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import { useAuthStore } from "@/src/features/auth/state/auth-store";
import type { ModuleKey, ModuleViewModel } from "@/src/features/modules/domain/module.types";
import { usePermittedModules } from "@/src/features/modules/hooks/use-permitted-modules";
import ModuleCard from "@/src/features/modules/presentation/ModuleCard";
import { SCREEN_HORIZONTAL_PADDING, SPACING } from "@/src/theme/tokens";
import { showMessage } from "@/src/utils/show-success-message";

const MODULE_GRID_COLUMNS = 2;
const MODULE_ROUTES: Record<ModuleKey, "/(app)/(tabs)/work-assigned" | "/(app)/incidents"> = {
  "work-assigned": "/(app)/(tabs)/work-assigned",
  incidents: "/(app)/incidents",
};

const MODULE_ACTIONS: Record<ModuleKey, () => void> = {
  "work-assigned": () => router.push(MODULE_ROUTES["work-assigned"]),
  incidents: () => router.push(MODULE_ROUTES.incidents),
};

const openModule = (module: ModuleViewModel): void => {
  if (module.children && module.children.length > 0) {
    router.push({ pathname: "/(app)/module/[id]", params: { id: module.id } });
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
      accessibilityHint={item.key || (item.children && item.children.length > 0) ? "Double tap to open module" : "Double tap to check module availability"}
      description={item.description}
      iconName={item.iconName}
      id={item.id}
      onPress={handlePress}
      title={item.title}
    />
  );
};

const getModuleKey = (module: ModuleViewModel): string => module.id;

function findModuleRecursively(modules: readonly ModuleViewModel[], id: string): ModuleViewModel | null {
  for (const mod of modules) {
    if (mod.id === id) {
      return mod;
    }
    if (mod.children && mod.children.length > 0) {
      const found = findModuleRecursively(mod.children, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export default function SubModuleScreen(): ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAuthStore((state) => state.session);
  const { viewState, reload } = usePermittedModules(session);
  const handleRetry = useCallback((): void => { void reload(); }, [reload]);
  const handleBack = useCallback((): void => router.back(), []);

  const currentModule = useMemo(() => {
    if (viewState.status === "success" && id) {
      return findModuleRecursively(viewState.data, id);
    }
    return null;
  }, [viewState, id]);

  const children = currentModule?.children ?? [];

  return (
    <ScreenContainer>
      <DetailHeader onBack={handleBack} title={currentModule?.title ?? "Modules"} />

      {viewState.status === "success" ? (
        <FlatList
          columnWrapperStyle={styles.moduleRow}
          contentContainerStyle={styles.list}
          data={children}
          keyExtractor={getModuleKey}
          numColumns={MODULE_GRID_COLUMNS}
          renderItem={renderModule}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <AsyncStateView
              emptyMessage={`No sub-modules found for ${currentModule?.title}.`}
              onRetry={handleRetry}
              status="empty"
              variant="list"
            />
          }
        />
      ) : (
        <View style={styles.state}>
          <AsyncStateView
            emptyMessage="No modules are assigned to your role."
            message={viewState.status === "error" ? viewState.message : undefined}
            onRetry={handleRetry}
            status={viewState.status}
            variant="list"
          />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: SPACING.section, paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: SPACING.medium },
  moduleRow: { gap: SPACING.medium },
  state: { flex: 1, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
});

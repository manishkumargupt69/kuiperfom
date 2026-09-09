import type { ReactElement } from "react";
import { useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import AppHeader from "@/src/components/ui/AppHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import type { ProjectViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { useDashboard } from "@/src/features/dashboard/hooks/use-dashboard";
import ProjectCard from "@/src/features/dashboard/presentation/ProjectCard";
import { useDashboardStore } from "@/src/features/dashboard/state/dashboard-store";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

const getProjectKey = (project: ProjectViewModel): string => project.id;

export default function DashboardScreen(): ReactElement {
  const { viewState, reload, loadMore } = useDashboard();
  const setSelectedProject = useDashboardStore((state) => state.setSelectedProject);

  const handleRetry = useCallback((): void => {
    void reload();
  }, [reload]);

  const handleProjectPress = useCallback(
    (project: ProjectViewModel): void => {
      setSelectedProject(project);
      router.push("/(app)/work-group-details");
    },
    [setSelectedProject]
  );

  const renderProject = useCallback(
    ({ item }: { item: ProjectViewModel }): ReactElement => {
      return <ProjectCard project={item} onPress={handleProjectPress} />;
    },
    [handleProjectPress]
  );

  const renderHeader = useCallback(
    (): ReactElement => <Text style={styles.title}>Assigned Projects</Text>,
    []
  );

  const openDrawer = useCallback((): void => {
    // We will use Drawer navigation, so we use expo-router's navigation properties
    // Actually, AppHeader accepts an action. We can change the action icon to menu.
    // In Drawer, navigation.dispatch(DrawerActions.openDrawer()) can be used,
    // or router.navigate can be used, but expo-router has `useNavigation`
    // Let's pass an openDrawer prop or let AppHeader handle it if we modify it later.
    // For now we will rely on a custom left button or keep it simple.
    // We'll update the action to open drawer.
  }, []);

  return (
    <ScreenContainer>
      <AppHeader title="SiteGuard247" showMenu={true} />
      {viewState.status === "success" ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={viewState.data}
          keyExtractor={getProjectKey}
          ListHeaderComponent={renderHeader}
          renderItem={renderProject}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
      ) : (
        <View style={styles.state}>
          {renderHeader()}
          <AsyncStateView
            emptyMessage="No projects are assigned to you."
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
  list: {
    paddingBottom: SPACING.section,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  state: {
    flex: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
  },
  title: {
    color: COLORS.ink,
    ...TYPOGRAPHY.sectionTitle,
    fontWeight: "800",
    letterSpacing: -0.3,
    paddingBottom: SPACING.large,
    paddingTop: SPACING.extraLarge,
  },
});

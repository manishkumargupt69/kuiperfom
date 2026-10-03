import type { ReactElement } from "react";
import { useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import DetailHeader from "@/src/components/ui/DetailHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import type { ProjectViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { useAssignedCities } from "@/src/features/dashboard/hooks/use-assigned-cities";
import ProjectCard from "@/src/features/dashboard/presentation/ProjectCard";
import { useDashboardStore } from "@/src/features/dashboard/state/dashboard-store";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

type CityProjectsParams = {
  cityId: string;
};

const getProjectKey = (project: ProjectViewModel): string => project.id;

export default function CityProjectsScreen(): ReactElement {
  const { cityId } = useLocalSearchParams<CityProjectsParams>();
  const { viewState, reload } = useAssignedCities();
  const setSelectedProject = useDashboardStore((state) => state.setSelectedProject);
  const city = viewState.status === "success"
    ? viewState.data.find((item) => item.id === cityId)
    : null;
  const handleBack = useCallback((): void => router.back(), []);
  const handleRetry = useCallback((): void => { void reload(); }, [reload]);
  const openProject = useCallback((project: ProjectViewModel): void => {
    setSelectedProject(project);
    router.push("/(app)/work-group-details");
  }, [setSelectedProject]);
  const renderProject = useCallback(
    ({ item }: { item: ProjectViewModel }): ReactElement => <ProjectCard project={item} onPress={openProject} />,
    [openProject],
  );

  return (
    <ScreenContainer>
      <DetailHeader onBack={handleBack} title="Projects" />
      {city && city.projects.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={city.projects}
          keyExtractor={getProjectKey}
          ListHeaderComponent={
            <View style={styles.heading}>
              <Text style={styles.cityCode}>{city.code}</Text>
              <Text accessibilityRole="header" style={styles.cityName}>{city.name}</Text>
              <Text style={styles.count}>{city.projects.length} {city.projects.length === 1 ? "project" : "projects"}</Text>
            </View>
          }
          renderItem={renderProject}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.state}>
          <AsyncStateView emptyMessage="No projects found for this city." message={viewState.status === "error" ? viewState.message : undefined} onRetry={handleRetry} status={viewState.status === "success" ? "empty" : viewState.status} variant="list" />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: SPACING.section, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  state: { flex: 1, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  heading: { gap: SPACING.extraSmall, paddingBottom: SPACING.large, paddingTop: SPACING.extraLarge },
  cityCode: { color: COLORS.accent, ...TYPOGRAPHY.caption, fontWeight: "700", letterSpacing: 1 },
  cityName: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle, fontWeight: "800" },
  count: { color: COLORS.inkMuted, ...TYPOGRAPHY.body },
});

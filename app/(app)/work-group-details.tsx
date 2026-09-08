import type { ReactElement } from "react";
import { useCallback } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import AppHeader from "@/src/components/ui/AppHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import type {
  DashboardWorkItemViewModel,
  ProjectDetailsViewModel,
  WorkGroupViewModel,
} from "@/src/features/dashboard/domain/dashboard.types";
import { useProjectDetails } from "@/src/features/dashboard/hooks/use-project-details";
import ProjectWorkItemRow from "@/src/features/dashboard/presentation/ProjectWorkItemRow";
import WorkGroupCard from "@/src/features/dashboard/presentation/WorkGroupCard";
import { useDashboardStore } from "@/src/features/dashboard/state/dashboard-store";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface WorkGroupListItem {
  kind: "work-group";
  id: string;
  workGroup: WorkGroupViewModel;
}

interface WorkItemListItem {
  kind: "work-item";
  id: string;
  workItem: DashboardWorkItemViewModel;
}

type ProjectDetailsListItem = WorkGroupListItem | WorkItemListItem;

const getProjectDetailsListItems = (
  project: ProjectDetailsViewModel,
): readonly ProjectDetailsListItem[] =>
  project.workGroups.flatMap((workGroup) => [
    { kind: "work-group" as const, id: `work-group-${workGroup.id}`, workGroup },
    ...workGroup.workItems.map((workItem) => ({
      kind: "work-item" as const,
      id: `work-item-${workItem.id}`,
      workItem,
    })),
  ]);

const getItemKey = (item: ProjectDetailsListItem): string => item.id;

export default function WorkGroupDetailsScreen(): ReactElement {
  const selectedProject = useDashboardStore((state) => state.selectedProject);
  const { viewState, reload } = useProjectDetails(selectedProject?.id ?? null);

  const handleBack = useCallback((): void => {
    router.back();
  }, []);

  const handleRetry = useCallback((): void => {
    void reload();
  }, [reload]);

  const handleWorkItemPress = useCallback(
    (workItem: DashboardWorkItemViewModel): void => {
      router.push({
        pathname: "/(app)/work-assigned/[id]",
        params: { id: workItem.id },
      });
    },
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: ProjectDetailsListItem }): ReactElement => {
      if (item.kind === "work-group") {
        return <WorkGroupCard workGroup={item.workGroup} />;
      }
      return (
        <ProjectWorkItemRow
          onPress={handleWorkItemPress}
          workItem={item.workItem}
        />
      );
    },
    [handleWorkItemPress],
  );

  const renderHeader = useCallback(
    (): ReactElement | null => {
      if (viewState.status !== "success") return null;
      const project = viewState.data;
      return (
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>Project details</Text>
          <View style={styles.detailsCard}>
            <Text style={styles.detail}>Client: {project.clientName}</Text>
            <Text style={styles.detail}>Project: {project.projectName}</Text>
            <Text style={styles.detail}>City: {project.city}</Text>
            <Text style={styles.detail}>Start date: {project.startDate}</Text>
          </View>
          <Text style={styles.sectionTitle}>Work groups</Text>
        </View>
      );
    },
    [viewState],
  );

  if (!selectedProject) {
    return (
      <ScreenContainer>
        <AppHeader onBack={handleBack} title="Details" />
        <View style={styles.state}>
          <AsyncStateView
            emptyMessage="No project selected."
            onRetry={handleRetry}
            status="empty"
            variant="detail"
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader onBack={handleBack} title="Work Groups" />
      {viewState.status === "success" ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={getProjectDetailsListItems(viewState.data)}
          keyExtractor={getItemKey}
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.state}>
          <AsyncStateView
            emptyMessage="No work groups are assigned to this project."
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
  headerContainer: {
    marginBottom: SPACING.medium,
  },
  sectionTitle: {
    color: COLORS.ink,
    ...TYPOGRAPHY.sectionTitle,
    fontWeight: "800",
    letterSpacing: -0.3,
    paddingBottom: SPACING.medium,
    paddingTop: SPACING.large,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: SPACING.medium,
    borderWidth: StyleSheet.hairlineWidth,
    gap: SPACING.small,
    padding: SPACING.large,
  },
  detail: {
    color: COLORS.ink,
    ...TYPOGRAPHY.body,
  },
});

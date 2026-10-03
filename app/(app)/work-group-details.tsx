import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import DetailHeader from "@/src/components/ui/DetailHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import SearchField from "@/src/components/ui/SearchField";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import type { DashboardWorkItemViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { useProjectDetails } from "@/src/features/dashboard/hooks/use-project-details";
import ProjectWorkItemRow from "@/src/features/dashboard/presentation/ProjectWorkItemRow";
import ProjectSummaryRow from "@/src/features/dashboard/presentation/ProjectSummaryRow";
import { useDashboardStore } from "@/src/features/dashboard/state/dashboard-store";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import SecondaryButton from "@/src/components/ui/SecondaryButton";

const DAYS_AHEAD = 30;
const getItemKey = (item: DashboardWorkItemViewModel): string => item.id;
const getLocalDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function WorkGroupDetailsScreen(): ReactElement {
  const selectedProject = useDashboardStore((state) => state.selectedProject);
  const { viewState, reload } = useProjectDetails(selectedProject?.id ?? null);
  const [searchText, setSearchText] = useState("");

  const handleBack = useCallback((): void => {
    router.back();
  }, []);

  const handleRetry = useCallback((): void => {
    void reload();
  }, [reload]);

  const clearSearch = useCallback((): void => setSearchText(""), []);
  const openAudit = useCallback((): void => router.push("/(app)/audit-work-items"), []);
  const openWorkItem = useCallback((workItem: DashboardWorkItemViewModel): void => {
    router.push({ pathname: "/(app)/work-assigned/[id]", params: { id: workItem.id } });
  }, []);

  const listItems = useMemo(() => {
    if (viewState.status !== "success") return [];
    const latestDate = new Date();
    latestDate.setDate(latestDate.getDate() + DAYS_AHEAD);
    const latestDateKey = getLocalDateKey(latestDate);
    const query = searchText.trim().toLocaleLowerCase();
    return viewState.data.workGroups.flatMap((workGroup) => workGroup.workItems)
      .filter((workItem) => workItem.targetCompletionDate && workItem.targetCompletionDate.slice(0, 10) <= latestDateKey)
      .filter((workItem) => !query || [workItem.workItemName, workItem.workSubGroupName, workItem.targetCompletionDate ?? "", workItem.status]
        .some((value) => value.toLocaleLowerCase().includes(query)));
  }, [viewState, searchText]);

  const renderItem = useCallback(
    ({ item }: { item: DashboardWorkItemViewModel }): ReactElement => <ProjectWorkItemRow workItem={item} onPress={openWorkItem} />,
    [openWorkItem],
  );

  const renderHeader = useCallback(
    (): ReactElement | null => {
      if (viewState.status !== "success") return null;
      const project = viewState.data;
      return (
        <View style={styles.headerContainer}>
          <ProjectSummaryRow city={project.city} projectName={project.projectName} startDate={project.startDate} />
          <View style={styles.auditAction}><SecondaryButton iconName="check-square" label="Audit work items" onPress={openAudit} /></View>
          <Text style={styles.sectionTitle}>Work items</Text>
          <Text style={styles.listHint}>Planned through the next 30 days, including overdue items</Text>
          <SearchField accessibilityLabel="Search work items" onChangeText={setSearchText} onClear={clearSearch} placeholder="Search work, subgroup, date, status" value={searchText} />
        </View>
      );
    },
    [viewState, searchText, clearSearch, openAudit],
  );

  if (!selectedProject) {
    return (
      <ScreenContainer>
        <DetailHeader onBack={handleBack} title="Work Status Update" />
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
      <DetailHeader onBack={handleBack} title="Work Status Update" />
      {viewState.status === "success" ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={listItems}
          keyExtractor={getItemKey}
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No work items match this date range and search.</Text>}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.state}>
          <AsyncStateView
            emptyMessage="No work items are assigned to this project."
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
    paddingTop: SPACING.medium,
  },
  listHint: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, marginBottom: SPACING.medium },
  empty: { color: COLORS.inkMuted, ...TYPOGRAPHY.body, paddingVertical: SPACING.extraLarge },
  auditAction: { alignItems: "flex-start", marginTop: SPACING.medium },
});

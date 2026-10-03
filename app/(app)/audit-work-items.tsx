import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import DetailHeader from "@/src/components/ui/DetailHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import SearchField from "@/src/components/ui/SearchField";
import type { DashboardWorkItemViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { useProjectDetails } from "@/src/features/dashboard/hooks/use-project-details";
import ProjectSummaryRow from "@/src/features/dashboard/presentation/ProjectSummaryRow";
import ProjectWorkItemRow from "@/src/features/dashboard/presentation/ProjectWorkItemRow";
import { useDashboardStore } from "@/src/features/dashboard/state/dashboard-store";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

const DAYS_AHEAD = 30;
const getItemKey = (item: DashboardWorkItemViewModel): string => item.id;
const getLocalDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function AuditWorkItemsScreen(): ReactElement {
  const selectedProject = useDashboardStore((state) => state.selectedProject);
  const { viewState, reload } = useProjectDetails(selectedProject?.id ?? null);
  const [searchText, setSearchText] = useState("");
  const handleBack = useCallback((): void => router.back(), []);
  const handleRetry = useCallback((): void => { void reload(); }, [reload]);
  const clearSearch = useCallback((): void => setSearchText(""), []);
  const openAudit = useCallback((item: DashboardWorkItemViewModel): void => {
    router.push({ pathname: "/(app)/audit-work-items/[id]", params: { id: item.id } });
  }, []);
  const renderItem = useCallback(
    ({ item }: { item: DashboardWorkItemViewModel }): ReactElement => <ProjectWorkItemRow accessibilityHint="Opens work audit" onPress={openAudit} workItem={item} />,
    [openAudit],
  );

  const items = useMemo((): readonly DashboardWorkItemViewModel[] => {
    if (viewState.status !== "success") return [];
    const workItems = viewState.data.workGroups.flatMap((group) => group.workItems);
    const query = searchText.trim().toLocaleLowerCase();
    if (query) {
      return workItems.filter((item) => [item.workItemName, item.workSubGroupName, item.targetCompletionDate ?? "", item.status]
        .some((value) => value.toLocaleLowerCase().includes(query)));
    }
    const latestDate = new Date();
    latestDate.setDate(latestDate.getDate() + DAYS_AHEAD);
    const latestDateKey = getLocalDateKey(latestDate);
    return workItems.filter((item) => item.targetCompletionDate && item.targetCompletionDate.slice(0, 10) <= latestDateKey);
  }, [searchText, viewState]);

  const renderHeader = useCallback((): ReactElement | null => {
    if (viewState.status !== "success") return null;
    const project = viewState.data;
    return (
      <View style={styles.header}>
        <ProjectSummaryRow city={project.city} projectName={project.projectName} startDate={project.startDate} />
        <Text accessibilityRole="header" style={styles.title}>Audit work items</Text>
        <Text style={styles.hint}>Planned through the next 30 days, including overdue items</Text>
        <SearchField accessibilityLabel="Search work items to audit" onChangeText={setSearchText} onClear={clearSearch} placeholder="Search work, subgroup, date, status" value={searchText} />
      </View>
    );
  }, [clearSearch, searchText, viewState]);

  return (
    <ScreenContainer>
      <DetailHeader onBack={handleBack} title="Audit Work Item" />
      {viewState.status === "success" ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={items}
          keyExtractor={getItemKey}
          ListEmptyComponent={<Text style={styles.empty}>No work items match this date range and search.</Text>}
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.state}>
          <AsyncStateView
            emptyMessage="No work items are available for this project."
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
  list: { paddingBottom: SPACING.section, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  state: { flex: 1, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  header: { gap: SPACING.medium, marginBottom: SPACING.medium },
  title: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle, fontWeight: "800", marginTop: SPACING.small },
  hint: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  empty: { color: COLORS.inkMuted, ...TYPOGRAPHY.body, paddingVertical: SPACING.extraLarge },
});

import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

import DrawerHeader from "@/src/components/ui/DrawerHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import SearchField from "@/src/components/ui/SearchField";
import type { ProjectViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { useDashboard } from "@/src/features/dashboard/hooks/use-dashboard";
import ProjectCard from "@/src/features/dashboard/presentation/ProjectCard";
import { useDashboardStore } from "@/src/features/dashboard/state/dashboard-store";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

const getProjectKey = (project: ProjectViewModel): string => project.id;

export default function ProjectMasterScreen(): ReactElement {
  const { viewState, reload, loadMore } = useDashboard();
  const setSelectedProject = useDashboardStore((state) => state.setSelectedProject);
  const [searchText, setSearchText] = useState("");

  const filteredProjects = useMemo(() => {
    if (viewState.status !== "success") return [];
    const normalized = searchText.trim().toLocaleLowerCase();
    if (!normalized) return viewState.data;
    return viewState.data.filter((p) => p.projectName.toLocaleLowerCase().includes(normalized) || p.clientName.toLocaleLowerCase().includes(normalized));
  }, [viewState, searchText]);

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
    (): ReactElement => (
      <View style={styles.header}>
        <Text style={styles.title}>Assigned Projects</Text>
        <View style={styles.searchRow}>
          <SearchField accessibilityLabel="Search projects" onChangeText={setSearchText} onClear={() => setSearchText("")} placeholder="Search projects..." value={searchText} />
          <Pressable accessibilityLabel="Filter projects" style={styles.filterBtn}>
            <Feather color={COLORS.ink} name="filter" size={18} />
          </Pressable>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{filteredProjects.length} projects</Text>
          <Text style={styles.metaText}>
            Sort by <Text style={styles.sortValue}>Recent</Text> <Feather color={COLORS.ink} name="chevron-down" size={12} />
          </Text>
        </View>
      </View>
    ),
    [searchText, filteredProjects.length]
  );

  return (
    <ScreenContainer>
      <DrawerHeader title="Project master" />
      {viewState.status === "success" ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={filteredProjects}
          keyExtractor={getProjectKey}
          ListHeaderComponent={renderHeader}
          renderItem={renderProject}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
  },
  header: {
    paddingBottom: SPACING.large,
    paddingTop: SPACING.extraLarge,
    gap: SPACING.medium,
  },
  searchRow: {
    flexDirection: "row",
    gap: SPACING.small,
  },
  filterBtn: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceMuted,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.caption,
  },
  sortValue: {
    color: COLORS.ink,
    fontWeight: "700",
  },
});

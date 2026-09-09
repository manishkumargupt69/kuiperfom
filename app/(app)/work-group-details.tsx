import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

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
import { COLORS, RADII, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { formatDate } from "@/src/utils/format-date-time";

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

const getItemKey = (item: ProjectDetailsListItem): string => item.id;

export default function WorkGroupDetailsScreen(): ReactElement {
  const selectedProject = useDashboardStore((state) => state.selectedProject);
  const { viewState, reload } = useProjectDetails(selectedProject?.id ?? null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const handleBack = useCallback((): void => {
    router.back();
  }, []);

  const handleRetry = useCallback((): void => {
    void reload();
  }, [reload]);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const listItems = useMemo(() => {
    if (viewState.status !== "success") return [];
    const project = viewState.data;
    return project.workGroups.flatMap((workGroup) => {
      const groupItem = { kind: "work-group" as const, id: `work-group-${workGroup.id}`, workGroup };
      if (expandedGroups.has(workGroup.id)) {
        const items = workGroup.workItems.map((workItem) => ({
          kind: "work-item" as const,
          id: `work-item-${workItem.id}`,
          workItem,
        }));
        return [groupItem, ...items];
      }
      return [groupItem];
    });
  }, [viewState, expandedGroups]);

  const renderItem = useCallback(
    ({ item }: { item: ProjectDetailsListItem }): ReactElement => {
      if (item.kind === "work-group") {
        return (
          <WorkGroupCard
            workGroup={item.workGroup}
            expanded={expandedGroups.has(item.workGroup.id)}
            onPress={() => toggleGroup(item.workGroup.id)}
          />
        );
      }
      return (
        <ProjectWorkItemRow
          workItem={item.workItem}
        />
      );
    },
    [expandedGroups, toggleGroup],
  );

  const renderHeader = useCallback(
    (): ReactElement | null => {
      if (viewState.status !== "success") return null;
      const project = viewState.data;
      return (
        <View style={styles.headerContainer}>
          <View style={styles.projectCard}>
            <View style={styles.projectCardHeader}>
              <View style={styles.projectIconWrapper}>
                <Feather name="briefcase" size={22} color={COLORS.accent} />
              </View>
              <View style={styles.projectTitleWrapper}>
                <Text style={styles.projectSubtitle}>Project Details</Text>
                <Text style={styles.projectTitle} numberOfLines={2}>{project.projectName}</Text>
              </View>
            </View>
            <View style={styles.projectMetaContainer}>
              <View style={styles.projectMetaItem}>
                <Feather name="user" size={14} color={COLORS.inkMuted} style={styles.projectMetaIcon} />
                <Text style={styles.projectMetaLabel}>Client</Text>
                <Text style={styles.projectMetaValue} numberOfLines={1}>{project.clientName}</Text>
              </View>
              <View style={styles.projectMetaItem}>
                <Feather name="map-pin" size={14} color={COLORS.inkMuted} style={styles.projectMetaIcon} />
                <Text style={styles.projectMetaLabel}>City</Text>
                <Text style={styles.projectMetaValue} numberOfLines={1}>{project.city}</Text>
              </View>
              <View style={styles.projectMetaItem}>
                <Feather name="calendar" size={14} color={COLORS.inkMuted} style={styles.projectMetaIcon} />
                <Text style={styles.projectMetaLabel}>Start Date</Text>
                <Text style={styles.projectMetaValue} numberOfLines={1}>
                  {formatDate(project.startDate)}
                </Text>
              </View>
            </View>
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
          data={listItems}
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
    paddingTop: SPACING.medium,
  },
  projectCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.large,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.large,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginTop: SPACING.medium,
  },
  projectCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.large,
  },
  projectIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: RADII.medium,
    backgroundColor: COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.medium,
  },
  projectTitleWrapper: {
    flex: 1,
  },
  projectSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
    marginBottom: 4,
  },
  projectTitle: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.ink,
    fontWeight: "800",
    lineHeight: 28,
  },
  projectMetaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.medium,
    backgroundColor: COLORS.background,
    padding: SPACING.medium,
    borderRadius: RADII.medium,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  projectMetaItem: {
    flex: 1,
    minWidth: 80,
  },
  projectMetaIcon: {
    marginBottom: 6,
  },
  projectMetaLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.inkMuted,
    fontWeight: "500",
    marginBottom: 2,
  },
  projectMetaValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.ink,
    fontWeight: "700",
  },
});

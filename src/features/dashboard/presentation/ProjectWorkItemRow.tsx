import { memo } from "react";
import type { ReactElement } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import StatusBadge from "@/src/components/ui/StatusBadge";
import type { DashboardWorkItemViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { formatDateTime } from "@/src/utils/format-date-time";

interface ProjectWorkItemRowProps {
  workItem: DashboardWorkItemViewModel;
  onPress?: (workItem: DashboardWorkItemViewModel) => void;
  onAudit?: (workItem: DashboardWorkItemViewModel) => void;
  accessibilityHint?: string;
}

const AUDIT_ACTION_RESERVED_WIDTH = 96;

const getRowStyle = ({
  pressed,
}: PressableStateCallbackType): StyleProp<ViewStyle> => [
  styles.main,
  pressed && styles.pressed,
];

function ProjectWorkItemRow({
  workItem,
  onPress,
  onAudit,
  accessibilityHint,
}: ProjectWorkItemRowProps): ReactElement {
  const handlePress = onPress ? (): void => onPress(workItem) : undefined;
  const handleAudit = onAudit ? (): void => onAudit(workItem) : undefined;
  const assigneeNames = workItem.assignedUsers
    .map((assignee) => assignee.name)
    .join(", ");

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityHint={onPress ? accessibilityHint ?? "Opens work details" : undefined}
        accessibilityLabel={`${workItem.workItemName}${workItem.workItemCode ? `, code ${workItem.workItemCode}` : ""}`}
        accessibilityRole={onPress ? "button" : "none"}
        onPress={handlePress}
        style={onPress ? getRowStyle : styles.main}
      >
        <View style={[styles.header, onAudit && styles.headerWithAction]}>
          <View style={styles.headerGroup}>
            <Text style={styles.headerLabel}>Work Sub Group</Text>
            <Text style={styles.subgroup}>{workItem.workSubGroupName}</Text>
          </View>
          <View style={styles.headerGroup}>
            <Text style={styles.headerLabel}>Work Item</Text>
            <Text style={styles.title}>{workItem.workItemName}</Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          <StatusBadge label={workItem.status.replace(/_/g, " ")} tone={workItem.status === "COMPLETED" ? "success" : workItem.status === "PENDING" || workItem.status === "HOLD" ? "warning" : "info"} />
          <Text style={styles.progress}>{workItem.progressPercent}% complete</Text>
        </View>
        {workItem.remarks ? <Text numberOfLines={2} style={styles.remarks}>{workItem.remarks}</Text> : null}

        <View style={styles.detailsGrid}>
          {workItem.workItemCode ? (
            <View style={styles.detailItem}>
              <Feather name="hash" size={14} color={COLORS.inkMuted} style={styles.icon} />
              <View>
                <Text style={styles.detailLabel}>Item Code</Text>
                <Text style={styles.detailValue}>{workItem.workItemCode}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.detailItem}>
            <Feather name="calendar" size={14} color={COLORS.inkMuted} style={styles.icon} />
            <View>
              <Text style={styles.detailLabel}>Target Completion Date</Text>
              <Text style={styles.detailValue}>{workItem.targetCompletionDate ? formatDateTime(workItem.targetCompletionDate) : "TBD"}</Text>
            </View>
          </View>

          {assigneeNames ? (
            <View style={styles.detailItem}>
              <Feather name="users" size={14} color={COLORS.inkMuted} style={styles.icon} />
              <View>
                <Text style={styles.detailLabel}>Assigned to</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{assigneeNames}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </Pressable>
      {onAudit ? (
        <Pressable accessibilityLabel={`Audit ${workItem.workItemName}`} accessibilityRole="button" onPress={handleAudit} style={styles.auditAction}>
          <Feather color={COLORS.accent} name="check-square" size={17} />
          <Text style={styles.auditLabel}>Audit</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default memo(ProjectWorkItemRow);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.large,
    borderWidth: 1,
    marginBottom: SPACING.medium,
    overflow: "hidden",
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  main: { padding: SPACING.large },
  pressed: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accent,
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  header: {
    marginBottom: SPACING.medium,
    gap: SPACING.small,
  },
  headerWithAction: { paddingRight: AUDIT_ACTION_RESERVED_WIDTH },
  headerGroup: {
    flexDirection: "column",
  },
  headerLabel: {
    color: COLORS.accent,
    ...TYPOGRAPHY.caption,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "800",
    marginBottom: 2,
  },
  subgroup: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.body,
    fontWeight: "600",
  },
  title: {
    color: COLORS.ink,
    ...TYPOGRAPHY.sectionTitle,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
  detailsGrid: {
    backgroundColor: COLORS.background,
    borderRadius: RADII.medium,
    padding: SPACING.medium,
    gap: SPACING.medium,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  progressRow: { alignItems: "center", flexDirection: "row", gap: SPACING.small, justifyContent: "space-between", marginBottom: SPACING.medium },
  progress: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, fontVariant: ["tabular-nums"] },
  remarks: { color: COLORS.inkMuted, ...TYPOGRAPHY.body, marginBottom: SPACING.medium },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  icon: {
    marginTop: 2,
    marginRight: SPACING.small,
  },
  detailLabel: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.caption,
    fontWeight: "500",
    marginBottom: 2,
  },
  detailValue: {
    color: COLORS.ink,
    ...TYPOGRAPHY.body,
    fontSize: 15,
    fontWeight: "600",
  },
  auditAction: { alignItems: "center", flexDirection: "row", gap: SPACING.small, minHeight: 48, paddingHorizontal: SPACING.medium, position: "absolute", right: SPACING.extraSmall, top: SPACING.extraSmall },
  auditLabel: { color: COLORS.accent, ...TYPOGRAPHY.body, fontWeight: "700" },
});

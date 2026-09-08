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

import StatusBadge from "@/src/components/ui/StatusBadge";
import type { DashboardWorkItemViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import type { StatusTone } from "@/src/types/status";
import { formatDateTime } from "@/src/utils/format-date-time";

interface ProjectWorkItemRowProps {
  workItem: DashboardWorkItemViewModel;
  onPress: (workItem: DashboardWorkItemViewModel) => void;
}

const getStatusTone = (status: string): StatusTone => {
  if (status === "COMPLETED") return "success";
  if (status === "HOLD" || status === "PENDING") return "warning";
  if (status === "STARTED") return "info";
  return "neutral";
};

const getRowStyle = ({
  pressed,
}: PressableStateCallbackType): StyleProp<ViewStyle> => [
  styles.container,
  pressed && styles.pressed,
];

function ProjectWorkItemRow({
  workItem,
  onPress,
}: ProjectWorkItemRowProps): ReactElement {
  const handlePress = (): void => onPress(workItem);
  const assigneeNames = workItem.assignedUsers
    .map((assignee) => assignee.name)
    .join(", ");

  return (
    <Pressable
      accessibilityHint="Opens work details"
      accessibilityLabel={`${workItem.requestNumber}, ${workItem.workItemName}, status ${workItem.status}`}
      accessibilityRole="button"
      onPress={handlePress}
      style={getRowStyle}
    >
      <View style={styles.header}>
        <Text style={styles.requestNumber}>{workItem.requestNumber}</Text>
        <StatusBadge label={workItem.status} tone={getStatusTone(workItem.status)} />
      </View>
      <Text style={styles.title}>{workItem.workItemName}</Text>
      <Text style={styles.subgroup}>{workItem.workSubGroupName}</Text>
      <View style={styles.details}>
        <Text style={styles.detail}>Code: {workItem.workItemCode}</Text>
        <Text style={styles.detail}>
          Target: {formatDateTime(workItem.targetCompletionDate)}
        </Text>
        <Text style={styles.detail}>Progress: {workItem.progressPercent}%</Text>
        {assigneeNames ? (
          <Text style={styles.detail}>Assigned to: {assigneeNames}</Text>
        ) : null}
        {workItem.remarks ? (
          <Text style={styles.detail}>Remarks: {workItem.remarks}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default memo(ProjectWorkItemRow);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.large,
    borderWidth: StyleSheet.hairlineWidth,
    gap: SPACING.small,
    marginBottom: SPACING.medium,
    padding: SPACING.large,
  },
  pressed: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accent,
    opacity: 0.9,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  requestNumber: {
    color: COLORS.accent,
    ...TYPOGRAPHY.caption,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  title: {
    color: COLORS.ink,
    ...TYPOGRAPHY.body,
    fontWeight: "700",
  },
  subgroup: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.caption,
  },
  details: {
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: SPACING.extraSmall,
    paddingTop: SPACING.small,
  },
  detail: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.caption,
  },
});

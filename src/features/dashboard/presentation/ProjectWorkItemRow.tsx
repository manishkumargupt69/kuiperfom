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

import type { DashboardWorkItemViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { formatDateTime } from "@/src/utils/format-date-time";

interface ProjectWorkItemRowProps {
  workItem: DashboardWorkItemViewModel;
  onPress?: (workItem: DashboardWorkItemViewModel) => void;
}

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
  const handlePress = onPress ? (): void => onPress(workItem) : undefined;
  const assigneeNames = workItem.assignedUsers
    .map((assignee) => assignee.name)
    .join(", ");

  return (
    <Pressable
      accessibilityHint={onPress ? "Opens work details" : undefined}
      accessibilityLabel={`${workItem.workItemName}, code ${workItem.workItemCode}`}
      accessibilityRole={onPress ? "button" : "none"}
      onPress={handlePress}
      style={onPress ? getRowStyle : styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerGroup}>
          <Text style={styles.headerLabel}>Work Sub Group</Text>
          <Text style={styles.subgroup}>{workItem.workSubGroupName}</Text>
        </View>
        <View style={styles.headerGroup}>
          <Text style={styles.headerLabel}>Work Item</Text>
          <Text style={styles.title}>{workItem.workItemName}</Text>
        </View>
      </View>
      
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Feather name="hash" size={14} color={COLORS.inkMuted} style={styles.icon} />
          <View>
            <Text style={styles.detailLabel}>Item Code</Text>
            <Text style={styles.detailValue}>{workItem.workItemCode}</Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <Feather name="calendar" size={14} color={COLORS.inkMuted} style={styles.icon} />
          <View>
            <Text style={styles.detailLabel}>Target Completion Date</Text>
            <Text style={styles.detailValue}>{formatDateTime(workItem.targetCompletionDate)}</Text>
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
    padding: SPACING.large,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.accent,
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  header: {
    marginBottom: SPACING.medium,
    gap: SPACING.small,
  },
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
});

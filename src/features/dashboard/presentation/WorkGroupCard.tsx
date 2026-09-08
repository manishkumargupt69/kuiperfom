import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { WorkGroupViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface WorkGroupCardProps {
  workGroup: WorkGroupViewModel;
}

export default function WorkGroupCard({ workGroup }: WorkGroupCardProps): ReactElement {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="folder-outline" size={20} color={COLORS.accent} style={styles.icon} />
        <Text style={styles.title} numberOfLines={1}>{workGroup.name}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{workGroup.workItemCount} Items</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: SPACING.medium,
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: SPACING.small,
  },
  icon: {
    marginRight: SPACING.small,
  },
  title: {
    ...TYPOGRAPHY.body,
    fontWeight: "600",
    color: COLORS.ink,
    flex: 1,
  },
  badge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.small,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.inkMuted,
    fontWeight: "600",
  },
});

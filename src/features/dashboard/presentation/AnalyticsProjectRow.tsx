import type { ReactElement } from "react";
import { memo } from "react";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { AnalyticsDisplayProject } from "@/src/features/dashboard/domain/dashboard.types";
import { getStatusColor, getStatusSurface } from "@/src/features/dashboard/presentation/dashboard-colors";
import { COLORS, MINIMUM_TOUCH_SIZE, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { formatDate } from "@/src/utils/format-date-time";

interface AnalyticsProjectRowProps {
  project: AnalyticsDisplayProject;
  onPress: (project: AnalyticsDisplayProject) => void;
}

function AnalyticsProjectRow({ project, onPress }: AnalyticsProjectRowProps): ReactElement {
  const statusColor = getStatusColor(project.status);
  const statusSurface = getStatusSurface(project.status);
  const delayLabel = project.delayDays === 1 ? "1 day overdue" : `${project.delayDays} days overdue`;

  return (
    <Pressable
      accessibilityLabel={`${project.projectName}, ${project.cityName}, ${project.statusLabel}${project.delayDays > 0 ? `, ${delayLabel}` : ""}`}
      accessibilityRole="button"
      onPress={() => onPress(project)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.topLine}>
        <Text numberOfLines={1} style={styles.projectNumber}>{project.projectNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusSurface }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{project.statusLabel}</Text>
        </View>
      </View>
      <View style={styles.projectLine}>
        <Text numberOfLines={2} style={styles.projectName}>{project.projectName}</Text>
        <Feather accessibilityElementsHidden color={COLORS.inkMuted} name="chevron-right" size={17} />
      </View>
      <View style={styles.metaLine}>
        <Feather accessibilityElementsHidden color={COLORS.inkMuted} name="map-pin" size={13} />
        <Text numberOfLines={1} style={styles.metaText}>{project.cityName}</Text>
        <Text style={styles.separator}>·</Text>
        <Text numberOfLines={1} style={styles.metaText}>{project.clientName}</Text>
      </View>
      <View style={styles.footer}>
        <Feather accessibilityElementsHidden color={project.delayDays > 0 ? COLORS.danger : COLORS.inkMuted} name="calendar" size={13} />
        <Text style={[styles.target, project.delayDays > 0 && styles.delayed]}>Target {formatDate(project.targetCompletionDate ?? "")}</Text>
        {project.delayDays > 0 ? <Text style={styles.delayLabel}>{delayLabel}</Text> : null}
      </View>
    </Pressable>
  );
}

export default memo(AnalyticsProjectRow);

const styles = StyleSheet.create({
  row: { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border, borderBottomWidth: StyleSheet.hairlineWidth, gap: SPACING.extraSmall, minHeight: MINIMUM_TOUCH_SIZE, paddingHorizontal: SPACING.large, paddingVertical: SPACING.medium },
  pressed: { backgroundColor: COLORS.surfaceMuted },
  topLine: { alignItems: "center", flexDirection: "row", gap: SPACING.small, justifyContent: "space-between" },
  projectNumber: { color: COLORS.accent, ...TYPOGRAPHY.caption, flex: 1, fontVariant: ["tabular-nums"], fontWeight: "700" },
  statusBadge: { borderRadius: 6, paddingHorizontal: SPACING.small, paddingVertical: SPACING.extraSmall },
  statusText: { ...TYPOGRAPHY.caption, fontWeight: "700" },
  projectLine: { alignItems: "center", flexDirection: "row", gap: SPACING.small },
  projectName: { color: COLORS.ink, ...TYPOGRAPHY.control, flex: 1, fontWeight: "700" },
  metaLine: { alignItems: "center", flexDirection: "row", gap: SPACING.extraSmall },
  metaText: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, flexShrink: 1 },
  separator: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  footer: { alignItems: "center", flexDirection: "row", gap: SPACING.extraSmall, marginTop: SPACING.extraSmall },
  target: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  delayed: { color: COLORS.danger },
  delayLabel: { color: COLORS.danger, ...TYPOGRAPHY.caption, fontWeight: "700", marginLeft: "auto" },
});

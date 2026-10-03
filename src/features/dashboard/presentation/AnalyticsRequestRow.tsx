import type { ReactElement } from "react";
import { memo } from "react";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { AnalyticsDisplayRequest } from "@/src/features/dashboard/domain/dashboard.types";
import { getStatusColor, getStatusSurface } from "@/src/features/dashboard/presentation/dashboard-colors";
import { COLORS, MINIMUM_TOUCH_SIZE, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { formatDate } from "@/src/utils/format-date-time";

interface AnalyticsRequestRowProps {
  request: AnalyticsDisplayRequest;
  onPress: (request: AnalyticsDisplayRequest) => void;
}

function AnalyticsRequestRow({ request, onPress }: AnalyticsRequestRowProps): ReactElement {
  const statusColor = getStatusColor(request.status);
  const statusSurface = getStatusSurface(request.status);

  return (
    <Pressable
      accessibilityLabel={`${request.requestNumber}, ${request.projectName}, ${request.statusLabel}${request.isDelayed ? ", delayed" : ""}`}
      accessibilityRole="button"
      onPress={() => onPress(request)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.topLine}>
        <Text numberOfLines={1} style={styles.requestNumber}>{request.requestNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusSurface }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{request.statusLabel}</Text>
        </View>
      </View>
      <View style={styles.projectLine}>
        <Text numberOfLines={1} style={styles.project}>{request.projectName}</Text>
        <Feather accessibilityElementsHidden color={COLORS.inkMuted} name="chevron-right" size={17} />
      </View>
      <Text numberOfLines={1} style={styles.description}>{request.cityName} · {request.workItemName}</Text>
      <View style={styles.footer}>
        <Feather accessibilityElementsHidden color={request.isDelayed ? COLORS.danger : COLORS.inkMuted} name="calendar" size={13} />
        <Text style={[styles.target, request.isDelayed && styles.delayed]}>Target {formatDate(request.targetCompletionDate)}</Text>
        {request.isDelayed ? <Text style={styles.delayedLabel}>Overdue</Text> : null}
      </View>
    </Pressable>
  );
}

export default memo(AnalyticsRequestRow);

const styles = StyleSheet.create({
  row: { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border, borderBottomWidth: StyleSheet.hairlineWidth, gap: SPACING.extraSmall, minHeight: MINIMUM_TOUCH_SIZE, paddingHorizontal: SPACING.large, paddingVertical: SPACING.medium },
  pressed: { backgroundColor: COLORS.surfaceMuted },
  topLine: { alignItems: "center", flexDirection: "row", gap: SPACING.small, justifyContent: "space-between" },
  requestNumber: { color: COLORS.accent, ...TYPOGRAPHY.caption, flex: 1, fontVariant: ["tabular-nums"], fontWeight: "700" },
  statusBadge: { borderRadius: 6, paddingHorizontal: SPACING.small, paddingVertical: SPACING.extraSmall },
  statusText: { ...TYPOGRAPHY.caption, fontWeight: "700" },
  projectLine: { alignItems: "center", flexDirection: "row", gap: SPACING.small },
  project: { color: COLORS.ink, ...TYPOGRAPHY.control, flex: 1, fontWeight: "700" },
  description: { color: COLORS.inkMuted, ...TYPOGRAPHY.body },
  footer: { alignItems: "center", flexDirection: "row", gap: SPACING.extraSmall, marginTop: SPACING.extraSmall },
  target: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  delayed: { color: COLORS.danger },
  delayedLabel: { color: COLORS.danger, ...TYPOGRAPHY.caption, fontWeight: "700", marginLeft: "auto" },
});

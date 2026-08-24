import { memo } from "react";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import StatusBadge from "@/src/components/ui/StatusBadge";
import type { WorkItemViewModel } from "@/src/features/work/domain/work.types";
import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface WorkItemRowProps { item: WorkItemViewModel; onPress: (item: WorkItemViewModel) => void; }

function WorkItemRow({ item, onPress }: WorkItemRowProps): ReactElement {
  const handlePress = (): void => onPress(item);
  return (
    <Pressable accessibilityHint="Opens work details" accessibilityLabel={`${item.requestNumber}, ${item.workItem}, status ${item.status.label}`} accessibilityRole="button" onPress={handlePress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.topLine}><Text style={styles.requestNumber}>{item.requestNumber}</Text><StatusBadge label={item.status.label} tone={item.status.tone} /></View>
      <Text style={styles.title}>{item.workItem}</Text>
      <Text style={styles.meta}>{item.workGroup} / {item.workSubgroup}</Text>
      <View style={styles.bottomLine}><Text style={styles.meta}>Target: {item.targetCompletion}</Text>{item.completionPercentage === null ? null : <Text style={styles.progress}>{item.completionPercentage}%</Text>}</View>
      {item.remarks ? <Text numberOfLines={1} style={styles.remarks}>{item.remarks}</Text> : null}
      {item.attachments.length > 0 ? <Text style={styles.evidence}>{item.attachments.length} evidence attachment{item.attachments.length === 1 ? "" : "s"}</Text> : null}
    </Pressable>
  );
}

export default memo(WorkItemRow);

const styles = StyleSheet.create({
  container: { borderBottomColor: COLORS.border, borderBottomWidth: 1, gap: SPACING.small, minHeight: 108, paddingVertical: SPACING.large },
  pressed: { backgroundColor: COLORS.surfaceMuted },
  topLine: { alignItems: "center", flexDirection: "row", gap: SPACING.medium, justifyContent: "space-between" },
  bottomLine: { alignItems: "center", flexDirection: "row", gap: SPACING.medium, justifyContent: "space-between" },
  requestNumber: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, fontWeight: "600" },
  title: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "600" },
  meta: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  progress: { color: COLORS.accent, ...TYPOGRAPHY.body, fontWeight: "700" },
  remarks: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  evidence: { color: COLORS.accent, ...TYPOGRAPHY.caption, fontWeight: "600" },
});

import { memo, useMemo } from "react";
import type { ReactElement } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import StatusBadge from "@/src/components/ui/StatusBadge";
import type { WorkItemViewModel } from "@/src/features/work/domain/work.types";
import WorkInfoRow from "@/src/features/work/presentation/WorkInfoRow";
import { COLORS, MINIMUM_TOUCH_SIZE, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { formatDate, formatDateTime } from "@/src/utils/format-date-time";

interface WorkItemRowProps {
  isExpanded: boolean;
  item: WorkItemViewModel;
  onToggle: (item: WorkItemViewModel) => void;
  onUpdate: (item: WorkItemViewModel) => void;
}

function WorkItemRow({ isExpanded, item, onToggle, onUpdate }: WorkItemRowProps): ReactElement {
  const photoUri = item.attachments.find((attachment) => attachment.kind === "photo")?.uri;
  const photoSource = useMemo(() => photoUri ? { uri: photoUri } : undefined, [photoUri]);
  const completionLabel = item.completionPercentage === null
    ? "Completion not reported"
    : `${item.completionPercentage}% complete`;
  const handleToggle = (): void => onToggle(item);
  const handleUpdate = (): void => onUpdate(item);

  return (
    <View style={styles.container}>
      <View style={styles.tile}>
        <Pressable
          accessibilityHint="Expands work details"
          accessibilityLabel={`${item.requestNumber}, ${item.workItem}, status ${item.status.label}, due ${formatDate(item.targetCompletion)}`}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          onPress={handleToggle}
          style={({ pressed }) => [styles.tileBody, pressed && styles.pressed]}
        >
          <View style={styles.tileTop}>
            <Text numberOfLines={1} style={styles.requestNumber}>{item.requestNumber}</Text>
            <StatusBadge label={item.status.label} tone={item.status.tone} />
          </View>
          <Text numberOfLines={2} style={styles.title}>{item.workItem}</Text>
          <View style={styles.dueRow}>
            <Feather color={COLORS.inkMuted} name="calendar" size={15} />
            <Text style={styles.dueDate}>Due {formatDate(item.targetCompletion)}</Text>
            <Feather color={COLORS.inkMuted} name={isExpanded ? "chevron-up" : "chevron-down"} size={18} />
          </View>
        </Pressable>
        <Pressable
          accessibilityLabel={`Update ${item.requestNumber}`}
          accessibilityRole="button"
          onPress={handleUpdate}
          style={({ pressed }) => [styles.updateButton, pressed && styles.updatePressed]}
        >
          <Feather color={COLORS.accent} name="edit-2" size={19} />
        </Pressable>
      </View>

      {isExpanded ? (
        <View style={styles.details}>
          <View style={styles.hero}>
            <Text style={styles.group}>{item.workGroup} · {item.workSubgroup}</Text>
            {photoSource ? <Image accessibilityLabel="Work evidence" resizeMode="cover" source={photoSource} style={styles.thumbnail} /> : null}
          </View>
          <WorkInfoRow iconName="hash" value={item.workItemCode} />
          {item.assignedToName ? <WorkInfoRow iconName="user" value={item.assignedToName} /> : null}
          <WorkInfoRow iconName="calendar" value={formatDateTime(item.targetCompletion)} />
          {item.remarks ? <WorkInfoRow iconName="message-square" value={item.remarks} /> : null}
          <View style={styles.footer}>
            <View style={styles.progressPill}>
              <Feather color={COLORS.accent} name="activity" size={14} />
              <Text style={styles.progress}>{completionLabel}</Text>
            </View>
            {item.attachments.length > 0 ? (
              <View style={styles.evidence}>
                <Feather color={COLORS.inkMuted} name="paperclip" size={14} />
                <Text style={styles.evidenceLabel}>{item.attachments.length}</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default memo(WorkItemRow);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.large,
    borderWidth: 1,
    elevation: 2,
    marginBottom: SPACING.medium,
    overflow: "hidden",
    shadowColor: COLORS.ink,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tile: { alignItems: "center", flexDirection: "row" },
  tileBody: { flex: 1, gap: SPACING.small, padding: SPACING.large },
  pressed: { backgroundColor: COLORS.accentSoft },
  tileTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: SPACING.small },
  requestNumber: { color: COLORS.accent, ...TYPOGRAPHY.caption, flexShrink: 1, fontWeight: "800", letterSpacing: 0.5 },
  title: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "800" },
  dueRow: { alignItems: "center", flexDirection: "row", gap: SPACING.small },
  dueDate: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, flex: 1, fontWeight: "600" },
  updateButton: { alignItems: "center", backgroundColor: COLORS.accentSoft, borderRadius: RADII.pill, justifyContent: "center", marginRight: SPACING.medium, minHeight: MINIMUM_TOUCH_SIZE, minWidth: MINIMUM_TOUCH_SIZE },
  updatePressed: { backgroundColor: COLORS.border },
  details: { borderTopColor: COLORS.border, borderTopWidth: 1, gap: SPACING.small, padding: SPACING.large },
  hero: { alignItems: "center", flexDirection: "row", gap: SPACING.medium, justifyContent: "space-between" },
  group: { color: COLORS.inkMuted, ...TYPOGRAPHY.body, flex: 1, fontWeight: "500" },
  thumbnail: { backgroundColor: COLORS.surfaceMuted, borderRadius: RADII.medium, height: 64, width: 64 },
  footer: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: SPACING.extraSmall },
  progressPill: { alignItems: "center", backgroundColor: COLORS.accentSoft, borderRadius: RADII.pill, flexDirection: "row", gap: SPACING.small, paddingHorizontal: SPACING.medium, paddingVertical: SPACING.small },
  progress: { color: COLORS.accent, ...TYPOGRAPHY.caption, fontWeight: "700" },
  evidence: { alignItems: "center", flexDirection: "row", gap: SPACING.extraSmall },
  evidenceLabel: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, fontWeight: "700" },
});

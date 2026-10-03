import { memo } from "react";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Slider from "@react-native-community/slider";

import StatusBadge from "@/src/components/ui/StatusBadge";
import type { WorkItemViewModel, WorkTransitionKey } from "@/src/features/work/domain/work.types";
import WorkTransitionChip from "@/src/features/work/presentation/WorkTransitionChip";
import { COLORS, MINIMUM_TOUCH_SIZE, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { formatDate } from "@/src/utils/format-date-time";

interface WorkDetailFormProps {
  item: WorkItemViewModel;
  completionPercentage: number | null;
  remarks: string;
  selectedTransition: WorkTransitionKey | null;
  evidenceCount: number;
  onCompletionChange: (value: number) => void;
  onTransitionSelect: (value: WorkTransitionKey) => void;
  onEvidencePress: () => void;
  onRemarksPress: () => void;
  onHistoryPress: () => void;
}

function WorkDetailForm({
  item,
  completionPercentage,
  remarks,
  selectedTransition,
  evidenceCount,
  onCompletionChange,
  onTransitionSelect,
  onEvidencePress,
  onRemarksPress,
  onHistoryPress,
}: WorkDetailFormProps): ReactElement {
  const sliderValue = Math.min(100, Math.max(0, completionPercentage ?? 0));

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.summaryTop}>
          <Text style={styles.requestNumber}>{item.requestNumber}</Text>
          <StatusBadge label={item.status.label} tone={item.status.tone} />
        </View>
        <Text numberOfLines={2} style={styles.itemName}>{item.workItem}</Text>
        <Text numberOfLines={1} style={styles.group}>{item.workGroup} · {item.workSubgroup}</Text>
        <View style={styles.summaryBottom}>
          <View style={styles.dueDate}>
            <Feather color={COLORS.inkMuted} name="calendar" size={15} />
            <Text style={styles.meta}>Target {formatDate(item.targetCompletion)}</Text>
          </View>
          <Pressable accessibilityLabel="View work history" accessibilityRole="button" onPress={onHistoryPress} style={styles.historyButton}>
            <Feather color={COLORS.accent} name="clock" size={15} />
            <Text style={styles.historyText}>History</Text>
          </Pressable>
        </View>
        {item.remarks ? <Text numberOfLines={1} style={styles.currentRemarks}>Current: {item.remarks}</Text> : null}
      </View>

      {item.availableTransitions.length > 0 ? (
        <View style={styles.editor}>
          <Text style={styles.label}>Status action</Text>
          <View style={styles.chips}>
            {item.availableTransitions.includes("start") ? (
              <WorkTransitionChip isSelected={selectedTransition === "start"} label="Started" onSelect={onTransitionSelect} transition="start" />
            ) : null}
            {item.availableTransitions.includes("hold") ? (
              <WorkTransitionChip isSelected={selectedTransition === "hold"} label="Hold" onSelect={onTransitionSelect} transition="hold" />
            ) : null}
            {item.availableTransitions.includes("complete") ? (
              <WorkTransitionChip isSelected={selectedTransition === "complete"} label="Completed" onSelect={onTransitionSelect} transition="complete" />
            ) : null}
          </View>

          <View style={styles.sliderHeading}>
            <Text style={styles.label}>Completion</Text>
            <Text accessibilityLiveRegion="polite" style={styles.percentage}>{sliderValue}%</Text>
          </View>
          <Slider
            accessibilityLabel="Completion percentage"
            maximumTrackTintColor={COLORS.border}
            maximumValue={100}
            minimumTrackTintColor={COLORS.accent}
            minimumValue={0}
            onValueChange={onCompletionChange}
            step={1}
            thumbTintColor={COLORS.accent}
            value={sliderValue}
          />

          <Pressable accessibilityLabel="Edit new remarks" accessibilityRole="button" onPress={onRemarksPress} style={({ pressed }) => [styles.detailButton, pressed && styles.pressed]}>
            <View style={styles.detailCopy}>
              <Text style={styles.label}>New remarks</Text>
              <Text numberOfLines={1} style={styles.detailValue}>{remarks.trim() || "—"}</Text>
            </View>
            <Feather color={COLORS.accent} name="edit-2" size={18} />
          </Pressable>
          <Pressable accessibilityLabel={`Open evidence, ${evidenceCount} attachments`} accessibilityRole="button" onPress={onEvidencePress} style={({ pressed }) => [styles.evidenceButton, pressed && styles.pressed]}>
            <Feather color={COLORS.accent} name="paperclip" size={18} />
            <Text style={styles.evidenceLabel}>Evidence</Text>
            <Text style={styles.evidenceCount}>{evidenceCount}</Text>
            <Feather color={COLORS.inkMuted} name="chevron-right" size={18} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default memo(WorkDetailForm);

const styles = StyleSheet.create({
  container: { gap: SPACING.medium, padding: SPACING.large },
  summary: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADII.large, borderWidth: 1, gap: SPACING.small, padding: SPACING.large },
  summaryTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  requestNumber: { color: COLORS.accent, ...TYPOGRAPHY.caption, fontWeight: "800" },
  itemName: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle, fontWeight: "800" },
  group: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  summaryBottom: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  dueDate: { alignItems: "center", flexDirection: "row", gap: SPACING.extraSmall },
  meta: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  historyButton: { alignItems: "center", flexDirection: "row", gap: SPACING.extraSmall, minHeight: MINIMUM_TOUCH_SIZE },
  historyText: { color: COLORS.accent, ...TYPOGRAPHY.caption, fontWeight: "700" },
  currentRemarks: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  editor: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADII.large, borderWidth: 1, gap: SPACING.small, padding: SPACING.large },
  label: { color: COLORS.ink, ...TYPOGRAPHY.body, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.small },
  sliderHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: SPACING.extraSmall },
  percentage: { color: COLORS.accent, ...TYPOGRAPHY.control, fontVariant: ["tabular-nums"], fontWeight: "800" },
  detailButton: { alignItems: "center", borderColor: COLORS.border, borderRadius: RADII.medium, borderWidth: 1, flexDirection: "row", minHeight: 58, paddingHorizontal: SPACING.medium },
  detailCopy: { flex: 1, gap: SPACING.extraSmall },
  detailValue: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  evidenceButton: { alignItems: "center", borderColor: COLORS.border, borderRadius: RADII.medium, borderWidth: 1, flexDirection: "row", gap: SPACING.small, minHeight: MINIMUM_TOUCH_SIZE, paddingHorizontal: SPACING.medium },
  evidenceLabel: { color: COLORS.ink, ...TYPOGRAPHY.body, flex: 1, fontWeight: "700" },
  evidenceCount: { color: COLORS.accent, ...TYPOGRAPHY.caption, fontWeight: "800" },
  pressed: { backgroundColor: COLORS.accentSoft },
});

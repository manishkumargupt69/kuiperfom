import { memo } from "react";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import SelectField from "@/src/components/ui/SelectField";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface IncidentReportFormProps {
  typeLabel: string;
  subtypeLabel: string;
  description: string;
  remarks: string;
  isSubtypeDisabled: boolean;
  evidenceCount: number;
  onTypePress: () => void;
  onSubtypePress: () => void;
  onDescriptionPress: () => void;
  onRemarksPress: () => void;
  onEvidencePress: () => void;
}

function IncidentReportForm({
  typeLabel,
  subtypeLabel,
  description,
  remarks,
  isSubtypeDisabled,
  evidenceCount,
  onTypePress,
  onSubtypePress,
  onDescriptionPress,
  onRemarksPress,
  onEvidencePress,
}: IncidentReportFormProps): ReactElement {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.sectionHeader}><Feather color={COLORS.accent} name="layers" size={18} /><Text style={styles.sectionTitle}>Classification</Text></View>
        <SelectField label="Incident type" onPress={onTypePress} placeholder="Select incident type" value={typeLabel} />
        <SelectField isDisabled={isSubtypeDisabled} label="Incident subtype" onPress={onSubtypePress} placeholder="Select incident subtype" value={subtypeLabel} />
      </View>
      <View style={styles.card}>
        <View style={styles.sectionHeader}><Feather color={COLORS.accent} name="edit-3" size={18} /><Text style={styles.sectionTitle}>Incident details</Text></View>
        <Pressable accessibilityLabel="Edit description" accessibilityRole="button" onPress={onDescriptionPress} style={({ pressed }) => [styles.detailButton, pressed && styles.pressed]}>
          <View style={styles.detailCopy}>
            <Text style={styles.label}>Description</Text>
            <Text numberOfLines={1} style={styles.detailValue}>{description.trim() || "—"}</Text>
          </View>
          <Feather color={COLORS.accent} name="edit-2" size={18} />
        </Pressable>
        <Pressable accessibilityLabel="Edit remarks" accessibilityRole="button" onPress={onRemarksPress} style={({ pressed }) => [styles.detailButton, pressed && styles.pressed]}>
          <View style={styles.detailCopy}>
            <Text style={styles.label}>Remarks</Text>
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
    </View>
  );
}

export default memo(IncidentReportForm);

const styles = StyleSheet.create({
  container: { gap: SPACING.large, padding: SPACING.large },
  card: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADII.large, borderWidth: 1, gap: SPACING.large, padding: SPACING.large },
  sectionHeader: { alignItems: "center", flexDirection: "row", gap: SPACING.small },
  sectionTitle: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "800" },
  label: { color: COLORS.ink, ...TYPOGRAPHY.body, fontWeight: "700" },
  detailButton: { alignItems: "center", borderColor: COLORS.border, borderRadius: RADII.medium, borderWidth: 1, flexDirection: "row", minHeight: 58, paddingHorizontal: SPACING.medium },
  detailCopy: { flex: 1, gap: SPACING.extraSmall },
  detailValue: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  evidenceButton: { alignItems: "center", borderColor: COLORS.border, borderRadius: RADII.medium, borderWidth: 1, flexDirection: "row", gap: SPACING.small, minHeight: 52, paddingHorizontal: SPACING.medium },
  evidenceLabel: { color: COLORS.ink, ...TYPOGRAPHY.body, flex: 1, fontWeight: "700" },
  evidenceCount: { color: COLORS.accent, ...TYPOGRAPHY.caption, fontWeight: "800" },
  pressed: { backgroundColor: COLORS.accentSoft },
});

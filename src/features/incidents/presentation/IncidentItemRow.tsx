import { memo } from "react";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import StatusBadge from "@/src/components/ui/StatusBadge";
import type { IncidentViewModel } from "@/src/features/incidents/domain/incident.types";
import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface IncidentItemRowProps { incident: IncidentViewModel; onPress: (incident: IncidentViewModel) => void; }

function IncidentItemRow({ incident, onPress }: IncidentItemRowProps): ReactElement {
  const handlePress = (): void => onPress(incident);
  const classification = [incident.type, incident.subtype].filter(Boolean).join(" / ");
  return (
    <Pressable accessibilityHint="Opens incident details" accessibilityLabel={`${incident.incidentNumber}, ${incident.type}, status ${incident.status.label}`} accessibilityRole="button" onPress={handlePress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.topLine}><Text style={styles.number}>{incident.incidentNumber}</Text><StatusBadge label={incident.status.label} tone={incident.status.tone} /></View>
      <Text style={styles.title}>{classification}</Text>
      <Text numberOfLines={2} style={styles.description}>{incident.description}</Text>
      {incident.remarks ? <Text numberOfLines={1} style={styles.remarks}>{incident.remarks}</Text> : null}
      {incident.attachments.length > 0 ? <Text style={styles.evidence}>{incident.attachments.length} evidence attachment{incident.attachments.length === 1 ? "" : "s"}</Text> : null}
    </Pressable>
  );
}

export default memo(IncidentItemRow);

const styles = StyleSheet.create({
  container: { borderBottomColor: COLORS.border, borderBottomWidth: 1, gap: SPACING.small, minHeight: 104, paddingVertical: SPACING.large },
  pressed: { backgroundColor: COLORS.surfaceMuted },
  topLine: { alignItems: "center", flexDirection: "row", gap: SPACING.medium, justifyContent: "space-between" },
  number: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, fontWeight: "600" },
  title: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "600" },
  description: { color: COLORS.inkMuted, ...TYPOGRAPHY.body },
  remarks: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  evidence: { color: COLORS.accent, ...TYPOGRAPHY.caption, fontWeight: "600" },
});

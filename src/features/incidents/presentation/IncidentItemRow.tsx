import { memo } from "react";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import StatusBadge from "@/src/components/ui/StatusBadge";
import type { IncidentViewModel } from "@/src/features/incidents/domain/incident.types";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface IncidentItemRowProps { incident: IncidentViewModel; onPress: (incident: IncidentViewModel) => void; }

function IncidentItemRow({ incident, onPress }: IncidentItemRowProps): ReactElement {
  const handlePress = (): void => onPress(incident);
  const classification = [incident.type, incident.subtype].filter(Boolean).join(" / ");
  return (
    <Pressable accessibilityHint="Opens incident details" accessibilityLabel={`${incident.incidentNumber}, ${incident.title}, status ${incident.status.label}`} accessibilityRole="button" onPress={handlePress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.topLine}><Text style={styles.number}>{incident.incidentNumber}</Text><StatusBadge label={incident.status.label} tone={incident.status.tone} /></View>
      <Text style={styles.title}>{incident.title}</Text>
      <View style={styles.classificationRow}><Feather color={COLORS.accent} name="alert-circle" size={16} /><Text style={styles.classification}>{classification}</Text></View>
      <Text numberOfLines={2} style={styles.description}>{incident.description}</Text>
      {incident.remarks ? <Text numberOfLines={1} style={styles.remarks}>{incident.remarks}</Text> : null}
      {incident.attachments.length > 0 ? <View style={styles.evidenceRow}><Feather color={COLORS.accent} name="paperclip" size={15} /><Text style={styles.evidence}>{incident.attachments.length} evidence attachment{incident.attachments.length === 1 ? "" : "s"}</Text></View> : null}
    </Pressable>
  );
}

export default memo(IncidentItemRow);

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADII.large, borderWidth: 1, elevation: 1, gap: SPACING.small, marginBottom: SPACING.medium, minHeight: 120, padding: SPACING.large, shadowColor: "#000000", shadowOffset: { height: 1, width: 0 }, shadowOpacity: 0.04, shadowRadius: 4 },
  pressed: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accent, opacity: 0.9 },
  topLine: { alignItems: "center", flexDirection: "row", gap: SPACING.medium, justifyContent: "space-between" },
  number: { color: COLORS.accent, ...TYPOGRAPHY.caption, fontWeight: "800", letterSpacing: 0.5 },
  title: { color: COLORS.ink, fontSize: 18, fontWeight: "700", lineHeight: 24 },
  classificationRow: { alignItems: "center", flexDirection: "row", gap: SPACING.small },
  classification: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  description: { color: COLORS.inkMuted, ...TYPOGRAPHY.body },
  remarks: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  evidence: { color: COLORS.accent, ...TYPOGRAPHY.caption, fontWeight: "600" },
  evidenceRow: { alignItems: "center", flexDirection: "row", gap: SPACING.small },
});

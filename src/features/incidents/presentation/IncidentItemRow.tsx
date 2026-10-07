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
    <Pressable accessibilityHint="Opens incident details" accessibilityLabel={`${incident.incidentNumber}, status ${incident.status.label}`} accessibilityRole="button" onPress={handlePress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.topLine}><Text numberOfLines={1} style={styles.title}>{incident.incidentNumber}</Text><StatusBadge label={incident.status.label} tone={incident.status.tone} /></View>
      <Text numberOfLines={2} style={styles.description}>{incident.description}</Text>
      {classification ? <Text numberOfLines={1} style={styles.classification}>{classification}</Text> : null}
      {incident.remarks ? <Text numberOfLines={1} style={styles.remarks}>{incident.remarks}</Text> : null}
      {incident.attachments.length > 0 ? <View style={styles.evidenceRow}><Feather color={COLORS.accent} name="paperclip" size={15} /><Text style={styles.evidence}>{incident.attachments.length} evidence attachment{incident.attachments.length === 1 ? "" : "s"}</Text></View> : null}
    </Pressable>
  );
}

export default memo(IncidentItemRow);

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADII.large, borderWidth: 1, gap: SPACING.medium, marginBottom: SPACING.medium, minHeight: 120, padding: SPACING.large },
  pressed: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accent, opacity: 0.9 },
  topLine: { alignItems: "center", flexDirection: "row", gap: SPACING.medium, justifyContent: "space-between" },
  title: { color: COLORS.ink, flex: 1, fontFamily: "IBMPlexSans_700Bold", fontSize: 18, lineHeight: 24 },
  classification: { color: COLORS.accent, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  description: { color: COLORS.ink, fontSize: 16, fontWeight: "500", lineHeight: 23 },
  remarks: { color: COLORS.inkMuted, fontSize: 13, lineHeight: 19 },
  evidence: { color: COLORS.accent, ...TYPOGRAPHY.caption, fontWeight: "600" },
  evidenceRow: { alignItems: "center", borderTopColor: COLORS.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: SPACING.small, paddingTop: SPACING.medium },
});

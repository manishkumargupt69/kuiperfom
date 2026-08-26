import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import StatusBadge from "@/src/components/ui/StatusBadge";
import EvidenceAttachmentList from "@/src/features/evidence/presentation/EvidenceAttachmentList";
import type { IncidentViewModel } from "@/src/features/incidents/domain/incident.types";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface IncidentDetailViewProps { incident: IncidentViewModel; }

export default function IncidentDetailView({ incident }: IncidentDetailViewProps): ReactElement {
  const classification = [incident.type, incident.subtype].filter(Boolean).join(" / ");
  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.topLine}><Text style={styles.number}>{incident.incidentNumber}</Text><StatusBadge label={incident.status.label} tone={incident.status.tone} /></View>
        <Text style={styles.title}>{incident.title}</Text>
        <View style={styles.metaRow}><Feather color={COLORS.accent} name="alert-circle" size={16} /><Text style={styles.meta}>{classification}</Text></View>
      </View>
      <View style={styles.card}>
        <View style={styles.sectionHeader}><Feather color={COLORS.accent} name="align-left" size={17} /><Text style={styles.sectionTitle}>Description</Text></View>
        <Text style={styles.body}>{incident.description}</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.sectionHeader}><Feather color={COLORS.accent} name="user" size={17} /><Text style={styles.sectionTitle}>Assigned to</Text></View>
        <Text style={styles.body}>{incident.assignedToName}</Text>
      </View>
      {incident.remarks ? <View style={styles.card}><View style={styles.sectionHeader}><Feather color={COLORS.accent} name="message-square" size={17} /><Text style={styles.sectionTitle}>Remarks</Text></View><Text style={styles.body}>{incident.remarks}</Text></View> : null}
      <View style={styles.card}>
        <View style={styles.sectionHeader}><Feather color={COLORS.accent} name="paperclip" size={17} /><Text style={styles.sectionTitle}>Evidence</Text></View>
        <EvidenceAttachmentList attachments={incident.attachments} />
      </View>
      <View style={styles.card}>
        <View style={styles.sectionHeader}><Feather color={COLORS.accent} name="clock" size={17} /><Text style={styles.sectionTitle}>Incident history</Text></View>
        <Text style={styles.muted}>Current status: {incident.status.label}.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.large, padding: SPACING.large },
  summary: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADII.large, borderWidth: 1, gap: SPACING.medium, padding: SPACING.large },
  topLine: { alignItems: "center", flexDirection: "row", gap: SPACING.medium, justifyContent: "space-between" },
  number: { color: COLORS.accent, ...TYPOGRAPHY.caption, fontWeight: "800", letterSpacing: 0.5 },
  title: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle, fontWeight: "800" },
  metaRow: { alignItems: "center", flexDirection: "row", gap: SPACING.small },
  meta: { color: COLORS.inkMuted, ...TYPOGRAPHY.body, flex: 1 },
  card: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADII.large, borderWidth: 1, gap: SPACING.small, padding: SPACING.large },
  sectionHeader: { alignItems: "center", flexDirection: "row", gap: SPACING.small },
  sectionTitle: { color: COLORS.ink, ...TYPOGRAPHY.body, fontWeight: "700" },
  body: { color: COLORS.ink, ...TYPOGRAPHY.body },
  muted: { color: COLORS.inkMuted, ...TYPOGRAPHY.body },
});

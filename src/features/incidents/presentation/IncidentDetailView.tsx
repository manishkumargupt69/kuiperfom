import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

import StatusBadge from "@/src/components/ui/StatusBadge";
import EvidenceAttachmentList from "@/src/features/evidence/presentation/EvidenceAttachmentList";
import type { IncidentViewModel } from "@/src/features/incidents/domain/incident.types";
import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface IncidentDetailViewProps { incident: IncidentViewModel; }

export default function IncidentDetailView({ incident }: IncidentDetailViewProps): ReactElement {
  const classification = [incident.type, incident.subtype].filter(Boolean).join(" / ");
  return <View style={styles.container}><View style={styles.summary}><View style={styles.topLine}><Text style={styles.number}>{incident.incidentNumber}</Text><StatusBadge label={incident.status.label} tone={incident.status.tone} /></View><Text style={styles.title}>{classification}</Text></View><View style={styles.section}><Text style={styles.sectionTitle}>Incident</Text><Text style={styles.body}>{incident.description}</Text></View>{incident.remarks ? <View style={styles.section}><Text style={styles.sectionTitle}>Remarks</Text><Text style={styles.body}>{incident.remarks}</Text></View> : null}<View style={styles.section}><Text style={styles.sectionTitle}>Evidence</Text><EvidenceAttachmentList attachments={incident.attachments} /></View><View style={styles.section}><Text style={styles.sectionTitle}>Incident History</Text><Text style={styles.muted}>Reported with status Pending.</Text></View></View>;
}

const styles = StyleSheet.create({ container: { gap: SPACING.extraLarge, padding: SPACING.extraLarge }, summary: { borderBottomColor: COLORS.border, borderBottomWidth: 1, gap: SPACING.medium, paddingBottom: SPACING.large }, topLine: { alignItems: "center", flexDirection: "row", gap: SPACING.medium, justifyContent: "space-between" }, number: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, fontWeight: "600" }, title: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle, fontWeight: "700" }, section: { gap: SPACING.small }, sectionTitle: { color: COLORS.ink, ...TYPOGRAPHY.body, fontWeight: "700" }, body: { color: COLORS.ink, ...TYPOGRAPHY.body }, muted: { color: COLORS.inkMuted, ...TYPOGRAPHY.body } });

import { memo } from "react";
import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

import EvidenceAttachmentList from "@/src/features/evidence/presentation/EvidenceAttachmentList";
import type { WorkHistoryViewModel } from "@/src/features/work/domain/work.types";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { formatDateTime } from "@/src/utils/format-date-time";

interface WorkHistoryRowProps {
  entry: WorkHistoryViewModel;
}

function WorkHistoryRow({ entry }: WorkHistoryRowProps): ReactElement {
  return (
    <View style={styles.row}>
      <View style={styles.heading}>
        <Text style={styles.action}>{entry.action.replace(/_/g, " ")}</Text>
        <Text style={styles.date}>{formatDateTime(entry.actionAt)}</Text>
      </View>
      <Text style={styles.meta}>{entry.actionByName} · {entry.status} · {entry.progressPercent}% complete</Text>
      {entry.remarks ? <Text style={styles.remarks}>{entry.remarks}</Text> : null}
      {entry.attachments.length > 0 ? <EvidenceAttachmentList attachments={entry.attachments} showLocationUnavailable /> : null}
      {entry.audit ? (
        <View style={styles.audit}>
          <Text style={styles.auditTitle}>Audit · {entry.audit.auditedAt ? formatDateTime(entry.audit.auditedAt) : "Date unavailable"}</Text>
          {entry.audit.remarks ? <Text style={styles.remarks}>{entry.audit.remarks}</Text> : null}
          {entry.audit.attachments.length > 0 ? <EvidenceAttachmentList attachments={entry.audit.attachments} showLocationUnavailable /> : null}
        </View>
      ) : null}
    </View>
  );
}

export default memo(WorkHistoryRow);

const styles = StyleSheet.create({
  row: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADII.large, borderWidth: 1, gap: SPACING.small, marginBottom: SPACING.medium, padding: SPACING.large },
  heading: { alignItems: "flex-start", flexDirection: "row", gap: SPACING.small, justifyContent: "space-between" },
  action: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "800", textTransform: "capitalize" },
  date: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, flexShrink: 1, textAlign: "right" },
  meta: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  remarks: { color: COLORS.ink, ...TYPOGRAPHY.body },
  audit: { borderTopColor: COLORS.border, borderTopWidth: StyleSheet.hairlineWidth, gap: SPACING.small, paddingTop: SPACING.medium },
  auditTitle: { color: COLORS.accent, ...TYPOGRAPHY.control, fontWeight: "700" },
});

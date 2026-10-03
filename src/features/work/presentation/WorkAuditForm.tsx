import { memo } from "react";
import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

import FormField from "@/src/components/ui/FormField";
import MediaAttachmentTray from "@/src/components/ui/MediaAttachmentTray";
import type { DashboardWorkItemViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import ProjectSummaryRow from "@/src/features/dashboard/presentation/ProjectSummaryRow";
import ProjectWorkItemRow from "@/src/features/dashboard/presentation/ProjectWorkItemRow";
import type { EvidenceAttachment } from "@/src/types/evidence";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface WorkAuditFormProps {
  projectName: string;
  city: string;
  startDate: string;
  item: DashboardWorkItemViewModel;
  remarks: string;
  attachments: readonly EvidenceAttachment[];
  onRemarksChange: (value: string) => void;
  onAddPhoto: () => void;
  onAddDocument: () => void;
  onRemoveAttachment: (id: string) => void;
}

function WorkAuditForm({ projectName, city, startDate, item, remarks, attachments, onRemarksChange, onAddPhoto, onAddDocument, onRemoveAttachment }: WorkAuditFormProps): ReactElement {
  return (
    <View style={styles.container}>
      <ProjectSummaryRow city={city} projectName={projectName} startDate={startDate} />
      <ProjectWorkItemRow workItem={item} />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audit details</Text>
        <FormField isMultiline label="Audit remarks" onChangeText={onRemarksChange} placeholder="Enter audit remarks" value={remarks} />
      </View>
      <View style={styles.section}>
        <MediaAttachmentTray attachments={attachments} onAddDocument={onAddDocument} onAddPhoto={onAddPhoto} onRemove={onRemoveAttachment} title="Audit evidence" />
        <Text style={styles.locationNote}>Accepted: camera photos, PDF, Word, and Excel. Photo location is unavailable.</Text>
      </View>
    </View>
  );
}

export default memo(WorkAuditForm);

const styles = StyleSheet.create({
  container: { gap: SPACING.medium },
  section: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADII.large, borderWidth: 1, gap: SPACING.medium, padding: SPACING.large },
  sectionTitle: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "800" },
  locationNote: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
});

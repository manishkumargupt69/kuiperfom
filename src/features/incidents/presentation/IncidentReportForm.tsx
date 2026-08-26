import { memo } from "react";
import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import FormField from "@/src/components/ui/FormField";
import MediaAttachmentTray from "@/src/components/ui/MediaAttachmentTray";
import SelectField from "@/src/components/ui/SelectField";
import type { EvidenceAttachment } from "@/src/types/evidence";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface IncidentReportFormProps {
  typeLabel: string;
  subtypeLabel: string;
  title: string;
  description: string;
  assigneeLabel: string;
  remarks: string;
  isSubtypeDisabled: boolean;
  attachments: readonly EvidenceAttachment[];
  isRecording: boolean;
  recordingDurationMilliseconds: number;
  onTypePress: () => void;
  onSubtypePress: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAssigneePress: () => void;
  onRemarksChange: (value: string) => void;
  onAddDocument: () => void;
  onAddFromGallery: () => void;
  onAddPhoto: () => void;
  onAddVideo: () => void;
  onRecordVoice: () => void;
  onRemoveAttachment: (id: string) => void;
}

function IncidentReportForm({
  typeLabel,
  subtypeLabel,
  title,
  description,
  assigneeLabel,
  remarks,
  isSubtypeDisabled,
  attachments,
  isRecording,
  recordingDurationMilliseconds,
  onTypePress,
  onSubtypePress,
  onTitleChange,
  onDescriptionChange,
  onAssigneePress,
  onRemarksChange,
  onAddDocument,
  onAddFromGallery,
  onAddPhoto,
  onAddVideo,
  onRecordVoice,
  onRemoveAttachment,
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
        <FormField label="Incident title" onChangeText={onTitleChange} placeholder="Enter incident title" textCapitalization="sentences" value={title} />
        <FormField isMultiline label="Description" onChangeText={onDescriptionChange} placeholder="Describe the incident" textCapitalization="sentences" value={description} />
        <SelectField label="Assigned to" onPress={onAssigneePress} placeholder="Select assignee" value={assigneeLabel} />
        <FormField isMultiline label="Remarks" onChangeText={onRemarksChange} placeholder="Enter remarks" textCapitalization="sentences" value={remarks} />
      </View>
      <View style={styles.card}>
        <MediaAttachmentTray attachments={attachments} isRecording={isRecording} onAddDocument={onAddDocument} onAddFromGallery={onAddFromGallery} onAddPhoto={onAddPhoto} onAddVideo={onAddVideo} onRecordVoice={onRecordVoice} onRemove={onRemoveAttachment} recordingDurationMilliseconds={recordingDurationMilliseconds} />
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
});

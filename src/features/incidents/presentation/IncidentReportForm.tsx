import { memo } from "react";
import type { ReactElement } from "react";
import { StyleSheet, View } from "react-native";

import FormField from "@/src/components/ui/FormField";
import MediaAttachmentTray from "@/src/components/ui/MediaAttachmentTray";
import SelectField from "@/src/components/ui/SelectField";
import type { EvidenceAttachment } from "@/src/types/evidence";
import { SPACING } from "@/src/theme/tokens";

interface IncidentReportFormProps { typeLabel: string; subtypeLabel: string; description: string; remarks: string; isSubtypeDisabled: boolean; attachments: readonly EvidenceAttachment[]; isRecording: boolean; recordingDurationMilliseconds: number; onTypePress: () => void; onSubtypePress: () => void; onDescriptionChange: (value: string) => void; onRemarksChange: (value: string) => void; onAddDocument: () => void; onAddPhoto: () => void; onAddVideo: () => void; onRecordVoice: () => void; onRemoveAttachment: (id: string) => void; }

function IncidentReportForm({ typeLabel, subtypeLabel, description, remarks, isSubtypeDisabled, attachments, isRecording, recordingDurationMilliseconds, onTypePress, onSubtypePress, onDescriptionChange, onRemarksChange, onAddDocument, onAddPhoto, onAddVideo, onRecordVoice, onRemoveAttachment }: IncidentReportFormProps): ReactElement {
  return <View style={styles.container}><SelectField label="Incident Type" onPress={onTypePress} placeholder="Select incident type" value={typeLabel} /><SelectField isDisabled={isSubtypeDisabled} label="Incident Subtype" onPress={onSubtypePress} placeholder="Select incident subtype" value={subtypeLabel} /><FormField isMultiline label="Incident" onChangeText={onDescriptionChange} placeholder="Describe the incident" textCapitalization="sentences" value={description} /><FormField isMultiline label="Remarks" onChangeText={onRemarksChange} placeholder="Enter remarks" textCapitalization="sentences" value={remarks} /><MediaAttachmentTray attachments={attachments} isRecording={isRecording} onAddDocument={onAddDocument} onAddPhoto={onAddPhoto} onAddVideo={onAddVideo} onRecordVoice={onRecordVoice} onRemove={onRemoveAttachment} recordingDurationMilliseconds={recordingDurationMilliseconds} /></View>;
}

export default memo(IncidentReportForm);
const styles = StyleSheet.create({ container: { gap: SPACING.extraLarge, padding: SPACING.extraLarge } });

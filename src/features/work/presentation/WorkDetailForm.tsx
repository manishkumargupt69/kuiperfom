import { memo } from "react";
import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

import FormField from "@/src/components/ui/FormField";
import MediaAttachmentTray from "@/src/components/ui/MediaAttachmentTray";
import SecondaryButton from "@/src/components/ui/SecondaryButton";
import type { WorkItemViewModel, WorkTransitionKey } from "@/src/features/work/domain/work.types";
import type { EvidenceAttachment } from "@/src/types/evidence";
import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface WorkDetailFormProps { item: WorkItemViewModel; completionPercentage: string; remarks: string; selectedTransition: WorkTransitionKey | null; attachments: readonly EvidenceAttachment[]; isRecording: boolean; recordingDurationMilliseconds: number; onCompletionChange: (value: string) => void; onRemarksChange: (value: string) => void; onTransitionSelect: (value: WorkTransitionKey) => void; onAddDocument: () => void; onAddPhoto: () => void; onAddVideo: () => void; onRecordVoice: () => void; onRemoveAttachment: (id: string) => void; }

function WorkDetailForm({ item, completionPercentage, remarks, selectedTransition, attachments, isRecording, recordingDurationMilliseconds, onCompletionChange, onRemarksChange, onTransitionSelect, onAddDocument, onAddPhoto, onAddVideo, onRecordVoice, onRemoveAttachment }: WorkDetailFormProps): ReactElement {
  const selectStart = (): void => onTransitionSelect("start");
  const selectHold = (): void => onTransitionSelect("hold");
  const selectComplete = (): void => onTransitionSelect("complete");
  return (
    <View style={styles.container}>
      <View style={styles.summary}><Text style={styles.number}>{item.requestNumber}</Text><Text style={styles.title}>{item.workItem}</Text><Text style={styles.meta}>{item.workGroup} / {item.workSubgroup}</Text><Text style={styles.meta}>Target: {item.targetCompletion}</Text></View>
      <View style={styles.section}><Text style={styles.sectionTitle}>Status action</Text><View style={styles.actions}><SecondaryButton isDisabled={!item.availableTransitions.includes("start")} isSelected={selectedTransition === "start"} label="Mark Started" onPress={selectStart} /><SecondaryButton isDisabled={!item.availableTransitions.includes("hold")} isSelected={selectedTransition === "hold"} label="Mark Hold" onPress={selectHold} /><SecondaryButton isDisabled={!item.availableTransitions.includes("complete")} isSelected={selectedTransition === "complete"} label="Mark Completed" onPress={selectComplete} /></View></View>
      <FormField keyboardType="number-pad" label="Completion Percentage" maxLength={3} onChangeText={onCompletionChange} placeholder="Enter percentage" value={completionPercentage} />
      <FormField isMultiline label="Remarks" onChangeText={onRemarksChange} placeholder="Enter remarks" textCapitalization="sentences" value={remarks} />
      <MediaAttachmentTray attachments={attachments} isRecording={isRecording} onAddDocument={onAddDocument} onAddPhoto={onAddPhoto} onAddVideo={onAddVideo} onRecordVoice={onRecordVoice} onRemove={onRemoveAttachment} recordingDurationMilliseconds={recordingDurationMilliseconds} />
    </View>
  );
}

export default memo(WorkDetailForm);

const styles = StyleSheet.create({
  container: { gap: SPACING.extraLarge, padding: SPACING.extraLarge },
  summary: { borderBottomColor: COLORS.border, borderBottomWidth: 1, gap: SPACING.small, paddingBottom: SPACING.large },
  number: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, fontWeight: "600" },
  title: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle, fontWeight: "700" },
  meta: { color: COLORS.inkMuted, ...TYPOGRAPHY.body },
  section: { gap: SPACING.medium },
  sectionTitle: { color: COLORS.ink, ...TYPOGRAPHY.body, fontWeight: "700" },
  actions: { gap: SPACING.small },
});

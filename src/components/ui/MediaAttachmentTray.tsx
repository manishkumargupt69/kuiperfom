import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

import SecondaryButton from "@/src/components/ui/SecondaryButton";
import EvidenceAttachmentList from "@/src/features/evidence/presentation/EvidenceAttachmentList";
import type { EvidenceAttachment } from "@/src/types/evidence";
import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface MediaAttachmentTrayProps {
  attachments: readonly EvidenceAttachment[];
  isRecording: boolean;
  recordingDurationMilliseconds: number;
  onAddDocument: () => void;
  onAddPhoto: () => void;
  onAddVideo: () => void;
  onRecordVoice: () => void;
  onRemove: (id: string) => void;
}

const formatRecordingDuration = (durationMilliseconds: number): string => {
  const seconds = Math.floor(durationMilliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

export default function MediaAttachmentTray({ attachments, isRecording, recordingDurationMilliseconds, onAddDocument, onAddPhoto, onAddVideo, onRecordVoice, onRemove }: MediaAttachmentTrayProps): ReactElement {
  const voiceLabel = isRecording ? `Stop Recording (${formatRecordingDuration(recordingDurationMilliseconds)})` : "Record Voice Note";
  return <View style={styles.container}><Text style={styles.title}>Evidence</Text><EvidenceAttachmentList attachments={attachments} onRemove={onRemove} /><View style={styles.actions}><SecondaryButton isDisabled={isRecording} label="Add File" onPress={onAddDocument} /><SecondaryButton isDisabled={isRecording} label="Add Photo" onPress={onAddPhoto} /><SecondaryButton isDisabled={isRecording} label="Add Video" onPress={onAddVideo} /><SecondaryButton isSelected={isRecording} label={voiceLabel} onPress={onRecordVoice} /></View></View>;
}

const styles = StyleSheet.create({ container: { gap: SPACING.medium }, title: { color: COLORS.ink, ...TYPOGRAPHY.body, fontWeight: "700" }, actions: { gap: SPACING.small } });

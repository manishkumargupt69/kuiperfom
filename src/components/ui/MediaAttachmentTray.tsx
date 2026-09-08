import { useCallback } from "react";
import type { ReactElement } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import SecondaryButton from "@/src/components/ui/SecondaryButton";
import EvidenceAttachmentList from "@/src/features/evidence/presentation/EvidenceAttachmentList";
import type { EvidenceAttachment } from "@/src/types/evidence";
import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { runAfterKeyboardDismissed } from "@/src/utils/run-after-keyboard-dismissed";

interface MediaAttachmentTrayProps {
  title?: string;
  attachments: readonly EvidenceAttachment[];
  isRecording: boolean;
  recordingDurationMilliseconds: number;
  onAddDocument: () => void;
  onAddFromGallery: () => void;
  onAddPhoto: () => void;
  onAddVideo?: () => void;
  onRecordVoice?: () => void;
  onRemove: (id: string) => void;
}

const formatRecordingDuration = (durationMilliseconds: number): string => {
  const seconds = Math.floor(durationMilliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

export default function MediaAttachmentTray({ title = "Evidence", attachments, isRecording, recordingDurationMilliseconds, onAddDocument, onAddFromGallery, onAddPhoto, onAddVideo, onRecordVoice, onRemove }: MediaAttachmentTrayProps): ReactElement {
  const voiceLabel = isRecording ? `Stop Recording (${formatRecordingDuration(recordingDurationMilliseconds)})` : "Record Voice Note";
  const handleAddDocument = useCallback((): void => runAfterKeyboardDismissed(onAddDocument), [onAddDocument]);
  const handleOpenCamera = useCallback((): void => {
    runAfterKeyboardDismissed((): void => {
      const options: import("react-native").AlertButton[] = [{ text: "Take photo", onPress: onAddPhoto }];
      if (onAddVideo) {
        options.push({ text: "Record video", onPress: onAddVideo });
      }
      options.push({ text: "Cancel", style: "cancel" });
      Alert.alert("Capture evidence", "Choose what to capture.", options);
    });
  }, [onAddPhoto, onAddVideo]);
  const handleAddFromGallery = useCallback((): void => runAfterKeyboardDismissed(onAddFromGallery), [onAddFromGallery]);
  const handleRecordVoice = useCallback((): void => { if (onRecordVoice) runAfterKeyboardDismissed(onRecordVoice); }, [onRecordVoice]);
  return <View style={styles.container}><View><Text style={styles.title}>{title}</Text><Text style={styles.supportingText}>Capture or attach photos, {onAddVideo ? "video, " : ""}documents{onRecordVoice ? ", and voice notes" : ""}.</Text></View><EvidenceAttachmentList attachments={attachments} onRemove={onRemove} /><View style={styles.actions}><SecondaryButton iconName="camera" isDisabled={isRecording} label="Camera" onPress={handleOpenCamera} style={styles.action} /><SecondaryButton iconName="image" isDisabled={isRecording} label="Gallery" onPress={handleAddFromGallery} style={styles.action} /><SecondaryButton iconName="file-text" isDisabled={isRecording} label="File" onPress={handleAddDocument} style={styles.action} />{onRecordVoice ? <SecondaryButton iconName="mic" isSelected={isRecording} label={voiceLabel} onPress={handleRecordVoice} style={styles.action} /> : null}</View></View>;
}

const styles = StyleSheet.create({ container: { gap: SPACING.medium }, title: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "700" }, supportingText: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, marginTop: SPACING.extraSmall }, actions: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.small }, action: { flexBasis: "48%", flexGrow: 1, paddingHorizontal: SPACING.medium } });

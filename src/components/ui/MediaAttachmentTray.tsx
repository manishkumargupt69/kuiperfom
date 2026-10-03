import { useCallback } from "react";
import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

import SecondaryButton from "@/src/components/ui/SecondaryButton";
import EvidenceAttachmentList from "@/src/features/evidence/presentation/EvidenceAttachmentList";
import type { EvidenceAttachment } from "@/src/types/evidence";
import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { runAfterKeyboardDismissed } from "@/src/utils/run-after-keyboard-dismissed";

interface MediaAttachmentTrayProps {
  title?: string;
  attachments: readonly EvidenceAttachment[];
  onAddDocument?: () => void;
  onAddFromGallery?: () => void;
  onAddPhoto: () => void;
  onRemove: (id: string) => void;
}

export default function MediaAttachmentTray({ title = "Evidence", attachments, onAddDocument, onAddFromGallery, onAddPhoto, onRemove }: MediaAttachmentTrayProps): ReactElement {
  const supportingText = "Attach photos, PDF, Word, or Excel files.";
  const handleAddDocument = useCallback((): void => { if (onAddDocument) runAfterKeyboardDismissed(onAddDocument); }, [onAddDocument]);
  const handleOpenCamera = useCallback((): void => runAfterKeyboardDismissed(onAddPhoto), [onAddPhoto]);
  const handleAddFromGallery = useCallback((): void => { if (onAddFromGallery) runAfterKeyboardDismissed(onAddFromGallery); }, [onAddFromGallery]);
  return <View style={styles.container}><View><Text style={styles.title}>{title}</Text><Text style={styles.supportingText}>{supportingText}</Text></View><EvidenceAttachmentList attachments={attachments} onRemove={onRemove} /><View style={styles.actions}><SecondaryButton iconName="camera" label="Camera" onPress={handleOpenCamera} style={styles.action} />{onAddFromGallery ? <SecondaryButton iconName="image" label="Gallery" onPress={handleAddFromGallery} style={styles.action} /> : null}{onAddDocument ? <SecondaryButton iconName="file-text" label="File" onPress={handleAddDocument} style={styles.action} /> : null}</View></View>;
}

const styles = StyleSheet.create({ container: { gap: SPACING.medium }, title: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "700" }, supportingText: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, marginTop: SPACING.extraSmall }, actions: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.small }, action: { flexBasis: "48%", flexGrow: 1, paddingHorizontal: SPACING.medium } });

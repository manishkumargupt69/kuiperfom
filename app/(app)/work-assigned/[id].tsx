import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import DetailHeader from "@/src/components/ui/DetailHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import FormField from "@/src/components/ui/FormField";
import MediaAttachmentTray from "@/src/components/ui/MediaAttachmentTray";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import EvidenceAttachmentList from "@/src/features/evidence/presentation/EvidenceAttachmentList";
import { useWorkEditor } from "@/src/features/work/hooks/use-work-editor";
import WorkDetailForm from "@/src/features/work/presentation/WorkDetailForm";
import { useUnsavedChanges } from "@/src/hooks/use-unsaved-changes";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { showSuccessMessage } from "@/src/utils/show-success-message";

const getSaveErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Try again.";
type WorkDetailParams = { id?: string };

export default function WorkDetailScreen(): ReactElement {
  const { id = "" } = useLocalSearchParams<WorkDetailParams>();
  const [isEvidenceVisible, setIsEvidenceVisible] = useState(false);
  const [isRemarksVisible, setIsRemarksVisible] = useState(false);
  const {
    editorState,
    isSaving,
    reload,
    save,
    selectTransition,
    setCompletionPercentage,
    setRemarks,
    viewState,
    attachments,
    addDocument,
    addFromGallery,
    addPhoto,
    removeAttachment,
  } = useWorkEditor(id);
  const originalCompletion = viewState.status === "success" ? viewState.data.completionPercentage : null;
  const isDirty = editorState.isHydrated && (editorState.completionPercentage !== originalCompletion
    || Boolean(editorState.remarks.length || editorState.transition || attachments.length));
  const allowNavigation = useUnsavedChanges(isDirty);
  const handleBack = useCallback((): void => router.back(), []);
  const openEvidence = useCallback((): void => setIsEvidenceVisible(true), []);
  const closeEvidence = useCallback((): void => setIsEvidenceVisible(false), []);
  const openRemarks = useCallback((): void => setIsRemarksVisible(true), []);
  const closeRemarks = useCallback((): void => setIsRemarksVisible(false), []);
  const openHistory = useCallback((): void => {
    router.push({ pathname: "/(app)/work-assigned/[id]/history", params: { id } });
  }, [id]);
  const handleRetry = useCallback((): void => {
    void reload();
  }, [reload]);
  const handleSave = useCallback(async (): Promise<void> => {
    try {
      await save();
      allowNavigation();
      showSuccessMessage("Work update saved");
      router.back();
    } catch (error: unknown) {
      Alert.alert("Unable to save update", getSaveErrorMessage(error));
    }
  }, [allowNavigation, save]);

  return (
    <ScreenContainer>
      <DetailHeader onBack={handleBack} title="Update Work Record" />
      {viewState.status === "success" ? (
        <View style={styles.body}>
          <WorkDetailForm
            completionPercentage={editorState.completionPercentage}
            evidenceCount={viewState.data.attachments.length + attachments.length}
            item={viewState.data}
            onCompletionChange={setCompletionPercentage}
            onEvidencePress={openEvidence}
            onHistoryPress={openHistory}
            onRemarksPress={openRemarks}
            onTransitionSelect={selectTransition}
            remarks={editorState.remarks}
            selectedTransition={editorState.transition}
          />
        </View>
      ) : (
        <AsyncStateView
          emptyMessage="The requested work record is unavailable."
          message={viewState.status === "error" ? viewState.message : undefined}
          onRetry={handleRetry}
          status={viewState.status}
          variant="detail"
        />
      )}
      {viewState.status === "success" ? (
        <View style={styles.footer}>
          {viewState.data.availableTransitions.length > 0 ? (
            <PrimaryButton
              isLoading={isSaving}
              label="Submit Update"
              onPress={handleSave}
            />
          ) : null}
        </View>
      ) : null}
      <BottomSheetModal accessibilityLabel="Close remarks editor" isVisible={isRemarksVisible} onClose={closeRemarks} title="New remarks">
        <View style={styles.remarksSheet}>
          <FormField isMultiline label="New remarks" onChangeText={setRemarks} placeholder="Enter remarks" textCapitalization="sentences" value={editorState.remarks} />
          <PrimaryButton label="Done" onPress={closeRemarks} />
        </View>
      </BottomSheetModal>
      <BottomSheetModal accessibilityLabel="Close evidence" isVisible={isEvidenceVisible} onClose={closeEvidence} title="Evidence">
        <View style={styles.evidenceSheet}>
          {viewState.status === "success" && viewState.data.attachments.length > 0 ? (
            <View style={styles.existingEvidence}>
              <Text style={styles.sheetLabel}>Existing evidence</Text>
              <EvidenceAttachmentList attachments={viewState.data.attachments} />
            </View>
          ) : null}
          <MediaAttachmentTray attachments={attachments} onAddDocument={addDocument} onAddFromGallery={addFromGallery} onAddPhoto={addPhoto} onRemove={removeAttachment} title="Add evidence" />
        </View>
      </BottomSheetModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  footer: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: SCREEN_HORIZONTAL_PADDING,
  },
  remarksSheet: { gap: SPACING.large, padding: SCREEN_HORIZONTAL_PADDING },
  evidenceSheet: { gap: SPACING.large, padding: SCREEN_HORIZONTAL_PADDING },
  existingEvidence: { gap: SPACING.small },
  sheetLabel: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "700" },
});

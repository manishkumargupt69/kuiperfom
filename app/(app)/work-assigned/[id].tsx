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
import EvidenceCameraModal from "@/src/features/evidence/presentation/EvidenceCameraModal";
import EvidenceAttachmentList from "@/src/features/evidence/presentation/EvidenceAttachmentList";
import { useWorkEvidenceFlow } from "@/src/features/work/hooks/use-work-evidence-flow";
import WorkDetailForm from "@/src/features/work/presentation/WorkDetailForm";
import { useUnsavedChanges } from "@/src/hooks/use-unsaved-changes";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { showSuccessMessage } from "@/src/utils/show-success-message";

const getSaveErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Try again.";
type WorkDetailParams = { id?: string };

export default function WorkDetailScreen(): ReactElement {
  const { id = "" } = useLocalSearchParams<WorkDetailParams>();
  const [isRemarksVisible, setIsRemarksVisible] = useState(false);
  const evidenceFlow = useWorkEvidenceFlow(id);
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
    preparation,
    removeAttachment,
  } = evidenceFlow.editor;
  const originalCompletion = viewState.status === "success" ? viewState.data.completionPercentage : null;
  const isDirty = editorState.isHydrated && (editorState.completionPercentage !== originalCompletion
    || Boolean(editorState.remarks.length || editorState.transition || attachments.length || preparation));
  const allowNavigation = useUnsavedChanges(isDirty);
  const handleBack = useCallback((): void => router.back(), []);
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
            onEvidencePress={evidenceFlow.openEvidence}
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
            <>
              {preparation ? <Text accessibilityLiveRegion="polite" style={styles.footerStatus}>Preparing evidence before submit…</Text> : null}
              {isSaving && attachments.length > 0 ? <Text accessibilityLiveRegion="polite" style={styles.footerStatus}>Uploading evidence and saving update…</Text> : null}
              <PrimaryButton
                isDisabled={!isDirty || !editorState.transition || Boolean(preparation)}
                isLoading={isSaving}
                label="Submit Update"
                onPress={handleSave}
              />
            </>
          ) : null}
        </View>
      ) : null}
      <BottomSheetModal accessibilityLabel="Close remarks editor" isVisible={isRemarksVisible} onClose={closeRemarks} title="New remarks">
        <View style={styles.remarksSheet}>
          <FormField isMultiline label="New remarks" onChangeText={setRemarks} placeholder="Enter remarks" textCapitalization="sentences" value={editorState.remarks} />
          <PrimaryButton label="Done" onPress={closeRemarks} />
        </View>
      </BottomSheetModal>
      <BottomSheetModal accessibilityLabel="Close evidence" isVisible={evidenceFlow.isEvidenceVisible} onClose={evidenceFlow.closeEvidence} onDismiss={evidenceFlow.handleEvidenceDismiss} title="Evidence">
        <View style={styles.evidenceSheet}>
          {viewState.status === "success" && viewState.data.attachments.length > 0 ? (
            <View style={styles.existingEvidence}>
              <Text style={styles.sheetLabel}>Existing evidence</Text>
              <EvidenceAttachmentList attachments={viewState.data.attachments} hasBottomAction />
            </View>
          ) : null}
          <MediaAttachmentTray attachments={attachments} onAddDocument={evidenceFlow.chooseFile} onAddFromGallery={evidenceFlow.chooseGallery} onAddPhoto={evidenceFlow.chooseCamera} onRemove={removeAttachment} preparation={preparation} supportsVideo title="Add evidence" />
        </View>
      </BottomSheetModal>
      <EvidenceCameraModal isVisible={evidenceFlow.isCameraVisible} onCaptured={evidenceFlow.handleCameraCaptured} onClose={evidenceFlow.closeCamera} onDismiss={evidenceFlow.handleCameraDismiss} />
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
  footerStatus: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, marginBottom: SPACING.small, textAlign: "center" },
  remarksSheet: { gap: SPACING.large, padding: SCREEN_HORIZONTAL_PADDING },
  evidenceSheet: { gap: SPACING.large, padding: SCREEN_HORIZONTAL_PADDING },
  existingEvidence: { gap: SPACING.small },
  sheetLabel: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "700" },
});

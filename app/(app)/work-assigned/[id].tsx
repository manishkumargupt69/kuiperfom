import type { ReactElement } from "react";
import { useCallback } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import AppHeader from "@/src/components/ui/AppHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import { useWorkEditor } from "@/src/features/work/hooks/use-work-editor";
import WorkDetailForm from "@/src/features/work/presentation/WorkDetailForm";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING } from "@/src/theme/tokens";
import { showSuccessMessage } from "@/src/utils/show-success-message";

const getSaveErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Try again.";

export default function WorkDetailScreen(): ReactElement {
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
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
    isRecording,
    recordingDurationMilliseconds,
    addDocument,
    addPhoto,
    addVideo,
    toggleVoiceRecording,
    removeAttachment,
  } = useWorkEditor(id);
  const handleBack = useCallback((): void => router.back(), []);
  const handleRetry = useCallback((): void => {
    void reload();
  }, [reload]);
  const handleSave = useCallback(async (): Promise<void> => {
    try {
      await save();
      showSuccessMessage("Work update saved");
      router.back();
    } catch (error: unknown) {
      Alert.alert("Unable to save update", getSaveErrorMessage(error));
    }
  }, [save]);

  return (
    <ScreenContainer>
      <AppHeader onBack={handleBack} title="Update Work Record" />
      {viewState.status === "success" ? (
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <WorkDetailForm
            attachments={attachments}
            completionPercentage={editorState.completionPercentage}
            isRecording={isRecording}
            item={viewState.data}
            onAddDocument={addDocument}
            onAddPhoto={addPhoto}
            onAddVideo={addVideo}
            onCompletionChange={setCompletionPercentage}
            onRecordVoice={toggleVoiceRecording}
            onRemarksChange={setRemarks}
            onRemoveAttachment={removeAttachment}
            onTransitionSelect={selectTransition}
            recordingDurationMilliseconds={recordingDurationMilliseconds}
            remarks={editorState.remarks}
            selectedTransition={editorState.transition}
          />
        </ScrollView>
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
          <PrimaryButton
            isDisabled={isRecording}
            isLoading={isSaving}
            label="Save Update"
            onPress={handleSave}
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: SPACING.section },
  footer: {
    backgroundColor: COLORS.background,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    padding: SCREEN_HORIZONTAL_PADDING,
  },
});

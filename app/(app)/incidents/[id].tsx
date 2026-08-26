import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import AppHeader from "@/src/components/ui/AppHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import type { IncidentOptionViewModel } from "@/src/features/incidents/domain/incident.types";
import { useIncidentDetail } from "@/src/features/incidents/hooks/use-incident-detail";
import { useIncidentReport } from "@/src/features/incidents/hooks/use-incident-report";
import IncidentDetailView from "@/src/features/incidents/presentation/IncidentDetailView";
import IncidentOptionPicker from "@/src/features/incidents/presentation/IncidentOptionPicker";
import IncidentReportForm from "@/src/features/incidents/presentation/IncidentReportForm";
import {
  COLORS,
  SCREEN_HORIZONTAL_PADDING,
  SPACING,
} from "@/src/theme/tokens";
import { showSuccessMessage } from "@/src/utils/show-success-message";

type PickerKind = "type" | "subtype" | "assignee" | null;

const getSaveErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Try again.";

export default function IncidentDetailScreen(): ReactElement {
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [pickerKind, setPickerKind] = useState<PickerKind>(null);
  const { viewState, reload } = useIncidentDetail(id);
  const incident = viewState.status === "success" ? viewState.data : null;
  const editor = useIncidentReport(incident);

  const handleBack = useCallback((): void => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }
    router.back();
  }, [isEditing]);
  const handleRetry = useCallback((): void => {
    void reload();
  }, [reload]);
  const handleOptionsRetry = useCallback((): void => {
    void editor.reloadTypes();
  }, [editor]);
  const handleEdit = useCallback((): void => setIsEditing(true), []);
  const openTypePicker = useCallback((): void => setPickerKind("type"), []);
  const openSubtypePicker = useCallback((): void => setPickerKind("subtype"), []);
  const openAssigneePicker = useCallback((): void => setPickerKind("assignee"), []);
  const closePicker = useCallback((): void => setPickerKind(null), []);
  const handleOptionSelect = useCallback((option: IncidentOptionViewModel): void => {
    if (pickerKind === "type") editor.selectType(option);
    else if (pickerKind === "subtype") editor.selectSubtype(option);
    else if (pickerKind === "assignee") editor.selectAssignee(option);
    setPickerKind(null);
  }, [editor, pickerKind]);
  const handleSave = useCallback(async (): Promise<void> => {
    try {
      const incidentNumber = await editor.submit();
      showSuccessMessage(`${incidentNumber} updated`);
      setIsEditing(false);
    } catch (error: unknown) {
      Alert.alert("Unable to update incident", getSaveErrorMessage(error));
    }
  }, [editor]);

  const isDetailReady = viewState.status === "success";
  const isEditorReady = editor.typesState.status === "success";
  const pickerOptions = pickerKind === "type" && editor.typesState.status === "success" ? editor.typesState.data : pickerKind === "subtype" ? editor.subtypes : pickerKind === "assignee" ? editor.assignees : [];
  const pickerTitle = pickerKind === "type" ? "Incident Type" : pickerKind === "subtype" ? "Incident Subtype" : "Assigned To";

  return (
    <ScreenContainer>
      <AppHeader
        onBack={handleBack}
        title={isEditing ? "Edit Incident" : "Incident Details"}
      />
      {isDetailReady ? (
        isEditing ? (
          isEditorReady ? (
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <IncidentReportForm
                assigneeLabel={editor.state.assignee?.label ?? ""}
                attachments={editor.attachments}
                description={editor.state.description}
                isRecording={editor.isRecording}
                isSubtypeDisabled={
                  !editor.state.type ||
                  editor.isLoadingSubtypes ||
                  editor.subtypes.length === 0
                }
                onAddDocument={editor.addDocument}
                onAddFromGallery={editor.addFromGallery}
                onAddPhoto={editor.addPhoto}
                onAddVideo={editor.addVideo}
                onAssigneePress={openAssigneePicker}
                onDescriptionChange={editor.setDescription}
                onRecordVoice={editor.toggleVoiceRecording}
                onRemarksChange={editor.setRemarks}
                onRemoveAttachment={editor.removeAttachment}
                onSubtypePress={openSubtypePicker}
                onTitleChange={editor.setTitle}
                onTypePress={openTypePicker}
                recordingDurationMilliseconds={
                  editor.recordingDurationMilliseconds
                }
                remarks={editor.state.remarks}
                subtypeLabel={editor.state.subtype?.label ?? ""}
                title={editor.state.title}
                typeLabel={editor.state.type?.label ?? ""}
              />
            </ScrollView>
          ) : (
            <AsyncStateView
              emptyMessage="No incident types are available."
              message={
                editor.typesState.status === "error"
                  ? editor.typesState.message
                  : undefined
              }
              onRetry={handleOptionsRetry}
              status={
                editor.typesState.status === "success"
                  ? "loading"
                  : editor.typesState.status
              }
              variant="detail"
            />
          )
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <IncidentDetailView incident={viewState.data} />
          </ScrollView>
        )
      ) : (
        <AsyncStateView
          emptyMessage="The requested incident is unavailable."
          message={
            viewState.status === "error" ? viewState.message : undefined
          }
          onRetry={handleRetry}
          status={viewState.status}
          variant="detail"
        />
      )}
      {isDetailReady && (!isEditing || isEditorReady) ? (
        <View style={styles.footer}>
          <PrimaryButton
            isDisabled={isEditing && editor.isRecording}
            isLoading={isEditing && editor.isSubmitting}
            label={isEditing ? "Save Changes" : "Edit Incident"}
            onPress={isEditing ? handleSave : handleEdit}
          />
        </View>
      ) : null}
      <IncidentOptionPicker
        isVisible={pickerKind !== null}
        onClose={closePicker}
        onSelect={handleOptionSelect}
        options={pickerOptions}
        title={pickerTitle}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: SPACING.section },
  footer: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: SCREEN_HORIZONTAL_PADDING,
  },
});

import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import AppHeader from "@/src/components/ui/AppHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import type { IncidentOptionViewModel } from "@/src/features/incidents/domain/incident.types";
import { useIncidentReport } from "@/src/features/incidents/hooks/use-incident-report";
import IncidentOptionPicker from "@/src/features/incidents/presentation/IncidentOptionPicker";
import IncidentReportForm from "@/src/features/incidents/presentation/IncidentReportForm";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING } from "@/src/theme/tokens";
import { showSuccessMessage } from "@/src/utils/show-success-message";

type PickerKind = "type" | "subtype" | "assignee" | null;

const getSubmitErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Try again.";

export default function NewIncidentScreen(): ReactElement {
  const [pickerKind, setPickerKind] = useState<PickerKind>(null);
  const incidentReport = useIncidentReport();
  const {
    addDocument,
    addFromGallery,
    addPhoto,
    addVideo,
    assignees,
    attachments,
    isLoadingSubtypes,
    isRecording,
    isSubmitting,
    recordingDurationMilliseconds,
    reloadTypes,
    removeAttachment,
    selectAssignee,
    selectSubtype,
    selectType,
    setDescription,
    setRemarks,
    setTitle,
    state,
    submit,
    subtypes,
    toggleVoiceRecording,
    typesState,
  } = incidentReport;

  const handleBack = useCallback((): void => router.back(), []);
  const openTypePicker = useCallback((): void => setPickerKind("type"), []);
  const openSubtypePicker = useCallback((): void => setPickerKind("subtype"), []);
  const openAssigneePicker = useCallback((): void => setPickerKind("assignee"), []);
  const closePicker = useCallback((): void => setPickerKind(null), []);
  const handleOptionSelect = useCallback((option: IncidentOptionViewModel): void => {
    if (pickerKind === "type") selectType(option);
    else if (pickerKind === "subtype") selectSubtype(option);
    else if (pickerKind === "assignee") selectAssignee(option);
    setPickerKind(null);
  }, [pickerKind, selectAssignee, selectSubtype, selectType]);
  const handleRetry = useCallback((): void => {
    void reloadTypes();
  }, [reloadTypes]);
  const handleSubmit = useCallback(async (): Promise<void> => {
    try {
      const incidentNumber = await submit();
      showSuccessMessage(`${incidentNumber} submitted`);
      router.back();
    } catch (error: unknown) {
      Alert.alert("Unable to submit incident", getSubmitErrorMessage(error));
    }
  }, [submit]);

  const pickerOptions =
    pickerKind === "type" && typesState.status === "success"
      ? typesState.data
      : pickerKind === "subtype"
        ? subtypes
        : pickerKind === "assignee"
          ? assignees
          : [];
  const pickerTitle = pickerKind === "type"
    ? "Incident Type"
    : pickerKind === "subtype"
      ? "Incident Subtype"
      : "Assigned To";

  return (
    <ScreenContainer>
      <AppHeader onBack={handleBack} title="Report Incident" />
      {typesState.status === "success" ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <IncidentReportForm
            assigneeLabel={state.assignee?.label ?? ""}
            attachments={attachments}
            description={state.description}
            isRecording={isRecording}
            isSubtypeDisabled={!state.type || isLoadingSubtypes || subtypes.length === 0}
            onAddDocument={addDocument}
            onAddFromGallery={addFromGallery}
            onAddPhoto={addPhoto}
            onAddVideo={addVideo}
            onAssigneePress={openAssigneePicker}
            onDescriptionChange={setDescription}
            onRecordVoice={toggleVoiceRecording}
            onRemarksChange={setRemarks}
            onRemoveAttachment={removeAttachment}
            onSubtypePress={openSubtypePicker}
            onTitleChange={setTitle}
            onTypePress={openTypePicker}
            recordingDurationMilliseconds={recordingDurationMilliseconds}
            remarks={state.remarks}
            subtypeLabel={state.subtype?.label ?? ""}
            title={state.title}
            typeLabel={state.type?.label ?? ""}
          />
        </ScrollView>
      ) : (
        <AsyncStateView
          emptyMessage="No incident types are available."
          message={typesState.status === "error" ? typesState.message : undefined}
          onRetry={handleRetry}
          status={typesState.status}
          variant="detail"
        />
      )}
      {typesState.status === "success" ? (
        <View style={styles.footer}>
          <PrimaryButton
            isDisabled={isRecording}
            isLoading={isSubmitting}
            label="Submit Incident"
            onPress={handleSubmit}
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

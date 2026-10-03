import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import DetailHeader from "@/src/components/ui/DetailHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import FormField from "@/src/components/ui/FormField";
import MediaAttachmentTray from "@/src/components/ui/MediaAttachmentTray";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import type { IncidentOptionViewModel } from "@/src/features/incidents/domain/incident.types";
import { useIncidentReport } from "@/src/features/incidents/hooks/use-incident-report";
import IncidentOptionPicker from "@/src/features/incidents/presentation/IncidentOptionPicker";
import IncidentReportForm from "@/src/features/incidents/presentation/IncidentReportForm";
import { useUnsavedChanges } from "@/src/hooks/use-unsaved-changes";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING } from "@/src/theme/tokens";
import { showSuccessMessage } from "@/src/utils/show-success-message";

type PickerKind = "type" | "subtype" | "assignee" | null;

const getSubmitErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Try again.";

export default function NewIncidentScreen(): ReactElement {
  const [pickerKind, setPickerKind] = useState<PickerKind>(null);
  const [isTitleVisible, setIsTitleVisible] = useState(false);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isRemarksVisible, setIsRemarksVisible] = useState(false);
  const [isEvidenceVisible, setIsEvidenceVisible] = useState(false);
  const incidentReport = useIncidentReport();
  const {
    addDocument,
    addFromGallery,
    addPhoto,
    assignees,
    attachments,
    isLoadingSubtypes,
    isSubmitting,
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
    typesState,
  } = incidentReport;
  const isDirty = Boolean(state.type || state.subtype || state.assignee || state.title || state.description || state.remarks || attachments.length);
  const allowNavigation = useUnsavedChanges(isDirty);

  const handleBack = useCallback((): void => router.back(), []);
  const openTypePicker = useCallback((): void => setPickerKind("type"), []);
  const openSubtypePicker = useCallback((): void => setPickerKind("subtype"), []);
  const openAssigneePicker = useCallback((): void => setPickerKind("assignee"), []);
  const closePicker = useCallback((): void => setPickerKind(null), []);
  
  const openTitle = useCallback((): void => setIsTitleVisible(true), []);
  const closeTitle = useCallback((): void => setIsTitleVisible(false), []);
  const openDescription = useCallback((): void => setIsDescriptionVisible(true), []);
  const closeDescription = useCallback((): void => setIsDescriptionVisible(false), []);
  const openRemarks = useCallback((): void => setIsRemarksVisible(true), []);
  const closeRemarks = useCallback((): void => setIsRemarksVisible(false), []);
  const openEvidence = useCallback((): void => setIsEvidenceVisible(true), []);
  const closeEvidence = useCallback((): void => setIsEvidenceVisible(false), []);
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
      allowNavigation();
      showSuccessMessage(`${incidentNumber} submitted`);
      router.back();
    } catch (error: unknown) {
      Alert.alert("Unable to submit incident", getSubmitErrorMessage(error));
    }
  }, [allowNavigation, submit]);

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
      <DetailHeader onBack={handleBack} title="Report Incident" />
      {typesState.status === "success" ? (
        <View style={styles.body}>
          <IncidentReportForm
            assigneeLabel={state.assignee?.label ?? ""}
            description={state.description}
            evidenceCount={attachments.length}
            isSubtypeDisabled={!state.type || isLoadingSubtypes || subtypes.length === 0}
            onAssigneePress={openAssigneePicker}
            onDescriptionPress={openDescription}
            onEvidencePress={openEvidence}
            onRemarksPress={openRemarks}
            onSubtypePress={openSubtypePicker}
            onTitlePress={openTitle}
            onTypePress={openTypePicker}
            remarks={state.remarks}
            subtypeLabel={state.subtype?.label ?? ""}
            title={state.title}
            typeLabel={state.type?.label ?? ""}
          />
        </View>
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
      <BottomSheetModal accessibilityLabel="Close title editor" isVisible={isTitleVisible} onClose={closeTitle} title="Incident title">
        <View style={styles.sheet}>
          <FormField label="Incident title" onChangeText={setTitle} placeholder="Enter incident title" textCapitalization="sentences" value={state.title} />
          <PrimaryButton label="Done" onPress={closeTitle} />
        </View>
      </BottomSheetModal>
      <BottomSheetModal accessibilityLabel="Close description editor" isVisible={isDescriptionVisible} onClose={closeDescription} title="Description">
        <View style={styles.sheet}>
          <FormField isMultiline label="Description" onChangeText={setDescription} placeholder="Describe the incident" textCapitalization="sentences" value={state.description} />
          <PrimaryButton label="Done" onPress={closeDescription} />
        </View>
      </BottomSheetModal>
      <BottomSheetModal accessibilityLabel="Close remarks editor" isVisible={isRemarksVisible} onClose={closeRemarks} title="Remarks">
        <View style={styles.sheet}>
          <FormField isMultiline label="Remarks" onChangeText={setRemarks} placeholder="Enter remarks" textCapitalization="sentences" value={state.remarks} />
          <PrimaryButton label="Done" onPress={closeRemarks} />
        </View>
      </BottomSheetModal>
      <BottomSheetModal accessibilityLabel="Close evidence" isVisible={isEvidenceVisible} onClose={closeEvidence} title="Evidence">
        <View style={styles.sheet}>
          <MediaAttachmentTray attachments={attachments} onAddDocument={addDocument} onAddFromGallery={addFromGallery} onAddPhoto={addPhoto} onRemove={removeAttachment} />
        </View>
      </BottomSheetModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  sheet: { gap: SPACING.large, padding: SCREEN_HORIZONTAL_PADDING },
  footer: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: SCREEN_HORIZONTAL_PADDING,
  },
});

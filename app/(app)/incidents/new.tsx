import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import DetailHeader from "@/src/components/ui/DetailHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import FormField from "@/src/components/ui/FormField";
import MediaAttachmentTray from "@/src/components/ui/MediaAttachmentTray";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import EvidenceCameraModal from "@/src/features/evidence/presentation/EvidenceCameraModal";
import type { IncidentOptionViewModel } from "@/src/features/incidents/domain/incident.types";
import { useIncidentEvidenceFlow } from "@/src/features/incidents/hooks/use-incident-evidence-flow";
import IncidentOptionPicker from "@/src/features/incidents/presentation/IncidentOptionPicker";
import IncidentReportForm from "@/src/features/incidents/presentation/IncidentReportForm";
import { useUnsavedChanges } from "@/src/hooks/use-unsaved-changes";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { showSuccessMessage } from "@/src/utils/show-success-message";

type PickerKind = "type" | "subtype" | null;

const getSubmitErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Try again.";

export default function NewIncidentScreen(): ReactElement {
  const [pickerKind, setPickerKind] = useState<PickerKind>(null);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isRemarksVisible, setIsRemarksVisible] = useState(false);
  const evidenceFlow = useIncidentEvidenceFlow();
  const {
    attachments,
    isLoadingSubtypes,
    isSubmitting,
    preparation,
    reloadTypes,
    removeAttachment,
    selectSubtype,
    selectType,
    setDescription,
    setRemarks,
    state,
    submit,
    subtypes,
    typesState,
  } = evidenceFlow.report;
  const isDirty = Boolean(state.type || state.subtype || state.description || state.remarks || attachments.length || preparation);
  const allowNavigation = useUnsavedChanges(isDirty);

  const handleBack = useCallback((): void => router.back(), []);
  const openTypePicker = useCallback((): void => setPickerKind("type"), []);
  const openSubtypePicker = useCallback((): void => setPickerKind("subtype"), []);
  const closePicker = useCallback((): void => setPickerKind(null), []);
  const openDescription = useCallback((): void => setIsDescriptionVisible(true), []);
  const closeDescription = useCallback((): void => setIsDescriptionVisible(false), []);
  const openRemarks = useCallback((): void => setIsRemarksVisible(true), []);
  const closeRemarks = useCallback((): void => setIsRemarksVisible(false), []);
  const handleOptionSelect = useCallback((option: IncidentOptionViewModel): void => {
    if (pickerKind === "type") selectType(option);
    else if (pickerKind === "subtype") selectSubtype(option);
    setPickerKind(null);
  }, [pickerKind, selectSubtype, selectType]);
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
        : [];
  const pickerTitle = pickerKind === "type"
    ? "Incident Type"
    : "Incident Subtype";

  return (
    <ScreenContainer>
      <DetailHeader onBack={handleBack} title="Report Incident" />
      {typesState.status === "success" ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          style={styles.body}
        >
          <IncidentReportForm
            description={state.description}
            evidenceCount={attachments.length}
            isSubtypeDisabled={!state.type || isLoadingSubtypes || subtypes.length === 0}
            onDescriptionPress={openDescription}
            onEvidencePress={evidenceFlow.openEvidence}
            onRemarksPress={openRemarks}
            onSubtypePress={openSubtypePicker}
            onTypePress={openTypePicker}
            remarks={state.remarks}
            subtypeLabel={state.subtype?.label ?? ""}
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
          {preparation ? <Text accessibilityLiveRegion="polite" style={styles.footerStatus}>Preparing evidence before submit…</Text> : null}
          {isSubmitting && attachments.length > 0 ? <Text accessibilityLiveRegion="polite" style={styles.footerStatus}>Uploading evidence and submitting incident…</Text> : null}
          <PrimaryButton
            isDisabled={Boolean(preparation)}
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
      <BottomSheetModal accessibilityLabel="Close evidence" isVisible={evidenceFlow.isEvidenceVisible} onClose={evidenceFlow.closeEvidence} onDismiss={evidenceFlow.handleEvidenceDismiss} title="Evidence">
        <View style={styles.sheet}>
          <MediaAttachmentTray attachments={attachments} onAddDocument={evidenceFlow.chooseFile} onAddFromGallery={evidenceFlow.chooseGallery} onAddPhoto={evidenceFlow.chooseCamera} onRemove={removeAttachment} preparation={preparation} supportsVideo title="Add evidence" />
        </View>
      </BottomSheetModal>
      <EvidenceCameraModal isVisible={evidenceFlow.isCameraVisible} onCaptured={evidenceFlow.handleCameraCaptured} onClose={evidenceFlow.closeCamera} onDismiss={evidenceFlow.handleCameraDismiss} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.large },
  sheet: { gap: SPACING.large, padding: SCREEN_HORIZONTAL_PADDING },
  footerStatus: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, marginBottom: SPACING.small, textAlign: "center" },
  footer: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: SCREEN_HORIZONTAL_PADDING,
  },
});

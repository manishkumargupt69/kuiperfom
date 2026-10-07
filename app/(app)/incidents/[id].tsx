import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useAppNavigation } from "@/src/components/navigation/AppNavigationContext";
import DetailHeader from "@/src/components/ui/DetailHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import FormField from "@/src/components/ui/FormField";
import MediaAttachmentTray from "@/src/components/ui/MediaAttachmentTray";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import EvidenceCameraModal from "@/src/features/evidence/presentation/EvidenceCameraModal";
import EvidenceAttachmentList from "@/src/features/evidence/presentation/EvidenceAttachmentList";
import type { IncidentOptionViewModel } from "@/src/features/incidents/domain/incident.types";
import { useIncidentDetail } from "@/src/features/incidents/hooks/use-incident-detail";
import { useIncidentEvidenceFlow } from "@/src/features/incidents/hooks/use-incident-evidence-flow";
import IncidentDetailView from "@/src/features/incidents/presentation/IncidentDetailView";
import IncidentOptionPicker from "@/src/features/incidents/presentation/IncidentOptionPicker";
import IncidentReportForm from "@/src/features/incidents/presentation/IncidentReportForm";
import { useUnsavedChanges } from "@/src/hooks/use-unsaved-changes";
import {
  COLORS,
  SCREEN_HORIZONTAL_PADDING,
  SPACING,
  TYPOGRAPHY,
} from "@/src/theme/tokens";
import { showSuccessMessage } from "@/src/utils/show-success-message";

type PickerKind = "type" | "subtype" | null;

const getSaveErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Try again.";

export default function IncidentDetailScreen(): ReactElement {
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [pickerKind, setPickerKind] = useState<PickerKind>(null);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isRemarksVisible, setIsRemarksVisible] = useState(false);
  const { viewState, reload } = useIncidentDetail(id);
  const incident = viewState.status === "success" ? viewState.data : null;
  const evidenceFlow = useIncidentEvidenceFlow(incident);
  const editor = evidenceFlow.report;
  const { requestNavigation, setFloatingBarHidden } = useAppNavigation();
  useEffect(() => {
    setFloatingBarHidden(isEditing);
    return () => setFloatingBarHidden(false);
  }, [isEditing, setFloatingBarHidden]);
  const isDirty = isEditing && Boolean(incident && editor.state.type) && (
    editor.state.type?.id !== incident?.typeId
    || editor.state.subtype?.id !== incident?.subtypeId
    || editor.state.description !== incident?.description
    || editor.state.remarks !== (incident?.remarks ?? "")
    || editor.attachments.length > 0
    || Boolean(editor.preparation)
  );
  const allowNavigation = useUnsavedChanges(isDirty);
  const requestEditClose = useCallback((): void => {
    requestNavigation(() => setIsEditing(false));
  }, [requestNavigation]);

  const handleBack = useCallback((): void => {
    if (isEditing) {
      if (isDirty) {
        requestEditClose();
        return;
      }
      setIsEditing(false);
      return;
    }
    router.back();
  }, [isDirty, isEditing, requestEditClose]);
  const handleRetry = useCallback((): void => {
    void reload();
  }, [reload]);
  const handleOptionsRetry = useCallback((): void => {
    void editor.reloadTypes();
  }, [editor]);
  const handleEdit = useCallback((): void => setIsEditing(true), []);
  const openTypePicker = useCallback((): void => setPickerKind("type"), []);
  const openSubtypePicker = useCallback((): void => setPickerKind("subtype"), []);
  const closePicker = useCallback((): void => setPickerKind(null), []);
  const openDescription = useCallback((): void => setIsDescriptionVisible(true), []);
  const closeDescription = useCallback((): void => setIsDescriptionVisible(false), []);
  const openRemarks = useCallback((): void => setIsRemarksVisible(true), []);
  const closeRemarks = useCallback((): void => setIsRemarksVisible(false), []);
  const handleOptionSelect = useCallback((option: IncidentOptionViewModel): void => {
    if (pickerKind === "type") editor.selectType(option);
    else if (pickerKind === "subtype") editor.selectSubtype(option);
    setPickerKind(null);
  }, [editor, pickerKind]);
  const handleSave = useCallback(async (): Promise<void> => {
    try {
      const incidentNumber = await editor.submit();
      allowNavigation();
      showSuccessMessage(`${incidentNumber} updated`);
      setIsEditing(false);
    } catch (error: unknown) {
      Alert.alert("Unable to update incident", getSaveErrorMessage(error));
    }
  }, [allowNavigation, editor]);

  const isDetailReady = viewState.status === "success";
  const isEditorReady = editor.typesState.status === "success";
  const pickerOptions = pickerKind === "type" && editor.typesState.status === "success" ? editor.typesState.data : pickerKind === "subtype" ? editor.subtypes : [];
  const pickerTitle = pickerKind === "type" ? "Incident Type" : "Incident Subtype";

  return (
    <ScreenContainer>
      <DetailHeader
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
                description={editor.state.description}
                evidenceCount={(incident?.attachments.length ?? 0) + editor.attachments.length}
                isSubtypeDisabled={
                  !editor.state.type ||
                  editor.isLoadingSubtypes ||
                  editor.subtypes.length === 0
                }
                onDescriptionPress={openDescription}
                onEvidencePress={evidenceFlow.openEvidence}
                onRemarksPress={openRemarks}
                onSubtypePress={openSubtypePicker}
                onTypePress={openTypePicker}
                remarks={editor.state.remarks}
                subtypeLabel={editor.state.subtype?.label ?? ""}
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
          <View style={styles.detailBody}>
            <IncidentDetailView incident={viewState.data} />
          </View>
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
          {isEditing && editor.preparation ? <Text accessibilityLiveRegion="polite" style={styles.footerStatus}>Preparing evidence before save…</Text> : null}
          {isEditing && editor.isSubmitting && editor.attachments.length > 0 ? <Text accessibilityLiveRegion="polite" style={styles.footerStatus}>Uploading evidence and saving incident…</Text> : null}
          <PrimaryButton
            isDisabled={isEditing && Boolean(editor.preparation)}
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
      <BottomSheetModal accessibilityLabel="Close description editor" isVisible={isDescriptionVisible} onClose={closeDescription} title="Description">
        <View style={styles.sheet}>
          <FormField isMultiline label="Description" onChangeText={editor.setDescription} placeholder="Describe the incident" textCapitalization="sentences" value={editor.state.description} />
          <PrimaryButton label="Done" onPress={closeDescription} />
        </View>
      </BottomSheetModal>
      <BottomSheetModal accessibilityLabel="Close remarks editor" isVisible={isRemarksVisible} onClose={closeRemarks} title="Remarks">
        <View style={styles.sheet}>
          <FormField isMultiline label="Remarks" onChangeText={editor.setRemarks} placeholder="Enter remarks" textCapitalization="sentences" value={editor.state.remarks} />
          <PrimaryButton label="Done" onPress={closeRemarks} />
        </View>
      </BottomSheetModal>
      <BottomSheetModal accessibilityLabel="Close evidence" isVisible={evidenceFlow.isEvidenceVisible} onClose={evidenceFlow.closeEvidence} onDismiss={evidenceFlow.handleEvidenceDismiss} title="Evidence">
        <View style={styles.sheet}>
          {incident && incident.attachments.length > 0 ? (
            <View style={styles.existingEvidence}>
              <Text style={styles.sheetLabel}>Existing evidence</Text>
              <EvidenceAttachmentList attachments={incident.attachments} hasBottomAction />
            </View>
          ) : null}
          <MediaAttachmentTray attachments={editor.attachments} onAddDocument={evidenceFlow.chooseFile} onAddFromGallery={evidenceFlow.chooseGallery} onAddPhoto={evidenceFlow.chooseCamera} onRemove={editor.removeAttachment} preparation={editor.preparation} supportsVideo title="Add evidence" />
        </View>
      </BottomSheetModal>
      <EvidenceCameraModal isVisible={evidenceFlow.isCameraVisible} onCaptured={evidenceFlow.handleCameraCaptured} onClose={evidenceFlow.closeCamera} onDismiss={evidenceFlow.handleCameraDismiss} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  detailBody: { flex: 1 },
  scroll: { paddingBottom: SPACING.section },
  sheet: { gap: SPACING.large, padding: SCREEN_HORIZONTAL_PADDING },
  existingEvidence: { gap: SPACING.small },
  sheetLabel: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "700" },
  footerStatus: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, marginBottom: SPACING.small, textAlign: "center" },
  footer: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: SCREEN_HORIZONTAL_PADDING,
  },
});

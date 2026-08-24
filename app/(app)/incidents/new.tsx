import type { ReactElement } from "react";
import { useCallback } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import type { AlertButton } from "react-native";
import { router } from "expo-router";

import AppHeader from "@/src/components/ui/AppHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import type { IncidentOptionViewModel } from "@/src/features/incidents/domain/incident.types";
import { useIncidentReport } from "@/src/features/incidents/hooks/use-incident-report";
import IncidentReportForm from "@/src/features/incidents/presentation/IncidentReportForm";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING } from "@/src/theme/tokens";
import { showSuccessMessage } from "@/src/utils/show-success-message";

const getSubmitErrorMessage = (error: unknown): string => error instanceof Error ? error.message : "Try again.";

const getOptionButtons = (options: readonly IncidentOptionViewModel[], onSelect: (option: IncidentOptionViewModel) => void): AlertButton[] => [
  ...options.map((option) => ({ text: option.label, onPress: (): void => onSelect(option) })),
  { text: "Cancel", style: "cancel" },
];

export default function NewIncidentScreen(): ReactElement {
  const { isLoadingSubtypes, isSubmitting, reloadTypes, selectSubtype, selectType, setDescription, setRemarks, state, submit, subtypes, typesState, attachments, isRecording, recordingDurationMilliseconds, addDocument, addPhoto, addVideo, toggleVoiceRecording, removeAttachment } = useIncidentReport();
  const handleBack = useCallback((): void => router.back(), []);
  const openTypePicker = useCallback((): void => { if (typesState.status === "success") Alert.alert("Incident Type", undefined, getOptionButtons(typesState.data, selectType)); }, [selectType, typesState]);
  const openSubtypePicker = useCallback((): void => { if (subtypes.length > 0) Alert.alert("Incident Subtype", undefined, getOptionButtons(subtypes, selectSubtype)); }, [selectSubtype, subtypes]);
  const handleRetry = useCallback((): void => { void reloadTypes(); }, [reloadTypes]);
  const handleSubmit = useCallback(async (): Promise<void> => { try { const incidentNumber = await submit(); showSuccessMessage(`${incidentNumber} submitted`); router.back(); } catch (error: unknown) { Alert.alert("Unable to submit incident", getSubmitErrorMessage(error)); } }, [submit]);

  return (
    <ScreenContainer>
      <AppHeader onBack={handleBack} title="Report Incident" />
      {typesState.status === "success" ? <ScrollView automaticallyAdjustKeyboardInsets contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}><IncidentReportForm attachments={attachments} description={state.description} isRecording={isRecording} isSubtypeDisabled={!state.type || isLoadingSubtypes || subtypes.length === 0} onAddDocument={addDocument} onAddPhoto={addPhoto} onAddVideo={addVideo} onDescriptionChange={setDescription} onRecordVoice={toggleVoiceRecording} onRemarksChange={setRemarks} onRemoveAttachment={removeAttachment} onSubtypePress={openSubtypePicker} onTypePress={openTypePicker} recordingDurationMilliseconds={recordingDurationMilliseconds} remarks={state.remarks} subtypeLabel={state.subtype?.label ?? ""} typeLabel={state.type?.label ?? ""} /></ScrollView> : <AsyncStateView emptyMessage="No incident types are available." message={typesState.status === "error" ? typesState.message : undefined} onRetry={handleRetry} status={typesState.status} variant="detail" />}
      {typesState.status === "success" ? <View style={styles.footer}><PrimaryButton isDisabled={isRecording} isLoading={isSubmitting} label="Submit Incident" onPress={handleSubmit} /></View> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ scroll: { paddingBottom: SPACING.section }, footer: { backgroundColor: COLORS.background, borderTopColor: COLORS.border, borderTopWidth: 1, padding: SCREEN_HORIZONTAL_PADDING } });

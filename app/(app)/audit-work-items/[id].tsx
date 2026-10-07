import type { ReactElement } from "react";
import { useCallback } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import DetailHeader from "@/src/components/ui/DetailHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import SecondaryButton from "@/src/components/ui/SecondaryButton";
import { useWorkAudit } from "@/src/features/work/hooks/use-work-audit";
import WorkAuditForm from "@/src/features/work/presentation/WorkAuditForm";
import { useUnsavedChanges } from "@/src/hooks/use-unsaved-changes";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING } from "@/src/theme/tokens";
import { showSuccessMessage } from "@/src/utils/show-success-message";

type WorkAuditParams = { id: string; projectId?: string };
const getErrorMessage = (error: unknown): string => error instanceof Error ? error.message : "Try again.";

export default function WorkAuditScreen(): ReactElement {
  const { id, projectId } = useLocalSearchParams<WorkAuditParams>();
  const audit = useWorkAudit(id, projectId);
  const { reload, save } = audit;
  const allowNavigation = useUnsavedChanges(Boolean(audit.remarks.length || audit.attachments.length));
  const handleBack = useCallback((): void => router.back(), []);
  const handleRetry = useCallback((): void => { void reload(); }, [reload]);
  const openHistory = useCallback((): void => {
    router.push({ pathname: "/(app)/work-assigned/[id]/history", params: { id } });
  }, [id]);
  const handleSave = useCallback(async (): Promise<void> => {
    try {
      await save();
      allowNavigation();
      showSuccessMessage("Work audit saved");
      router.back();
    } catch (error: unknown) {
      Alert.alert("Unable to save audit", getErrorMessage(error));
    }
  }, [allowNavigation, save]);

  return (
    <ScreenContainer>
      <DetailHeader onBack={handleBack} title="Audit Work Item" />
      {audit.viewState.status === "success" ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <WorkAuditForm
            attachments={audit.attachments}
            city={audit.viewState.data.city}
            item={audit.viewState.data.item}
            onAddDocument={audit.addDocument}
            onAddPhoto={audit.addPhoto}
            onRemarksChange={audit.setRemarks}
            onRemoveAttachment={audit.removeAttachment}
            projectName={audit.viewState.data.projectName}
            remarks={audit.remarks}
            startDate={audit.viewState.data.startDate}
          />
        </ScrollView>
      ) : (
        <View style={styles.state}>
          <AsyncStateView emptyMessage="This work item is unavailable." message={audit.viewState.status === "error" ? audit.viewState.message : undefined} onRetry={handleRetry} status={audit.viewState.status} variant="detail" />
        </View>
      )}
      {audit.viewState.status === "success" ? (
        <View style={styles.footer}>
          <SecondaryButton iconName="clock" label="View History" onPress={openHistory} />
          <PrimaryButton isLoading={audit.isSaving} label="Submit Audit" onPress={handleSave} />
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: SPACING.section, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  state: { flex: 1, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  footer: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border, borderTopWidth: StyleSheet.hairlineWidth, gap: SPACING.small, padding: SCREEN_HORIZONTAL_PADDING },
});

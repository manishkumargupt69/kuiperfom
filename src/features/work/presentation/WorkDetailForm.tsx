import { memo } from "react";
import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

import FormField from "@/src/components/ui/FormField";
import MediaAttachmentTray from "@/src/components/ui/MediaAttachmentTray";
import SecondaryButton from "@/src/components/ui/SecondaryButton";
import StatusBadge from "@/src/components/ui/StatusBadge";
import EvidenceAttachmentList from "@/src/features/evidence/presentation/EvidenceAttachmentList";
import type {
  WorkItemViewModel,
  WorkTransitionKey,
} from "@/src/features/work/domain/work.types";
import WorkInfoRow from "@/src/features/work/presentation/WorkInfoRow";
import type { EvidenceAttachment } from "@/src/types/evidence";
import {
  COLORS,
  RADII,
  SPACING,
  TYPOGRAPHY,
} from "@/src/theme/tokens";
import { formatDateTime } from "@/src/utils/format-date-time";

interface WorkDetailFormProps {
  item: WorkItemViewModel;
  completionPercentage: string;
  remarks: string;
  selectedTransition: WorkTransitionKey | null;
  attachments: readonly EvidenceAttachment[];
  isRecording: boolean;
  recordingDurationMilliseconds: number;
  onCompletionChange: (value: string) => void;
  onRemarksChange: (value: string) => void;
  onTransitionSelect: (value: WorkTransitionKey) => void;
  onAddDocument: () => void;
  onAddFromGallery: () => void;
  onAddPhoto: () => void;
  onAddVideo: () => void;
  onRecordVoice: () => void;
  onRemoveAttachment: (id: string) => void;
}

function WorkDetailForm({
  item,
  completionPercentage,
  remarks,
  selectedTransition,
  attachments,
  isRecording,
  recordingDurationMilliseconds,
  onCompletionChange,
  onRemarksChange,
  onTransitionSelect,
  onAddDocument,
  onAddFromGallery,
  onAddPhoto,
  onAddVideo,
  onRecordVoice,
  onRemoveAttachment,
}: WorkDetailFormProps): ReactElement {
  const selectStart = (): void => onTransitionSelect("start");
  const selectHold = (): void => onTransitionSelect("hold");
  const selectComplete = (): void => onTransitionSelect("complete");

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.summaryHeader}>
          <Text style={styles.requestNumber}>{item.requestNumber}</Text>
          <StatusBadge label={item.status.label} tone={item.status.tone} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{item.workItem}</Text>
          <Text style={styles.group}>
            {item.workGroup} · {item.workSubgroup}
          </Text>
        </View>
        <View style={styles.information}>
          <WorkInfoRow iconName="hash" label="Item code" value={item.workItemCode} />
          <WorkInfoRow
            iconName="calendar"
            label="Target completion"
            value={formatDateTime(item.targetCompletion)}
          />
          <WorkInfoRow iconName="user" label="Assigned to" value={item.assignedToName} />
          {item.partModel ? (
            <WorkInfoRow iconName="tool" label="Model" value={item.partModel} />
          ) : null}
          {item.weightLabel ? (
            <WorkInfoRow iconName="box" label="Weight" value={item.weightLabel} />
          ) : null}
          {item.unitOfMeasure ? (
            <WorkInfoRow iconName="package" label="Unit" value={item.unitOfMeasure} />
          ) : null}
          {item.workItemDescription ? (
            <WorkInfoRow
              iconName="align-left"
              label="Description"
              value={item.workItemDescription}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Record information</Text>
        <WorkInfoRow iconName="user-check" label="Created by" value={item.createdByName} />
        <WorkInfoRow
          iconName="clock"
          label="Created"
          value={formatDateTime(item.createdAt)}
        />
        <WorkInfoRow
          iconName="refresh-cw"
          label="Last updated"
          value={formatDateTime(item.updatedAt)}
        />
      </View>

      {item.attachments.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Existing evidence</Text>
          <EvidenceAttachmentList attachments={item.attachments} />
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Status action</Text>
        <View style={styles.actions}>
          <SecondaryButton
            isDisabled={!item.availableTransitions.includes("start")}
            isSelected={selectedTransition === "start"}
            label="Mark Started"
            onPress={selectStart}
          />
          <SecondaryButton
            isDisabled={!item.availableTransitions.includes("hold")}
            isSelected={selectedTransition === "hold"}
            label="Mark Hold"
            onPress={selectHold}
          />
          <SecondaryButton
            isDisabled={!item.availableTransitions.includes("complete")}
            isSelected={selectedTransition === "complete"}
            label="Mark Completed"
            onPress={selectComplete}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Work update</Text>
        <FormField
          keyboardType="number-pad"
          label="Completion Percentage"
          maxLength={3}
          onChangeText={onCompletionChange}
          placeholder="Enter percentage"
          value={completionPercentage}
        />
        <FormField
          isMultiline
          label="Remarks"
          onChangeText={onRemarksChange}
          placeholder="Enter remarks"
          textCapitalization="sentences"
          value={remarks}
        />
      </View>

      <View style={styles.card}>
        <MediaAttachmentTray
          attachments={attachments}
          isRecording={isRecording}
          onAddDocument={onAddDocument}
          onAddFromGallery={onAddFromGallery}
          onAddPhoto={onAddPhoto}
          onAddVideo={onAddVideo}
          onRecordVoice={onRecordVoice}
          onRemove={onRemoveAttachment}
          recordingDurationMilliseconds={recordingDurationMilliseconds}
          title="Add evidence"
        />
      </View>
    </View>
  );
}

export default memo(WorkDetailForm);

const styles = StyleSheet.create({
  container: {
    gap: SPACING.large,
    padding: SPACING.large,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.large,
    borderWidth: 1,
    elevation: 1,
    gap: SPACING.medium,
    padding: SPACING.large,
    shadowColor: "#000000",
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  summaryHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.medium,
    justifyContent: "space-between",
  },
  requestNumber: {
    color: COLORS.accent,
    ...TYPOGRAPHY.caption,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  titleBlock: { gap: SPACING.extraSmall },
  title: {
    color: COLORS.ink,
    ...TYPOGRAPHY.sectionTitle,
    fontWeight: "800",
  },
  group: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.body,
    fontWeight: "500",
  },
  information: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    gap: SPACING.small,
    paddingTop: SPACING.medium,
  },
  sectionTitle: {
    color: COLORS.ink,
    ...TYPOGRAPHY.control,
    fontWeight: "800",
  },
  actions: { gap: SPACING.small },
});

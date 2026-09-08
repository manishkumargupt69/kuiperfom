import { memo, useMemo } from "react";
import type { ReactElement } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";

import StatusBadge from "@/src/components/ui/StatusBadge";
import type { WorkItemViewModel } from "@/src/features/work/domain/work.types";
import WorkInfoRow from "@/src/features/work/presentation/WorkInfoRow";
import {
  COLORS,
  RADII,
  SPACING,
  TYPOGRAPHY,
} from "@/src/theme/tokens";
import { formatDateTime } from "@/src/utils/format-date-time";

interface WorkItemRowProps {
  item: WorkItemViewModel;
  onPress: (item: WorkItemViewModel) => void;
}

const getCardStyle = ({
  pressed,
}: PressableStateCallbackType): StyleProp<ViewStyle> => [
  styles.container,
  pressed && styles.pressed,
];

function WorkItemRow({ item, onPress }: WorkItemRowProps): ReactElement {
  const handlePress = (): void => onPress(item);
  const photoUri = item.attachments.find(
    (attachment) => attachment.kind === "photo",
  )?.uri;
  const photoSource = useMemo(
    () => photoUri ? { uri: photoUri } : undefined,
    [photoUri],
  );
  const completionLabel =
    item.completionPercentage === null
      ? "Completion not reported"
      : `${item.completionPercentage}% complete`;

  return (
    <Pressable
      accessibilityHint="Opens work details"
      accessibilityLabel={`${item.requestNumber}, ${item.workItem}, status ${item.status.label}`}
      accessibilityRole="button"
      onPress={handlePress}
      style={getCardStyle}
    >
      <View style={styles.header}>
        <Text style={styles.requestNumber}>{item.requestNumber}</Text>
        <StatusBadge label={item.status.label} tone={item.status.tone} />
      </View>

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.title}>{item.workItem}</Text>
          <Text style={styles.group}>
            {item.workGroup} · {item.workSubgroup}
          </Text>
        </View>
        {photoSource ? (
          <Image
            accessibilityLabel="Work evidence"
            resizeMode="cover"
            source={photoSource}
            style={styles.thumbnail}
          />
        ) : null}
      </View>

      <View style={styles.information}>
        <WorkInfoRow iconName="hash" value={item.workItemCode} />
        {item.assignedToName ? (
          <WorkInfoRow iconName="user" value={item.assignedToName} />
        ) : null}
        <WorkInfoRow
          iconName="calendar"
          value={formatDateTime(item.targetCompletion)}
        />
      </View>

      {item.remarks ? (
        <WorkInfoRow iconName="message-square" value={item.remarks} />
      ) : null}

      <View style={styles.footer}>
        <View style={styles.progressPill}>
          <Feather color={COLORS.accent} name="activity" size={14} />
          <Text style={styles.progress}>{completionLabel}</Text>
        </View>
        {item.attachments.length > 0 ? (
          <View style={styles.evidence}>
            <Feather color={COLORS.inkMuted} name="paperclip" size={14} />
            <Text style={styles.evidenceLabel}>{item.attachments.length}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export default memo(WorkItemRow);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.large,
    borderWidth: 1,
    elevation: 2,
    gap: SPACING.medium,
    marginBottom: SPACING.large,
    padding: SPACING.large,
    shadowColor: "#000000",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  pressed: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accent,
    opacity: 0.9,
  },
  header: {
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
  hero: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: SPACING.medium,
  },
  heroCopy: { flex: 1, gap: SPACING.extraSmall },
  title: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  group: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.body,
    fontWeight: "500",
  },
  thumbnail: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADII.medium,
    height: 76,
    width: 76,
  },
  information: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    gap: SPACING.extraSmall,
    paddingTop: SPACING.medium,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressPill: {
    alignItems: "center",
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADII.pill,
    flexDirection: "row",
    gap: SPACING.small,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },
  progress: {
    color: COLORS.accent,
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
  },
  evidence: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.extraSmall,
  },
  evidenceLabel: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
  },
});


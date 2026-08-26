import { memo } from "react";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import type { IncidentOptionViewModel } from "@/src/features/incidents/domain/incident.types";
import {
  COLORS,
  MINIMUM_TOUCH_SIZE,
  SPACING,
  TYPOGRAPHY,
} from "@/src/theme/tokens";

interface IncidentOptionRowProps {
  option: IncidentOptionViewModel;
  onPress: (option: IncidentOptionViewModel) => void;
}

function IncidentOptionRow({
  option,
  onPress,
}: IncidentOptionRowProps): ReactElement {
  const handlePress = (): void => onPress(option);
  return (
    <Pressable
      accessibilityLabel={option.label}
      accessibilityRole="button"
      onPress={handlePress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{option.label}</Text>
      <Feather color={COLORS.inkMuted} name="chevron-right" size={18} />
    </Pressable>
  );
}

export default memo(IncidentOptionRow);

const styles = StyleSheet.create({
  row: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    minHeight: MINIMUM_TOUCH_SIZE,
    paddingHorizontal: SPACING.extraLarge,
    paddingVertical: SPACING.medium,
  },
  label: { color: COLORS.ink, ...TYPOGRAPHY.body },
  pressed: { backgroundColor: COLORS.surfaceMuted },
});

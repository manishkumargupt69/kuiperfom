import { memo } from "react";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import type { WorkTransitionKey } from "@/src/features/work/domain/work.types";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface WorkTransitionChipProps {
  label: string;
  transition: WorkTransitionKey;
  isSelected: boolean;
  onSelect: (transition: WorkTransitionKey) => void;
}

function WorkTransitionChip({ label, transition, isSelected, onSelect }: WorkTransitionChipProps): ReactElement {
  const handlePress = (): void => onSelect(transition);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      hitSlop={SPACING.extraSmall}
      onPress={handlePress}
      style={({ pressed }) => [styles.chip, isSelected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[styles.label, isSelected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

export default memo(WorkTransitionChip);

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: SPACING.medium,
  },
  selected: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  pressed: { opacity: 0.75 },
  label: { color: COLORS.ink, ...TYPOGRAPHY.caption, fontWeight: "700" },
  selectedLabel: { color: COLORS.white },
});

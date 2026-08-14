import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ModuleViewModel } from "@/src/features/modules/domain/module.types";
import { COLORS, MINIMUM_TOUCH_SIZE, SPACING } from "@/src/theme/tokens";

interface ModuleRowProps {
  module: ModuleViewModel;
  onPress: (module: ModuleViewModel) => void;
}

function ModuleRow({ module, onPress }: ModuleRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={module.title}
      accessibilityHint="Opens this field operations module"
      onPress={() => onPress(module)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Text style={styles.sequence}>{module.sequenceLabel}</Text>
      <View style={styles.copy}>
        <Text style={styles.title}>{module.title}</Text>
        <Text style={styles.description}>{module.description}</Text>
      </View>
      <Text accessibilityElementsHidden style={styles.arrow}>
        {"\u2192"}
      </Text>
    </Pressable>
  );
}

export default memo(ModuleRow);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: SPACING.large,
    minHeight: 96,
    paddingVertical: SPACING.large,
  },
  pressed: {
    opacity: 0.62,
  },
  sequence: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: "800",
    width: 24,
  },
  copy: {
    flex: 1,
    gap: SPACING.extraSmall,
  },
  title: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: "700",
  },
  description: {
    color: COLORS.inkMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  arrow: {
    color: COLORS.ink,
    fontSize: 24,
    minWidth: MINIMUM_TOUCH_SIZE,
    textAlign: "right",
  },
});

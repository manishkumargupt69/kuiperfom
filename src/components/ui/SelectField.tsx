import { useCallback } from "react";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { runAfterKeyboardDismissed } from "@/src/utils/run-after-keyboard-dismissed";

interface SelectFieldProps { label: string; placeholder: string; value: string; onPress: () => void; isDisabled?: boolean; }

export default function SelectField({ label, placeholder, value, onPress, isDisabled = false }: SelectFieldProps): ReactElement {
  const handlePress = useCallback((): void => {
    runAfterKeyboardDismissed(onPress);
  }, [onPress]);

  return <View style={styles.container}><Text style={styles.label}>{label}</Text><Pressable accessibilityLabel={`${label}: ${value || placeholder}`} accessibilityRole="button" accessibilityState={{ disabled: isDisabled }} disabled={isDisabled} onPress={handlePress} style={({ pressed }) => [styles.control, pressed && styles.pressed, isDisabled && styles.disabled]}><Text style={[styles.value, !value && styles.placeholder]}>{value || placeholder}</Text><Feather color={COLORS.inkMuted} name="chevron-down" size={20} /></Pressable></View>;
}

const styles = StyleSheet.create({
  container: { gap: SPACING.small },
  label: { color: COLORS.ink, ...TYPOGRAPHY.body, fontWeight: "600" },
  control: { alignItems: "center", backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADII.medium, borderWidth: 1, flexDirection: "row", gap: SPACING.small, minHeight: 52, paddingHorizontal: SPACING.large },
  pressed: { backgroundColor: COLORS.surfaceMuted, borderColor: COLORS.accent },
  disabled: { backgroundColor: COLORS.surfaceMuted, opacity: 0.58 },
  value: { color: COLORS.ink, flex: 1, ...TYPOGRAPHY.control },
  placeholder: { color: COLORS.inkMuted },
});

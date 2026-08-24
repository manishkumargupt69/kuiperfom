import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { COLORS, MINIMUM_TOUCH_SIZE, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface SecondaryButtonProps { label: string; onPress: () => void; isDisabled?: boolean; isSelected?: boolean; }

export default function SecondaryButton({ label, onPress, isDisabled = false, isSelected = false }: SecondaryButtonProps): ReactElement {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: isDisabled, selected: isSelected }} disabled={isDisabled} onPress={onPress} style={({ pressed }) => [styles.button, isSelected && styles.selected, pressed && styles.pressed, isDisabled && styles.disabled]}><Text style={[styles.label, isSelected && styles.selectedLabel]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({ button: { alignItems: "center", borderColor: COLORS.border, borderRadius: RADII.small, borderWidth: 1, justifyContent: "center", minHeight: MINIMUM_TOUCH_SIZE, paddingHorizontal: SPACING.large }, selected: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accent }, selectedLabel: { color: COLORS.accent }, pressed: { backgroundColor: COLORS.surfaceMuted }, disabled: { opacity: 0.45 }, label: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "600" } });

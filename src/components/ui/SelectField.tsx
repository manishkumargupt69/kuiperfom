import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import { COLORS, MINIMUM_TOUCH_SIZE, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface SelectFieldProps { label: string; placeholder: string; value: string; onPress: () => void; isDisabled?: boolean; }

export default function SelectField({ label, placeholder, value, onPress, isDisabled = false }: SelectFieldProps): ReactElement {
  return <View style={styles.container}><Text style={styles.label}>{label}</Text><Pressable accessibilityLabel={`${label}: ${value || placeholder}`} accessibilityRole="button" accessibilityState={{ disabled: isDisabled }} disabled={isDisabled} onPress={onPress} style={styles.control}><Text style={[styles.value, !value && styles.placeholder]}>{value || placeholder}</Text><Feather color={COLORS.inkMuted} name="chevron-down" size={18} /></Pressable></View>;
}

const styles = StyleSheet.create({
  container: { gap: SPACING.small },
  label: { color: COLORS.ink, ...TYPOGRAPHY.body, fontWeight: "600" },
  control: { alignItems: "center", backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADII.medium, borderWidth: 1, flexDirection: "row", gap: SPACING.small, minHeight: MINIMUM_TOUCH_SIZE, paddingHorizontal: SPACING.large },
  value: { color: COLORS.ink, flex: 1, ...TYPOGRAPHY.control },
  placeholder: { color: COLORS.inkMuted },
});

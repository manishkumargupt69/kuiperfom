import type { ReactElement } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import { COLORS, MINIMUM_TOUCH_SIZE, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface SearchFieldProps { accessibilityLabel: string; onChangeText: (value: string) => void; onClear: () => void; placeholder: string; value: string; }

export default function SearchField({ accessibilityLabel, onChangeText, onClear, placeholder, value }: SearchFieldProps): ReactElement {
  return (
    <View style={styles.container}>
      <Feather accessibilityElementsHidden color={COLORS.inkMuted} name="search" size={18} />
      <TextInput accessibilityLabel={accessibilityLabel} autoCapitalize="none" autoCorrect={false} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={COLORS.inkMuted} returnKeyType="search" showSoftInputOnFocus style={styles.input} value={value} />
      {value ? <Pressable accessibilityLabel="Clear search" accessibilityRole="button" onPress={onClear} style={styles.clearButton}><Feather color={COLORS.inkMuted} name="x" size={18} /></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", backgroundColor: COLORS.surfaceMuted, borderColor: COLORS.surfaceMuted, borderRadius: RADII.medium, borderWidth: 1, flex: 1, flexDirection: "row", minHeight: MINIMUM_TOUCH_SIZE, paddingLeft: SPACING.medium },
  input: { color: COLORS.ink, flex: 1, ...TYPOGRAPHY.body, minHeight: MINIMUM_TOUCH_SIZE, paddingHorizontal: SPACING.small },
  clearButton: { alignItems: "center", justifyContent: "center", minHeight: MINIMUM_TOUCH_SIZE, minWidth: MINIMUM_TOUCH_SIZE },
});

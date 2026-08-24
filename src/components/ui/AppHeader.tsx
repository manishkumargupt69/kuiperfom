import type { ComponentProps, ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import { COLORS, MINIMUM_TOUCH_SIZE, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface HeaderAction { accessibilityLabel: string; icon: ComponentProps<typeof Feather>["name"]; onPress: () => void; }
interface AppHeaderProps { title: string; onBack?: () => void; action?: HeaderAction; }

export default function AppHeader({ title, onBack, action }: AppHeaderProps): ReactElement {
  return (
    <View style={styles.container}>
      {onBack ? <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={onBack} style={styles.iconButton}><Feather accessibilityElementsHidden color={COLORS.ink} importantForAccessibility="no-hide-descendants" name="arrow-left" size={22} /></Pressable> : null}
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {action ? <Pressable accessibilityLabel={action.accessibilityLabel} accessibilityRole="button" onPress={action.onPress} style={styles.iconButton}><Feather accessibilityElementsHidden color={COLORS.ink} importantForAccessibility="no-hide-descendants" name={action.icon} size={22} /></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", borderBottomColor: COLORS.border, borderBottomWidth: 1, flexDirection: "row", minHeight: 56, paddingHorizontal: SCREEN_HORIZONTAL_PADDING - SPACING.medium },
  iconButton: { alignItems: "center", justifyContent: "center", minHeight: MINIMUM_TOUCH_SIZE, minWidth: MINIMUM_TOUCH_SIZE },
  title: { color: COLORS.ink, flex: 1, ...TYPOGRAPHY.control, fontWeight: "700", paddingHorizontal: SPACING.small },
});

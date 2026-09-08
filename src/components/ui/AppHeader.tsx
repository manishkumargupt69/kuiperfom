import type { ComponentProps, ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import { useNavigation } from "expo-router";

import { COLORS, MINIMUM_TOUCH_SIZE, SCREEN_HORIZONTAL_PADDING, SPACING } from "@/src/theme/tokens";

interface HeaderAction { accessibilityLabel: string; icon: ComponentProps<typeof Feather>["name"]; onPress: () => void; }
interface AppHeaderProps { title: string; onBack?: () => void; action?: HeaderAction; showMenu?: boolean; }

export default function AppHeader({ title, onBack, action, showMenu }: AppHeaderProps): ReactElement {
  const navigation = useNavigation();
  const handleMenu = () => {};

  return (
    <View style={styles.container}>
      {onBack ? <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={onBack} style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}><Feather accessibilityElementsHidden color={COLORS.ink} importantForAccessibility="no-hide-descendants" name="arrow-left" size={22} /></Pressable> : null}
      {showMenu && !onBack ? <Pressable accessibilityLabel="Open menu" accessibilityRole="button" onPress={handleMenu} style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}><Feather accessibilityElementsHidden color={COLORS.ink} importantForAccessibility="no-hide-descendants" name="menu" size={22} /></Pressable> : null}
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {action ? <Pressable accessibilityLabel={action.accessibilityLabel} accessibilityRole="button" onPress={action.onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}><Feather accessibilityElementsHidden color={COLORS.ink} importantForAccessibility="no-hide-descendants" name={action.icon} size={22} /></Pressable> : null}
    </View>

  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", backgroundColor: COLORS.surface, borderBottomColor: COLORS.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", minHeight: 58, paddingHorizontal: SCREEN_HORIZONTAL_PADDING - SPACING.medium },
  iconButton: { alignItems: "center", borderRadius: 24, justifyContent: "center", minHeight: MINIMUM_TOUCH_SIZE, minWidth: MINIMUM_TOUCH_SIZE },
  iconButtonPressed: { backgroundColor: COLORS.surfaceMuted },
  title: { color: COLORS.ink, flex: 1, fontSize: 17, fontWeight: "700", lineHeight: 22, paddingHorizontal: SPACING.small },
});

import type { ComponentProps, ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import BrandLogo from "@/src/components/branding/BrandLogo";
import { APP_HEADER_CONTENT_HEIGHT, COLORS, MINIMUM_TOUCH_SIZE, SCREEN_HORIZONTAL_PADDING, SPACING } from "@/src/theme/tokens";

interface HeaderAction { accessibilityLabel: string; icon: ComponentProps<typeof Feather>["name"]; onPress: () => void; }
interface AppHeaderProps { title: string; onBack?: () => void; leadingAction?: HeaderAction; action?: HeaderAction; }

export default function AppHeader({ title, onBack, leadingAction, action }: AppHeaderProps): ReactElement {
  const menuAction = leadingAction ?? (action?.icon === "menu" ? action : undefined);
  const trailingAction = action?.icon === "menu" ? undefined : action;

  return (
    <View style={styles.header}>
      {onBack && menuAction ? (
        <View style={styles.menuRow}>
          <Pressable accessibilityLabel={menuAction.accessibilityLabel} accessibilityRole="button" onPress={menuAction.onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}>
            <Feather accessibilityElementsHidden color={COLORS.ink} importantForAccessibility="no-hide-descendants" name={menuAction.icon} size={22} />
          </Pressable>
        </View>
      ) : null}
      <View style={styles.container}>
        {onBack ? <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={onBack} style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}><Feather accessibilityElementsHidden color={COLORS.ink} importantForAccessibility="no-hide-descendants" name="arrow-left" size={22} /></Pressable> : menuAction ? <Pressable accessibilityLabel={menuAction.accessibilityLabel} accessibilityRole="button" onPress={menuAction.onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}><Feather accessibilityElementsHidden color={COLORS.ink} importantForAccessibility="no-hide-descendants" name={menuAction.icon} size={22} /></Pressable> : null}
        {title === "SiteGuard247" ? (
          <View style={styles.brandTitle}>
            <BrandLogo fontSize={18} />
          </View>
        ) : (
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        )}
        {trailingAction ? <Pressable accessibilityLabel={trailingAction.accessibilityLabel} accessibilityRole="button" onPress={trailingAction.onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}><Feather accessibilityElementsHidden color={COLORS.ink} importantForAccessibility="no-hide-descendants" name={trailingAction.icon} size={22} /></Pressable> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border, borderBottomWidth: StyleSheet.hairlineWidth },
  menuRow: { alignItems: "center", flexDirection: "row", minHeight: MINIMUM_TOUCH_SIZE, paddingHorizontal: SCREEN_HORIZONTAL_PADDING - SPACING.medium },
  container: { alignItems: "center", flexDirection: "row", minHeight: APP_HEADER_CONTENT_HEIGHT, paddingHorizontal: SCREEN_HORIZONTAL_PADDING - SPACING.medium },
  brandTitle: { flex: 1, paddingHorizontal: SPACING.small },
  iconButton: { alignItems: "center", borderRadius: 24, justifyContent: "center", minHeight: MINIMUM_TOUCH_SIZE, minWidth: MINIMUM_TOUCH_SIZE },
  iconButtonPressed: { backgroundColor: COLORS.surfaceMuted },
  title: { color: COLORS.ink, flex: 1, fontSize: 17, fontWeight: "700", lineHeight: 22, paddingHorizontal: SPACING.small },
});

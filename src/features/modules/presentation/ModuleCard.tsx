import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PressableStateCallbackType, StyleProp, ViewStyle } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import type { ModuleIconName } from "@/src/features/modules/domain/module.types";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

const ICON_BADGE_SIZE = 44;

interface ModuleCardProps {
  id: string;
  title: string;
  description: string;
  iconName: ModuleIconName;
  onPress: () => void;
  accessibilityHint?: string;
}

const getCardStyle = ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => [
  styles.container,
  pressed && styles.pressed,
];

export default function ModuleCard({
  id,
  title,
  description,
  iconName,
  onPress,
  accessibilityHint = "Double tap to open module",
}: ModuleCardProps): ReactElement {
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={`${title}. ${description}`}
      accessibilityRole="button"
      nativeID={id}
      onPress={onPress}
      style={getCardStyle}
    >
      <View style={styles.header}>
        <View accessibilityElementsHidden style={styles.iconBadge}>
          <Feather color={COLORS.accent} name={iconName} size={22} />
        </View>
        <View accessibilityElementsHidden style={styles.disclosureBadge}>
          <Feather color={COLORS.inkMuted} name="chevron-right" size={18} />
        </View>
      </View>
      <Text numberOfLines={2} style={styles.title}>{title}</Text>
      <Text numberOfLines={2} style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.large,
    borderWidth: 1,
    elevation: 1,
    flexBasis: "48%",
    flexGrow: 0,
    gap: SPACING.small,
    marginBottom: SPACING.medium,
    minHeight: 154,
    padding: SPACING.large,
    shadowColor: "#000000",
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  pressed: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accent,
    opacity: 0.86,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.extraSmall,
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADII.medium,
    height: ICON_BADGE_SIZE,
    justifyContent: "center",
    width: ICON_BADGE_SIZE,
  },
  disclosureBadge: {
    alignItems: "center",
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADII.pill,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  title: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
  },
  description: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.caption,
  },
});

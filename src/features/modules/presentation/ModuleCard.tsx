import type { ReactElement } from "react";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";

import type { ModuleIconName } from "@/src/features/modules/domain/module.types";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const CARD_PRESS_DURATION_MILLISECONDS = 80;
const CARD_IDLE_PROGRESS = 0;
const CARD_PRESSED_PROGRESS = 1;
const ICON_BADGE_SIZE = 40;
const MODULE_ICON_SIZE = 20;

interface ModuleCardProps {
  id: string;
  title: string;
  description: string;
  iconName: ModuleIconName;
  onPress: () => void;
  accessibilityHint?: string;
}

export default function ModuleCard({
  id,
  title,
  description,
  iconName,
  onPress,
  accessibilityHint = "Double tap to open module",
}: ModuleCardProps): ReactElement {
  const pressProgress = useRef(new Animated.Value(CARD_IDLE_PROGRESS)).current;
  const [isFocused, setIsFocused] = useState(false);
  const animatedStateStyle = useMemo(
    () => ({
      backgroundColor: pressProgress.interpolate({
        inputRange: [CARD_IDLE_PROGRESS, CARD_PRESSED_PROGRESS],
        outputRange: [COLORS.surface, COLORS.surfaceMuted],
      }),
      borderColor: pressProgress.interpolate({
        inputRange: [CARD_IDLE_PROGRESS, CARD_PRESSED_PROGRESS],
        outputRange: [COLORS.border, COLORS.accent],
      }),
      borderWidth: pressProgress.interpolate({
        inputRange: [CARD_IDLE_PROGRESS, CARD_PRESSED_PROGRESS],
        outputRange: [1, 1.5],
      }),
    }),
    [pressProgress],
  );

  const animatePressState = (progress: number): void => {
    Animated.timing(pressProgress, {
      duration: CARD_PRESS_DURATION_MILLISECONDS,
      toValue: progress,
      useNativeDriver: false,
    }).start();
  };

  const handlePressIn = (): void => {
    animatePressState(CARD_PRESSED_PROGRESS);
  };

  const handlePressOut = (): void => {
    animatePressState(CARD_IDLE_PROGRESS);
  };

  const handleFocus = (): void => {
    setIsFocused(true);
  };

  const handleBlur = (): void => {
    setIsFocused(false);
  };

  return (
    <AnimatedPressable
      accessible
      accessibilityHint={accessibilityHint}
      accessibilityLabel={`${title}. ${description}`}
      accessibilityRole="button"
      nativeID={id}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        animatedStateStyle,
        isFocused && styles.focused,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Feather
            accessibilityElementsHidden
            color={COLORS.accent}
            importantForAccessibility="no-hide-descendants"
            name={iconName}
            size={MODULE_ICON_SIZE}
          />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Feather
          accessibilityElementsHidden
          color={COLORS.inkMuted}
          importantForAccessibility="no-hide-descendants"
          name="chevron-right"
          size={24}
          style={styles.chevron}
        />
      </View>
      <Text style={styles.description}>{description}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADII.medium,
    elevation: 1,
    marginBottom: SPACING.large,
    minHeight: 112,
    padding: SPACING.large,
    shadowColor: "#000000",
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  focused: {
    outlineColor: COLORS.accent,
    outlineOffset: 2,
    outlineStyle: "solid",
    outlineWidth: 2,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: SPACING.small,
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADII.small,
    height: ICON_BADGE_SIZE,
    justifyContent: "center",
    marginRight: SPACING.medium,
    width: ICON_BADGE_SIZE,
  },
  title: {
    color: COLORS.ink,
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 22,
  },
  chevron: {
    marginLeft: SPACING.small,
  },
  description: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.body,
    fontWeight: "400",
  },
});

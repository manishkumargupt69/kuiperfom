import { memo } from "react";
import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface ProjectDetailsErrorViewProps {
  projectName: string;
  onRetry: () => void;
}

function ProjectDetailsErrorView({ projectName, onRetry }: ProjectDetailsErrorViewProps): ReactElement {
  return (
    <View style={styles.card}>
      <View style={styles.iconSurface}>
        <Feather accessibilityElementsHidden color={COLORS.accent} importantForAccessibility="no-hide-descendants" name="folder" size={28} />
      </View>
      <View style={styles.copy}>
        <Text accessibilityLiveRegion="polite" style={styles.title}>Project details could not be loaded.</Text>
        <Text numberOfLines={2} style={styles.projectName}>{projectName}</Text>
      </View>
      <PrimaryButton label="Try again" onPress={onRetry} />
    </View>
  );
}

export default memo(ProjectDetailsErrorView);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.large,
    borderWidth: 1,
    gap: SPACING.extraLarge,
    padding: SPACING.extraLarge,
  },
  iconSurface: {
    alignItems: "center",
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADII.medium,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  copy: { gap: SPACING.small },
  title: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle, fontWeight: "700" },
  projectName: { color: COLORS.inkMuted, ...TYPOGRAPHY.body },
});

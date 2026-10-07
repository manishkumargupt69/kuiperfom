import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface WorkAssignedStateViewProps {
  status: "empty" | "error";
  onRetry: () => void;
}

export default function WorkAssignedStateView({ status, onRetry }: WorkAssignedStateViewProps): ReactElement {
  const isError = status === "error";

  return (
    <View style={styles.card}>
      <View style={[styles.iconSurface, isError && styles.errorIconSurface]}>
        <Feather
          accessibilityElementsHidden
          color={isError ? COLORS.danger : COLORS.accent}
          importantForAccessibility="no-hide-descendants"
          name={isError ? "alert-circle" : "inbox"}
          size={26}
        />
      </View>
      <Text accessibilityLiveRegion={isError ? "polite" : "none"} style={styles.message}>
        {isError ? "Assigned work could not be loaded." : "No assigned work found."}
      </Text>
      {isError ? <PrimaryButton label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}

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
  errorIconSurface: { backgroundColor: COLORS.dangerSoft },
  message: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle, fontWeight: "700" },
});

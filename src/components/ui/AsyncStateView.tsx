import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface AsyncStateViewProps {
  emptyMessage: string;
  message?: string;
  onRetry: () => void;
  status: "idle" | "loading" | "empty" | "error";
  variant: "list" | "detail";
}

export default function AsyncStateView({ emptyMessage, message, onRetry, status, variant }: AsyncStateViewProps): ReactElement {
  if (status === "idle" || status === "loading") {
    return variant === "list" ? <View accessibilityLabel="Loading" style={styles.skeletons}><View style={styles.listBlock} /><View style={styles.listBlock} /><View style={styles.listBlock} /></View> : <View accessibilityLabel="Loading" style={styles.skeletons}><View style={styles.detailLine} /><View style={styles.detailBlock} /><View style={styles.detailBlock} /></View>;
  }

  if (status === "empty") return <Text style={styles.message}>{emptyMessage}</Text>;
  return <View style={styles.error}><Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text><PrimaryButton label="Try again" onPress={onRetry} /></View>;
}

const styles = StyleSheet.create({
  skeletons: { gap: SPACING.large, paddingVertical: SPACING.large },
  listBlock: { backgroundColor: COLORS.surfaceMuted, borderRadius: RADII.small, height: 108 },
  detailLine: { backgroundColor: COLORS.surfaceMuted, borderRadius: RADII.small, height: 28 },
  detailBlock: { backgroundColor: COLORS.surfaceMuted, borderRadius: RADII.small, height: 96 },
  error: { gap: SPACING.large, paddingVertical: SPACING.extraLarge },
  message: { color: COLORS.inkMuted, ...TYPOGRAPHY.body, paddingVertical: SPACING.extraLarge },
});

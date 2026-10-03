import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { formatDate } from "@/src/utils/format-date-time";

interface ProjectSummaryRowProps {
  projectName: string;
  city: string;
  startDate: string;
}

export default function ProjectSummaryRow({ projectName, city, startDate }: ProjectSummaryRowProps): ReactElement {
  return (
    <View accessibilityLabel={`Project ${projectName}, city ${city}, start date ${formatDate(startDate)}`} style={styles.container}>
      <Text numberOfLines={1} style={styles.projectName}>{projectName}</Text>
      <Text numberOfLines={1} style={styles.city}>{city}</Text>
      <Text numberOfLines={1} style={styles.startDate}>{formatDate(startDate)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: SPACING.small,
    marginTop: SPACING.medium,
    padding: SPACING.medium,
  },
  projectName: { color: COLORS.ink, ...TYPOGRAPHY.caption, flex: 1, fontWeight: "700" },
  city: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, maxWidth: 86 },
  startDate: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
});

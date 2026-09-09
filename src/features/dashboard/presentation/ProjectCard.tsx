import { memo } from "react";
import type { ReactElement } from "react";
import { StyleSheet, Text, Pressable, View } from "react-native";
import type { PressableStateCallbackType, StyleProp, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

import type { ProjectViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface ProjectCardProps {
  project: ProjectViewModel;
  onPress: (project: ProjectViewModel) => void;
}

const getRowStyle = ({
  pressed,
}: PressableStateCallbackType): StyleProp<ViewStyle> => [
  styles.container,
  pressed && styles.pressed,
];

function ProjectCard({ project, onPress }: ProjectCardProps): ReactElement {
  const handlePress = (): void => onPress(project);

  return (
    <Pressable
      accessibilityHint="Opens project work groups"
      accessibilityLabel={`Project ${project.projectName}, Client ${project.clientName}`}
      accessibilityRole="button"
      onPress={handlePress}
      style={getRowStyle}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.clientName}>{project.clientName}</Text>
          <Text style={styles.title} numberOfLines={1}>{project.projectName}</Text>
        </View>
        <View style={styles.chevronContainer}>
          <Feather name="chevron-right" size={20} color={COLORS.inkMuted} />
        </View>
      </View>
      
      <View style={styles.metaContainer}>
        <View style={styles.metaBadge}>
          <Feather name="layers" size={14} color={COLORS.accent} />
          <Text style={styles.metaText}>{project.workGroupCount} Work Groups</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(ProjectCard);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.large,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.medium,
    padding: SPACING.large,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  pressed: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.accent,
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.medium,
  },
  clientName: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.caption,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
    marginBottom: 4,
  },
  title: {
    color: COLORS.ink,
    ...TYPOGRAPHY.sectionTitle,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: SPACING.small,
    paddingVertical: 6,
    borderRadius: RADII.small,
    gap: 6,
  },
  metaText: {
    color: COLORS.accent,
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
  },
});

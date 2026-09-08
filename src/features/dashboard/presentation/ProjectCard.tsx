import type { ReactElement } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { ProjectViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface ProjectCardProps {
  project: ProjectViewModel;
  onPress: (project: ProjectViewModel) => void;
}

export default function ProjectCard({ project, onPress }: ProjectCardProps): ReactElement {
  const handlePress = (): void => onPress(project);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{project.projectName}</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.inkMuted} />
      </View>
      <Text style={styles.subtitle}>{project.clientName}</Text>
      <View style={styles.meta}>
        <Ionicons name="briefcase-outline" size={14} color={COLORS.inkMuted} />
        <Text style={styles.metaText}>{project.workGroupCount} Work Groups</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.medium,
    padding: SPACING.large,
    marginBottom: SPACING.medium,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.small,
  },
  title: {
    ...TYPOGRAPHY.body,
    fontWeight: "700",
    color: COLORS.ink,
    flex: 1,
    marginRight: SPACING.small,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.inkMuted,
    marginBottom: SPACING.medium,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.extraSmall,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.inkMuted,
  },
});

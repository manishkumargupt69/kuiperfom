import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import type { WorkGroupViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface WorkGroupCardProps {
  workGroup: WorkGroupViewModel;
  expanded?: boolean;
  onPress?: () => void;
}

export default function WorkGroupCard({ workGroup, expanded, onPress }: WorkGroupCardProps): ReactElement {
  const CardContainer = onPress ? Pressable : View;
  
  return (
    <CardContainer 
      onPress={onPress} 
      style={({ pressed }: any) => [
        styles.container, 
        expanded && styles.containerExpanded,
        pressed && styles.pressed
      ] as any}
    >
      <View style={styles.content}>
        <View style={[styles.iconFrame, expanded && styles.iconFrameExpanded]}>
          <Feather 
            name="folder" 
            size={22} 
            color={expanded ? COLORS.white : COLORS.accent} 
          />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {workGroup.name}
          </Text>
          <Text style={styles.subtitle}>
            {workGroup.workItemCount} {workGroup.workItemCount === 1 ? "work item" : "work items"}
          </Text>
        </View>
        <View style={[styles.chevron, expanded && styles.chevronExpanded]}>
          <Feather 
            name="chevron-down" 
            size={20} 
            color={expanded ? COLORS.accent : COLORS.inkMuted} 
          />
        </View>
      </View>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.large,
    marginBottom: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  containerExpanded: {
    borderColor: COLORS.accent,
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.large,
  },
  iconFrame: {
    width: 48,
    height: 48,
    borderRadius: RADII.medium,
    backgroundColor: COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.medium,
  },
  iconFrameExpanded: {
    backgroundColor: COLORS.accent,
  },
  textBlock: {
    flex: 1,
    marginRight: SPACING.medium,
  },
  title: {
    ...TYPOGRAPHY.body,
    fontWeight: "700",
    color: COLORS.ink,
    marginBottom: 4,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.inkMuted,
    fontWeight: "600",
  },
  chevron: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: COLORS.background,
  },
  chevronExpanded: {
    transform: [{ rotate: "180deg" }],
    backgroundColor: COLORS.accentSoft,
  },
});

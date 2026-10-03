import type { ReactElement } from "react";
import { memo } from "react";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { AssignedCityViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { COLORS, MINIMUM_TOUCH_SIZE, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface AssignedCityRowProps {
  city: AssignedCityViewModel;
  isSelected: boolean;
  onPress: (city: AssignedCityViewModel) => void;
}

function AssignedCityRow({ city, isSelected, onPress }: AssignedCityRowProps): ReactElement {
  const projectCount = city.projectCount ?? city.projects.length;
  const projectLabel = projectCount === 1 ? "project" : "projects";

  return (
    <Pressable
      accessibilityHint="Opens projects in this city"
      accessibilityLabel={`${city.name}, code ${city.code}, ${projectCount} ${projectLabel}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={() => onPress(city)}
      style={({ pressed }) => [styles.row, isSelected && styles.selected, pressed && styles.pressed]}
    >
      <View style={styles.icon}><Feather color={COLORS.accent} name="map-pin" size={21} /></View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.name}>{city.name}</Text>
        <Text numberOfLines={1} style={styles.code}>Code {city.code}</Text>
      </View>
      <View style={styles.countBlock}>
        <Text style={styles.count}>{projectCount}</Text>
        <Text style={styles.countLabel}>{projectLabel}</Text>
      </View>
      <Feather accessibilityElementsHidden color={COLORS.inkMuted} name="chevron-right" size={18} />
    </Pressable>
  );
}

export default memo(AssignedCityRow);

const styles = StyleSheet.create({
  row: { alignItems: "center", backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: RADII.large, borderWidth: 1, elevation: 2, flexDirection: "row", gap: SPACING.medium, minHeight: 88, padding: SPACING.large, shadowColor: COLORS.ink, shadowOffset: { height: 2, width: 0 }, shadowOpacity: 0.05, shadowRadius: 6 },
  selected: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accent },
  pressed: { backgroundColor: COLORS.surfaceMuted },
  icon: { alignItems: "center", backgroundColor: COLORS.accentSoft, borderRadius: RADII.medium, height: MINIMUM_TOUCH_SIZE, justifyContent: "center", width: MINIMUM_TOUCH_SIZE },
  copy: { flex: 1, gap: SPACING.extraSmall },
  name: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "800" },
  code: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, fontVariant: ["tabular-nums"] },
  countBlock: { alignItems: "center", borderLeftColor: COLORS.border, borderLeftWidth: 1, minWidth: 64, paddingLeft: SPACING.medium },
  count: { color: COLORS.accent, ...TYPOGRAPHY.sectionTitle, fontVariant: ["tabular-nums"], fontWeight: "800" },
  countLabel: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, fontWeight: "600" },
});

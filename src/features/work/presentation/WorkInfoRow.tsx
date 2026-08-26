import { memo } from "react";
import type { ComponentProps, ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface WorkInfoRowProps {
  iconName: ComponentProps<typeof Feather>["name"];
  value: string;
  label?: string;
}

function WorkInfoRow({
  iconName,
  value,
  label,
}: WorkInfoRowProps): ReactElement {
  return (
    <View style={styles.row}>
      <View accessibilityElementsHidden style={styles.iconBadge}>
        <Feather color={COLORS.accent} name={iconName} size={16} />
      </View>
      <View style={styles.copy}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

export default memo(WorkInfoRow);

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACING.medium,
    minHeight: 36,
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADII.small,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  copy: { flex: 1 },
  label: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.caption,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  value: {
    color: COLORS.ink,
    ...TYPOGRAPHY.body,
    fontWeight: "600",
  },
});

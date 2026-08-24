import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface ProfileDetailRowProps {
  label: string;
  value: string;
}

export default function ProfileDetailRow({
  label,
  value,
}: ProfileDetailRowProps): ReactElement {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        numberOfLines={1}
        selectable
        style={styles.value}
      >
        {value || "—"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: SPACING.medium,
    minHeight: 38,
    paddingVertical: SPACING.extraSmall,
  },
  label: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.caption,
    fontWeight: "600",
    letterSpacing: 0.35,
    textTransform: "uppercase",
    width: 88,
  },
  value: {
    color: COLORS.ink,
    flex: 1,
    ...TYPOGRAPHY.caption,
    fontWeight: "600",
    textAlign: "right",
  },
});

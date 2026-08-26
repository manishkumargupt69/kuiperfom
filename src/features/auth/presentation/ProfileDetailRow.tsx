import type { ComponentProps, ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import { COLORS, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface ProfileDetailRowProps {
  iconName: ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
}

export default function ProfileDetailRow({
  iconName,
  label,
  value,
}: ProfileDetailRowProps): ReactElement {
  return (
    <View style={styles.row}>
      <View accessibilityElementsHidden style={styles.iconBadge}>
        <Feather color={COLORS.accent} name={iconName} size={15} />
      </View>
      <View style={styles.copy}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: SPACING.small,
    minHeight: 40,
    paddingVertical: SPACING.small,
  },
  iconBadge: {
    alignItems: "center",
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADII.small,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  copy: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: SPACING.small,
  },
  label: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.caption,
    fontWeight: "600",
    letterSpacing: 0.25,
    textTransform: "uppercase",
    width: 82,
  },
  value: {
    color: COLORS.ink,
    flex: 1,
    ...TYPOGRAPHY.caption,
    fontWeight: "600",
    textAlign: "right",
  },
});

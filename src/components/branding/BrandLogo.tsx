import type { ReactElement } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { SPACING } from "@/src/theme/tokens";

interface BrandLogoProps {
  fontSize?: number;
  style?: ViewStyle;
}

export default function BrandLogo({ fontSize = 24, style }: BrandLogoProps): ReactElement {
  const scaledGap = fontSize * 0.15;
  const scaledPaddingH = fontSize * 0.3;
  const scaledPaddingV = fontSize * 0.15;
  const scaledBorderRadius = fontSize * 0.2;

  return (
    <View style={[styles.container, { gap: scaledGap }, style]}>
      <Text style={[styles.siteguard, { fontSize }]}>SITEGUARD</Text>
      <View style={[styles.box, { paddingHorizontal: scaledPaddingH, paddingVertical: scaledPaddingV, borderRadius: scaledBorderRadius }]}>
        <Text style={[styles.twentyFourSeven, { fontSize: fontSize * 0.7 }]}>24/7</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  siteguard: {
    fontFamily: "IBMPlexSans_700Bold",
    color: "#082823",
  },
  box: {
    backgroundColor: "#082823",
    justifyContent: "center",
    alignItems: "center",
  },
  twentyFourSeven: {
    fontFamily: "IBMPlexSans_700Bold",
    color: "#12D18E",
  },
});

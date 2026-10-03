import type { ReactElement } from "react";
import { memo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import Feather from "@expo/vector-icons/Feather";

import type { AnalyticsSegmentViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { getCityColor, getStatusColor } from "@/src/features/dashboard/presentation/dashboard-colors";
import { COLORS, MINIMUM_TOUCH_SIZE, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

const CHART_SIZE = 128;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = 50;
const CHART_STROKE = 16;
const CIRCUMFERENCE = 2 * Math.PI * CHART_RADIUS;
const SEGMENT_GAP = 2;

interface AnalyticsPieChartProps {
  title: string;
  unit: string;
  palette: "status" | "city";
  segments: readonly AnalyticsSegmentViewModel[];
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
}

function AnalyticsPieChart({ title, unit, palette, segments, selectedKey, onSelect }: AnalyticsPieChartProps): ReactElement {
  const total = segments.reduce((count, segment) => count + segment.count, 0);
  let distance = 0;

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.viewAll}>View all <Feather name="chevron-right" size={12} /></Text>
      </View>
      <View style={styles.content}>
        <View accessibilityLabel={`${title}: ${total} ${unit}`} style={styles.chart}>
          <Svg accessibilityElementsHidden height={CHART_SIZE} width={CHART_SIZE}>
            <Circle cx={CHART_CENTER} cy={CHART_CENTER} fill="none" r={CHART_RADIUS} stroke={COLORS.surfaceMuted} strokeWidth={CHART_STROKE} />
            <G originX={CHART_CENTER} originY={CHART_CENTER} rotation={-90}>
              {segments.map((segment, index) => {
                const length = total > 0 ? segment.count / total * CIRCUMFERENCE : 0;
                const visibleLength = segments.length === 1 ? length : Math.max(length - SEGMENT_GAP, 0);
                const offset = distance;
                distance += length;
                const color = palette === "status" ? getStatusColor(segment.key) : getCityColor(index);
                return (
                  <Circle
                    key={segment.key}
                    cx={CHART_CENTER}
                    cy={CHART_CENTER}
                    fill="none"
                    opacity={selectedKey && selectedKey !== segment.key ? 0.32 : 1}
                    onPress={onSelect ? () => onSelect(segment.key) : undefined}
                    r={CHART_RADIUS}
                    stroke={color}
                    strokeDasharray={[visibleLength, CIRCUMFERENCE - visibleLength]}
                    strokeDashoffset={-offset}
                    strokeWidth={CHART_STROKE}
                  />
                );
              })}
            </G>
          </Svg>
          <View pointerEvents="none" style={styles.chartCenter}>
            <Text style={styles.total}>{total}</Text>
            <Text style={styles.totalLabel}>{unit}</Text>
          </View>
        </View>
        <ScrollView style={styles.legend} persistentScrollbar showsVerticalScrollIndicator>
          {segments.map((segment, index) => {
            const color = palette === "status" ? getStatusColor(segment.key) : getCityColor(index);
            const percentage = total > 0 ? Math.round(segment.count / total * 100) : 0;
            const content = (
              <>
                <View accessibilityElementsHidden style={[styles.swatch, { backgroundColor: color }]} />
                <Text numberOfLines={1} style={styles.label}>{segment.label}</Text>
                <Text style={styles.count}>{segment.count} ({percentage}%)</Text>
              </>
            );
            return onSelect ? (
              <Pressable
                key={segment.key}
                accessibilityLabel={`${segment.label}: ${segment.count} ${unit}, ${percentage} percent`}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedKey === segment.key }}
                onPress={() => onSelect(segment.key)}
                style={({ pressed }) => [styles.legendRow, pressed && styles.pressed, selectedKey === segment.key && styles.selected]}
              >
                {content}
              </Pressable>
            ) : <View key={segment.key} style={styles.legendRow}>{content}</View>;
          })}
        </ScrollView>
      </View>
    </View>
  );
}

export default memo(AnalyticsPieChart);

const styles = StyleSheet.create({
  section: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: SPACING.medium, padding: SPACING.large },
  title: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "700" },
  content: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: SPACING.small },
  chart: { alignItems: "center", height: CHART_SIZE, justifyContent: "center", width: CHART_SIZE },
  chartCenter: { alignItems: "center", justifyContent: "center", position: "absolute" },
  total: { color: COLORS.ink, fontSize: 27, fontVariant: ["tabular-nums"], fontWeight: "800", lineHeight: 32 },
  totalLabel: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  legend: { flex: 1, minWidth: 148, maxHeight: 160 },
  legendRow: { alignItems: "center", borderRadius: 8, flexDirection: "row", gap: SPACING.extraSmall, minHeight: MINIMUM_TOUCH_SIZE, paddingHorizontal: SPACING.extraSmall },
  pressed: { backgroundColor: COLORS.surfaceMuted },
  selected: { backgroundColor: COLORS.accentSoft },
  swatch: { borderRadius: 4, height: 8, marginRight: SPACING.extraSmall, width: 8 },
  label: { color: COLORS.ink, ...TYPOGRAPHY.caption, flex: 1 },
  count: { color: COLORS.ink, ...TYPOGRAPHY.caption, fontVariant: ["tabular-nums"], fontWeight: "700" },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  viewAll: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
});

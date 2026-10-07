import type { ReactElement } from "react";
import { memo, useCallback } from "react";
import type { ListRenderItemInfo } from "react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Svg, { Circle, G } from "react-native-svg";

import type { AnalyticsSegmentViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { getCityColor, getStatusColor } from "@/src/features/dashboard/presentation/dashboard-colors";
import { COLORS, MINIMUM_TOUCH_SIZE, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

const CHART_SIZE = 128;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = 50;
const CHART_STROKE = 16;
const CIRCUMFERENCE = 2 * Math.PI * CHART_RADIUS;
const SEGMENT_GAP = 2;
const VISIBLE_LEGEND_ROWS = 4;
const LEGEND_SCROLL_CUE_HEIGHT = 12;
const LEGEND_HEIGHT = VISIBLE_LEGEND_ROWS * MINIMUM_TOUCH_SIZE + LEGEND_SCROLL_CUE_HEIGHT;
const getSegmentKey = (segment: AnalyticsSegmentViewModel): string => segment.key;

interface AnalyticsPieChartProps {
  title: string;
  unit: string;
  palette: "status" | "city";
  segments: readonly AnalyticsSegmentViewModel[];
  emptyMessage: string;
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
}

function AnalyticsPieChart({ title, unit, palette, segments, emptyMessage, selectedKey, onSelect }: AnalyticsPieChartProps): ReactElement {
  const total = segments.reduce((count, segment) => count + segment.count, 0);
  const isEmpty = segments.length === 0;
  const hasMoreSegments = segments.length > VISIBLE_LEGEND_ROWS;
  let distance = 0;
  const renderLegendItem = useCallback(({ item: segment, index }: ListRenderItemInfo<AnalyticsSegmentViewModel>): ReactElement => {
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
        accessibilityLabel={`${segment.label}: ${segment.count} ${unit}, ${percentage} percent`}
        accessibilityRole="button"
        accessibilityState={{ selected: selectedKey === segment.key }}
        onPress={() => onSelect(segment.key)}
        style={({ pressed }) => [styles.legendRow, pressed && styles.pressed, selectedKey === segment.key && styles.selected]}
      >
        {content}
      </Pressable>
    ) : <View style={styles.legendRow}>{content}</View>;
  }, [onSelect, palette, selectedKey, total, unit]);

  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
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
        <View style={[styles.legendViewport, isEmpty && styles.emptyLegendViewport, { height: isEmpty ? CHART_SIZE : Math.min(segments.length * MINIMUM_TOUCH_SIZE, LEGEND_HEIGHT) }]}>
          {isEmpty ? (
            <View style={styles.emptyLegend}><Text style={styles.emptyMessage}>{emptyMessage}</Text></View>
          ) : (
            <FlatList
              accessibilityHint={hasMoreSegments ? "Swipe up to view more" : undefined}
              data={segments}
              disallowInterruption={hasMoreSegments}
              keyExtractor={getSegmentKey}
              nestedScrollEnabled
              persistentScrollbar={hasMoreSegments}
              renderItem={renderLegendItem}
              scrollEnabled={hasMoreSegments}
              showsVerticalScrollIndicator={hasMoreSegments}
              style={styles.legend}
            />
          )}
        </View>
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
  legendViewport: { flex: 1, minWidth: 148 },
  emptyLegendViewport: { minWidth: 0 },
  emptyLegend: { flex: 1, justifyContent: "center" },
  emptyMessage: { color: COLORS.inkMuted, ...TYPOGRAPHY.body },
  legend: { flex: 1 },
  legendRow: { alignItems: "center", borderRadius: 8, flexDirection: "row", gap: SPACING.extraSmall, minHeight: MINIMUM_TOUCH_SIZE, paddingLeft: SPACING.extraSmall, paddingRight: SPACING.large },
  pressed: { backgroundColor: COLORS.surfaceMuted },
  selected: { backgroundColor: COLORS.accentSoft },
  swatch: { borderRadius: 4, height: 8, marginRight: SPACING.extraSmall, width: 8 },
  label: { color: COLORS.ink, ...TYPOGRAPHY.caption, flex: 1 },
  count: { color: COLORS.ink, ...TYPOGRAPHY.caption, fontVariant: ["tabular-nums"], fontWeight: "700" },
});

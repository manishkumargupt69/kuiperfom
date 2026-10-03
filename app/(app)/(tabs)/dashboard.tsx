import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import { AccessibilityInfo, Animated, Easing, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { router } from "expo-router";

import AsyncStateView from "@/src/components/ui/AsyncStateView";
import DrawerHeader from "@/src/components/ui/DrawerHeader";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import SearchField from "@/src/components/ui/SearchField";
import SecondaryButton from "@/src/components/ui/SecondaryButton";
import type { AnalyticsDisplayProject } from "@/src/features/dashboard/domain/dashboard.types";
import { useDashboardAnalytics } from "@/src/features/dashboard/hooks/use-dashboard-analytics";
import AnalyticsPieChart from "@/src/features/dashboard/presentation/AnalyticsPieChart";
import AnalyticsProjectRow from "@/src/features/dashboard/presentation/AnalyticsProjectRow";
import { useDashboardStore } from "@/src/features/dashboard/state/dashboard-store";
import { COLORS, MINIMUM_TOUCH_SIZE, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

type DashboardFilter = { kind: "status"; key: string } | { kind: "delayed" } | null;

const getProjectKey = (project: AnalyticsDisplayProject): string => project.id;

function DashboardSkeleton(): ReactElement {
  const shimmer = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmer]);

  return (
    <View style={styles.overview}>
      <Animated.View style={[styles.metrics, { opacity: shimmer }]}>
        <View style={styles.totalMetric}>
          <View style={{ backgroundColor: COLORS.surfaceMuted, height: 12, width: 80, borderRadius: 4, marginBottom: 8 }} />
          <View style={{ backgroundColor: COLORS.surfaceMuted, height: 40, width: 60, borderRadius: 8, marginBottom: 4 }} />
          <View style={{ backgroundColor: COLORS.surfaceMuted, height: 12, width: 100, borderRadius: 4 }} />
        </View>
      </Animated.View>

      {[1, 2].map((key) => (
        <Animated.View key={key} style={[styles.section, { opacity: shimmer }]}>
          <View style={{ backgroundColor: COLORS.surfaceMuted, height: 20, width: 120, borderRadius: 4, marginBottom: 16 }} />
          <View style={styles.content}>
            <View style={[styles.chart, { backgroundColor: COLORS.surfaceMuted, borderRadius: 64 }]} />
            <View style={styles.legend}>
              {[1, 2, 3].map(i => (
                <View key={i} style={styles.legendRow}>
                  <View style={[styles.swatch, { backgroundColor: COLORS.surfaceMuted }]} />
                  <View style={{ backgroundColor: COLORS.surfaceMuted, height: 12, width: 60, borderRadius: 4, flex: 1 }} />
                  <View style={{ backgroundColor: COLORS.surfaceMuted, height: 12, width: 24, borderRadius: 4 }} />
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}


export default function DashboardScreen(): ReactElement {
  const { viewState, reload } = useDashboardAnalytics();
  const setSelectedProject = useDashboardStore((state) => state.setSelectedProject);
  const [filter, setFilter] = useState<DashboardFilter>(null);
  const [searchText, setSearchText] = useState("");
  const listRef = useRef<FlatList<AnalyticsDisplayProject>>(null);
  const projectListOffset = useRef(0);
  const reduceMotionRef = useRef(false);
  const hasRevealedRef = useRef(false);
  const metricReveal = useRef(new Animated.Value(0)).current;
  const statusReveal = useRef(new Animated.Value(0)).current;
  const cityReveal = useRef(new Animated.Value(0)).current;
  const analytics = viewState.status === "success" ? viewState.data : null;
  const hasAnalytics = Boolean(analytics);

  useEffect(() => {
    if (!hasAnalytics || hasRevealedRef.current) return;
    hasRevealedRef.current = true;
    let isActive = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (!isActive) return;
        reduceMotionRef.current = reduceMotion;
        Animated.stagger(
          reduceMotion ? 0 : 75,
          [metricReveal, statusReveal, cityReveal].map((value) =>
            Animated.timing(value, {
              toValue: 1,
              duration: reduceMotion ? 0 : 280,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ),
        ).start();
      })
      .catch(() => {
        if (isActive) [metricReveal, statusReveal, cityReveal].forEach((value) => value.setValue(1));
      });
    return () => {
      isActive = false;
      [metricReveal, statusReveal, cityReveal].forEach((value) => value.stopAnimation());
    };
  }, [hasAnalytics, cityReveal, metricReveal, statusReveal]);

  const rotation = useRef(new Animated.Value(0)).current;

  const handleRetry = useCallback((): void => {
    Animated.timing(rotation, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) rotation.setValue(0);
    });
    void reload();
  }, [reload, rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const clearSearch = useCallback((): void => setSearchText(""), []);
  const clearFilter = useCallback((): void => setFilter(null), []);
  const captureProjectListOffset = useCallback((event: LayoutChangeEvent): void => {
    projectListOffset.current = event.nativeEvent.layout.y;
  }, []);
  const scrollToProjectList = useCallback((): void => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: Math.max(0, projectListOffset.current - SPACING.medium),
        animated: !reduceMotionRef.current,
      });
    });
  }, []);
  const showStatus = useCallback((key: string): void => {
    setFilter((current) => current?.kind === "status" && current.key === key ? null : { kind: "status", key });
    scrollToProjectList();
  }, [scrollToProjectList]);
  const showDelayed = useCallback((): void => {
    setFilter((current) => current?.kind === "delayed" ? null : { kind: "delayed" });
    scrollToProjectList();
  }, [scrollToProjectList]);
  const openProject = useCallback((project: AnalyticsDisplayProject): void => {
    setSelectedProject(project);
    router.push("/(app)/work-group-details");
  }, [setSelectedProject]);
  const openCityList = useCallback((cityId: string): void => {
    router.navigate({ pathname: "/(app)/(tabs)/city-list", params: { cityId } });
  }, []);
  const renderProject = useCallback(
    ({ item }: { item: AnalyticsDisplayProject }): ReactElement => <AnalyticsProjectRow project={item} onPress={openProject} />,
    [openProject],
  );

  const filteredProjects = useMemo(() => {
    if (!analytics) return [];
    const normalizedSearch = searchText.trim().toLocaleLowerCase();
    return analytics.projects.filter((project) => {
      if (filter?.kind === "status" && project.status !== filter.key) return false;
      if (filter?.kind === "delayed" && project.delayDays === 0) return false;
      return !normalizedSearch || [project.projectNumber, project.projectName, project.cityName, project.clientName]
        .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
    });
  }, [analytics, filter, searchText]);

  return (
    <ScreenContainer>
      <DrawerHeader title="Dashboard" />
      {analytics || viewState.status === "loading" ? (
        <FlatList
          ref={listRef}
          contentContainerStyle={styles.list}
          data={filteredProjects}
          keyExtractor={getProjectKey}
          renderItem={renderProject}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.headingRow}>
                <View style={styles.headingCopy}>
                  <Text accessibilityRole="header" style={styles.title}>Assigned projects</Text>
                </View>
                <Pressable accessibilityLabel="Refresh dashboard" accessibilityRole="button" onPress={handleRetry} style={({ pressed }) => [styles.refreshButton, pressed && { opacity: 0.5 }]}>
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Feather color={COLORS.accent} name="refresh-cw" size={19} />
                  </Animated.View>
                </Pressable>
              </View>
              
              {analytics ? (
                <>
                  <View style={styles.overview}>
                    <Animated.View style={[styles.metricsRow, { opacity: metricReveal, transform: [{ translateY: metricReveal.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
                      <View style={styles.metricCard}>
                        <View style={[styles.metricIconBox, { backgroundColor: COLORS.successSoft }]}><Feather color={COLORS.success} name="layers" size={17} /></View>
                        <Text style={[styles.metricLabel, { color: COLORS.ink }]}>Total Projects</Text>
                        <Text style={styles.metricValue}>{analytics.projects.length}</Text>
                        <Text style={styles.metricHint}>Assigned to you</Text>
                      </View>
                      <Pressable accessibilityLabel={`Delayed projects: ${analytics.delayedCount}. Filter list`} accessibilityRole="button" accessibilityState={{ selected: filter?.kind === "delayed" }} onPress={showDelayed} style={({ pressed }) => [styles.metricCard, pressed && styles.pressed, filter?.kind === "delayed" && styles.selected]}>
                        <View style={[styles.metricIconBox, { backgroundColor: COLORS.dangerSoft }]}><Feather color={COLORS.danger} name="clock" size={17} /></View>
                        <Text style={[styles.metricLabel, { color: COLORS.ink }]}>Delayed</Text>
                        <View style={styles.delayedValueRow}>
                          <Text style={styles.metricValue}>{analytics.delayedCount}</Text>
                          <Feather color={COLORS.inkMuted} name="chevron-right" size={20} />
                        </View>
                      </Pressable>
                    </Animated.View>
                    <Animated.View style={{ opacity: statusReveal, transform: [{ translateY: statusReveal.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
                      <AnalyticsPieChart title="Project status" unit="projects" palette="status" segments={analytics.statusSegments} selectedKey={filter?.kind === "status" ? filter.key : null} onSelect={showStatus} />
                    </Animated.View>
                    <Animated.View style={{ opacity: cityReveal, transform: [{ translateY: cityReveal.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
                      <AnalyticsPieChart title="Projects by city" unit="projects" palette="city" segments={analytics.citySegments} onSelect={openCityList} />
                    </Animated.View>
                  </View>
                  <View onLayout={captureProjectListOffset} style={styles.projectsSection}>
                    <View style={styles.projectsHeading}>
                      <Text accessibilityRole="header" style={styles.sectionTitle}>Projects</Text>
                      <Text style={styles.resultCount}>{filteredProjects.length} of {analytics.projects.length}</Text>
                    </View>
                    <SearchField accessibilityLabel="Search projects" onChangeText={setSearchText} onClear={clearSearch} placeholder="Search projects" value={searchText} />
                    {filter ? <SecondaryButton label="Clear filter" onPress={clearFilter} /> : null}
                  </View>
                </>
              ) : (
                <DashboardSkeleton />
              )}
            </View>
          }
          ListEmptyComponent={analytics ? <Text style={styles.empty}>No projects match this filter.</Text> : null}
        />
      ) : (
        <View style={styles.state}>
          <AsyncStateView emptyMessage="No projects are assigned to you." message={viewState.status === "error" ? viewState.message : undefined} onRetry={handleRetry} status={viewState.status === "success" ? "idle" : viewState.status} variant="list" />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: SPACING.section, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  state: { flex: 1, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  header: { gap: SPACING.large, paddingBottom: SPACING.large, paddingTop: SPACING.large },
  headingRow: { alignItems: "center", flexDirection: "row", gap: SPACING.small, justifyContent: "space-between" },
  headingCopy: { flex: 1, gap: SPACING.extraSmall },
  title: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle, fontWeight: "800" },
  refreshButton: { alignItems: "center", height: MINIMUM_TOUCH_SIZE, justifyContent: "center", width: MINIMUM_TOUCH_SIZE },
  overview: { gap: SPACING.medium },
  metricsRow: { flexDirection: "row", gap: SPACING.medium },
  metricCard: { flex: 1, backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: SPACING.large, minHeight: 124, gap: SPACING.extraSmall },
  metricIconBox: { alignItems: "center", borderRadius: 9, height: 30, justifyContent: "center", width: 30, marginBottom: SPACING.extraSmall },
  metricLabel: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, fontWeight: "600" },
  metricValue: { color: COLORS.ink, fontSize: 38, fontVariant: ["tabular-nums"], fontWeight: "800", lineHeight: 44 },
  metricHint: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
  delayedValueRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pressed: { backgroundColor: COLORS.surfaceMuted },
  selected: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accent },
  projectsSection: { gap: SPACING.medium },
  projectsHeading: { alignItems: "baseline", flexDirection: "row", justifyContent: "space-between" },
  sectionTitle: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "700" },
  resultCount: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, fontVariant: ["tabular-nums"] },
  empty: { color: COLORS.inkMuted, ...TYPOGRAPHY.body, paddingVertical: SPACING.extraLarge },
  
  // Skeleton Specific Styles
  section: { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: SPACING.medium, padding: SPACING.large },
  content: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: SPACING.small },
  chart: { alignItems: "center", height: 128, justifyContent: "center", width: 128 },
  legend: { flex: 1, minWidth: 148, maxHeight: 160 },
  legendRow: { alignItems: "center", borderRadius: 8, flexDirection: "row", gap: SPACING.extraSmall, minHeight: MINIMUM_TOUCH_SIZE, paddingHorizontal: SPACING.extraSmall },
  swatch: { borderRadius: 4, height: 8, marginRight: SPACING.extraSmall, width: 8 },
});

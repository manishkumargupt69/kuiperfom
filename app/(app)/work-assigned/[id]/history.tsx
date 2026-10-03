import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import DetailHeader from "@/src/components/ui/DetailHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import SearchField from "@/src/components/ui/SearchField";
import type { WorkHistoryViewModel } from "@/src/features/work/domain/work.types";
import { useWorkHistory } from "@/src/features/work/hooks/use-work-history";
import WorkHistoryRow from "@/src/features/work/presentation/WorkHistoryRow";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";
import { formatDate } from "@/src/utils/format-date-time";

type WorkHistoryParams = { id: string };
const getHistoryKey = (entry: WorkHistoryViewModel): string => entry.id;

export default function WorkHistoryScreen(): ReactElement {
  const { id } = useLocalSearchParams<WorkHistoryParams>();
  const { viewState, reload } = useWorkHistory(id);
  const [dateSearch, setDateSearch] = useState("");
  const clearSearch = useCallback((): void => setDateSearch(""), []);
  const handleBack = useCallback((): void => router.back(), []);
  const handleRetry = useCallback((): void => { void reload(); }, [reload]);
  const renderEntry = useCallback(({ item }: { item: WorkHistoryViewModel }): ReactElement => <WorkHistoryRow entry={item} />, []);
  const entries = useMemo(() => {
    if (viewState.status !== "success") return [];
    const query = dateSearch.trim().toLocaleLowerCase();
    return query ? viewState.data.filter((entry) =>
      entry.actionAt.slice(0, 10).includes(query) || formatDate(entry.actionAt).toLocaleLowerCase().includes(query) ||
      Boolean(entry.audit?.auditedAt && (entry.audit.auditedAt.slice(0, 10).includes(query) || formatDate(entry.audit.auditedAt).toLocaleLowerCase().includes(query))),
    ) : viewState.data;
  }, [dateSearch, viewState]);

  return (
    <ScreenContainer>
      <DetailHeader onBack={handleBack} title="Work History" />
      {viewState.status === "success" ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={entries}
          keyExtractor={getHistoryKey}
          ListHeaderComponent={<View style={styles.header}><Text accessibilityRole="header" style={styles.title}>Update history</Text><SearchField accessibilityLabel="Search history by date" onChangeText={setDateSearch} onClear={clearSearch} placeholder="Search date" value={dateSearch} /></View>}
          ListEmptyComponent={<Text style={styles.empty}>No updates match this date.</Text>}
          renderItem={renderEntry}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.state}><AsyncStateView emptyMessage="No updates have been recorded for this work item." message={viewState.status === "error" ? viewState.message : undefined} onRetry={handleRetry} status={viewState.status} variant="list" /></View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: SPACING.section, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  state: { flex: 1, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  header: { gap: SPACING.medium, paddingVertical: SPACING.large },
  title: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle, fontWeight: "800" },
  empty: { color: COLORS.inkMuted, ...TYPOGRAPHY.body, paddingVertical: SPACING.extraLarge },
});

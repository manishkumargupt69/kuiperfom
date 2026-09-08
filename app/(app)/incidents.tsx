import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import AppHeader from "@/src/components/ui/AppHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import SearchField from "@/src/components/ui/SearchField";
import { useAuthStore } from "@/src/features/auth/state/auth-store";
import type { IncidentViewModel } from "@/src/features/incidents/domain/incident.types";
import { useReportedIncidents } from "@/src/features/incidents/hooks/use-reported-incidents";
import IncidentItemRow from "@/src/features/incidents/presentation/IncidentItemRow";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING } from "@/src/theme/tokens";

export default function IncidentsScreen(): ReactElement {
  const [searchText, setSearchText] = useState("");
  const session = useAuthStore((state) => state.session);
  const { viewState, reload, loadMore, isFetchingNextPage } = useReportedIncidents(session, searchText);
  const handleBack = useCallback((): void => router.back(), []);
  const clearSearch = useCallback((): void => setSearchText(""), []);
  const reportIncident = useCallback((): void => router.push("/(app)/incidents/new"), []);
  const openIncident = useCallback((incident: IncidentViewModel): void => { router.push({ pathname: "/(app)/incidents/[id]", params: { id: incident.id } }); }, []);
  const renderItem = useCallback(({ item }: { item: IncidentViewModel }): ReactElement => <IncidentItemRow incident={item} onPress={openIncident} />, [openIncident]);
  const keyExtractor = useCallback((item: IncidentViewModel): string => item.id, []);
  const handleRetry = useCallback((): void => { void reload(); }, [reload]);

  const renderFooter = useCallback(
    () =>
      isFetchingNextPage ? (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" />
        </View>
      ) : null,
    [isFetchingNextPage]
  );

  return (
    <ScreenContainer>
      <AppHeader onBack={handleBack} title="Incidents" />
      <View style={styles.tools}><SearchField accessibilityLabel="Search incidents" onChangeText={setSearchText} onClear={clearSearch} placeholder="Search incidents" value={searchText} /></View>
      <View style={styles.body}>
        {viewState.status === "success" ? (
          <FlatList 
            contentContainerStyle={styles.list} 
            data={viewState.data} 
            keyExtractor={keyExtractor} 
            keyboardShouldPersistTaps="handled" 
            renderItem={renderItem} 
            showsVerticalScrollIndicator={false} 
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        ) : (
          <AsyncStateView emptyMessage="No reported incidents found." message={viewState.status === "error" ? viewState.message : undefined} onRetry={handleRetry} status={viewState.status} variant="list" />
        )}
      </View>
      <View style={styles.footer}><PrimaryButton label="Report Incident" onPress={reportIncident} /></View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tools: { flexDirection: "row", gap: SPACING.small, paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingVertical: SPACING.medium },
  body: { flex: 1, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  list: { paddingBottom: SPACING.section, paddingTop: SPACING.extraSmall },
  footer: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border, borderTopWidth: StyleSheet.hairlineWidth, padding: SCREEN_HORIZONTAL_PADDING },
  footerLoader: { paddingVertical: SPACING.medium, alignItems: "center", justifyContent: "center" },
});

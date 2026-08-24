import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import AppHeader from "@/src/components/ui/AppHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import SearchField from "@/src/components/ui/SearchField";
import { useAuthStore } from "@/src/features/auth/state/auth-store";
import type { WorkItemViewModel } from "@/src/features/work/domain/work.types";
import { useAssignedWork } from "@/src/features/work/hooks/use-assigned-work";
import WorkItemRow from "@/src/features/work/presentation/WorkItemRow";
import { SCREEN_HORIZONTAL_PADDING, SPACING } from "@/src/theme/tokens";

export default function WorkAssignedScreen(): ReactElement {
  const [searchText, setSearchText] = useState("");
  const session = useAuthStore((state) => state.session);
  const { viewState, reload } = useAssignedWork(session, searchText);

  const handleBack = useCallback((): void => router.back(), []);
  const clearSearch = useCallback((): void => setSearchText(""), []);
  const openWorkItem = useCallback((item: WorkItemViewModel): void => {
    router.push({ pathname: "/(app)/work-assigned/[id]", params: { id: item.id } });
  }, []);
  const renderItem = useCallback(({ item }: { item: WorkItemViewModel }): ReactElement => <WorkItemRow item={item} onPress={openWorkItem} />, [openWorkItem]);
  const keyExtractor = useCallback((item: WorkItemViewModel): string => item.id, []);
  const handleRetry = useCallback((): void => { void reload(); }, [reload]);

  return (
    <ScreenContainer>
      <AppHeader onBack={handleBack} title="Work Assigned" />
      <View style={styles.tools}>
        <SearchField accessibilityLabel="Search assigned work" onChangeText={setSearchText} onClear={clearSearch} placeholder="Search assigned work" value={searchText} />
      </View>
      {viewState.status === "success" ? (
        <FlatList contentContainerStyle={styles.list} data={viewState.data} keyExtractor={keyExtractor} keyboardShouldPersistTaps="handled" renderItem={renderItem} showsVerticalScrollIndicator={false} />
      ) : (
        <View style={styles.state}><AsyncStateView emptyMessage="No assigned work found." message={viewState.status === "error" ? viewState.message : undefined} onRetry={handleRetry} status={viewState.status} variant="list" /></View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tools: { flexDirection: "row", gap: SPACING.small, paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingVertical: SPACING.medium },
  list: { paddingBottom: SPACING.section, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  state: { flex: 1, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
});

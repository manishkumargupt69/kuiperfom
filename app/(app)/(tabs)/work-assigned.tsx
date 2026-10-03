import type { ReactElement } from "react";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import DrawerHeader from "@/src/components/ui/DrawerHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import SearchField from "@/src/components/ui/SearchField";
import SecondaryButton from "@/src/components/ui/SecondaryButton";
import type { WorkItemViewModel } from "@/src/features/work/domain/work.types";
import { useWorkAssignedScreen } from "@/src/features/work/hooks/use-work-assigned-screen";
import WorkItemRow from "@/src/features/work/presentation/WorkItemRow";
import WorkSortPicker from "@/src/features/work/presentation/WorkSortPicker";
import { SCREEN_HORIZONTAL_PADDING, SPACING } from "@/src/theme/tokens";

export default function WorkAssignedScreen(): ReactElement {
  const {
    expandedWorkId,
    isFetchingNextPage,
    isSortVisible,
    searchText,
    sortKey,
    viewState,
    clearSearch,
    closeSort,
    handleRetry,
    loadMore,
    openSort,
    selectSort,
    setSearchText,
    toggleWorkItem,
  } = useWorkAssignedScreen();

  const openWorkItem = useCallback((item: WorkItemViewModel): void => {
    router.push({ pathname: "/(app)/work-assigned/[id]", params: { id: item.id } });
  }, []);
  const renderItem = useCallback(({ item }: { item: WorkItemViewModel }): ReactElement => (
    <WorkItemRow isExpanded={expandedWorkId === item.id} item={item} onToggle={toggleWorkItem} onUpdate={openWorkItem} />
  ), [expandedWorkId, openWorkItem, toggleWorkItem]);
  const keyExtractor = useCallback((item: WorkItemViewModel): string => item.id, []);
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
      <DrawerHeader title="Work Assigned" />
      <View style={styles.tools}>
        <SearchField accessibilityLabel="Search assigned work" onChangeText={setSearchText} onClear={clearSearch} placeholder="Search assigned work" value={searchText} />
        <SecondaryButton label="Sort" onPress={openSort} />
      </View>
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
        <View style={styles.state}><AsyncStateView emptyMessage="No assigned work found." message={viewState.status === "error" ? viewState.message : undefined} onRetry={handleRetry} status={viewState.status} variant="list" /></View>
      )}
      <WorkSortPicker
        isVisible={isSortVisible}
        onClose={closeSort}
        onSelect={selectSort}
        selectedKey={sortKey}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tools: { flexDirection: "row", gap: SPACING.small, paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingVertical: SPACING.medium },
  list: { paddingBottom: SPACING.section, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  state: { flex: 1, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  footerLoader: { paddingVertical: SPACING.medium, alignItems: "center", justifyContent: "center" },
});

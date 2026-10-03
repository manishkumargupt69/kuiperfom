import { useCallback, useState } from "react";

import { useAuthStore } from "@/src/features/auth/state/auth-store";
import type { WorkItemViewModel, WorkSortKey } from "@/src/features/work/domain/work.types";
import { useAssignedWork } from "@/src/features/work/hooks/use-assigned-work";
import type { ViewState } from "@/src/types/view-state";
import { runAfterKeyboardDismissed } from "@/src/utils/run-after-keyboard-dismissed";

interface WorkAssignedScreenState {
  expandedWorkId: string | null;
  isFetchingNextPage: boolean;
  isSortVisible: boolean;
  searchText: string;
  sortKey: WorkSortKey;
  viewState: ViewState<readonly WorkItemViewModel[]>;
  clearSearch: () => void;
  closeSort: () => void;
  handleRetry: () => void;
  loadMore: () => void;
  openSort: () => void;
  selectSort: (value: WorkSortKey) => void;
  setSearchText: (value: string) => void;
  toggleWorkItem: (item: WorkItemViewModel) => void;
}

export const useWorkAssignedScreen = (): WorkAssignedScreenState => {
  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] = useState<WorkSortKey>("target-asc");
  const [isSortVisible, setIsSortVisible] = useState(false);
  const [expandedWorkId, setExpandedWorkId] = useState<string | null>(null);
  const session = useAuthStore((state) => state.session);
  const { viewState, reload, loadMore, isFetchingNextPage } = useAssignedWork(session, searchText, sortKey);

  const clearSearch = useCallback((): void => setSearchText(""), []);
  const closeSort = useCallback((): void => setIsSortVisible(false), []);
  const handleRetry = useCallback((): void => { void reload(); }, [reload]);
  const openSort = useCallback((): void => {
    runAfterKeyboardDismissed(() => setIsSortVisible(true));
  }, []);
  const selectSort = useCallback((value: WorkSortKey): void => {
    setSortKey(value);
    setIsSortVisible(false);
  }, []);
  const toggleWorkItem = useCallback((item: WorkItemViewModel): void => {
    setExpandedWorkId((currentId) => currentId === item.id ? null : item.id);
  }, []);

  return {
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
  };
};

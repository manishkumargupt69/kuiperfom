import { useInfiniteQuery } from "@tanstack/react-query";

import { workRepository } from "@/src/features/work/data/local-work.repository";
import type { AuthSession } from "@/src/features/auth/domain/auth.types";
import type {
  WorkItemViewModel,
  WorkSortKey,
} from "@/src/features/work/domain/work.types";
import type { ViewState } from "@/src/types/view-state";

const WORK_QUERY_KEY = "assigned-work";
const PAGE_LIMIT = 25;

interface AssignedWorkResult {
  viewState: ViewState<readonly WorkItemViewModel[]>;
  reload: () => Promise<void>;
  loadMore: () => void;
  isFetchingNextPage: boolean;
}

const matchesSearch = (item: WorkItemViewModel, searchText: string): boolean => {
  const normalizedSearch = searchText.trim().toLocaleLowerCase();
  if (!normalizedSearch) return true;
  return [
    item.requestNumber,
    item.workItem,
    item.workItemCode,
    item.workGroup,
    item.workSubgroup,
    item.assignedToName,
  ].some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
};

const sortWorkItems = (
  items: readonly WorkItemViewModel[],
  sortKey: WorkSortKey,
): WorkItemViewModel[] =>
  [...items].sort((firstItem, secondItem) => {
    if (sortKey === "target-desc") {
      return secondItem.targetCompletion.localeCompare(firstItem.targetCompletion);
    }
    if (sortKey === "request-number") {
      return firstItem.requestNumber.localeCompare(
        secondItem.requestNumber,
        undefined,
        { numeric: true },
      );
    }
    if (sortKey === "status") {
      return firstItem.status.label.localeCompare(secondItem.status.label);
    }
    return firstItem.targetCompletion.localeCompare(secondItem.targetCompletion);
  });

export const useAssignedWork = (
  session: AuthSession | null,
  searchText: string,
  sortKey: WorkSortKey,
): AssignedWorkResult => {
  const userId = session?.user.id ?? "";
  
  const query = useInfiniteQuery({
    queryKey: [WORK_QUERY_KEY, userId],
    queryFn: ({ pageParam = 1 }) => 
      session ? workRepository.getAssignedWork(session, pageParam as number) : Promise.resolve([]),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_LIMIT ? allPages.length + 1 : undefined;
    },
    enabled: Boolean(session),
  });

  const reload = async (): Promise<void> => { await query.refetch(); };
  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  };

  const isFetchingNextPage = query.isFetchingNextPage;

  if (!userId || query.fetchStatus === "idle" && query.status === "pending") {
    return { viewState: { status: "idle" }, reload, loadMore, isFetchingNextPage };
  }
  if (query.status === "pending") {
    return { viewState: { status: "loading" }, reload, loadMore, isFetchingNextPage };
  }
  if (query.status === "error") {
    return { viewState: { status: "error", message: "Assigned work could not be loaded." }, reload, loadMore, isFetchingNextPage };
  }

  const allItems = query.data.pages.flat();
  const filteredItems = sortWorkItems(
    allItems.filter((item) => matchesSearch(item, searchText)),
    sortKey,
  );

  if (filteredItems.length === 0) {
    return { viewState: { status: "empty" }, reload, loadMore, isFetchingNextPage };
  }

  return { viewState: { status: "success", data: filteredItems }, reload, loadMore, isFetchingNextPage };
};

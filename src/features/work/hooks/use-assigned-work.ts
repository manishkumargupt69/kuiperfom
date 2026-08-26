import { useQuery } from "@tanstack/react-query";

import { workRepository } from "@/src/features/work/data/local-work.repository";
import type { AuthSession } from "@/src/features/auth/domain/auth.types";
import type {
  WorkItemViewModel,
  WorkSortKey,
} from "@/src/features/work/domain/work.types";
import type { ViewState } from "@/src/types/view-state";

const WORK_QUERY_KEY = "assigned-work";

interface AssignedWorkResult {
  viewState: ViewState<readonly WorkItemViewModel[]>;
  reload: () => Promise<void>;
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
  const query = useQuery({ queryKey: [WORK_QUERY_KEY, userId], queryFn: () => session ? workRepository.getAssignedWork(session) : Promise.resolve([]), enabled: Boolean(session) });
  const reload = async (): Promise<void> => { await query.refetch(); };

  if (!userId || query.fetchStatus === "idle" && query.status === "pending") return { viewState: { status: "idle" }, reload };
  if (query.isPending) return { viewState: { status: "loading" }, reload };
  if (query.isError) return { viewState: { status: "error", message: "Assigned work could not be loaded." }, reload };

  const filteredItems = sortWorkItems(
    query.data.filter((item) => matchesSearch(item, searchText)),
    sortKey,
  );
  if (filteredItems.length === 0) return { viewState: { status: "empty" }, reload };
  return { viewState: { status: "success", data: filteredItems }, reload };
};

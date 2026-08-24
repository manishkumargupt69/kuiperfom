import { useQuery } from "@tanstack/react-query";

import { workRepository } from "@/src/features/work/data/local-work.repository";
import type { AuthSession } from "@/src/features/auth/domain/auth.types";
import type { WorkItemViewModel } from "@/src/features/work/domain/work.types";
import type { ViewState } from "@/src/types/view-state";

const WORK_QUERY_KEY = "assigned-work";

interface AssignedWorkResult {
  viewState: ViewState<readonly WorkItemViewModel[]>;
  reload: () => Promise<void>;
}

const matchesSearch = (item: WorkItemViewModel, searchText: string): boolean => {
  const normalizedSearch = searchText.trim().toLocaleLowerCase();
  if (!normalizedSearch) return true;
  return [item.requestNumber, item.workItem, item.workGroup, item.workSubgroup].some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
};

export const useAssignedWork = (session: AuthSession | null, searchText: string): AssignedWorkResult => {
  const userId = session?.user.id ?? "";
  const query = useQuery({ queryKey: [WORK_QUERY_KEY, userId], queryFn: () => session ? workRepository.getAssignedWork(session) : Promise.resolve([]), enabled: Boolean(session) });
  const reload = async (): Promise<void> => { await query.refetch(); };

  if (!userId || query.fetchStatus === "idle" && query.status === "pending") return { viewState: { status: "idle" }, reload };
  if (query.isPending) return { viewState: { status: "loading" }, reload };
  if (query.isError) return { viewState: { status: "error", message: "Assigned work could not be loaded." }, reload };

  const filteredItems = query.data.filter((item) => matchesSearch(item, searchText));
  if (filteredItems.length === 0) return { viewState: { status: "empty" }, reload };
  return { viewState: { status: "success", data: filteredItems }, reload };
};

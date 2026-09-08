import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/src/features/auth/state/auth-store";
import { dashboardRepository } from "@/src/features/dashboard/data/dashboard.repository";
import type { ProjectViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import type { ViewState } from "@/src/types/view-state";

const DASHBOARD_PROJECTS_QUERY_KEY = "dashboard-projects";
const PAGE_LIMIT = 25;

interface DashboardResult {
  viewState: ViewState<readonly ProjectViewModel[]>;
  reload: () => Promise<void>;
  loadMore: () => void;
  isFetchingNextPage: boolean;
}

export const useDashboard = (): DashboardResult => {
  const session = useAuthStore((state) => state.session);
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: [DASHBOARD_PROJECTS_QUERY_KEY],
    queryFn: () => {
      if (!session) return Promise.resolve([]);
      return dashboardRepository.getAssignedProjects(session);
    },
    enabled: Boolean(session),
  });

  const reload = useCallback(async (): Promise<void> => {
    setPage(1);
    await query.refetch();
  }, [query]);

  const loadMore = useCallback(() => {
    if (query.data && page * PAGE_LIMIT < query.data.length) {
      setPage((prev) => prev + 1);
    }
  }, [query.data, page]);

  let viewState: ViewState<readonly ProjectViewModel[]>;
  if (!session) {
    viewState = { status: "idle" };
  } else if (query.isPending) {
    viewState = { status: "loading" };
  } else if (query.isError) {
    viewState = {
      status: "error",
      message: "Projects could not be loaded. Try again.",
    };
  } else if (query.data.length === 0) {
    viewState = { status: "empty" };
  } else {
    viewState = { status: "success", data: query.data.slice(0, page * PAGE_LIMIT) };
  }

  // Client-side pagination doesn't really have a "fetching next page" state since it's instantaneous.
  // We'll set it to false so the footer loader doesn't flash.
  return {
    viewState,
    reload,
    loadMore,
    isFetchingNextPage: false,
  };
};


import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/src/features/auth/state/auth-store";
import { dashboardRepository } from "@/src/features/dashboard/data/dashboard.repository";
import type { ProjectDetailsViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import type { ViewState } from "@/src/types/view-state";

const PROJECT_DETAILS_QUERY_KEY = "project-details";
const PROJECT_DETAILS_LOAD_ERROR_MESSAGE = "Project details could not be loaded. Try again.";

interface ProjectDetailsResult {
  viewState: ViewState<ProjectDetailsViewModel>;
  reload: () => Promise<void>;
}

export const useProjectDetails = (
  projectId: string | null,
): ProjectDetailsResult => {
  const session = useAuthStore((state) => state.session);
  const query = useQuery({
    queryKey: [PROJECT_DETAILS_QUERY_KEY, projectId],
    queryFn: () => {
      if (!session || !projectId) {
        return Promise.reject(new Error(PROJECT_DETAILS_LOAD_ERROR_MESSAGE));
      }
      return dashboardRepository.getProjectDetails(session, projectId);
    },
    enabled: Boolean(session && projectId),
  });

  const reload = useCallback(async (): Promise<void> => {
    await query.refetch();
  }, [query]);

  if (!session || !projectId) {
    return { viewState: { status: "idle" }, reload };
  }
  if (query.isPending) {
    return { viewState: { status: "loading" }, reload };
  }
  if (query.isError) {
    return {
      viewState: { status: "error", message: PROJECT_DETAILS_LOAD_ERROR_MESSAGE },
      reload,
    };
  }
  if (!query.data || query.data.workGroups.length === 0) {
    return { viewState: { status: "empty" }, reload };
  }

  return { viewState: { status: "success", data: query.data }, reload };
};

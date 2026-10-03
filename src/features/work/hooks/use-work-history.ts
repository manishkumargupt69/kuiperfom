import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/src/features/auth/state/auth-store";
import { workRepository } from "@/src/features/work/data/local-work.repository";
import type { WorkHistoryViewModel } from "@/src/features/work/domain/work.types";
import type { ViewState } from "@/src/types/view-state";

export const WORK_HISTORY_QUERY_KEY = "work-history";

interface WorkHistoryResult {
  viewState: ViewState<readonly WorkHistoryViewModel[]>;
  reload: () => Promise<void>;
}

export const useWorkHistory = (id: string): WorkHistoryResult => {
  const session = useAuthStore((state) => state.session);
  const query = useQuery({
    queryKey: [WORK_HISTORY_QUERY_KEY, session?.user.id, id],
    queryFn: () => {
      if (!session) return Promise.reject(new Error("Sign in to view work history."));
      return workRepository.getWorkHistory(session, id);
    },
    enabled: Boolean(session && id),
  });
  const reload = useCallback(async (): Promise<void> => { await query.refetch(); }, [query]);

  if (!session || !id) return { viewState: { status: "idle" }, reload };
  if (query.isPending) return { viewState: { status: "loading" }, reload };
  if (query.isError) return { viewState: { status: "error", message: query.error.message }, reload };
  if (query.data.length === 0) return { viewState: { status: "empty" }, reload };
  return { viewState: { status: "success", data: query.data }, reload };
};

import { useQuery } from "@tanstack/react-query";

import { moduleRepository } from "@/src/features/modules/data/mock-module.repository";
import type { ModuleViewModel } from "@/src/features/modules/domain/module.types";
import type { ViewState } from "@/src/types/view-state";

const MODULE_QUERY_KEY = "permitted-modules";

interface PermittedModulesResult {
  viewState: ViewState<ModuleViewModel[]>;
  reload: () => Promise<void>;
}

export const usePermittedModules = (
  userId: string,
): PermittedModulesResult => {
  const query = useQuery({
    queryKey: [MODULE_QUERY_KEY, userId],
    queryFn: () => moduleRepository.getPermittedModules(userId),
    enabled: Boolean(userId),
  });

  const reload = async (): Promise<void> => {
    await query.refetch();
  };

  if (!userId || query.fetchStatus === "idle" && query.status === "pending") {
    return { viewState: { status: "idle" }, reload };
  }

  if (query.isPending) {
    return { viewState: { status: "loading" }, reload };
  }

  if (query.isError) {
    return {
      viewState: {
        status: "error",
        message: "Module access could not be loaded. Check your connection.",
      },
      reload,
    };
  }

  if (query.data.length === 0) {
    return { viewState: { status: "empty" }, reload };
  }

  return { viewState: { status: "success", data: query.data }, reload };
};

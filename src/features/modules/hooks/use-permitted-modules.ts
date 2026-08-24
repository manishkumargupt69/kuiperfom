import { useQuery } from "@tanstack/react-query";

import type { AuthSession } from "@/src/features/auth/domain/auth.types";
import { moduleRepository } from "@/src/features/modules/data/module.repository";
import type { ModuleViewModel } from "@/src/features/modules/domain/module.types";
import type { ViewState } from "@/src/types/view-state";

interface PermittedModulesResult {
  viewState: ViewState<ModuleViewModel[]>;
  reload: () => Promise<void>;
}

const MODULE_QUERY_KEY = "permitted-modules";

export const usePermittedModules = (
  session: AuthSession | null,
): PermittedModulesResult => {
  const userId = session?.user.id ?? "";
  const roleId = session?.user.roleId ?? "";
  const companyId = session?.user.company[0]?.id ?? "";
  const query = useQuery({
    queryKey: [MODULE_QUERY_KEY, userId, roleId, companyId],
    queryFn: () =>
      session
        ? moduleRepository.getPermittedModules(session)
        : Promise.resolve([]),
    enabled: Boolean(session),
  });
  const reload = async (): Promise<void> => {
    await query.refetch();
  };

  if (
    !session ||
    (query.fetchStatus === "idle" && query.status === "pending")
  ) {
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

  return {
    viewState: { status: "success", data: query.data },
    reload,
  };
};

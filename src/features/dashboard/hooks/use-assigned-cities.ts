import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/src/features/auth/state/auth-store";
import { dashboardRepository } from "@/src/features/dashboard/data/dashboard.repository";
import type { AssignedCityViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import type { ViewState } from "@/src/types/view-state";

interface AssignedCitiesResult {
  viewState: ViewState<readonly AssignedCityViewModel[]>;
  reload: () => Promise<void>;
}

export const useAssignedCities = (): AssignedCitiesResult => {
  const session = useAuthStore((state) => state.session);
  const query = useQuery({
    queryKey: ["assigned-project-cities", session?.user.id],
    queryFn: () => session ? dashboardRepository.getAssignedCities(session) : Promise.resolve([]),
    enabled: Boolean(session),
  });
  const reload = useCallback(async (): Promise<void> => { await query.refetch(); }, [query]);

  if (!session) return { viewState: { status: "idle" }, reload };
  if (query.isPending) return { viewState: { status: "loading" }, reload };
  if (query.isError) return { viewState: { status: "error", message: "Cities could not be loaded." }, reload };
  if (query.data.length === 0) return { viewState: { status: "empty" }, reload };
  return { viewState: { status: "success", data: query.data }, reload };
};

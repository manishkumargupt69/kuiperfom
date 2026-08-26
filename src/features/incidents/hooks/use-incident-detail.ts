import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/src/features/auth/state/auth-store";
import { incidentRepository } from "@/src/features/incidents/data/incident.repository";
import type { IncidentViewModel } from "@/src/features/incidents/domain/incident.types";
import type { ViewState } from "@/src/types/view-state";

const INCIDENT_DETAIL_QUERY_KEY = "incident-detail";
interface IncidentDetailResult { viewState: ViewState<IncidentViewModel>; reload: () => Promise<void>; }

export const useIncidentDetail = (id: string): IncidentDetailResult => {
  const session = useAuthStore((state) => state.session);
  const { data, fetchStatus, isError, isPending, refetch, status } = useQuery({ queryKey: [INCIDENT_DETAIL_QUERY_KEY, session?.user.id ?? "", id], queryFn: () => session ? incidentRepository.getIncident(session, id) : Promise.resolve(null), enabled: Boolean(id && session) });
  const reload = useCallback(async (): Promise<void> => { await refetch(); }, [refetch]);
  if (!id || !session || fetchStatus === "idle" && status === "pending") return { viewState: { status: "idle" }, reload };
  if (isPending) return { viewState: { status: "loading" }, reload };
  if (isError) return { viewState: { status: "error", message: "Incident details could not be loaded." }, reload };
  if (!data) return { viewState: { status: "empty" }, reload };
  return { viewState: { status: "success", data }, reload };
};

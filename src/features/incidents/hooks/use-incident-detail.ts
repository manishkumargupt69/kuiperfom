import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import { incidentRepository } from "@/src/features/incidents/data/local-incident.repository";
import type { IncidentViewModel } from "@/src/features/incidents/domain/incident.types";
import type { ViewState } from "@/src/types/view-state";

const INCIDENT_DETAIL_QUERY_KEY = "incident-detail";
interface IncidentDetailResult { viewState: ViewState<IncidentViewModel>; reload: () => Promise<void>; }

export const useIncidentDetail = (id: string): IncidentDetailResult => {
  const { data, fetchStatus, isError, isPending, refetch, status } = useQuery({ queryKey: [INCIDENT_DETAIL_QUERY_KEY, id], queryFn: () => incidentRepository.getIncident(id), enabled: Boolean(id) });
  const reload = useCallback(async (): Promise<void> => { await refetch(); }, [refetch]);
  if (!id || fetchStatus === "idle" && status === "pending") return { viewState: { status: "idle" }, reload };
  if (isPending) return { viewState: { status: "loading" }, reload };
  if (isError) return { viewState: { status: "error", message: "Incident details could not be loaded." }, reload };
  if (!data) return { viewState: { status: "empty" }, reload };
  return { viewState: { status: "success", data }, reload };
};

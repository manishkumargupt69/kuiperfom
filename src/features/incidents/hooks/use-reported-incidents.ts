import { useQuery } from "@tanstack/react-query";

import { incidentRepository } from "@/src/features/incidents/data/incident.repository";
import type { AuthSession } from "@/src/features/auth/domain/auth.types";
import type { IncidentViewModel } from "@/src/features/incidents/domain/incident.types";
import type { ViewState } from "@/src/types/view-state";

const INCIDENT_QUERY_KEY = "reported-incidents";
interface ReportedIncidentsResult { viewState: ViewState<readonly IncidentViewModel[]>; reload: () => Promise<void>; }
const matchesSearch = (incident: IncidentViewModel, searchText: string): boolean => { const search = searchText.trim().toLocaleLowerCase(); if (!search) return true; return [incident.incidentNumber, incident.type, incident.subtype, incident.title, incident.description, incident.assignedToName].some((value) => value.toLocaleLowerCase().includes(search)); };

export const useReportedIncidents = (session: AuthSession | null, searchText: string): ReportedIncidentsResult => {
  const userId = session?.user.id ?? "";
  const query = useQuery({ queryKey: [INCIDENT_QUERY_KEY, userId], queryFn: () => session ? incidentRepository.getReportedIncidents(session) : Promise.resolve([]), enabled: Boolean(session) });
  const reload = async (): Promise<void> => { await query.refetch(); };
  if (!userId || query.fetchStatus === "idle" && query.status === "pending") return { viewState: { status: "idle" }, reload };
  if (query.isPending) return { viewState: { status: "loading" }, reload };
  if (query.isError) return { viewState: { status: "error", message: "Reported incidents could not be loaded." }, reload };
  const filtered = query.data.filter((incident) => matchesSearch(incident, searchText));
  if (filtered.length === 0) return { viewState: { status: "empty" }, reload };
  return { viewState: { status: "success", data: filtered }, reload };
};

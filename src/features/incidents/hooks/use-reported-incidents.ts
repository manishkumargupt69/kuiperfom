import { useInfiniteQuery } from "@tanstack/react-query";

import { incidentRepository } from "@/src/features/incidents/data/incident.repository";
import type { AuthSession } from "@/src/features/auth/domain/auth.types";
import type { IncidentViewModel } from "@/src/features/incidents/domain/incident.types";
import type { ViewState } from "@/src/types/view-state";

const INCIDENT_QUERY_KEY = "reported-incidents";
const PAGE_LIMIT = 25;

interface ReportedIncidentsResult { 
  viewState: ViewState<readonly IncidentViewModel[]>; 
  reload: () => Promise<void>; 
  loadMore: () => void;
  isFetchingNextPage: boolean;
}

const matchesSearch = (incident: IncidentViewModel, searchText: string): boolean => { 
  const search = searchText.trim().toLocaleLowerCase(); 
  if (!search) return true; 
  return [incident.incidentNumber, incident.type, incident.subtype, incident.title, incident.description, incident.assignedToName].some((value) => value.toLocaleLowerCase().includes(search)); 
};

export const useReportedIncidents = (session: AuthSession | null, searchText: string): ReportedIncidentsResult => {
  const userId = session?.user.id ?? "";
  
  const query = useInfiniteQuery({
    queryKey: [INCIDENT_QUERY_KEY, userId],
    queryFn: ({ pageParam = 1 }) => session ? incidentRepository.getReportedIncidents(session, pageParam as number) : Promise.resolve([]),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_LIMIT ? allPages.length + 1 : undefined;
    },
    enabled: Boolean(session),
  });

  const reload = async (): Promise<void> => { await query.refetch(); };
  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  };
  const isFetchingNextPage = query.isFetchingNextPage;

  if (!userId || query.fetchStatus === "idle" && query.status === "pending") {
    return { viewState: { status: "idle" }, reload, loadMore, isFetchingNextPage };
  }
  if (query.status === "pending") {
    return { viewState: { status: "loading" }, reload, loadMore, isFetchingNextPage };
  }
  if (query.status === "error") {
    return { viewState: { status: "error", message: "Reported incidents could not be loaded." }, reload, loadMore, isFetchingNextPage };
  }

  const allItems = query.data.pages.flat();
  const filtered = allItems.filter((incident) => matchesSearch(incident, searchText));
  
  if (filtered.length === 0) {
    return { viewState: { status: "empty" }, reload, loadMore, isFetchingNextPage };
  }
  return { viewState: { status: "success", data: filtered }, reload, loadMore, isFetchingNextPage };
};

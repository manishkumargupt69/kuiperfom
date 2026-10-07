import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/src/features/auth/state/auth-store";
import { dashboardRepository } from "@/src/features/dashboard/data/dashboard.repository";
import type {
  AnalyticsDisplayProject,
  AnalyticsSegmentViewModel,
  DashboardAnalyticsViewModel,
  ProjectAnalyticsViewModel,
} from "@/src/features/dashboard/domain/dashboard.types";
import type { ViewState } from "@/src/types/view-state";

const DASHBOARD_ANALYTICS_QUERY_KEY = "dashboard-project-analytics";
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

interface DashboardAnalyticsResult {
  viewState: ViewState<DashboardAnalyticsViewModel>;
  reload: () => Promise<void>;
}

interface BuildSegmentsOptions {
  projects: readonly AnalyticsDisplayProject[];
  getKey: (project: AnalyticsDisplayProject) => string;
  getLabel: (key: string) => string;
}

const buildSegments = ({ projects, getKey, getLabel }: BuildSegmentsOptions): AnalyticsSegmentViewModel[] => {
  const counts = projects.reduce((result, project) => {
    const key = getKey(project);
    result.set(key, (result.get(key) ?? 0) + 1);
    return result;
  }, new Map<string, number>());
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: getLabel(key), count }))
    .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label));
};

const getStatusLabel = (status: string): string => {
  const label = status.replace(/_/g, " ").toLowerCase();
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const getDelayDays = (targetCompletionDate: string | null, today: Date): number => {
  if (!targetCompletionDate) return 0;
  const [year, month, day] = targetCompletionDate.slice(0, 10).split("-").map(Number);
  const targetDay = Date.UTC(year, month - 1, day);
  const currentDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(0, Math.floor((currentDay - targetDay) / MILLISECONDS_PER_DAY));
};

const mapAnalytics = (projects: readonly ProjectAnalyticsViewModel[]): DashboardAnalyticsViewModel => {
  const today = new Date();
  const displayProjects: AnalyticsDisplayProject[] = projects.map((project) => ({
    ...project,
    statusLabel: getStatusLabel(project.status),
    delayDays: getDelayDays(project.targetCompletionDate, today),
  }));
  return {
    projects: displayProjects,
    statusSegments: buildSegments({
      projects: displayProjects,
      getKey: (project) => project.status,
      getLabel: getStatusLabel,
    }),
    citySegments: buildSegments({
      projects: displayProjects,
      getKey: (project) => project.cityId,
      getLabel: (cityId) => displayProjects.find((project) => project.cityId === cityId)?.cityName ?? cityId,
    }),
    delayedCount: displayProjects.filter((project) => project.delayDays > 0).length,
  };
};

export const useDashboardAnalytics = (): DashboardAnalyticsResult => {
  const session = useAuthStore((state) => state.session);
  const query = useQuery({
    queryKey: [DASHBOARD_ANALYTICS_QUERY_KEY, session?.user.id],
    queryFn: () => session ? dashboardRepository.getProjectAnalytics(session) : Promise.resolve([]),
    enabled: Boolean(session),
  });
  const analytics = useMemo(() => query.data ? mapAnalytics(query.data) : null, [query.data]);
  const { refetch } = query;
  const reload = useCallback(async (): Promise<void> => { await refetch(); }, [refetch]);

  if (!session) return { viewState: { status: "idle" }, reload };
  if (query.isPending) return { viewState: { status: "loading" }, reload };
  if (query.isError) return { viewState: { status: "error", message: query.error.message }, reload };
  if (!analytics || analytics.projects.length === 0) return { viewState: { status: "empty" }, reload };
  return { viewState: { status: "success", data: analytics }, reload };
};

export interface WorkGroupViewModel {
  id: string;
  name: string;
  workItemCount: number;
  workItems: readonly DashboardWorkItemViewModel[];
}

export interface ProjectViewModel {
  id: string;
  clientName: string;
  projectName: string;
  workGroupCount: number;
}

export interface AssignedCityViewModel {
  id: string;
  code: string;
  name: string;
  projectCount: number;
  projects: readonly ProjectViewModel[];
}

export interface ProjectDetailsViewModel extends ProjectViewModel {
  city: string;
  startDate: string;
  emptyReason: "no-work-items" | "unassigned";
  workGroups: readonly WorkGroupViewModel[];
}

export interface DashboardWorkItemAssigneeViewModel {
  id: string;
  userId: string;
  name: string;
}

export interface DashboardWorkItemViewModel {
  id: string;
  requestNumber: string;
  workItemId: string;
  workItemName: string;
  workItemCode: string;
  workSubGroupId: string;
  workSubGroupName: string;
  status: string;
  progressPercent: number;
  targetCompletionDate: string | null;
  remarks: string;
  assignedUsers: readonly DashboardWorkItemAssigneeViewModel[];
}

export interface AnalyticsWorkRequestViewModel {
  id: string;
  requestNumber: string;
  projectName: string;
  cityName: string;
  workItemName: string;
  status: string;
  targetCompletionDate: string;
  assignedToNames: string;
}

export interface AnalyticsDisplayRequest extends AnalyticsWorkRequestViewModel {
  isDelayed: boolean;
  statusLabel: string;
}

export interface AnalyticsSegmentViewModel {
  key: string;
  label: string;
  count: number;
}

export interface ProjectAnalyticsViewModel extends ProjectViewModel {
  projectNumber: string;
  cityId: string;
  cityCode: string;
  cityName: string;
  status: string;
  targetCompletionDate: string | null;
}

export interface AnalyticsDisplayProject extends ProjectAnalyticsViewModel {
  statusLabel: string;
  delayDays: number;
}

export interface DashboardAnalyticsViewModel {
  projects: readonly AnalyticsDisplayProject[];
  statusSegments: readonly AnalyticsSegmentViewModel[];
  citySegments: readonly AnalyticsSegmentViewModel[];
  delayedCount: number;
}

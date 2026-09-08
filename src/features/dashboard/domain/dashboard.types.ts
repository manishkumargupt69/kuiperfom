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

export interface ProjectDetailsViewModel extends ProjectViewModel {
  city: string;
  startDate: string;
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
  targetCompletionDate: string;
  remarks: string;
  assignedUsers: readonly DashboardWorkItemAssigneeViewModel[];
}

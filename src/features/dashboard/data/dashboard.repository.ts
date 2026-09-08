import { createAuthenticatedHeaders } from "@/src/features/auth/data/authenticated-headers";
import type { AuthSession } from "@/src/features/auth/domain/auth.types";
import type {
  DashboardWorkItemAssigneeViewModel,
  DashboardWorkItemViewModel,
  ProjectDetailsViewModel,
  ProjectViewModel,
  WorkGroupViewModel,
} from "@/src/features/dashboard/domain/dashboard.types";
import { executeJsonRequest } from "@/src/utils/api-client";

const API_BASE_URL = "http://34.100.253.156/fom-api";
const DASHBOARD_PROJECTS_PATH = "/work-request/dashboard-projects";
const PROJECT_WORK_GROUPS_PATH = "/work-request/project-workgroups";
const PROJECTS_LOAD_ERROR_MESSAGE = "Projects could not be loaded.";
const PROJECT_DETAILS_LOAD_ERROR_MESSAGE = "Project details could not be loaded.";

interface DashboardProjectDto {
  projectId: string;
  projectName: string;
  clientName: string;
  assignedWorkGroupCount: number;
}

interface DashboardWorkItemAssigneeDto {
  id: string;
  assignedToUserId: string;
  assignedToUserName: string;
}

interface DashboardWorkItemDto {
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
  assignedUsers: DashboardWorkItemAssigneeDto[];
}

interface DashboardWorkGroupDto {
  workGroupId: string;
  workGroupName: string;
  assignedWorkItemCount: number;
  workItems: DashboardWorkItemDto[];
}

interface DashboardProjectDetailsDto {
  projectId: string;
  clientName: string;
  projectName: string;
  city: string;
  startDate: string;
  workGroups: DashboardWorkGroupDto[];
}

interface DashboardProjectsResponseDto {
  status: string;
  message: string;
  data: DashboardProjectDto[];
}

interface DashboardProjectDetailsResponseDto {
  status: string;
  message: string;
  data: DashboardProjectDetailsDto;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isDashboardProjectDto = (value: unknown): value is DashboardProjectDto =>
  isRecord(value) &&
  typeof value.projectId === "string" &&
  typeof value.projectName === "string" &&
  typeof value.clientName === "string" &&
  typeof value.assignedWorkGroupCount === "number";

const isDashboardWorkItemAssigneeDto = (
  value: unknown,
): value is DashboardWorkItemAssigneeDto =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.assignedToUserId === "string" &&
  typeof value.assignedToUserName === "string";

const isDashboardWorkItemDto = (
  value: unknown,
): value is DashboardWorkItemDto =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.requestNumber === "string" &&
  typeof value.workItemId === "string" &&
  typeof value.workItemName === "string" &&
  typeof value.workItemCode === "string" &&
  typeof value.workSubGroupId === "string" &&
  typeof value.workSubGroupName === "string" &&
  typeof value.status === "string" &&
  typeof value.progressPercent === "number" &&
  typeof value.targetCompletionDate === "string" &&
  typeof value.remarks === "string" &&
  Array.isArray(value.assignedUsers) &&
  value.assignedUsers.every(isDashboardWorkItemAssigneeDto);

const isDashboardWorkGroupDto = (
  value: unknown,
): value is DashboardWorkGroupDto =>
  isRecord(value) &&
  typeof value.workGroupId === "string" &&
  typeof value.workGroupName === "string" &&
  typeof value.assignedWorkItemCount === "number" &&
  Array.isArray(value.workItems) &&
  value.workItems.every(isDashboardWorkItemDto);

const isDashboardProjectDetailsDto = (
  value: unknown,
): value is DashboardProjectDetailsDto =>
  isRecord(value) &&
  typeof value.projectId === "string" &&
  typeof value.clientName === "string" &&
  typeof value.projectName === "string" &&
  typeof value.city === "string" &&
  typeof value.startDate === "string" &&
  Array.isArray(value.workGroups) &&
  value.workGroups.every(isDashboardWorkGroupDto);

const isDashboardProjectsResponseDto = (
  value: unknown,
): value is DashboardProjectsResponseDto =>
  isRecord(value) &&
  typeof value.status === "string" &&
  typeof value.message === "string" &&
  Array.isArray(value.data) &&
  value.data.every(isDashboardProjectDto);

const isDashboardProjectDetailsResponseDto = (
  value: unknown,
): value is DashboardProjectDetailsResponseDto =>
  isRecord(value) &&
  typeof value.status === "string" &&
  typeof value.message === "string" &&
  isDashboardProjectDetailsDto(value.data);

const createJsonHeaders = (session: AuthSession): Record<string, string> => ({
  ...createAuthenticatedHeaders(session),
  "Content-Type": "application/json",
});

const mapProjectDto = (project: DashboardProjectDto): ProjectViewModel => ({
  id: project.projectId,
  clientName: project.clientName,
  projectName: project.projectName,
  workGroupCount: project.assignedWorkGroupCount,
});

const mapWorkItemAssigneeDto = (
  assignee: DashboardWorkItemAssigneeDto,
): DashboardWorkItemAssigneeViewModel => ({
  id: assignee.id,
  userId: assignee.assignedToUserId,
  name: assignee.assignedToUserName,
});

const mapWorkItemDto = (
  workItem: DashboardWorkItemDto,
): DashboardWorkItemViewModel => ({
  id: workItem.id,
  requestNumber: workItem.requestNumber,
  workItemId: workItem.workItemId,
  workItemName: workItem.workItemName,
  workItemCode: workItem.workItemCode,
  workSubGroupId: workItem.workSubGroupId,
  workSubGroupName: workItem.workSubGroupName,
  status: workItem.status,
  progressPercent: workItem.progressPercent,
  targetCompletionDate: workItem.targetCompletionDate,
  remarks: workItem.remarks,
  assignedUsers: workItem.assignedUsers.map(mapWorkItemAssigneeDto),
});

const mapWorkGroupDto = (
  workGroup: DashboardWorkGroupDto,
): WorkGroupViewModel => ({
  id: workGroup.workGroupId,
  name: workGroup.workGroupName,
  workItemCount: workGroup.assignedWorkItemCount,
  workItems: workGroup.workItems.map(mapWorkItemDto),
});

const mapProjectDetailsDto = (
  project: DashboardProjectDetailsDto,
): ProjectDetailsViewModel => ({
  id: project.projectId,
  clientName: project.clientName,
  projectName: project.projectName,
  city: project.city,
  startDate: project.startDate,
  workGroupCount: project.workGroups.length,
  workGroups: project.workGroups.map(mapWorkGroupDto),
});

export class DashboardRepository {
  public async getAssignedProjects(
    session: AuthSession,
  ): Promise<readonly ProjectViewModel[]> {
    const { response, body } = await executeJsonRequest({
      url: `${API_BASE_URL}${DASHBOARD_PROJECTS_PATH}`,
      method: "POST",
      headers: createJsonHeaders(session),
    });
    if (!response.ok || !isDashboardProjectsResponseDto(body)) {
      throw new Error(PROJECTS_LOAD_ERROR_MESSAGE);
    }

    return body.data.map(mapProjectDto);
  }

  public async getProjectDetails(
    session: AuthSession,
    projectId: string,
  ): Promise<ProjectDetailsViewModel> {
    const { response, body } = await executeJsonRequest({
      url: `${API_BASE_URL}${PROJECT_WORK_GROUPS_PATH}/${projectId}`,
      method: "PUT",
      headers: createAuthenticatedHeaders(session),
    });
    if (!response.ok || !isDashboardProjectDetailsResponseDto(body)) {
      throw new Error(PROJECT_DETAILS_LOAD_ERROR_MESSAGE);
    }

    return mapProjectDetailsDto(body.data);
  }
}

export const dashboardRepository = new DashboardRepository();

import { createAuthenticatedHeaders } from "@/src/features/auth/data/authenticated-headers";
import type { AuthSession } from "@/src/features/auth/domain/auth.types";
import type {
  AssignedCityViewModel,
  AnalyticsWorkRequestViewModel,
  DashboardWorkItemAssigneeViewModel,
  DashboardWorkItemViewModel,
  ProjectDetailsViewModel,
  ProjectAnalyticsViewModel,
  ProjectViewModel,
  WorkGroupViewModel,
} from "@/src/features/dashboard/domain/dashboard.types";
import { executeJsonRequest } from "@/src/utils/api-client";

const API_BASE_URL = "http://34.100.253.156/fom-api";
const DASHBOARD_PROJECTS_PATH = "/work-request/dashboard-projects";
const PROJECT_SEARCH_PATH = "/project-header/search-project";
const PROJECT_WORK_GROUPS_PATH = "/work-request/project-workgroups";
const PROJECTS_LOAD_ERROR_MESSAGE = "Projects could not be loaded.";
const ANALYTICS_PAGE_SIZE = 100;
const PROJECT_SEARCH_PAGE_SIZE = 25;

const PROJECT_SEARCH_INCLUDE = {
  city: { select: { name: true } },
  workItemProjects: {
    include: {
      workGroup: { select: { itemWorkGroupName: true } },
      workSubGroup: { select: { itemWorkSubGroupName: true } },
      workItem: { select: { nameCode: true } },
      assignedUsers: true,
    },
  },
} as const;

const ANALYTICS_INCLUDE = {
  project: { select: { id: true, projectName: true, projectNumber: true, city: { select: { name: true, cityCode: true } }, company: { select: { name: true, code: true } } } },
  workGroup: { select: { id: true, itemWorkGroupName: true, description: true } },
  workSubGroup: { select: { id: true, itemWorkSubGroupName: true, description: true } },
  workItem: { select: { id: true, itemName: true, nameCode: true, itemCode: true, uom: true } },
  assignedUsers: { include: { assignedToUser: { select: { id: true, name: true, nameCode: true, code: true } } } },
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

interface AnalyticsWorkRequestDto {
  id: string;
  requestNumber: string;
  targetCompletionDate: string;
  status: string;
  project: { projectName: string; city: { name: string } };
  workItem: { itemName: string };
  assignedUsers: { assignedToUser: { name: string } }[];
}

interface AnalyticsSearchResponseDto {
  status: string;
  data: { data: AnalyticsWorkRequestDto[]; totalPages: number };
}

interface DashboardProjectDto {
  projectId: string;
  projectName: string;
  clientName: string;
  assignedWorkGroupCount: number;
}

interface DashboardCityDto {
  cityId: string;
  cityName: string;
  cityCode: string;
  projectCount: number;
  assignedWorkGroupCount: number;
  projects: DashboardProjectDto[];
}

interface ProjectSearchDto {
  id: string;
  projectNumber: string;
  projectName: string;
  cityId: string;
  city: { id: string; name: string };
  startDate: string;
  status: string;
  targetCompletionDate: string | null;
  workItemProjects: ProjectSearchWorkItemDto[];
}

interface ProjectSearchWorkItemDto {
  id: string;
  requestNumber: string;
  workGroupId: string;
  workSubGroupId: string;
  workItemId: string;
  status: string;
  progressPercent: number;
  targetCompletionDate: string | null;
  remarks: string | null;
  workGroup: { itemWorkGroupName: string };
  workSubGroup: { itemWorkSubGroupName: string };
  workItem: { nameCode: string };
  assignedUsers: { id: string; assignedToUserId: string }[];
}

interface ProjectSearchResponseDto {
  status: string;
  data: { data: ProjectSearchDto[]; totalPages: number };
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
  data: DashboardCityDto[];
}

interface DashboardProjectDetailsResponseDto {
  status: string;
  message: string;
  data: DashboardProjectDetailsDto;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isAnalyticsWorkRequestDto = (value: unknown): value is AnalyticsWorkRequestDto =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.requestNumber === "string" &&
  typeof value.targetCompletionDate === "string" &&
  typeof value.status === "string" &&
  isRecord(value.project) &&
  typeof value.project.projectName === "string" &&
  isRecord(value.project.city) &&
  typeof value.project.city.name === "string" &&
  isRecord(value.workItem) &&
  typeof value.workItem.itemName === "string" &&
  Array.isArray(value.assignedUsers) &&
  value.assignedUsers.every((assignee) =>
    isRecord(assignee) &&
    isRecord(assignee.assignedToUser) &&
    typeof assignee.assignedToUser.name === "string",
  );

const isAnalyticsSearchResponseDto = (value: unknown): value is AnalyticsSearchResponseDto =>
  isRecord(value) &&
  typeof value.status === "string" &&
  isRecord(value.data) &&
  Array.isArray(value.data.data) &&
  value.data.data.every(isAnalyticsWorkRequestDto) &&
  Number.isInteger(value.data.totalPages);

const mapAnalyticsWorkRequest = (item: AnalyticsWorkRequestDto): AnalyticsWorkRequestViewModel => ({
  id: item.id,
  requestNumber: item.requestNumber,
  projectName: item.project.projectName,
  cityName: item.project.city.name,
  workItemName: item.workItem.itemName,
  status: item.status,
  targetCompletionDate: item.targetCompletionDate,
  assignedToNames: item.assignedUsers.map((assignee) => assignee.assignedToUser.name).join(", "),
});

const isDashboardProjectDto = (value: unknown): value is DashboardProjectDto =>
  isRecord(value) &&
  typeof value.projectId === "string" &&
  typeof value.projectName === "string" &&
  typeof value.clientName === "string" &&
  typeof value.assignedWorkGroupCount === "number";

const isDashboardCityDto = (value: unknown): value is DashboardCityDto =>
  isRecord(value) &&
  typeof value.cityId === "string" &&
  typeof value.cityName === "string" &&
  typeof value.cityCode === "string" &&
  typeof value.projectCount === "number" &&
  typeof value.assignedWorkGroupCount === "number" &&
  Array.isArray(value.projects) &&
  value.projects.every(isDashboardProjectDto);

const isProjectSearchDto = (value: unknown): value is ProjectSearchDto =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.projectNumber === "string" &&
  typeof value.projectName === "string" &&
  typeof value.cityId === "string" &&
  isRecord(value.city) &&
  typeof value.city.id === "string" &&
  typeof value.city.name === "string" &&
  typeof value.startDate === "string" &&
  typeof value.status === "string" &&
  (typeof value.targetCompletionDate === "string" || value.targetCompletionDate === null) &&
  Array.isArray(value.workItemProjects) &&
  value.workItemProjects.every(isProjectSearchWorkItemDto);

const isProjectSearchWorkItemDto = (value: unknown): value is ProjectSearchWorkItemDto =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.requestNumber === "string" &&
  typeof value.workGroupId === "string" &&
  typeof value.workSubGroupId === "string" &&
  typeof value.workItemId === "string" &&
  typeof value.status === "string" &&
  typeof value.progressPercent === "number" &&
  (typeof value.targetCompletionDate === "string" || value.targetCompletionDate === null) &&
  (typeof value.remarks === "string" || value.remarks === null) &&
  isRecord(value.workGroup) &&
  typeof value.workGroup.itemWorkGroupName === "string" &&
  isRecord(value.workSubGroup) &&
  typeof value.workSubGroup.itemWorkSubGroupName === "string" &&
  isRecord(value.workItem) &&
  typeof value.workItem.nameCode === "string" &&
  Array.isArray(value.assignedUsers) &&
  value.assignedUsers.every((user) =>
    isRecord(user) &&
    typeof user.id === "string" &&
    typeof user.assignedToUserId === "string",
  );

const isProjectSearchResponseDto = (value: unknown): value is ProjectSearchResponseDto =>
  isRecord(value) &&
  typeof value.status === "string" &&
  isRecord(value.data) &&
  Array.isArray(value.data.data) &&
  value.data.data.every(isProjectSearchDto) &&
  Number.isInteger(value.data.totalPages);

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
  value.data.every(isDashboardCityDto);

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

const mapAssignedCityDto = (city: DashboardCityDto): AssignedCityViewModel => ({
  id: city.cityId,
  code: city.cityCode,
  name: city.cityName,
  projectCount: city.projectCount,
  projects: city.projects.map(mapProjectDto),
});

const mapProjectAnalyticsDto = (
  assignedProject: ProjectViewModel & { cityCode: string },
  project: ProjectSearchDto,
): ProjectAnalyticsViewModel => ({
  ...assignedProject,
  projectNumber: project.projectNumber,
  cityId: project.cityId,
  cityName: project.city.name,
  status: project.status,
  targetCompletionDate: project.targetCompletionDate,
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

const mapSearchProjectWorkItem = (
  item: ProjectSearchWorkItemDto,
  session: AuthSession,
): DashboardWorkItemViewModel => ({
  id: item.id,
  requestNumber: item.requestNumber,
  workItemId: item.workItemId,
  workItemName: item.workItem.nameCode,
  workItemCode: "",
  workSubGroupId: item.workSubGroupId,
  workSubGroupName: item.workSubGroup.itemWorkSubGroupName,
  status: item.status,
  progressPercent: item.progressPercent,
  targetCompletionDate: item.targetCompletionDate,
  remarks: item.remarks ?? "",
  assignedUsers: item.assignedUsers
    .filter((user) => user.assignedToUserId === session.user.id)
    .map((user) => ({ id: user.id, userId: user.assignedToUserId, name: session.user.name })),
});

const mapSearchProjectDetails = ({
  project,
  assignedProject,
  session,
}: {
  project: ProjectSearchDto;
  assignedProject: ProjectViewModel;
  session: AuthSession;
}): ProjectDetailsViewModel => {
  const assignedItems = project.workItemProjects.filter((item) =>
    item.assignedUsers.some((user) => user.assignedToUserId === session.user.id),
  );
  const groups = assignedItems.reduce((result, item) => {
    const workItem = mapSearchProjectWorkItem(item, session);
    const existing = result.get(item.workGroupId);
    result.set(item.workGroupId, {
      id: item.workGroupId,
      name: item.workGroup.itemWorkGroupName,
      workItemCount: (existing?.workItemCount ?? 0) + 1,
      workItems: [...(existing?.workItems ?? []), workItem],
    });
    return result;
  }, new Map<string, WorkGroupViewModel>());
  const workGroups = [...groups.values()];
  return {
    ...assignedProject,
    city: project.city.name,
    startDate: project.startDate,
    workGroupCount: workGroups.length,
    workGroups,
  };
};

export class DashboardRepository {
  public async getProjectAnalytics(session: AuthSession): Promise<readonly ProjectAnalyticsViewModel[]> {
    const assignedCities = await this.getAssignedCities(session);
    const assignedProjects = assignedCities.flatMap((city) =>
      city.projects.map((project) => ({ ...project, cityCode: city.code })),
    );
    if (assignedProjects.length === 0) return [];

    const assignedIds = new Set(assignedProjects.map((project) => project.id));
    const matchingProjects = await this.searchProjects(session, assignedIds);

    if (matchingProjects.size !== assignedIds.size) {
      console.warn("Some assigned projects could not be loaded from search-project API.");
    }

    return assignedProjects
      .filter((project) => matchingProjects.has(project.id))
      .map((project) => {
        const details = matchingProjects.get(project.id)!;
        return mapProjectAnalyticsDto(project, details);
      });
  }

  private async searchProjects(
    session: AuthSession,
    projectIds: ReadonlySet<string>,
  ): Promise<ReadonlyMap<string, ProjectSearchDto>> {
    const matchingProjects = new Map<string, ProjectSearchDto>();
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages && matchingProjects.size < projectIds.size) {
      const { response, body } = await executeJsonRequest({
        url: `${API_BASE_URL}${PROJECT_SEARCH_PATH}`,
        method: "POST",
        headers: createJsonHeaders(session),
        body: {
          page,
          limit: PROJECT_SEARCH_PAGE_SIZE,
          sortBy: "createdAt",
          sortOrder: "desc",
          include: PROJECT_SEARCH_INCLUDE,
        },
      });

      if (!response.ok) throw new Error(`Project search returned HTTP ${response.status}.`);
      if (!isProjectSearchResponseDto(body)) throw new Error("Project search response is incomplete.");
      if (body.status !== "success") throw new Error("Project search could not be loaded.");

      body.data.data.filter((project) => projectIds.has(project.id))
        .forEach((project) => matchingProjects.set(project.id, project));
      totalPages = body.data.totalPages;
      page += 1;
    }

    return matchingProjects;
  }

  public async getWorkRequestAnalytics(session: AuthSession): Promise<readonly AnalyticsWorkRequestViewModel[]> {
    const requests: AnalyticsWorkRequestViewModel[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const { response, body } = await executeJsonRequest({
        url: `${API_BASE_URL}/work-request/search`,
        method: "POST",
        headers: createJsonHeaders(session),
        body: {
          page,
          limit: ANALYTICS_PAGE_SIZE,
          sortBy: "createdAt",
          sortOrder: "desc",
          include: ANALYTICS_INCLUDE,
        },
      });

      if (!response.ok || !isAnalyticsSearchResponseDto(body) || body.status !== "success") {
        throw new Error("Dashboard data could not be loaded.");
      }

      requests.push(...body.data.data.map(mapAnalyticsWorkRequest));
      totalPages = body.data.totalPages;
      page += 1;
    }

    return requests;
  }

  public async getAssignedProjects(
    session: AuthSession,
  ): Promise<readonly ProjectViewModel[]> {
    const cities = await this.getAssignedCities(session);
    return cities.flatMap((city) => city.projects);
  }

  public async getAssignedCities(
    session: AuthSession,
  ): Promise<readonly AssignedCityViewModel[]> {
    const { response, body } = await executeJsonRequest({
      url: `${API_BASE_URL}${DASHBOARD_PROJECTS_PATH}`,
      method: "POST",
      headers: createJsonHeaders(session),
    });
    if (!response.ok) throw new Error(`Assigned projects returned HTTP ${response.status}.`);
    if (!isDashboardProjectsResponseDto(body)) throw new Error(PROJECTS_LOAD_ERROR_MESSAGE);
    return body.data.map(mapAssignedCityDto);
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
    if (response.status === 404) return this.getProjectDetailsFromSearch(session, projectId);
    if (!response.ok) throw new Error(`Project details returned HTTP ${response.status}.`);
    if (!isDashboardProjectDetailsResponseDto(body)) throw new Error("Project details response is incomplete.");

    return mapProjectDetailsDto(body.data);
  }

  private async getProjectDetailsFromSearch(
    session: AuthSession,
    projectId: string,
  ): Promise<ProjectDetailsViewModel> {
    const [assignedProjects, matchingProjects] = await Promise.all([
      this.getAssignedProjects(session),
      this.searchProjects(session, new Set([projectId])),
    ]);
    const assignedProject = assignedProjects.find((project) => project.id === projectId);
    const project = matchingProjects.get(projectId);
    if (!assignedProject || !project) throw new Error("Project details could not be loaded.");
    return mapSearchProjectDetails({ project, assignedProject, session });
  }
}

export const dashboardRepository = new DashboardRepository();

import { createAuthenticatedHeaders } from "@/src/features/auth/data/authenticated-headers";
import type { AuthSession } from "@/src/features/auth/domain/auth.types";
import type {
  WorkItemViewModel,
  WorkTransitionKey,
  WorkUpdateInput,
} from "@/src/features/work/domain/work.types";
import type {
  EvidenceAttachment,
  EvidenceKind,
} from "@/src/types/evidence";
import type { StatusTone } from "@/src/types/status";
import {
  executeJsonRequest,
  executeMultipartRequest,
} from "@/src/utils/api-client";
import { appendFormDataFile } from "@/src/utils/append-form-data-file";

const API_ORIGIN = "http://34.100.253.156";
const API_BASE_URL = `${API_ORIGIN}/fom-api`;
const PHOTO_EXTENSIONS = new Set(["heic", "jpeg", "jpg", "png", "webp"]);
const VIDEO_EXTENSIONS = new Set(["avi", "mov", "mp4", "webm"]);
const AUDIO_EXTENSIONS = new Set(["aac", "m4a", "mp3", "wav"]);
const WORK_INCLUDE = {
  workGroup: { include: { itemWorkGroup: true } },
  workSubGroup: { include: { itemWorkSubGroup: true } },
  workItem: true,
} as const;

const STATUS_PRESENTATION: Readonly<
  Record<string, { label: string; tone: StatusTone }>
> = {
  COMPLETED: { label: "Completed", tone: "success" },
  HOLD: { label: "On Hold", tone: "warning" },
  PENDING: { label: "Pending", tone: "warning" },
  STARTED: { label: "Started", tone: "info" },
};

interface GeneralCodeDto {
  codeValue: string;
}

interface WorkGroupDto {
  itemWorkGroup: GeneralCodeDto;
}

interface WorkSubGroupDto {
  itemWorkSubGroup: GeneralCodeDto;
}

interface WorkItemDto {
  itemCode: string;
  itemName: string;
  description: string | null;
  partModel: string | null;
  weightKg: number | null;
  weightuom: string | null;
  uom: string | null;
}

interface WorkRequestListItemDto {
  id: string;
  requestNumber: string;
  assignedToUserId: string;
  createdById: string;
  workGroup: WorkGroupDto;
  workSubGroup: WorkSubGroupDto;
  workItem: WorkItemDto;
  targetCompletionDate: string;
  status: string;
  progressPercent: number | null;
  remarks: string | null;
  mediaUrls: string[] | null;
  voiceNoteUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface WorkRequestSearchResponseDto {
  status: string;
  data: {
    data: WorkRequestListItemDto[];
  };
}

interface WorkRequestDetailsResponseDto {
  status: string;
  data: {
    data: WorkRequestListItemDto;
  };
}

interface UserLookupDto {
  id: string;
  name: string;
}

interface UserSearchResponseDto {
  status: string;
  data: {
    data: UserLookupDto[];
  };
}

interface WorkMappingOptions {
  item: WorkRequestListItemDto;
  userNames: ReadonlyMap<string, string>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";
const isNullableNumber = (value: unknown): value is number | null =>
  value === null || typeof value === "number";
const isNullableStringArray = (value: unknown): value is string[] | null =>
  value === null ||
  Array.isArray(value) && value.every((item) => typeof item === "string");
const isGeneralCodeDto = (value: unknown): value is GeneralCodeDto =>
  isRecord(value) && typeof value.codeValue === "string";
const isWorkGroupDto = (value: unknown): value is WorkGroupDto =>
  isRecord(value) && isGeneralCodeDto(value.itemWorkGroup);
const isWorkSubGroupDto = (value: unknown): value is WorkSubGroupDto =>
  isRecord(value) && isGeneralCodeDto(value.itemWorkSubGroup);
const isWorkItemDto = (value: unknown): value is WorkItemDto =>
  isRecord(value) &&
  typeof value.itemCode === "string" &&
  typeof value.itemName === "string" &&
  isNullableString(value.description) &&
  isNullableString(value.partModel) &&
  isNullableNumber(value.weightKg) &&
  isNullableString(value.weightuom) &&
  isNullableString(value.uom);
const isWorkRequestListItemDto = (
  value: unknown,
): value is WorkRequestListItemDto =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.requestNumber === "string" &&
  typeof value.assignedToUserId === "string" &&
  typeof value.createdById === "string" &&
  isWorkGroupDto(value.workGroup) &&
  isWorkSubGroupDto(value.workSubGroup) &&
  isWorkItemDto(value.workItem) &&
  typeof value.targetCompletionDate === "string" &&
  typeof value.status === "string" &&
  isNullableNumber(value.progressPercent) &&
  isNullableString(value.remarks) &&
  isNullableStringArray(value.mediaUrls) &&
  isNullableString(value.voiceNoteUrl) &&
  typeof value.createdAt === "string" &&
  isNullableString(value.updatedAt);
const isWorkRequestSearchResponseDto = (
  value: unknown,
): value is WorkRequestSearchResponseDto =>
  isRecord(value) &&
  typeof value.status === "string" &&
  isRecord(value.data) &&
  Array.isArray(value.data.data) &&
  value.data.data.every(isWorkRequestListItemDto);
const isWorkRequestDetailsResponseDto = (
  value: unknown,
): value is WorkRequestDetailsResponseDto =>
  isRecord(value) &&
  typeof value.status === "string" &&
  isRecord(value.data) &&
  isWorkRequestListItemDto(value.data.data);
const isUserLookupDto = (value: unknown): value is UserLookupDto =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string";
const isUserSearchResponseDto = (
  value: unknown,
): value is UserSearchResponseDto =>
  isRecord(value) &&
  typeof value.status === "string" &&
  isRecord(value.data) &&
  Array.isArray(value.data.data) &&
  value.data.data.every(isUserLookupDto);

const createJsonHeaders = (session: AuthSession): Record<string, string> => ({
  ...createAuthenticatedHeaders(session),
  "Content-Type": "application/json",
});

const getAvailableTransitions = (
  status: string,
): readonly WorkTransitionKey[] => {
  if (status === "PENDING") return ["start"];
  if (status === "STARTED") return ["hold", "complete"];
  if (status === "HOLD") return ["start", "complete"];
  return [];
};

const getEvidenceKind = (url: string): EvidenceKind => {
  const pathWithoutQuery = url.split("?")[0] ?? url;
  const extension = pathWithoutQuery.split(".").pop()?.toLocaleLowerCase() ?? "";
  if (PHOTO_EXTENSIONS.has(extension)) return "photo";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  if (AUDIO_EXTENSIONS.has(extension)) return "audio";
  return "document";
};

const getMimeType = (kind: EvidenceKind): string => {
  if (kind === "photo") return "image/*";
  if (kind === "video") return "video/*";
  if (kind === "audio") return "audio/*";
  return "application/octet-stream";
};

const getAbsoluteMediaUrl = (url: string): string => {
  if (url.startsWith("http")) return encodeURI(url);
  if (url.startsWith("/fom-api/")) return encodeURI(`${API_ORIGIN}${url}`);
  const separator = url.startsWith("/") ? "" : "/";
  return encodeURI(`${API_BASE_URL}${separator}${url}`);
};

const mapRemoteAttachment = (
  url: string,
  forcedKind?: EvidenceKind,
): EvidenceAttachment => {
  const kind = forcedKind ?? getEvidenceKind(url);
  return {
    id: url,
    kind,
    name: url.split("/").pop() ?? "Evidence",
    uri: getAbsoluteMediaUrl(url),
    mimeType: getMimeType(kind),
  };
};

const mapAttachments = (
  mediaUrls: readonly string[] | null,
  voiceNoteUrl: string | null,
): EvidenceAttachment[] => [
  ...(mediaUrls ?? []).map((url) => mapRemoteAttachment(url)),
  ...(voiceNoteUrl ? [mapRemoteAttachment(voiceNoteUrl, "audio")] : []),
];

const getWeightLabel = (item: WorkItemDto): string | null => {
  if (item.weightKg === null) return null;
  return `${item.weightKg}${item.weightuom ? ` ${item.weightuom}` : ""}`;
};

const getUserName = (
  userNames: ReadonlyMap<string, string>,
  userId: string,
): string => userNames.get(userId) ?? "Unknown user";

const mapWorkRequestDto = ({
  item,
  userNames,
}: WorkMappingOptions): WorkItemViewModel => ({
  id: item.id,
  requestNumber: item.requestNumber,
  workGroup: item.workGroup.itemWorkGroup.codeValue,
  workSubgroup: item.workSubGroup.itemWorkSubGroup.codeValue,
  workItem: item.workItem.itemName,
  workItemCode: item.workItem.itemCode,
  workItemDescription: item.workItem.description,
  partModel: item.workItem.partModel,
  weightLabel: getWeightLabel(item.workItem),
  unitOfMeasure: item.workItem.uom,
  targetCompletion: item.targetCompletionDate,
  status: STATUS_PRESENTATION[item.status] ?? {
    label: item.status,
    tone: "neutral",
  },
  completionPercentage: item.progressPercent,
  remarks: item.remarks,
  assignedToName: getUserName(userNames, item.assignedToUserId),
  createdByName: getUserName(userNames, item.createdById),
  createdAt: item.createdAt,
  updatedAt: item.updatedAt ?? item.createdAt,
  availableTransitions: getAvailableTransitions(item.status),
  attachments: mapAttachments(item.mediaUrls, item.voiceNoteUrl),
});

const getUserNames = async (
  session: AuthSession,
): Promise<ReadonlyMap<string, string>> => {
  const { response, body } = await executeJsonRequest({
    url: `${API_BASE_URL}/user/search-user`,
    method: "POST",
    headers: createJsonHeaders(session),
    body: {
      page: 1,
      limit: 100,
      select: { id: true, name: true },
    },
  });
  if (!response.ok || !isUserSearchResponseDto(body)) {
    throw new Error("User names could not be loaded.");
  }
  return new Map(body.data.data.map((user) => [user.id, user.name]));
};

const getAssignedWorkDtos = async (
  session: AuthSession,
): Promise<readonly WorkRequestListItemDto[]> => {
  const { response, body } = await executeJsonRequest({
    url: `${API_BASE_URL}/workRequest/search-work-request`,
    method: "POST",
    headers: createJsonHeaders(session),
    body: {
      page: 1,
      limit: 50,
      filters: { assignedToUserId: session.user.id },
      include: WORK_INCLUDE,
    },
  });
  if (!response.ok) {
    throw new Error("Assigned work could not be loaded.");
  }
  if (!isWorkRequestSearchResponseDto(body)) {
    throw new Error("The assigned work response was incomplete.");
  }
  return body.data.data;
};

const getWorkRequestDto = async ({
  session,
  id,
}: {
  session: AuthSession;
  id: string;
}): Promise<WorkRequestListItemDto | null> => {
  const { response, body } = await executeJsonRequest({
    url: `${API_BASE_URL}/workRequest/details-work-request/${id}`,
    method: "POST",
    headers: createJsonHeaders(session),
    body: { include: WORK_INCLUDE },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Work details could not be loaded.");
  }
  if (!isWorkRequestDetailsResponseDto(body)) {
    throw new Error("The work details response was incomplete.");
  }
  return body.data.data;
};

const appendLocalAttachments = (
  formData: FormData,
  attachments: readonly EvidenceAttachment[],
): void => {
  attachments
    .filter((attachment) => attachment.uri.startsWith("file:"))
    .forEach((attachment) => {
      appendFormDataFile({
        formData,
        fieldName: "files",
        file: {
          uri: attachment.uri,
          name: attachment.name,
          type: attachment.mimeType,
          sizeBytes: attachment.sizeBytes,
        },
      });
    });
};

const createActionFormData = (input: WorkUpdateInput): FormData => {
  const formData = new FormData();
  formData.append("remarks", input.remarks.trim());
  if (input.transition !== "complete" && input.completionPercentage.trim()) {
    formData.append("progressPercent", input.completionPercentage.trim());
  }
  appendLocalAttachments(formData, input.attachments);
  return formData;
};

const getActionPath = ({
  transition,
  currentItem,
}: {
  transition: WorkTransitionKey;
  currentItem: WorkItemViewModel;
}): string => {
  if (transition === "start" && currentItem.status.label === "On Hold") {
    return "action-resume";
  }
  return `action-${transition}`;
};

export class LocalWorkRepository {
  async getAssignedWork(
    session: AuthSession,
  ): Promise<readonly WorkItemViewModel[]> {
    const [workRequestDtos, userNames] = await Promise.all([
      getAssignedWorkDtos(session),
      getUserNames(session),
    ]);
    return workRequestDtos.map((item) =>
      mapWorkRequestDto({ item, userNames }),
    );
  }

  async getWorkItem(
    session: AuthSession,
    id: string,
  ): Promise<WorkItemViewModel | null> {
    const [item, userNames] = await Promise.all([
      getWorkRequestDto({ session, id }),
      getUserNames(session),
    ]);
    return item ? mapWorkRequestDto({ item, userNames }) : null;
  }

  async updateWorkItem(
    session: AuthSession,
    input: WorkUpdateInput,
  ): Promise<WorkItemViewModel> {
    if (!input.transition) {
      throw new Error("Select a status action.");
    }

    const currentItem = await this.getWorkItem(session, input.id);
    if (!currentItem) {
      throw new Error("Work record not found.");
    }

    const actionPath = getActionPath({
      transition: input.transition,
      currentItem,
    });
    const { response } = await executeMultipartRequest({
      url: `${API_BASE_URL}/workRequest/${actionPath}/${input.id}`,
      method: "PUT",
      headers: createAuthenticatedHeaders(session),
      body: createActionFormData(input),
    });
    if (!response.ok) {
      throw new Error("The work action could not be saved.");
    }

    const updatedItem = await this.getWorkItem(session, input.id);
    if (!updatedItem) {
      throw new Error("The updated work record could not be loaded.");
    }
    return updatedItem;
  }
}

export const workRepository = new LocalWorkRepository();

import { File } from "expo-file-system";

import {
  readLocalRecords,
  writeLocalRecords,
} from "@/src/data/local-record-storage";
import { createAuthenticatedHeaders } from "@/src/features/auth/data/authenticated-headers";
import type { AuthSession } from "@/src/features/auth/domain/auth.types";
import type {
  WorkItemViewModel,
  WorkTransitionKey,
  WorkUpdateInput,
} from "@/src/features/work/domain/work.types";
import { isEvidenceAttachment } from "@/src/types/evidence";
import type { EvidenceAttachment } from "@/src/types/evidence";
import type { StatusTone } from "@/src/types/status";
import {
  executeJsonRequest,
  executeMultipartRequest,
} from "@/src/utils/api-client";

const API_BASE_URL = "http://34.100.253.156/fom-api";
const WORK_STORAGE_KEY = "fom.local.work.v2";
const INITIAL_WORK_ITEMS: readonly WorkItemViewModel[] = [];

const WORK_TRANSITIONS = ["start", "hold", "complete"] as const;
const STATUS_TONES = [
  "neutral",
  "info",
  "success",
  "warning",
  "danger",
] as const;
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
  itemName: string;
}

interface WorkRequestListItemDto {
  id: string;
  requestNumber: string;
  workGroup: WorkGroupDto;
  workSubGroup: WorkSubGroupDto;
  workItem: WorkItemDto;
  targetCompletionDate: string;
  status: string;
  progressPercent: number | null;
  remarks: string | null;
}

interface WorkRequestSearchResponseDto {
  status: string;
  data: {
    data: WorkRequestListItemDto[];
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
const isNullableString = (value: unknown): boolean =>
  value === null || typeof value === "string";
const isNullableNumber = (value: unknown): boolean =>
  value === null || typeof value === "number";
const isWorkTransition = (value: unknown): boolean =>
  typeof value === "string" &&
  WORK_TRANSITIONS.includes(value as (typeof WORK_TRANSITIONS)[number]);
const isStatus = (value: unknown): boolean =>
  isRecord(value) &&
  typeof value.label === "string" &&
  typeof value.tone === "string" &&
  STATUS_TONES.includes(value.tone as (typeof STATUS_TONES)[number]);
const isWorkItem = (value: unknown): value is WorkItemViewModel =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.requestNumber === "string" &&
  typeof value.workGroup === "string" &&
  typeof value.workSubgroup === "string" &&
  typeof value.workItem === "string" &&
  typeof value.targetCompletion === "string" &&
  isStatus(value.status) &&
  isNullableNumber(value.completionPercentage) &&
  isNullableString(value.remarks) &&
  Array.isArray(value.availableTransitions) &&
  value.availableTransitions.every(isWorkTransition) &&
  Array.isArray(value.attachments) &&
  value.attachments.every(isEvidenceAttachment);

const isGeneralCodeDto = (value: unknown): value is GeneralCodeDto =>
  isRecord(value) && typeof value.codeValue === "string";
const isWorkGroupDto = (value: unknown): value is WorkGroupDto =>
  isRecord(value) && isGeneralCodeDto(value.itemWorkGroup);
const isWorkSubGroupDto = (value: unknown): value is WorkSubGroupDto =>
  isRecord(value) && isGeneralCodeDto(value.itemWorkSubGroup);
const isWorkItemDto = (value: unknown): value is WorkItemDto =>
  isRecord(value) && typeof value.itemName === "string";
const isWorkRequestListItemDto = (
  value: unknown,
): value is WorkRequestListItemDto =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.requestNumber === "string" &&
  isWorkGroupDto(value.workGroup) &&
  isWorkSubGroupDto(value.workSubGroup) &&
  isWorkItemDto(value.workItem) &&
  typeof value.targetCompletionDate === "string" &&
  typeof value.status === "string" &&
  isNullableNumber(value.progressPercent) &&
  isNullableString(value.remarks);
const isWorkRequestSearchResponseDto = (
  value: unknown,
): value is WorkRequestSearchResponseDto =>
  isRecord(value) &&
  typeof value.status === "string" &&
  isRecord(value.data) &&
  Array.isArray(value.data.data) &&
  value.data.data.every(isWorkRequestListItemDto);

const getAvailableTransitions = (
  status: string,
): readonly WorkTransitionKey[] => {
  if (status === "PENDING") return ["start"];
  if (status === "STARTED") return ["hold", "complete"];
  if (status === "HOLD") return ["start", "complete"];
  return [];
};

const mapWorkRequestDto = (
  item: WorkRequestListItemDto,
): WorkItemViewModel => ({
  id: item.id,
  requestNumber: item.requestNumber,
  workGroup: item.workGroup.itemWorkGroup.codeValue,
  workSubgroup: item.workSubGroup.itemWorkSubGroup.codeValue,
  workItem: item.workItem.itemName,
  targetCompletion: item.targetCompletionDate,
  status: STATUS_PRESENTATION[item.status] ?? {
    label: item.status,
    tone: "neutral",
  },
  completionPercentage: item.progressPercent,
  remarks: item.remarks,
  availableTransitions: getAvailableTransitions(item.status),
  attachments: [],
});

const readWorkItems = async (): Promise<readonly WorkItemViewModel[]> =>
  readLocalRecords({
    key: WORK_STORAGE_KEY,
    initialRecords: INITIAL_WORK_ITEMS,
    isRecord: isWorkItem,
  });

const appendAttachments = (
  formData: FormData,
  attachments: readonly EvidenceAttachment[],
): void => {
  attachments.forEach((attachment) => {
    formData.append("files", new File(attachment.uri), attachment.name);
  });
};

const createActionFormData = (input: WorkUpdateInput): FormData => {
  const formData = new FormData();
  formData.append("remarks", input.remarks.trim());
  if (input.transition !== "complete" && input.completionPercentage.trim()) {
    formData.append("progressPercent", input.completionPercentage.trim());
  }
  appendAttachments(formData, input.attachments);
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
    const { response, body } = await executeJsonRequest({
      url: `${API_BASE_URL}/workRequest/search-work-request`,
      method: "POST",
      headers: createAuthenticatedHeaders(session),
      body: {
        page: 1,
        limit: 50,
        filters: { assignedToUserId: session.user.id },
        include: {
          workGroup: { include: { itemWorkGroup: true } },
          workSubGroup: { include: { itemWorkSubGroup: true } },
          workItem: true,
        },
      },
    });
    if (!response.ok) {
      throw new Error("Assigned work could not be loaded.");
    }
    if (!isWorkRequestSearchResponseDto(body)) {
      throw new Error("The assigned work response was incomplete.");
    }

    const workItems = body.data.data.map(mapWorkRequestDto);
    await writeLocalRecords(WORK_STORAGE_KEY, workItems);
    return workItems;
  }

  async getWorkItem(id: string): Promise<WorkItemViewModel | null> {
    const item = (await readWorkItems()).find(
      (candidate) => candidate.id === id,
    );
    return item ?? null;
  }

  async updateWorkItem(
    session: AuthSession,
    input: WorkUpdateInput,
  ): Promise<WorkItemViewModel> {
    if (!input.transition) {
      throw new Error("Select a status action.");
    }

    const currentItem = await this.getWorkItem(input.id);
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

    const workItems = await this.getAssignedWork(session);
    const updatedItem = workItems.find((item) => item.id === input.id);
    if (!updatedItem) {
      throw new Error("The updated work record could not be loaded.");
    }
    return updatedItem;
  }
}

export const workRepository = new LocalWorkRepository();

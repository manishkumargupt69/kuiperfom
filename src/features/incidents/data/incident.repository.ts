import { createAuthenticatedHeaders } from "@/src/features/auth/data/authenticated-headers";
import type { AuthSession } from "@/src/features/auth/domain/auth.types";
import type {
  IncidentCreateInput,
  IncidentOptionViewModel,
  IncidentViewModel,
} from "@/src/features/incidents/domain/incident.types";
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
const PHOTO_EXTENSIONS = new Set(["jpeg", "jpg", "png", "webp", "heic"]);
const VIDEO_EXTENSIONS = new Set(["avi", "mov", "mp4", "webm"]);
const AUDIO_EXTENSIONS = new Set(["aac", "m4a", "mp3", "wav"]);

const STATUS_PRESENTATION: Readonly<
  Record<string, { label: string; tone: StatusTone }>
> = {
  CANCELLED: { label: "Cancelled", tone: "danger" },
  HOLD: { label: "On Hold", tone: "warning" },
  PENDING: { label: "Pending", tone: "warning" },
  RESOLVED: { label: "Resolved", tone: "success" },
  STARTED: { label: "Started", tone: "info" },
};

interface IncidentTypeDto {
  id: string;
  incidentTypeName: string;
  isActive: boolean;
}

interface IncidentSubtypeDto {
  id: string;
  incidentTypeMasterId: string;
  incidentSubTypeName: string;
  isActive: boolean;
}

interface AssigneeDto {
  id: string;
  name: string;
}

interface IncidentListItemDto {
  id: string;
  incidentNumber: string;
  incidentTypeId: string;
  incidentSubTypeId: string;
  displayIncident: string | null;
  title: string;
  description: string;
  status: string;
  assignedToId: string | null;
  remarks: string | null;
  mediaUrls: string[] | null;
  voiceNoteUrl: string | null;
}

interface SearchRequestOptions<T> {
  session: AuthSession;
  path: string;
  body: Readonly<Record<string, unknown>>;
  isItem: (value: unknown) => value is T;
  errorMessage: string;
}

interface IncidentMappingOptions {
  incident: IncidentListItemDto;
  types: readonly IncidentOptionViewModel[];
  subtypes: readonly IncidentOptionViewModel[];
  assignees: readonly IncidentOptionViewModel[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === "string";
const isIncidentTypeDto = (value: unknown): value is IncidentTypeDto =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.incidentTypeName === "string" &&
  typeof value.isActive === "boolean";
const isIncidentSubtypeDto = (value: unknown): value is IncidentSubtypeDto =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.incidentTypeMasterId === "string" &&
  typeof value.incidentSubTypeName === "string" &&
  typeof value.isActive === "boolean";
const isAssigneeDto = (value: unknown): value is AssigneeDto =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string";
const isIncidentListItemDto = (
  value: unknown,
): value is IncidentListItemDto =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.incidentNumber === "string" &&
  typeof value.incidentTypeId === "string" &&
  typeof value.incidentSubTypeId === "string" &&
  isNullableString(value.displayIncident) &&
  typeof value.title === "string" &&
  typeof value.description === "string" &&
  typeof value.status === "string" &&
  isNullableString(value.assignedToId) &&
  isNullableString(value.remarks) &&
  (value.mediaUrls === null ||
    Array.isArray(value.mediaUrls) &&
      value.mediaUrls.every((url) => typeof url === "string")) &&
  isNullableString(value.voiceNoteUrl);

const createJsonHeaders = (session: AuthSession): Record<string, string> => ({
  ...createAuthenticatedHeaders(session),
  "Content-Type": "application/json",
});

const searchRecords = async <T>({
  session,
  path,
  body,
  isItem,
  errorMessage,
}: SearchRequestOptions<T>): Promise<T[]> => {
  const { response, body: responseBody } = await executeJsonRequest({
    url: `${API_BASE_URL}/${path}`,
    method: "POST",
    headers: createJsonHeaders(session),
    body,
  });
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  if (
    !isRecord(responseBody) ||
    !isRecord(responseBody.data) ||
    !Array.isArray(responseBody.data.data) ||
    !responseBody.data.data.every(isItem)
  ) {
    throw new Error(errorMessage);
  }
  return responseBody.data.data;
};

const mapOption = ({ id, label }: IncidentOptionViewModel): IncidentOptionViewModel => ({
  id,
  label,
});

const getOptionLabel = (
  options: readonly IncidentOptionViewModel[],
  id: string,
): string => options.find((option) => option.id === id)?.label ?? "Unknown";

const getEvidenceKind = (url: string): EvidenceKind => {
  const extension = url.split(".").pop()?.toLocaleLowerCase() ?? "";
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

const mapRemoteAttachment = (
  url: string,
  forcedKind?: EvidenceKind,
): EvidenceAttachment => {
  const kind = forcedKind ?? getEvidenceKind(url);
  return {
    id: url,
    kind,
    name: url.split("/").pop() ?? "Evidence",
    uri: encodeURI(url.startsWith("http") ? url : `${API_BASE_URL}${url}`),
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

const mapIncidentDto = ({
  incident,
  types,
  subtypes,
  assignees,
}: IncidentMappingOptions): IncidentViewModel => ({
  id: incident.id,
  incidentNumber: incident.incidentNumber,
  typeId: incident.incidentTypeId,
  type: getOptionLabel(types, incident.incidentTypeId),
  subtypeId: incident.incidentSubTypeId,
  subtype: getOptionLabel(subtypes, incident.incidentSubTypeId),
  title: incident.title || incident.displayIncident || "Incident",
  description: incident.description,
  assignedToId: incident.assignedToId ?? "",
  assignedToName: incident.assignedToId
    ? getOptionLabel(assignees, incident.assignedToId)
    : "Unassigned",
  remarks: incident.remarks,
  status: STATUS_PRESENTATION[incident.status] ?? {
    label: incident.status,
    tone: "neutral",
  },
  attachments: mapAttachments(incident.mediaUrls, incident.voiceNoteUrl),
});

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

const createIncidentFormData = (input: IncidentCreateInput): FormData => {
  const formData = new FormData();
  formData.append("incidentTypeId", input.typeId);
  formData.append("incidentSubTypeId", input.subtypeId);
  formData.append("title", input.title.trim());
  formData.append("description", input.description.trim());
  formData.append("assignedToId", input.assignedToId);
  formData.append("remarks", input.remarks.trim());
  appendLocalAttachments(formData, input.attachments);
  return formData;
};

const getIncidentNumber = (value: unknown): string | null => {
  if (!isRecord(value)) return null;
  if (typeof value.incidentNumber === "string") return value.incidentNumber;
  return getIncidentNumber(value.data);
};

const getMutationErrorMessage = ({
  status,
  fallbackMessage,
}: {
  status: number;
  fallbackMessage: string;
}): string =>
  status === 413
    ? "The server upload limit is smaller than this attachment. Remove it or choose a smaller file."
    : fallbackMessage;

export class IncidentRepository {
  async getReportedIncidents(
    session: AuthSession,
    page: number = 1,
  ): Promise<readonly IncidentViewModel[]> {
    const [incidentDtos, types, subtypes, assignees] = await Promise.all([
      searchRecords({
        session,
        path: "incident/search-incident",
        body: { page, limit: 25 },
        isItem: isIncidentListItemDto,
        errorMessage: "Incidents could not be loaded.",
      }),
      this.getTypes(session),
      this.getSubtypes(session, ""),
      this.getAssignees(session),
    ]);
    return incidentDtos.map((incident) =>
      mapIncidentDto({ incident, types, subtypes, assignees }),
    );
  }

  async getIncident(
    session: AuthSession,
    id: string,
  ): Promise<IncidentViewModel | null> {
    return (await this.getReportedIncidents(session)).find(
      (candidate) => candidate.id === id,
    ) ?? null;
  }

  async getTypes(
    session: AuthSession,
  ): Promise<readonly IncidentOptionViewModel[]> {
    const rows = await searchRecords({
      session,
      path: "incidentType/search-incidentType",
      body: { page: 0, limit: 50 },
      isItem: isIncidentTypeDto,
      errorMessage: "Incident types could not be loaded.",
    });
    return rows
      .filter((row) => row.isActive)
      .map((row) => mapOption({ id: row.id, label: row.incidentTypeName }));
  }

  async getSubtypes(
    session: AuthSession,
    typeId: string,
  ): Promise<readonly IncidentOptionViewModel[]> {
    const filters = typeId ? { incidentTypeMasterId: typeId } : undefined;
    const rows = await searchRecords({
      session,
      path: "incidentSubType/search-incidentSubType",
      body: { page: 0, limit: 0, ...(filters ? { filters } : {}) },
      isItem: isIncidentSubtypeDto,
      errorMessage: "Incident subtypes could not be loaded.",
    });
    return rows
      .filter((row) => row.isActive)
      .map((row) => mapOption({ id: row.id, label: row.incidentSubTypeName }));
  }

  async getAssignees(
    session: AuthSession,
  ): Promise<readonly IncidentOptionViewModel[]> {
    const rows = await searchRecords({
      session,
      path: "user/search-user",
      body: {
        page: 1,
        limit: 50,
        filters: { isActive: true },
        select: { id: true, name: true },
      },
      isItem: isAssigneeDto,
      errorMessage: "Assignees could not be loaded.",
    });
    return rows.map((row) => mapOption({ id: row.id, label: row.name }));
  }

  async createIncident(
    session: AuthSession,
    input: IncidentCreateInput,
  ): Promise<string> {
    const { response, body } = await executeMultipartRequest({
      url: `${API_BASE_URL}/incident/add-incident`,
      method: "POST",
      headers: createAuthenticatedHeaders(session),
      body: createIncidentFormData(input),
    });
    if (!response.ok) {
      throw new Error(
        getMutationErrorMessage({
          status: response.status,
          fallbackMessage: "The incident could not be submitted.",
        }),
      );
    }

    const incidentNumber = getIncidentNumber(body);
    const incidents = await this.getReportedIncidents(session);
    return incidentNumber ?? incidents[0]?.incidentNumber ?? "Incident";
  }

  async updateIncident(
    session: AuthSession,
    id: string,
    input: IncidentCreateInput,
  ): Promise<IncidentViewModel> {
    const { response } = await executeMultipartRequest({
      url: `${API_BASE_URL}/incident/update-incident/${id}`,
      method: "PUT",
      headers: createAuthenticatedHeaders(session),
      body: createIncidentFormData(input),
    });
    if (!response.ok) {
      throw new Error(
        getMutationErrorMessage({
          status: response.status,
          fallbackMessage: "The incident could not be updated.",
        }),
      );
    }

    const incidents = await this.getReportedIncidents(session);
    const updatedIncident = incidents.find((incident) => incident.id === id);
    if (!updatedIncident) {
      throw new Error("The updated incident could not be loaded.");
    }
    return updatedIncident;
  }
}

export const incidentRepository = new IncidentRepository();

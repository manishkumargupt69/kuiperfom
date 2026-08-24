import * as Crypto from "expo-crypto";

import { readLocalRecords, writeLocalRecords } from "@/src/data/local-record-storage";
import { createAuthenticatedHeaders } from "@/src/features/auth/data/authenticated-headers";
import type { AuthSession } from "@/src/features/auth/domain/auth.types";
import type { IncidentCreateInput, IncidentOptionViewModel, IncidentViewModel } from "@/src/features/incidents/domain/incident.types";
import { isEvidenceAttachment } from "@/src/types/evidence";
import type { StatusTone } from "@/src/types/status";
import { executeJsonRequest } from "@/src/utils/api-client";

const API_BASE_URL = "http://34.100.253.156/fom-api";
const INCIDENT_STORAGE_KEY = "fom.local.incidents.v2";
const INITIAL_INCIDENTS: readonly IncidentViewModel[] = [];
const TYPES: readonly IncidentOptionViewModel[] = [];
const SUBTYPES: Readonly<Record<string, readonly IncidentOptionViewModel[]>> = {};

const STATUS_TONES = ["neutral", "info", "success", "warning", "danger"] as const;
const STATUS_PRESENTATION: Readonly<Record<string, { label: string; tone: StatusTone }>> = {
  CANCELLED: { label: "Cancelled", tone: "danger" },
  HOLD: { label: "On Hold", tone: "warning" },
  PENDING: { label: "Pending", tone: "warning" },
  RESOLVED: { label: "Resolved", tone: "success" },
  STARTED: { label: "Started", tone: "info" },
};

interface IncidentListItemDto {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  status: string;
  remarks?: string | null;
}

interface IncidentListResponseDto {
  status: string;
  data: IncidentListItemDto[];
}
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const isNullableString = (value: unknown): boolean => value === null || typeof value === "string";
const isStatus = (value: unknown): boolean => isRecord(value) && typeof value.label === "string" && typeof value.tone === "string" && STATUS_TONES.includes(value.tone as typeof STATUS_TONES[number]);
const isIncident = (value: unknown): value is IncidentViewModel => isRecord(value) && typeof value.id === "string" && typeof value.incidentNumber === "string" && typeof value.type === "string" && typeof value.subtype === "string" && typeof value.description === "string" && isNullableString(value.remarks) && isStatus(value.status) && Array.isArray(value.attachments) && value.attachments.every(isEvidenceAttachment);
const isOptionalNullableString = (value: unknown): boolean => value === undefined || isNullableString(value);
const isIncidentListItemDto = (value: unknown): value is IncidentListItemDto => isRecord(value) && typeof value.id === "string" && typeof value.incidentNumber === "string" && typeof value.title === "string" && typeof value.description === "string" && typeof value.status === "string" && isOptionalNullableString(value.remarks);
const isIncidentListResponseDto = (value: unknown): value is IncidentListResponseDto => isRecord(value) && typeof value.status === "string" && Array.isArray(value.data) && value.data.every(isIncidentListItemDto);
const mapIncidentDto = (incident: IncidentListItemDto): IncidentViewModel => ({
  id: incident.id,
  incidentNumber: incident.incidentNumber,
  type: incident.title,
  subtype: "",
  description: incident.description,
  remarks: incident.remarks ?? null,
  status: STATUS_PRESENTATION[incident.status] ?? { label: incident.status, tone: "neutral" },
  attachments: [],
});
const readIncidents = async (): Promise<readonly IncidentViewModel[]> => readLocalRecords({ key: INCIDENT_STORAGE_KEY, initialRecords: INITIAL_INCIDENTS, isRecord: isIncident });
const getOptionLabel = (options: readonly IncidentOptionViewModel[], id: string): string => options.find((option) => option.id === id)?.label ?? "Unknown";
const getNextIncidentNumber = (incidents: readonly IncidentViewModel[]): string => {
  const highestNumber = incidents.reduce((highest, incident) => {
    const numericPart = Number(incident.incidentNumber.replace("INC-", ""));
    return Number.isFinite(numericPart) ? Math.max(highest, numericPart) : highest;
  }, 3000);
  return `INC-${highestNumber + 1}`;
};

export class LocalIncidentRepository {
  async getReportedIncidents(session: AuthSession): Promise<readonly IncidentViewModel[]> {
    const query = new URLSearchParams({ limit: "50", page: "1", reportedById: session.user.id });
    const { response, body } = await executeJsonRequest({ url: `${API_BASE_URL}/incident?${query.toString()}`, method: "GET", headers: createAuthenticatedHeaders(session) });
    if (!response.ok) throw new Error("Reported incidents could not be loaded.");
    if (!isIncidentListResponseDto(body)) throw new Error("The incident response was incomplete.");
    const incidents = body.data.map(mapIncidentDto);
    await writeLocalRecords(INCIDENT_STORAGE_KEY, incidents);
    return incidents;
  }
  async getIncident(id: string): Promise<IncidentViewModel | null> { return (await readIncidents()).find((candidate) => candidate.id === id) ?? null; }
  async getTypes(): Promise<readonly IncidentOptionViewModel[]> { return TYPES; }
  async getSubtypes(typeId: string): Promise<readonly IncidentOptionViewModel[]> { return SUBTYPES[typeId] ?? []; }
  async createIncident(input: IncidentCreateInput): Promise<string> {
    const incidents = await readIncidents();
    const incidentNumber = getNextIncidentNumber(incidents);
    const incident: IncidentViewModel = {
      id: Crypto.randomUUID(),
      incidentNumber,
      type: getOptionLabel(TYPES, input.typeId),
      subtype: getOptionLabel(SUBTYPES[input.typeId] ?? [], input.subtypeId),
      description: input.description.trim(),
      remarks: input.remarks.trim() || null,
      status: { label: "Pending", tone: "warning" },
      attachments: input.attachments,
    };
    await writeLocalRecords(INCIDENT_STORAGE_KEY, [incident, ...incidents]);
    return incidentNumber;
  }
}

export const incidentRepository = new LocalIncidentRepository();

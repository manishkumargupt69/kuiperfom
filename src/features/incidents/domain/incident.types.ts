import type { StatusTone } from "@/src/types/status";
import type { EvidenceAttachment } from "@/src/types/evidence";

export interface IncidentViewModel {
  id: string;
  incidentNumber: string;
  typeId: string;
  type: string;
  subtypeId: string;
  subtype: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  remarks: string | null;
  status: { label: string; tone: StatusTone };
  attachments: readonly EvidenceAttachment[];
}

export interface IncidentOptionViewModel { id: string; label: string; }

export interface IncidentCreateInput {
  typeId: string;
  subtypeId: string;
  title: string;
  description: string;
  assignedToId: string;
  remarks: string;
  attachments: readonly EvidenceAttachment[];
}

import type { StatusTone } from "@/src/types/status";
import type { EvidenceAttachment } from "@/src/types/evidence";

export type WorkTransitionKey = "start" | "hold" | "complete";
export type WorkSortKey =
  | "target-asc"
  | "target-desc"
  | "request-number"
  | "status";

export interface WorkItemViewModel {
  id: string;
  requestNumber: string;
  workGroup: string;
  workSubgroup: string;
  workItem: string;
  workItemCode: string;
  workItemDescription: string | null;
  partModel: string | null;
  weightLabel: string | null;
  unitOfMeasure: string | null;
  targetCompletion: string;
  status: { label: string; tone: StatusTone };
  completionPercentage: number | null;
  remarks: string | null;
  assignedToName: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  availableTransitions: readonly WorkTransitionKey[];
  attachments: readonly EvidenceAttachment[];
}

export interface WorkUpdateInput {
  id: string;
  completionPercentage: string;
  remarks: string;
  transition: WorkTransitionKey | null;
  attachments: readonly EvidenceAttachment[];
}

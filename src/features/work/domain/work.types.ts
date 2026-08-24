import type { StatusTone } from "@/src/types/status";
import type { EvidenceAttachment } from "@/src/types/evidence";

export type WorkTransitionKey = "start" | "hold" | "complete";

export interface WorkItemViewModel {
  id: string;
  requestNumber: string;
  workGroup: string;
  workSubgroup: string;
  workItem: string;
  targetCompletion: string;
  status: { label: string; tone: StatusTone };
  completionPercentage: number | null;
  remarks: string | null;
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

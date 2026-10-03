import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/src/features/auth/state/auth-store";
import type { DashboardWorkItemViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { useProjectDetails } from "@/src/features/dashboard/hooks/use-project-details";
import { useDashboardStore } from "@/src/features/dashboard/state/dashboard-store";
import { useEvidenceAttachments } from "@/src/features/evidence/hooks/use-evidence-attachments";
import { workRepository } from "@/src/features/work/data/local-work.repository";
import type { WorkAuditInput } from "@/src/features/work/domain/work.types";
import type { EvidenceAttachment } from "@/src/types/evidence";
import type { ViewState } from "@/src/types/view-state";

interface WorkAuditDetails {
  projectName: string;
  city: string;
  startDate: string;
  item: DashboardWorkItemViewModel;
}

interface WorkAuditResult {
  viewState: ViewState<WorkAuditDetails>;
  remarks: string;
  attachments: readonly EvidenceAttachment[];
  isSaving: boolean;
  setRemarks: (value: string) => void;
  addPhoto: () => Promise<void>;
  addDocument: () => Promise<void>;
  removeAttachment: (id: string) => void;
  save: () => Promise<void>;
  reload: () => Promise<void>;
}

export const useWorkAudit = (id: string): WorkAuditResult => {
  const selectedProject = useDashboardStore((state) => state.selectedProject);
  const { viewState: projectState, reload } = useProjectDetails(selectedProject?.id ?? null);
  const session = useAuthStore((state) => state.session);
  const [remarks, setRemarks] = useState("");
  const evidence = useEvidenceAttachments();
  const queryClient = useQueryClient();
  const { isPending: isSaving, mutateAsync } = useMutation({
    mutationFn: (input: WorkAuditInput) => {
      if (!session) throw new Error("Sign in to audit work items.");
      return workRepository.auditWorkItem(session, input);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["work-history"] }),
        queryClient.invalidateQueries({ queryKey: ["project-details"] }),
      ]);
    },
  });
  const save = useCallback(async (): Promise<void> => {
    if (projectState.status !== "success") throw new Error("Work item details are unavailable.");
    const item = projectState.data.workGroups.flatMap((group) => group.workItems).find((workItem) => workItem.id === id);
    if (!item) throw new Error("Work item details are unavailable.");
    await mutateAsync({ id: item.id, remarks, attachments: evidence.attachments });
  }, [evidence.attachments, id, mutateAsync, projectState, remarks]);

  let viewState: ViewState<WorkAuditDetails>;
  if (projectState.status !== "success") {
    viewState = projectState;
  } else {
    const project = projectState.data;
    const item = project.workGroups.flatMap((group) => group.workItems).find((workItem) => workItem.id === id);
    viewState = item
      ? { status: "success", data: { projectName: project.projectName, city: project.city, startDate: project.startDate, item } }
      : { status: "empty" };
  }

  return {
    viewState,
    remarks,
    attachments: evidence.attachments,
    isSaving,
    setRemarks,
    addPhoto: evidence.addPhoto,
    addDocument: evidence.addDocument,
    removeAttachment: evidence.removeAttachment,
    save,
    reload,
  };
};

import { useCallback, useEffect, useReducer } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { workRepository } from "@/src/features/work/data/local-work.repository";
import type { WorkItemViewModel, WorkTransitionKey, WorkUpdateInput } from "@/src/features/work/domain/work.types";
import { useAuthStore } from "@/src/features/auth/state/auth-store";
import { useEvidenceAttachments } from "@/src/features/evidence/hooks/use-evidence-attachments";
import type { EvidencePreparationState } from "@/src/features/evidence/hooks/use-evidence-attachments";
import type { CapturedEvidence, EvidenceAttachment } from "@/src/types/evidence";
import type { ViewState } from "@/src/types/view-state";

const WORK_DETAIL_QUERY_KEY = "work-detail";
interface EditorState { completionPercentage: number | null; remarks: string; transition: WorkTransitionKey | null; isHydrated: boolean; }
type EditorAction = { type: "hydrate"; item: WorkItemViewModel } | { type: "completion"; value: number } | { type: "remarks"; value: string } | { type: "transition"; value: WorkTransitionKey };
const INITIAL_STATE: EditorState = { completionPercentage: null, remarks: "", transition: null, isHydrated: false };
const EMPTY_ATTACHMENTS: readonly EvidenceAttachment[] = [];
const reducer = (state: EditorState, action: EditorAction): EditorState => {
  if (action.type === "hydrate") return { completionPercentage: action.item.completionPercentage, remarks: "", transition: null, isHydrated: true };
  if (action.type === "completion") return { ...state, completionPercentage: action.value };
  if (action.type === "remarks") return { ...state, remarks: action.value };
  return { ...state, transition: action.value };
};

interface WorkEditorResult { viewState: ViewState<WorkItemViewModel>; editorState: EditorState; isSaving: boolean; attachments: readonly EvidenceAttachment[]; preparation: EvidencePreparationState | null; setCompletionPercentage: (value: number) => void; setRemarks: (value: string) => void; selectTransition: (value: WorkTransitionKey) => void; addDocument: () => Promise<void>; addCapturedMedia: (evidence: CapturedEvidence) => Promise<void>; addMediaFromGallery: () => Promise<void>; removeAttachment: (id: string) => void; save: () => Promise<void>; reload: () => Promise<void>; }

const validateCompletionPercentage = (value: number | null): void => {
  if (value === null) return;
  if (!Number.isInteger(value) || value < 0 || value > 100) throw new Error("Completion percentage must be a whole number from 0 to 100.");
};

export const useWorkEditor = (id: string, onEvidencePickerFinished: () => void): WorkEditorResult => {
  const [editorState, dispatch] = useReducer(reducer, INITIAL_STATE);
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const { data, fetchStatus, isError, isPending, refetch, status } = useQuery({
    queryKey: [WORK_DETAIL_QUERY_KEY, session?.user.id ?? "", id],
    queryFn: () =>
      session
        ? workRepository.getWorkItem(session, id)
        : Promise.resolve(null),
    enabled: Boolean(id && session),
  });
  const evidence = useEvidenceAttachments({
    initialAttachments: EMPTY_ATTACHMENTS,
    onPickerFinished: onEvidencePickerFinished,
    mediaStamp: "address-date",
  });
  const { isPending: isSaving, mutateAsync } = useMutation({ mutationFn: (input: WorkUpdateInput) => {
    if (!session) throw new Error("Your session has expired. Sign in again.");
    return workRepository.updateWorkItem(session, input);
  }, onSuccess: async (updatedItem) => {
    queryClient.setQueryData([WORK_DETAIL_QUERY_KEY, session?.user.id ?? "", updatedItem.id], updatedItem);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["assigned-work"] }),
      queryClient.invalidateQueries({ queryKey: ["project-details"] }),
      queryClient.invalidateQueries({ queryKey: ["work-history"] }),
    ]);
  } });
  useEffect(() => { if (data) dispatch({ type: "hydrate", item: data }); }, [data]);
  const setCompletionPercentage = useCallback((value: number): void => dispatch({ type: "completion", value }), []);
  const setRemarks = useCallback((value: string): void => dispatch({ type: "remarks", value }), []);
  const selectTransition = useCallback((value: WorkTransitionKey): void => dispatch({ type: "transition", value }), []);
  const save = useCallback(async (): Promise<void> => { if (!data) return; if (!editorState.transition) throw new Error("Select a status action."); if (evidence.preparation) throw new Error("Wait for the attachment to be ready before submitting."); validateCompletionPercentage(editorState.completionPercentage); await mutateAsync({ id: data.id, completionPercentage: editorState.completionPercentage?.toString() ?? "", remarks: editorState.remarks, transition: editorState.transition, attachments: evidence.attachments }); }, [data, editorState, evidence.attachments, evidence.preparation, mutateAsync]);
  const reload = useCallback(async (): Promise<void> => { await refetch(); }, [refetch]);
  let viewState: ViewState<WorkItemViewModel>;
  if (!id || fetchStatus === "idle" && status === "pending") viewState = { status: "idle" };
  else if (isPending) viewState = { status: "loading" };
  else if (isError) viewState = { status: "error", message: "Work details could not be loaded." };
  else if (!data) viewState = { status: "empty" };
  else viewState = { status: "success", data };
  return { viewState, editorState, isSaving, attachments: evidence.attachments, preparation: evidence.preparation, setCompletionPercentage, setRemarks, selectTransition, addDocument: evidence.addDocument, addCapturedMedia: evidence.addCapturedMedia, addMediaFromGallery: evidence.addMediaFromGallery, removeAttachment: evidence.removeAttachment, save, reload };
};

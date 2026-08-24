import { useCallback, useReducer } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { incidentRepository } from "@/src/features/incidents/data/local-incident.repository";
import type { IncidentCreateInput, IncidentOptionViewModel } from "@/src/features/incidents/domain/incident.types";
import { useEvidenceAttachments } from "@/src/features/evidence/hooks/use-evidence-attachments";
import type { EvidenceAttachment } from "@/src/types/evidence";
import type { ViewState } from "@/src/types/view-state";

const TYPE_QUERY_KEY = "incident-types";
const SUBTYPE_QUERY_KEY = "incident-subtypes";
interface ReportState { type: IncidentOptionViewModel | null; subtype: IncidentOptionViewModel | null; description: string; remarks: string; }
type ReportAction = { type: "select-type"; value: IncidentOptionViewModel } | { type: "select-subtype"; value: IncidentOptionViewModel } | { type: "description"; value: string } | { type: "remarks"; value: string };
const INITIAL_STATE: ReportState = { type: null, subtype: null, description: "", remarks: "" };
const EMPTY_ATTACHMENTS: readonly EvidenceAttachment[] = [];
const reducer = (state: ReportState, action: ReportAction): ReportState => {
  if (action.type === "select-type") return { ...state, type: action.value, subtype: null };
  if (action.type === "select-subtype") return { ...state, subtype: action.value };
  if (action.type === "description") return { ...state, description: action.value };
  return { ...state, remarks: action.value };
};

interface IncidentReportResult { state: ReportState; typesState: ViewState<readonly IncidentOptionViewModel[]>; subtypes: readonly IncidentOptionViewModel[]; isLoadingSubtypes: boolean; isSubmitting: boolean; attachments: readonly EvidenceAttachment[]; isRecording: boolean; recordingDurationMilliseconds: number; selectType: (value: IncidentOptionViewModel) => void; selectSubtype: (value: IncidentOptionViewModel) => void; setDescription: (value: string) => void; setRemarks: (value: string) => void; addDocument: () => Promise<void>; addPhoto: () => Promise<void>; addVideo: () => Promise<void>; toggleVoiceRecording: () => Promise<void>; removeAttachment: (id: string) => void; submit: () => Promise<string>; reloadTypes: () => Promise<void>; }

const validateIncident = (state: ReportState): void => {
  if (!state.type) throw new Error("Select an incident type.");
  if (!state.subtype) throw new Error("Select an incident subtype.");
  if (!state.description.trim()) throw new Error("Enter an incident description.");
};

export const useIncidentReport = (): IncidentReportResult => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const queryClient = useQueryClient();
  const evidence = useEvidenceAttachments(EMPTY_ATTACHMENTS);
  const typesQuery = useQuery({ queryKey: [TYPE_QUERY_KEY], queryFn: () => incidentRepository.getTypes() });
  const subtypesQuery = useQuery({ queryKey: [SUBTYPE_QUERY_KEY, state.type?.id], queryFn: () => incidentRepository.getSubtypes(state.type?.id ?? ""), enabled: Boolean(state.type) });
  const { isPending: isSubmitting, mutateAsync } = useMutation({ mutationFn: (input: IncidentCreateInput) => incidentRepository.createIncident(input), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["reported-incidents"] }); } });
  const { refetch: refetchTypes } = typesQuery;
  const selectType = useCallback((value: IncidentOptionViewModel): void => dispatch({ type: "select-type", value }), []);
  const selectSubtype = useCallback((value: IncidentOptionViewModel): void => dispatch({ type: "select-subtype", value }), []);
  const setDescription = useCallback((value: string): void => dispatch({ type: "description", value }), []);
  const setRemarks = useCallback((value: string): void => dispatch({ type: "remarks", value }), []);
  const submit = useCallback(async (): Promise<string> => { validateIncident(state); return mutateAsync({ typeId: state.type?.id ?? "", subtypeId: state.subtype?.id ?? "", description: state.description, remarks: state.remarks, attachments: evidence.attachments }); }, [evidence.attachments, mutateAsync, state]);
  const reloadTypes = useCallback(async (): Promise<void> => { await refetchTypes(); }, [refetchTypes]);
  let typesState: ViewState<readonly IncidentOptionViewModel[]>;
  if (typesQuery.fetchStatus === "idle" && typesQuery.status === "pending") typesState = { status: "idle" };
  else if (typesQuery.isPending) typesState = { status: "loading" };
  else if (typesQuery.isError) typesState = { status: "error", message: "Incident types could not be loaded." };
  else if (typesQuery.data.length === 0) typesState = { status: "empty" };
  else typesState = { status: "success", data: typesQuery.data };
  return { state, typesState, subtypes: subtypesQuery.data ?? [], isLoadingSubtypes: subtypesQuery.isPending && Boolean(state.type), isSubmitting, attachments: evidence.attachments, isRecording: evidence.isRecording, recordingDurationMilliseconds: evidence.recordingDurationMilliseconds, selectType, selectSubtype, setDescription, setRemarks, addDocument: evidence.addDocument, addPhoto: evidence.addPhoto, addVideo: evidence.addVideo, toggleVoiceRecording: evidence.toggleVoiceRecording, removeAttachment: evidence.removeAttachment, submit, reloadTypes };
};

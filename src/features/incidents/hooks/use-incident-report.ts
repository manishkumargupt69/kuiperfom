import { useCallback, useEffect, useReducer } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/src/features/auth/state/auth-store";
import { incidentRepository } from "@/src/features/incidents/data/incident.repository";
import type {
  IncidentCreateInput,
  IncidentOptionViewModel,
  IncidentViewModel,
} from "@/src/features/incidents/domain/incident.types";
import { useEvidenceAttachments } from "@/src/features/evidence/hooks/use-evidence-attachments";
import type { EvidenceAttachment } from "@/src/types/evidence";
import type { ViewState } from "@/src/types/view-state";

const TYPE_QUERY_KEY = "incident-types";
const SUBTYPE_QUERY_KEY = "incident-subtypes";
const ASSIGNEE_QUERY_KEY = "incident-assignees";
const EMPTY_ATTACHMENTS: readonly EvidenceAttachment[] = [];

interface ReportState {
  type: IncidentOptionViewModel | null;
  subtype: IncidentOptionViewModel | null;
  title: string;
  description: string;
  assignee: IncidentOptionViewModel | null;
  remarks: string;
}

type ReportAction =
  | { type: "hydrate"; value: IncidentViewModel }
  | { type: "select-type"; value: IncidentOptionViewModel }
  | { type: "select-subtype"; value: IncidentOptionViewModel }
  | { type: "select-assignee"; value: IncidentOptionViewModel }
  | { type: "title"; value: string }
  | { type: "description"; value: string }
  | { type: "remarks"; value: string };

interface IncidentSaveResult {
  incidentNumber: string;
  updatedIncident: IncidentViewModel | null;
}

const INITIAL_STATE: ReportState = {
  type: null,
  subtype: null,
  title: "",
  description: "",
  assignee: null,
  remarks: "",
};

const reducer = (state: ReportState, action: ReportAction): ReportState => {
  if (action.type === "hydrate") {
    return {
      type: { id: action.value.typeId, label: action.value.type },
      subtype: { id: action.value.subtypeId, label: action.value.subtype },
      title: action.value.title,
      description: action.value.description,
      assignee: action.value.assignedToId
        ? { id: action.value.assignedToId, label: action.value.assignedToName }
        : null,
      remarks: action.value.remarks ?? "",
    };
  }
  if (action.type === "select-type") {
    return { ...state, type: action.value, subtype: null };
  }
  if (action.type === "select-subtype") {
    return { ...state, subtype: action.value };
  }
  if (action.type === "select-assignee") {
    return { ...state, assignee: action.value };
  }
  if (action.type === "title") {
    return { ...state, title: action.value };
  }
  if (action.type === "description") {
    return { ...state, description: action.value };
  }
  return { ...state, remarks: action.value };
};

interface IncidentReportResult {
  state: ReportState;
  typesState: ViewState<readonly IncidentOptionViewModel[]>;
  subtypes: readonly IncidentOptionViewModel[];
  assignees: readonly IncidentOptionViewModel[];
  isLoadingSubtypes: boolean;
  isSubmitting: boolean;
  attachments: readonly EvidenceAttachment[];
  isRecording: boolean;
  recordingDurationMilliseconds: number;
  selectType: (value: IncidentOptionViewModel) => void;
  selectSubtype: (value: IncidentOptionViewModel) => void;
  selectAssignee: (value: IncidentOptionViewModel) => void;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setRemarks: (value: string) => void;
  addDocument: () => Promise<void>;
  addFromGallery: () => Promise<void>;
  addPhoto: () => Promise<void>;
  addVideo: () => Promise<void>;
  toggleVoiceRecording: () => Promise<void>;
  removeAttachment: (id: string) => void;
  submit: () => Promise<string>;
  reloadTypes: () => Promise<void>;
}

const validateIncident = (state: ReportState): void => {
  if (!state.type) throw new Error("Select an incident type.");
  if (!state.subtype) throw new Error("Select an incident subtype.");
  if (!state.title.trim()) throw new Error("Enter an incident title.");
  if (!state.description.trim()) throw new Error("Enter an incident description.");
  if (!state.assignee) throw new Error("Select an assignee.");
};

export const useIncidentReport = (
  incident: IncidentViewModel | null = null,
): IncidentReportResult => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const session = useAuthStore((authState) => authState.session);
  const queryClient = useQueryClient();
  const companyId = session?.user.company[0]?.id ?? "";
  const evidence = useEvidenceAttachments(EMPTY_ATTACHMENTS);
  const typesQuery = useQuery({
    queryKey: [TYPE_QUERY_KEY, companyId],
    queryFn: () => {
      if (!session) return Promise.resolve([]);
      return incidentRepository.getTypes(session);
    },
    enabled: Boolean(session),
  });
  const assigneesQuery = useQuery({
    queryKey: [ASSIGNEE_QUERY_KEY, companyId],
    queryFn: () => {
      if (!session) return Promise.resolve([]);
      return incidentRepository.getAssignees(session);
    },
    enabled: Boolean(session),
  });
  const subtypesQuery = useQuery({
    queryKey: [SUBTYPE_QUERY_KEY, companyId, state.type?.id],
    queryFn: () => {
      if (!session || !state.type) return Promise.resolve([]);
      return incidentRepository.getSubtypes(session, state.type.id);
    },
    enabled: Boolean(session && state.type),
  });
  const { isPending: isSubmitting, mutateAsync } = useMutation({
    mutationFn: async (input: IncidentCreateInput): Promise<IncidentSaveResult> => {
      if (!session) {
        throw new Error("Your session has expired. Sign in again.");
      }
      if (incident) {
        const updatedIncident = await incidentRepository.updateIncident(
          session,
          incident.id,
          input,
        );
        return {
          incidentNumber: updatedIncident.incidentNumber,
          updatedIncident,
        };
      }
      return {
        incidentNumber: await incidentRepository.createIncident(session, input),
        updatedIncident: null,
      };
    },
    onSuccess: async ({ updatedIncident }) => {
      if (updatedIncident) {
        queryClient.setQueryData(
          ["incident-detail", updatedIncident.id],
          updatedIncident,
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["reported-incidents"] });
    },
  });

  useEffect(() => {
    if (incident) {
      dispatch({ type: "hydrate", value: incident });
    }
  }, [incident]);

  const selectType = useCallback(
    (value: IncidentOptionViewModel): void =>
      dispatch({ type: "select-type", value }),
    [],
  );
  const selectSubtype = useCallback(
    (value: IncidentOptionViewModel): void =>
      dispatch({ type: "select-subtype", value }),
    [],
  );
  const selectAssignee = useCallback(
    (value: IncidentOptionViewModel): void =>
      dispatch({ type: "select-assignee", value }),
    [],
  );
  const setTitle = useCallback(
    (value: string): void => dispatch({ type: "title", value }),
    [],
  );
  const setDescription = useCallback(
    (value: string): void => dispatch({ type: "description", value }),
    [],
  );
  const setRemarks = useCallback(
    (value: string): void => dispatch({ type: "remarks", value }),
    [],
  );
  const submit = useCallback(async (): Promise<string> => {
    validateIncident(state);
    const result = await mutateAsync({
      typeId: state.type?.id ?? "",
      subtypeId: state.subtype?.id ?? "",
      title: state.title,
      description: state.description,
      assignedToId: state.assignee?.id ?? "",
      remarks: state.remarks,
      attachments: evidence.attachments,
    });
    return result.incidentNumber;
  }, [evidence.attachments, mutateAsync, state]);
  const reloadTypes = useCallback(async (): Promise<void> => {
    await Promise.all([typesQuery.refetch(), assigneesQuery.refetch()]);
  }, [assigneesQuery, typesQuery]);

  let typesState: ViewState<readonly IncidentOptionViewModel[]>;
  if (!session) {
    typesState = { status: "idle" };
  } else if (typesQuery.isPending || assigneesQuery.isPending) {
    typesState = { status: "loading" };
  } else if (typesQuery.isError || assigneesQuery.isError) {
    typesState = {
      status: "error",
      message: "Incident form options could not be loaded.",
    };
  } else if (typesQuery.data.length === 0) {
    typesState = { status: "empty" };
  } else {
    typesState = { status: "success", data: typesQuery.data };
  }

  return {
    state,
    typesState,
    subtypes: subtypesQuery.data ?? [],
    assignees: assigneesQuery.data ?? [],
    isLoadingSubtypes: subtypesQuery.isPending && Boolean(state.type),
    isSubmitting,
    attachments: evidence.attachments,
    isRecording: evidence.isRecording,
    recordingDurationMilliseconds: evidence.recordingDurationMilliseconds,
    selectType,
    selectSubtype,
    selectAssignee,
    setTitle,
    setDescription,
    setRemarks,
    addDocument: evidence.addDocument,
    addFromGallery: evidence.addFromGallery,
    addPhoto: evidence.addPhoto,
    addVideo: evidence.addVideo,
    toggleVoiceRecording: evidence.toggleVoiceRecording,
    removeAttachment: evidence.removeAttachment,
    submit,
    reloadTypes,
  };
};

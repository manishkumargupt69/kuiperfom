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
import type { EvidencePreparationState } from "@/src/features/evidence/hooks/use-evidence-attachments";
import type { CapturedEvidence, EvidenceAttachment } from "@/src/types/evidence";
import type { ViewState } from "@/src/types/view-state";

const TYPE_QUERY_KEY = "incident-types";
const SUBTYPE_QUERY_KEY = "incident-subtypes";
const EMPTY_ATTACHMENTS: readonly EvidenceAttachment[] = [];

interface ReportState {
  type: IncidentOptionViewModel | null;
  subtype: IncidentOptionViewModel | null;
  description: string;
  remarks: string;
}

type ReportAction =
  | { type: "hydrate"; value: IncidentViewModel }
  | { type: "select-type"; value: IncidentOptionViewModel }
  | { type: "select-subtype"; value: IncidentOptionViewModel }
  | { type: "description"; value: string }
  | { type: "remarks"; value: string };

interface IncidentSaveResult {
  incidentNumber: string;
  updatedIncident: IncidentViewModel | null;
}

const INITIAL_STATE: ReportState = {
  type: null,
  subtype: null,
  description: "",
  remarks: "",
};

const reducer = (state: ReportState, action: ReportAction): ReportState => {
  if (action.type === "hydrate") {
    return {
      type: { id: action.value.typeId, label: action.value.type },
      subtype: { id: action.value.subtypeId, label: action.value.subtype },
      description: action.value.description,
      remarks: action.value.remarks ?? "",
    };
  }
  if (action.type === "select-type") {
    return { ...state, type: action.value, subtype: null };
  }
  if (action.type === "select-subtype") {
    return { ...state, subtype: action.value };
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
  isLoadingSubtypes: boolean;
  isSubmitting: boolean;
  attachments: readonly EvidenceAttachment[];
  selectType: (value: IncidentOptionViewModel) => void;
  selectSubtype: (value: IncidentOptionViewModel) => void;
  setDescription: (value: string) => void;
  setRemarks: (value: string) => void;
  addDocument: () => Promise<void>;
  addMediaFromGallery: () => Promise<void>;
  addCapturedMedia: (evidence: CapturedEvidence) => Promise<void>;
  preparation: EvidencePreparationState | null;
  removeAttachment: (id: string) => void;
  submit: () => Promise<string>;
  reloadTypes: () => Promise<void>;
}

const validateIncident = (state: ReportState): void => {
  if (!state.type) throw new Error("Select an incident type.");
  if (!state.subtype) throw new Error("Select an incident subtype.");
  if (!state.description.trim()) throw new Error("Enter an incident description.");
};

export const useIncidentReport = (
  incident: IncidentViewModel | null = null,
  onEvidencePickerFinished?: () => void,
): IncidentReportResult => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const session = useAuthStore((authState) => authState.session);
  const queryClient = useQueryClient();
  const companyId = session?.user.company[0]?.id ?? "";
  const evidence = useEvidenceAttachments({
    initialAttachments: EMPTY_ATTACHMENTS,
    onPickerFinished: onEvidencePickerFinished,
    mediaStamp: "address-date",
  });
  const typesQuery = useQuery({
    queryKey: [TYPE_QUERY_KEY, companyId],
    queryFn: () => {
      if (!session) return Promise.resolve([]);
      return incidentRepository.getTypes(session);
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
      evidence.clearAttachments();
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
    if (!session) throw new Error("Your session has expired. Sign in again.");
    if (evidence.preparation) throw new Error("Wait for the attachment to be ready.");
    const result = await mutateAsync({
      typeId: state.type?.id ?? "",
      subtypeId: state.subtype?.id ?? "",
      description: state.description,
      assignedToId: session.user.id,
      remarks: state.remarks,
      attachments: evidence.attachments,
    });
    return result.incidentNumber;
  }, [evidence.attachments, evidence.preparation, mutateAsync, session, state]);
  const reloadTypes = useCallback(async (): Promise<void> => {
    await typesQuery.refetch();
  }, [typesQuery]);

  let typesState: ViewState<readonly IncidentOptionViewModel[]>;
  if (!session) {
    typesState = { status: "idle" };
  } else if (typesQuery.isPending) {
    typesState = { status: "loading" };
  } else if (typesQuery.isError) {
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
    isLoadingSubtypes: subtypesQuery.isPending && Boolean(state.type),
    isSubmitting,
    attachments: evidence.attachments,
    preparation: evidence.preparation,
    selectType,
    selectSubtype,
    setDescription,
    setRemarks,
    addDocument: evidence.addDocument,
    addMediaFromGallery: evidence.addMediaFromGallery,
    addCapturedMedia: evidence.addCapturedMedia,
    removeAttachment: evidence.removeAttachment,
    submit,
    reloadTypes,
  };
};

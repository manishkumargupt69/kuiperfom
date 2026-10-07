import { useCallback, useEffect, useRef, useState } from "react";
import { InteractionManager, Platform } from "react-native";

import { useIncidentReport } from "@/src/features/incidents/hooks/use-incident-report";
import type { IncidentViewModel } from "@/src/features/incidents/domain/incident.types";
import type { CapturedEvidence } from "@/src/types/evidence";

interface IncidentEvidenceFlowResult {
  report: ReturnType<typeof useIncidentReport>;
  isEvidenceVisible: boolean;
  isCameraVisible: boolean;
  openEvidence: () => void;
  closeEvidence: () => void;
  chooseCamera: () => void;
  chooseGallery: () => void;
  chooseFile: () => void;
  closeCamera: () => void;
  handleEvidenceDismiss: () => void;
  handleCameraDismiss: () => void;
  handleCameraCaptured: (evidence: CapturedEvidence) => void;
}

export const useIncidentEvidenceFlow = (incident: IncidentViewModel | null = null): IncidentEvidenceFlowResult => {
  const [isEvidenceVisible, setIsEvidenceVisible] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const openEvidence = useCallback((): void => setIsEvidenceVisible(true), []);
  const closeEvidence = useCallback((): void => setIsEvidenceVisible(false), []);
  const report = useIncidentReport(incident, openEvidence);
  const pendingPicker = useRef<(() => Promise<void>) | null>(null);
  const pendingCapture = useRef<CapturedEvidence | null>(null);
  const isReturningFromCamera = useRef(false);
  const { addCapturedMedia, addDocument, addMediaFromGallery } = report;

  const startPicker = useCallback((picker: () => Promise<void>): void => {
    pendingPicker.current = picker;
    setIsEvidenceVisible(false);
  }, []);
  const handleEvidenceDismiss = useCallback((): void => {
    const picker = pendingPicker.current;
    pendingPicker.current = null;
    if (picker) void picker();
  }, []);
  const chooseCamera = useCallback((): void => startPicker(async () => {
    isReturningFromCamera.current = true;
    setIsCameraVisible(true);
  }), [startPicker]);
  const chooseGallery = useCallback((): void => startPicker(addMediaFromGallery), [addMediaFromGallery, startPicker]);
  const chooseFile = useCallback((): void => startPicker(addDocument), [addDocument, startPicker]);
  const closeCamera = useCallback((): void => setIsCameraVisible(false), []);
  const handleCameraCaptured = useCallback((evidence: CapturedEvidence): void => {
    pendingCapture.current = evidence;
    setIsCameraVisible(false);
  }, []);
  const handleCameraDismiss = useCallback((): void => {
    if (!isReturningFromCamera.current) return;
    isReturningFromCamera.current = false;
    const evidence = pendingCapture.current;
    pendingCapture.current = null;
    openEvidence();
    if (evidence) void addCapturedMedia(evidence);
  }, [addCapturedMedia, openEvidence]);

  useEffect(() => {
    if (Platform.OS !== "android" || isEvidenceVisible) return;
    const task = InteractionManager.runAfterInteractions(handleEvidenceDismiss);
    return () => task.cancel();
  }, [handleEvidenceDismiss, isEvidenceVisible]);
  useEffect(() => {
    if (Platform.OS !== "android" || isCameraVisible) return;
    const task = InteractionManager.runAfterInteractions(handleCameraDismiss);
    return () => task.cancel();
  }, [handleCameraDismiss, isCameraVisible]);

  return {
    report,
    isEvidenceVisible,
    isCameraVisible,
    openEvidence,
    closeEvidence,
    chooseCamera,
    chooseGallery,
    chooseFile,
    closeCamera,
    handleEvidenceDismiss,
    handleCameraDismiss,
    handleCameraCaptured,
  };
};

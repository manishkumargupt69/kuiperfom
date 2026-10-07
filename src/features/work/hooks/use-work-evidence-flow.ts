import { useCallback, useEffect, useRef, useState } from "react";
import { InteractionManager, Platform } from "react-native";

import { useWorkEditor } from "@/src/features/work/hooks/use-work-editor";
import type { CapturedEvidence } from "@/src/types/evidence";

interface WorkEvidenceFlowResult {
  editor: ReturnType<typeof useWorkEditor>;
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

export const useWorkEvidenceFlow = (id: string): WorkEvidenceFlowResult => {
  const [isEvidenceVisible, setIsEvidenceVisible] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const pendingEvidencePicker = useRef<(() => Promise<void>) | null>(null);
  const pendingCapturedEvidence = useRef<CapturedEvidence | null>(null);
  const isReturningFromCamera = useRef(false);
  const openEvidence = useCallback((): void => setIsEvidenceVisible(true), []);
  const closeEvidence = useCallback((): void => setIsEvidenceVisible(false), []);
  const editor = useWorkEditor(id, openEvidence);
  const { addCapturedMedia, addDocument, addMediaFromGallery } = editor;

  const startEvidencePicker = useCallback((picker: () => Promise<void>): void => {
    pendingEvidencePicker.current = picker;
    setIsEvidenceVisible(false);
  }, []);

  const handleEvidenceDismiss = useCallback((): void => {
    const picker = pendingEvidencePicker.current;
    pendingEvidencePicker.current = null;
    if (picker) void picker();
  }, []);

  const chooseCamera = useCallback((): void => startEvidencePicker(async () => {
    isReturningFromCamera.current = true;
    setIsCameraVisible(true);
  }), [startEvidencePicker]);
  const chooseGallery = useCallback((): void => startEvidencePicker(addMediaFromGallery), [addMediaFromGallery, startEvidencePicker]);
  const chooseFile = useCallback((): void => startEvidencePicker(addDocument), [addDocument, startEvidencePicker]);
  const closeCamera = useCallback((): void => setIsCameraVisible(false), []);
  const handleCameraCaptured = useCallback((evidence: CapturedEvidence): void => {
    pendingCapturedEvidence.current = evidence;
    setIsCameraVisible(false);
  }, []);
  const handleCameraDismiss = useCallback((): void => {
    if (!isReturningFromCamera.current) return;
    isReturningFromCamera.current = false;
    const evidence = pendingCapturedEvidence.current;
    pendingCapturedEvidence.current = null;
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
    editor,
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

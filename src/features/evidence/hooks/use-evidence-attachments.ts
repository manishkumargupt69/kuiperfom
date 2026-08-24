import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { createEvidenceAttachment } from "@/src/features/evidence/data/evidence-file.service";
import type { EvidenceAttachment } from "@/src/types/evidence";

const DEFAULT_MIME_TYPE = "application/octet-stream";
const VOICE_MIME_TYPE = "audio/mp4";
const EMPTY_ATTACHMENTS: readonly EvidenceAttachment[] = [];

interface EvidenceAttachmentsResult {
  attachments: readonly EvidenceAttachment[];
  isRecording: boolean;
  recordingDurationMilliseconds: number;
  addDocument: () => Promise<void>;
  addPhoto: () => Promise<void>;
  addVideo: () => Promise<void>;
  toggleVoiceRecording: () => Promise<void>;
  removeAttachment: (id: string) => void;
}

const showEvidenceError = (message: string): void => {
  Alert.alert("Evidence unavailable", message);
};

export const useEvidenceAttachments = (
  initialAttachments: readonly EvidenceAttachment[] = EMPTY_ATTACHMENTS,
): EvidenceAttachmentsResult => {
  const [attachments, setAttachments] = useState<readonly EvidenceAttachment[]>(
    initialAttachments,
  );
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments]);

  const appendAttachment = useCallback((attachment: EvidenceAttachment): void => {
    setAttachments((currentAttachments) => [
      ...currentAttachments,
      attachment,
    ]);
  }, []);

  const addDocument = useCallback(async (): Promise<void> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      appendAttachment(
        createEvidenceAttachment({
          kind: "document",
          mimeType: asset.mimeType ?? DEFAULT_MIME_TYPE,
          name: asset.name,
          sizeBytes: asset.size,
          sourceUri: asset.uri,
        }),
      );
    } catch {
      showEvidenceError("The selected file could not be attached.");
    }
  }, [appendAttachment]);

  const selectMedia = useCallback(
    async (kind: "photo" | "video"): Promise<void> => {
      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          showEvidenceError("Allow media access to attach evidence.");
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: false,
          mediaTypes: [kind === "photo" ? "images" : "videos"],
          quality: 1,
        });
        if (result.canceled) return;

        const asset = result.assets[0];
        const fallbackName = `${kind}-${Date.now()}`;
        appendAttachment(
          createEvidenceAttachment({
            durationMilliseconds: asset.duration ?? undefined,
            kind,
            mimeType:
              asset.mimeType ??
              (kind === "photo" ? "image/jpeg" : "video/mp4"),
            name: asset.fileName ?? fallbackName,
            sizeBytes: asset.fileSize,
            sourceUri: asset.uri,
          }),
        );
      } catch {
        showEvidenceError(`The selected ${kind} could not be attached.`);
      }
    },
    [appendAttachment],
  );

  const addPhoto = useCallback(async (): Promise<void> => {
    await selectMedia("photo");
  }, [selectMedia]);

  const addVideo = useCallback(async (): Promise<void> => {
    await selectMedia("video");
  }, [selectMedia]);

  const toggleVoiceRecording = useCallback(async (): Promise<void> => {
    try {
      if (recorderState.isRecording) {
        await audioRecorder.stop();
        if (!audioRecorder.uri) {
          throw new Error("Recording file was not created.");
        }
        appendAttachment(
          createEvidenceAttachment({
            durationMilliseconds: recorderState.durationMillis,
            kind: "audio",
            mimeType: VOICE_MIME_TYPE,
            name: `voice-note-${Date.now()}.m4a`,
            sourceUri: audioRecorder.uri,
          }),
        );
        await setAudioModeAsync({ allowsRecording: false });
        return;
      }

      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        showEvidenceError("Allow microphone access to record a voice note.");
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch {
      showEvidenceError("The voice note could not be recorded.");
    }
  }, [appendAttachment, audioRecorder, recorderState]);

  const removeAttachment = useCallback((id: string): void => {
    setAttachments((currentAttachments) =>
      currentAttachments.filter((attachment) => attachment.id !== id),
    );
  }, []);

  return {
    attachments,
    isRecording: recorderState.isRecording,
    recordingDurationMilliseconds: recorderState.durationMillis,
    addDocument,
    addPhoto,
    addVideo,
    toggleVoiceRecording,
    removeAttachment,
  };
};

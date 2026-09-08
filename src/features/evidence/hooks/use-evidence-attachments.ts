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

import {
  createEvidenceAttachment,
  MAX_EVIDENCE_CONTENT_BYTES,
} from "@/src/features/evidence/data/evidence-file.service";
import type { EvidenceAttachment } from "@/src/types/evidence";

const DEFAULT_MIME_TYPE = "application/octet-stream";
const VOICE_MIME_TYPE = "audio/mp4";
const EMPTY_ATTACHMENTS: readonly EvidenceAttachment[] = [];

interface EvidenceAttachmentsResult {
  attachments: readonly EvidenceAttachment[];
  isRecording: boolean;
  recordingDurationMilliseconds: number;
  addDocument: () => Promise<void>;
  addFromGallery: () => Promise<void>;
  addPhoto: () => Promise<void>;
  addVideo: () => Promise<void>;
  toggleVoiceRecording: () => Promise<void>;
  removeAttachment: (id: string) => void;
}

const showEvidenceError = (message: string): void => {
  Alert.alert("Evidence unavailable", message);
};

const getMediaKind = (
  asset: ImagePicker.ImagePickerAsset,
): "photo" | "video" =>
  asset.type === "video" || asset.mimeType?.startsWith("video/")
    ? "video"
    : "photo";

const getRemainingEvidenceBytes = (
  attachments: readonly EvidenceAttachment[],
): number =>
  MAX_EVIDENCE_CONTENT_BYTES -
  attachments.reduce(
    (totalBytes, attachment) => totalBytes + (attachment.sizeBytes ?? 0),
    0,
  );

const getEvidenceErrorMessage = ({
  error,
  fallbackMessage,
}: {
  error: unknown;
  fallbackMessage: string;
}): string => (error instanceof Error ? error.message : fallbackMessage);

export interface EvidenceAttachmentOptions {
  allowVideo?: boolean;
}

export const useEvidenceAttachments = (
  initialAttachments: readonly EvidenceAttachment[] = EMPTY_ATTACHMENTS,
  options: EvidenceAttachmentOptions = { allowVideo: true },
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
        await createEvidenceAttachment({
          kind: "document",
          maximumSizeBytes: getRemainingEvidenceBytes(attachments),
          mimeType: asset.mimeType ?? DEFAULT_MIME_TYPE,
          name: asset.name,
          sourceUri: asset.uri,
        }),
      );
    } catch (error: unknown) {
      showEvidenceError(
        getEvidenceErrorMessage({
          error,
          fallbackMessage: "The selected file could not be attached.",
        }),
      );
    }
  }, [appendAttachment, attachments]);

  const appendMediaAsset = useCallback(
    async ({
      asset,
      kind,
    }: {
      asset: ImagePicker.ImagePickerAsset;
      kind: "photo" | "video";
    }): Promise<void> => {
      const fallbackName =
        kind === "photo"
          ? `photo-${Date.now()}.jpg`
          : `video-${Date.now()}.mp4`;
      return appendAttachment(
        await createEvidenceAttachment({
          durationMilliseconds: asset.duration ?? undefined,
          kind,
          maximumSizeBytes: getRemainingEvidenceBytes(attachments),
          mimeType:
            asset.mimeType ??
            (kind === "photo" ? "image/jpeg" : "video/mp4"),
          name: asset.fileName ?? fallbackName,
          sourceUri: asset.uri,
        }),
      );
    },
    [appendAttachment, attachments],
  );

  const addFromGallery = useCallback(async (): Promise<void> => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showEvidenceError("Allow media access to attach evidence.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        mediaTypes: options.allowVideo ? ["images", "videos"] : ["images"],
        quality: 1,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      await appendMediaAsset({ asset, kind: getMediaKind(asset) });
    } catch (error: unknown) {
      showEvidenceError(
        getEvidenceErrorMessage({
          error,
          fallbackMessage: "The selected media could not be attached.",
        }),
      );
    }
  }, [appendMediaAsset]);

  const captureMedia = useCallback(
    async (kind: "photo" | "video"): Promise<void> => {
      try {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          showEvidenceError("Allow camera access to capture evidence.");
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          mediaTypes: [kind === "photo" ? "images" : "videos"],
          quality: 1,
        });
        if (result.canceled) return;

        const asset = result.assets[0];
        await appendMediaAsset({ asset, kind });
      } catch (error: unknown) {
        showEvidenceError(
          getEvidenceErrorMessage({
            error,
            fallbackMessage: `The ${kind} could not be captured.`,
          }),
        );
      }
    },
    [appendMediaAsset],
  );

  const addPhoto = useCallback(async (): Promise<void> => {
    await captureMedia("photo");
  }, [captureMedia]);

  const addVideo = useCallback(async (): Promise<void> => {
    await captureMedia("video");
  }, [captureMedia]);

  const toggleVoiceRecording = useCallback(async (): Promise<void> => {
    try {
      if (recorderState.isRecording) {
        await audioRecorder.stop();
        if (!audioRecorder.uri) {
          throw new Error("Recording file was not created.");
        }
        appendAttachment(
          await createEvidenceAttachment({
            durationMilliseconds: recorderState.durationMillis,
            kind: "audio",
            maximumSizeBytes: getRemainingEvidenceBytes(attachments),
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
    } catch (error: unknown) {
      showEvidenceError(
        getEvidenceErrorMessage({
          error,
          fallbackMessage: "The voice note could not be recorded.",
        }),
      );
    }
  }, [appendAttachment, attachments, audioRecorder, recorderState]);

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
    addFromGallery,
    addPhoto,
    addVideo,
    toggleVoiceRecording,
    removeAttachment,
  };
};

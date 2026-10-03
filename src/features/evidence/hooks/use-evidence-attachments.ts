import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import {
  createEvidenceAttachment,
  MAX_EVIDENCE_CONTENT_BYTES,
} from "@/src/features/evidence/data/evidence-file.service";
import {
  getSupportedDocumentMimeType,
  SUPPORTED_DOCUMENT_MIME_TYPES,
} from "@/src/features/evidence/domain/evidence-upload-policy";
import type { EvidenceAttachment } from "@/src/types/evidence";

const EMPTY_ATTACHMENTS: readonly EvidenceAttachment[] = [];

interface EvidenceAttachmentsResult {
  attachments: readonly EvidenceAttachment[];
  addDocument: () => Promise<void>;
  addFromGallery: () => Promise<void>;
  addPhoto: () => Promise<void>;
  removeAttachment: (id: string) => void;
}

const showEvidenceError = (message: string): void => {
  Alert.alert("Evidence unavailable", message);
};

const getRemainingEvidenceBytes = (attachments: readonly EvidenceAttachment[]): number =>
  MAX_EVIDENCE_CONTENT_BYTES - attachments.reduce(
    (totalBytes, attachment) => totalBytes + (attachment.sizeBytes ?? 0),
    0,
  );

const getEvidenceErrorMessage = ({ error, fallbackMessage }: { error: unknown; fallbackMessage: string }): string =>
  error instanceof Error ? error.message : fallbackMessage;

export const useEvidenceAttachments = (
  initialAttachments: readonly EvidenceAttachment[] = EMPTY_ATTACHMENTS,
): EvidenceAttachmentsResult => {
  const [attachments, setAttachments] = useState<readonly EvidenceAttachment[]>(initialAttachments);

  useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments]);

  const appendAttachment = useCallback((attachment: EvidenceAttachment): void => {
    setAttachments((currentAttachments) => [...currentAttachments, attachment]);
  }, []);

  const addDocument = useCallback(async (): Promise<void> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: [...SUPPORTED_DOCUMENT_MIME_TYPES],
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const mimeType = getSupportedDocumentMimeType(asset.name);
      if (!mimeType) {
        showEvidenceError("Only image, PDF, Word, and Excel files are allowed.");
        return;
      }
      appendAttachment(await createEvidenceAttachment({
        kind: "document",
        maximumSizeBytes: getRemainingEvidenceBytes(attachments),
        mimeType,
        name: asset.name,
        sourceUri: asset.uri,
      }));
    } catch (error: unknown) {
      showEvidenceError(getEvidenceErrorMessage({ error, fallbackMessage: "The selected file could not be attached." }));
    }
  }, [appendAttachment, attachments]);

  const appendPhoto = useCallback(async (asset: ImagePicker.ImagePickerAsset): Promise<void> => {
    appendAttachment(await createEvidenceAttachment({
      kind: "photo",
      maximumSizeBytes: getRemainingEvidenceBytes(attachments),
      mimeType: asset.mimeType ?? "image/jpeg",
      name: asset.fileName ?? `photo-${Date.now()}.jpg`,
      sourceUri: asset.uri,
    }));
  }, [appendAttachment, attachments]);

  const addFromGallery = useCallback(async (): Promise<void> => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showEvidenceError("Allow media access to attach evidence.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        mediaTypes: ["images"],
        quality: 1,
      });
      if (result.canceled) return;
      await appendPhoto(result.assets[0]);
    } catch (error: unknown) {
      showEvidenceError(getEvidenceErrorMessage({ error, fallbackMessage: "The selected photo could not be attached." }));
    }
  }, [appendPhoto]);

  const addPhoto = useCallback(async (): Promise<void> => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showEvidenceError("Allow camera access to capture evidence.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        mediaTypes: ["images"],
        quality: 1,
      });
      if (result.canceled) return;
      await appendPhoto(result.assets[0]);
    } catch (error: unknown) {
      showEvidenceError(getEvidenceErrorMessage({ error, fallbackMessage: "The photo could not be captured." }));
    }
  }, [appendPhoto]);

  const removeAttachment = useCallback((id: string): void => {
    setAttachments((currentAttachments) => currentAttachments.filter((attachment) => attachment.id !== id));
  }, []);

  return { attachments, addDocument, addFromGallery, addPhoto, removeAttachment };
};

import { Directory, File, Paths } from "expo-file-system";
import * as Crypto from "expo-crypto";
import {
  Audio as AudioCompressor,
  Image as ImageCompressor,
  Video as VideoCompressor,
} from "react-native-compressor";

import type {
  EvidenceAttachment,
  EvidenceKind,
} from "@/src/types/evidence";

const EVIDENCE_DIRECTORY_NAME = "fom-evidence";
const BYTES_PER_MEBIBYTE = 1024 * 1024;
const MULTIPART_OVERHEAD_RESERVE_BYTES = 256 * 1024;
export const MAX_EVIDENCE_CONTENT_BYTES =
  10 * BYTES_PER_MEBIBYTE - MULTIPART_OVERHEAD_RESERVE_BYTES;

interface CreateEvidenceAttachmentOptions {
  sourceUri: string;
  name: string;
  kind: EvidenceKind;
  mimeType: string;
  durationMilliseconds?: number;
  maximumSizeBytes: number;
}

const getEvidenceDirectory = (): Directory => {
  const directory = new Directory(Paths.document, EVIDENCE_DIRECTORY_NAME);
  if (!directory.exists) {
    directory.create({ idempotent: true, intermediates: true });
  }
  return directory;
};

const sanitizeFileName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9._-]/g, "-");

const getCompressedSourceUri = async ({
  kind,
  sourceUri,
}: {
  kind: EvidenceKind;
  sourceUri: string;
}): Promise<string> => {
  if (kind === "photo") {
    return ImageCompressor.compress(sourceUri, {
      compressionMethod: "auto",
      output: "jpg",
    });
  }
  if (kind === "video") {
    return VideoCompressor.compress(sourceUri, {
      compressionMethod: "auto",
      minimumFileSizeForCompress: 0,
    });
  }
  if (kind === "audio") {
    return AudioCompressor.compress(sourceUri, { quality: "medium" });
  }
  throw new Error(
    "This file is too large. Documents must be smaller than 10 MB.",
  );
};

const getFileSize = (uri: string): number => {
  const sizeBytes = new File(uri).size;
  if (sizeBytes === null) {
    throw new Error("The selected file size could not be verified.");
  }
  return sizeBytes;
};

const getUploadSourceUri = async ({
  kind,
  sourceUri,
  maximumSizeBytes,
}: {
  kind: EvidenceKind;
  sourceUri: string;
  maximumSizeBytes: number;
}): Promise<string> => {
  if (kind === "document" && getFileSize(sourceUri) <= maximumSizeBytes) {
    return sourceUri;
  }
  return getCompressedSourceUri({ kind, sourceUri });
};

export const createEvidenceAttachment = async ({
  sourceUri,
  name,
  kind,
  mimeType,
  durationMilliseconds,
  maximumSizeBytes,
}: CreateEvidenceAttachmentOptions): Promise<EvidenceAttachment> => {
  if (maximumSizeBytes <= 0) {
    throw new Error(
      "Attachments must stay below 10 MB in total. Remove an attachment first.",
    );
  }

  const uploadSourceUri = await getUploadSourceUri({
    kind,
    sourceUri,
    maximumSizeBytes,
  });
  const sizeBytes = getFileSize(uploadSourceUri);
  if (sizeBytes > maximumSizeBytes) {
    throw new Error(
      "The file is still too large after compression. Choose a shorter or smaller file.",
    );
  }

  const id = Crypto.randomUUID();
  const destination = new File(
    getEvidenceDirectory(),
    `${id}-${sanitizeFileName(name)}`,
  );
  new File(uploadSourceUri).copy(destination);

  return {
    id,
    kind,
    name,
    uri: destination.uri,
    mimeType,
    sizeBytes,
    durationMilliseconds,
  };
};

import { Directory, File, Paths } from "expo-file-system";
import * as Crypto from "expo-crypto";

import type {
  EvidenceAttachment,
  EvidenceKind,
} from "@/src/types/evidence";

const EVIDENCE_DIRECTORY_NAME = "fom-evidence";

interface CreateEvidenceAttachmentOptions {
  sourceUri: string;
  name: string;
  kind: EvidenceKind;
  mimeType: string;
  sizeBytes?: number;
  durationMilliseconds?: number;
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

export const createEvidenceAttachment = ({
  sourceUri,
  name,
  kind,
  mimeType,
  sizeBytes,
  durationMilliseconds,
}: CreateEvidenceAttachmentOptions): EvidenceAttachment => {
  const id = Crypto.randomUUID();
  const destination = new File(
    getEvidenceDirectory(),
    `${id}-${sanitizeFileName(name)}`,
  );
  new File(sourceUri).copy(destination);

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

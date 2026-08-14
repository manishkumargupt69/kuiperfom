import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const MPIN_STORAGE_KEY = "fom.auth.mpin";

interface StoredMpin {
  userId: string;
  salt: string;
  digest: string;
}

const isStoredMpin = (value: unknown): value is StoredMpin => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.userId === "string" &&
    typeof candidate.salt === "string" &&
    typeof candidate.digest === "string"
  );
};

const createDigest = async (mpin: string, salt: string): Promise<string> =>
  Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${mpin}`,
  );

const loadStoredMpin = async (): Promise<StoredMpin | null> => {
  const value = await SecureStore.getItemAsync(MPIN_STORAGE_KEY);
  if (!value) {
    return null;
  }

  try {
    const parsedMpin: unknown = JSON.parse(value);
    if (isStoredMpin(parsedMpin)) {
      return parsedMpin;
    }
    await SecureStore.deleteItemAsync(MPIN_STORAGE_KEY);
    return null;
  } catch {
    await SecureStore.deleteItemAsync(MPIN_STORAGE_KEY);
    return null;
  }
};

export const hasConfiguredMpin = async (): Promise<boolean> =>
  Boolean(await loadStoredMpin());

export const configureMpin = async (
  userId: string,
  mpin: string,
): Promise<void> => {
  const salt = Crypto.randomUUID();
  const digest = await createDigest(mpin, salt);
  const storedMpin: StoredMpin = { userId, salt, digest };
  await SecureStore.setItemAsync(MPIN_STORAGE_KEY, JSON.stringify(storedMpin));
};

export const verifyMpin = async (mpin: string): Promise<string | null> => {
  const storedMpin = await loadStoredMpin();
  if (!storedMpin) {
    return null;
  }

  const candidateDigest = await createDigest(mpin, storedMpin.salt);
  return candidateDigest === storedMpin.digest ? storedMpin.userId : null;
};

import * as SecureStore from "expo-secure-store";

import type { AuthSession } from "@/src/features/auth/domain/auth.types";

const SESSION_STORAGE_KEY = "fom.auth.session";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isAuthSession = (value: unknown): value is AuthSession => {
  if (!isRecord(value) || !isRecord(value.user)) {
    return false;
  }

  return (
    typeof value.accessToken === "string" &&
    typeof value.user.id === "string" &&
    typeof value.user.displayName === "string" &&
    typeof value.user.roleName === "string"
  );
};

export const loadStoredSession = async (): Promise<AuthSession | null> => {
  const serializedSession = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
  if (!serializedSession) {
    return null;
  }

  try {
    const parsedSession: unknown = JSON.parse(serializedSession);
    if (isAuthSession(parsedSession)) {
      return parsedSession;
    }
    await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
    return null;
  } catch {
    await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
    return null;
  }
};

export const storeSession = async (session: AuthSession): Promise<void> => {
  await SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const removeStoredSession = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
};

import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";

import { authRepository } from "@/src/features/auth/data/mock-auth.repository";
import {
  hasConfiguredMpin,
  verifyMpin,
} from "@/src/features/auth/data/mpin.service";
import type { AuthMode } from "@/src/features/auth/domain/auth.types";
import { useAuthStore } from "@/src/features/auth/state/auth-store";

const MPIN_PATTERN = /^\d{4}$/;
const OTP_PATTERN = /^\d{4,6}$/;

interface SignInFields {
  userId: string;
  password: string;
  otp: string;
  mpin: string;
}

interface FieldErrors {
  userId?: string;
  password?: string;
  otp?: string;
  mpin?: string;
}

const INITIAL_FIELDS: SignInFields = {
  userId: "",
  password: "",
  otp: "",
  mpin: "",
};

const getValidationErrors = (
  mode: AuthMode,
  fields: SignInFields,
): FieldErrors => {
  if (mode === "mpin") {
    return MPIN_PATTERN.test(fields.mpin)
      ? {}
      : { mpin: "Enter your 4-digit MPIN." };
  }

  if (!fields.userId.trim()) {
    return { userId: "Enter your user ID." };
  }

  if (mode === "credentials" && !fields.password) {
    return { password: "Enter your password." };
  }

  if (mode === "otp" && !OTP_PATTERN.test(fields.otp)) {
    return { otp: "Enter the OTP sent to you." };
  }

  return {};
};

const hasErrors = (errors: FieldErrors): boolean =>
  Object.values(errors).some(Boolean);

export const useSignIn = () => {
  const signInPersisted = useAuthStore((state) => state.signIn);
  const signInForCurrentRun = useAuthStore(
    (state) => state.signInForCurrentRun,
  );
  const [mode, setMode] = useState<AuthMode>("credentials");
  const [fields, setFields] = useState<SignInFields>(INITIAL_FIELDS);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isRemembered, setIsRemembered] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpRequested, setIsOtpRequested] = useState(false);
  const [isMpinAvailable, setIsMpinAvailable] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const loadMpinAvailability = async (): Promise<void> => {
      setIsMpinAvailable(await hasConfiguredMpin());
    };
    void loadMpinAvailability();
  }, []);

  const updateField = useCallback(
    (field: keyof SignInFields, value: string): void => {
      setFields((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setNotice(null);
    },
    [],
  );

  const selectMode = useCallback((nextMode: AuthMode): void => {
    setMode(nextMode);
    setErrors({});
    setNotice(null);
  }, []);

  const requestOtp = useCallback(async (): Promise<void> => {
    if (!fields.userId.trim()) {
      setErrors({ userId: "Enter your user ID before requesting an OTP." });
      return;
    }

    setIsSubmitting(true);
    try {
      await authRepository.requestOtp(fields.userId.trim());
      setIsOtpRequested(true);
      setNotice("Development mode: enter any 4-6 digit OTP.");
    } finally {
      setIsSubmitting(false);
    }
  }, [fields.userId]);

  const submit = useCallback(async (): Promise<void> => {
    const nextErrors = getValidationErrors(mode, fields);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      return;
    }

    setIsSubmitting(true);
    setNotice(null);
    try {
      const session =
        mode === "credentials"
          ? await authRepository.loginWithCredentials({
              userId: fields.userId.trim(),
              password: fields.password,
            })
          : mode === "otp"
            ? await authRepository.loginWithOtp({
                userId: fields.userId.trim(),
                otp: fields.otp,
              })
            : await loginWithVerifiedMpin(fields.mpin);

      if (isRemembered) {
        await signInPersisted(session);
      } else {
        signInForCurrentRun(session);
      }
      router.replace("/(app)/home");
    } catch {
      setNotice("Sign-in could not be completed. Check your details and retry.");
    } finally {
      setIsSubmitting(false);
    }
  }, [fields, isRemembered, mode, signInForCurrentRun, signInPersisted]);

  return {
    mode,
    fields,
    errors,
    isRemembered,
    isSubmitting,
    isOtpRequested,
    isMpinAvailable,
    notice,
    selectMode,
    updateField,
    toggleRemembered: () => setIsRemembered((current) => !current),
    requestOtp,
    submit,
    showForgotPasswordNotice: () =>
      setNotice("Password recovery will be enabled with the FOM backend."),
  };
};

const loginWithVerifiedMpin = async (mpin: string) => {
  const userId = await verifyMpin(mpin);
  if (!userId) {
    throw new Error("Invalid MPIN");
  }
  return authRepository.loginWithMpin(userId);
};

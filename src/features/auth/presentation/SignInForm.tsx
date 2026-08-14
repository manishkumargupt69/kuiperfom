import { Pressable, StyleSheet, Text, View } from "react-native";

import FormField from "@/src/components/ui/FormField";
import PrimaryButton from "@/src/components/ui/PrimaryButton";
import type { AuthMode } from "@/src/features/auth/domain/auth.types";
import { COLORS, MINIMUM_TOUCH_SIZE, SPACING } from "@/src/theme/tokens";

interface SignInFields {
  userId: string;
  password: string;
  otp: string;
  mpin: string;
}

interface SignInErrors {
  userId?: string;
  password?: string;
  otp?: string;
  mpin?: string;
}

interface SignInFormProps {
  mode: AuthMode;
  fields: SignInFields;
  errors: SignInErrors;
  isSubmitting: boolean;
  isOtpRequested: boolean;
  onChangeField: (field: keyof SignInFields, value: string) => void;
  onRequestOtp: () => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
}

function SignInForm({
  mode,
  fields,
  errors,
  isSubmitting,
  isOtpRequested,
  onChangeField,
  onRequestOtp,
  onSubmit,
  onForgotPassword,
}: SignInFormProps) {
  if (mode === "mpin") {
    return (
      <View style={styles.form}>
        <FormField
          errorMessage={errors.mpin}
          isSecure
          keyboardType="number-pad"
          label="MPIN"
          maxLength={4}
          onChangeText={(value) => onChangeField("mpin", value)}
          placeholder="Enter 4 digits"
          value={fields.mpin}
        />
        <PrimaryButton
          isLoading={isSubmitting}
          label="Unlock workspace"
          onPress={onSubmit}
        />
      </View>
    );
  }

  return (
    <View style={styles.form}>
      <FormField
        errorMessage={errors.userId}
        label="User ID"
        onChangeText={(value) => onChangeField("userId", value)}
        placeholder="Email or ERP user ID"
        value={fields.userId}
      />
      {mode === "credentials" ? (
        <>
          <FormField
            errorMessage={errors.password}
            isSecure
            label="Password"
            onChangeText={(value) => onChangeField("password", value)}
            placeholder="Enter password"
            value={fields.password}
          />
          <Pressable
            accessibilityRole="button"
            onPress={onForgotPassword}
            style={styles.textAction}
          >
            <Text style={styles.textActionLabel}>Forgot password?</Text>
          </Pressable>
        </>
      ) : (
        <>
          {isOtpRequested ? (
            <FormField
              errorMessage={errors.otp}
              keyboardType="number-pad"
              label="One-time password"
              maxLength={6}
              onChangeText={(value) => onChangeField("otp", value)}
              placeholder="46 digit OTP"
              value={fields.otp}
            />
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={onRequestOtp}
            style={styles.textAction}
          >
            <Text style={styles.textActionLabel}>
              {isOtpRequested ? "Send OTP again" : "Send OTP"}
            </Text>
          </Pressable>
        </>
      )}
      <PrimaryButton
        isDisabled={mode === "otp" && !isOtpRequested}
        isLoading={isSubmitting}
        label="Continue"
        onPress={onSubmit}
      />
    </View>
  );
}

export default SignInForm;

const styles = StyleSheet.create({
  form: {
    gap: SPACING.large,
  },
  textAction: {
    alignItems: "flex-end",
    justifyContent: "center",
    minHeight: MINIMUM_TOUCH_SIZE,
  },
  textActionLabel: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "700",
  },
});

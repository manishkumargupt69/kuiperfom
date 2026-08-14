import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS, CONTROL_HEIGHT, RADII, SPACING } from "@/src/theme/tokens";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  errorMessage?: string;
  isSecure?: boolean;
  keyboardType?: "default" | "email-address" | "number-pad";
  maxLength?: number;
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  errorMessage,
  isSecure = false,
  keyboardType = "default",
  maxLength,
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={keyboardType}
        maxLength={maxLength}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.inkMuted}
        secureTextEntry={isSecure}
        style={[styles.input, errorMessage ? styles.inputError : undefined]}
        value={value}
      />
      {errorMessage ? (
        <Text accessibilityLiveRegion="polite" style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

export default FormField;

const styles = StyleSheet.create({
  container: {
    gap: SPACING.small,
  },
  label: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.medium,
    borderWidth: 1,
    color: COLORS.ink,
    fontSize: 16,
    height: CONTROL_HEIGHT,
    paddingHorizontal: SPACING.large,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
  },
});

import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { COLORS, CONTROL_HEIGHT, RADII } from "@/src/theme/tokens";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

function PrimaryButton({
  label,
  onPress,
  isDisabled = false,
  isLoading = false,
}: PrimaryButtonProps) {
  const isUnavailable = isDisabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isUnavailable, busy: isLoading }}
      disabled={isUnavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        isUnavailable && styles.buttonDisabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: COLORS.accent,
    borderRadius: RADII.medium,
    height: CONTROL_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  buttonPressed: {
    backgroundColor: COLORS.accentPressed,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  label: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
});

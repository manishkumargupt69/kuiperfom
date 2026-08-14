import { StyleSheet, Text, View } from "react-native";

import PrimaryButton from "@/src/components/ui/PrimaryButton";
import { COLORS, RADII, SPACING } from "@/src/theme/tokens";
import type { ViewState } from "@/src/types/view-state";
import type { ModuleViewModel } from "@/src/features/modules/domain/module.types";

interface ModuleListStateProps {
  viewState: Exclude<ViewState<ModuleViewModel[]>, { status: "success" }>;
  onRetry: () => void;
}

function ModuleListState({ viewState, onRetry }: ModuleListStateProps) {
  if (viewState.status === "loading") {
    return (
      <View accessibilityLabel="Loading modules" style={styles.skeletonGroup}>
        <View style={styles.skeleton} />
        <View style={styles.skeleton} />
      </View>
    );
  }

  if (viewState.status === "idle") {
    return <Text style={styles.message}>Preparing your workspace&</Text>;
  }

  if (viewState.status === "empty") {
    return (
      <Text style={styles.message}>
        No mobile modules are assigned to your role.
      </Text>
    );
  }

  return (
    <View style={styles.error}>
      <Text style={styles.message}>{viewState.message}</Text>
      <PrimaryButton label="Try again" onPress={onRetry} />
    </View>
  );
}

export default ModuleListState;

const styles = StyleSheet.create({
  skeletonGroup: {
    gap: SPACING.medium,
  },
  skeleton: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADII.medium,
    height: 88,
  },
  error: {
    gap: SPACING.large,
  },
  message: {
    color: COLORS.inkMuted,
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: SPACING.extraLarge,
  },
});

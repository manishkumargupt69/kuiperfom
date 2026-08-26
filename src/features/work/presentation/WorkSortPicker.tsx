import type { ReactElement } from "react";
import { StyleSheet, View } from "react-native";

import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import SecondaryButton from "@/src/components/ui/SecondaryButton";
import type { WorkSortKey } from "@/src/features/work/domain/work.types";
import { SPACING } from "@/src/theme/tokens";

interface WorkSortPickerProps {
  isVisible: boolean;
  selectedKey: WorkSortKey;
  onClose: () => void;
  onSelect: (value: WorkSortKey) => void;
}

export default function WorkSortPicker({
  isVisible,
  selectedKey,
  onClose,
  onSelect,
}: WorkSortPickerProps): ReactElement {
  const selectTargetAscending = (): void => onSelect("target-asc");
  const selectTargetDescending = (): void => onSelect("target-desc");
  const selectRequestNumber = (): void => onSelect("request-number");
  const selectStatus = (): void => onSelect("status");

  return (
    <BottomSheetModal
      accessibilityLabel="Close work sorting"
      isVisible={isVisible}
      onClose={onClose}
      title="Sort work"
    >
      <View style={styles.options}>
        <SecondaryButton
          isSelected={selectedKey === "target-asc"}
          label="Target completion — earliest"
          onPress={selectTargetAscending}
        />
        <SecondaryButton
          isSelected={selectedKey === "target-desc"}
          label="Target completion — latest"
          onPress={selectTargetDescending}
        />
        <SecondaryButton
          isSelected={selectedKey === "request-number"}
          label="Request number"
          onPress={selectRequestNumber}
        />
        <SecondaryButton
          isSelected={selectedKey === "status"}
          label="Status (A–Z)"
          onPress={selectStatus}
        />
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: SPACING.small,
    padding: SPACING.extraLarge,
  },
});

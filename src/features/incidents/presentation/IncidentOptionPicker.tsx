import { useCallback } from "react";
import type { ReactElement } from "react";
import type { ListRenderItemInfo } from "react-native";
import { FlatList, StyleSheet } from "react-native";

import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import type { IncidentOptionViewModel } from "@/src/features/incidents/domain/incident.types";
import IncidentOptionRow from "@/src/features/incidents/presentation/IncidentOptionRow";
import { SPACING } from "@/src/theme/tokens";

interface IncidentOptionPickerProps {
  isVisible: boolean;
  title: string;
  options: readonly IncidentOptionViewModel[];
  onClose: () => void;
  onSelect: (option: IncidentOptionViewModel) => void;
}

const getOptionKey = (option: IncidentOptionViewModel): string => option.id;

export default function IncidentOptionPicker({
  isVisible,
  title,
  options,
  onClose,
  onSelect,
}: IncidentOptionPickerProps): ReactElement {
  const renderOption = useCallback(
    ({ item }: ListRenderItemInfo<IncidentOptionViewModel>): ReactElement => (
      <IncidentOptionRow onPress={onSelect} option={item} />
    ),
    [onSelect],
  );

  return (
    <BottomSheetModal
      accessibilityLabel={`Close ${title}`}
      isVisible={isVisible}
      onClose={onClose}
      title={title}
    >
      <FlatList
        contentContainerStyle={styles.list}
        data={options}
        keyExtractor={getOptionKey}
        renderItem={renderOption}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: SPACING.extraLarge },
});

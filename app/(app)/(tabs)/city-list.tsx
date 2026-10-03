import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import DrawerHeader from "@/src/components/ui/DrawerHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import SearchField from "@/src/components/ui/SearchField";
import type { AssignedCityViewModel } from "@/src/features/dashboard/domain/dashboard.types";
import { useAssignedCities } from "@/src/features/dashboard/hooks/use-assigned-cities";
import AssignedCityRow from "@/src/features/dashboard/presentation/AssignedCityRow";
import { COLORS, SCREEN_HORIZONTAL_PADDING, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

type CityListParams = {
  cityId?: string;
};

const getCityKey = (city: AssignedCityViewModel): string => city.id;

export default function CityListScreen(): ReactElement {
  const { cityId } = useLocalSearchParams<CityListParams>();
  const { viewState, reload } = useAssignedCities();
  const [searchText, setSearchText] = useState("");
  const cities = useMemo(() => {
    if (viewState.status !== "success") return [];
    const normalizedSearch = searchText.trim().toLocaleLowerCase();
    return [...viewState.data]
      .filter((city) => !normalizedSearch || city.name.toLocaleLowerCase().includes(normalizedSearch) || city.code.toLocaleLowerCase().includes(normalizedSearch))
      .sort((first, second) => {
        if (first.id === cityId) return -1;
        if (second.id === cityId) return 1;
        return first.name.localeCompare(second.name);
      });
  }, [cityId, viewState, searchText]);
  const handleRetry = useCallback((): void => { void reload(); }, [reload]);
  const openCityProjects = useCallback((city: AssignedCityViewModel): void => {
    router.push({ pathname: "/(app)/city-projects", params: { cityId: city.id } });
  }, []);
  const renderCity = useCallback(
    ({ item }: { item: AssignedCityViewModel }): ReactElement => (
      <AssignedCityRow city={item} isSelected={item.id === cityId} onPress={openCityProjects} />
    ),
    [cityId, openCityProjects],
  );

  return (
    <ScreenContainer>
      <DrawerHeader title="Projects" />
      {viewState.status === "success" ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={cities}
          keyExtractor={getCityKey}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text accessibilityRole="header" style={styles.heading}>City list</Text>
              <Text style={styles.subheading}>Select a city to view assigned projects.</Text>
              <SearchField accessibilityLabel="Search city" onChangeText={setSearchText} onClear={() => setSearchText("")} placeholder="Search city..." value={searchText} />
            </View>
          }
          renderItem={renderCity}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <View style={styles.state}>
          <AsyncStateView emptyMessage="No cities have assigned projects." message={viewState.status === "error" ? viewState.message : undefined} onRetry={handleRetry} status={viewState.status} variant="list" />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { gap: SPACING.medium, paddingBottom: SPACING.section, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  state: { flex: 1, paddingHorizontal: SCREEN_HORIZONTAL_PADDING },
  heading: { color: COLORS.ink, ...TYPOGRAPHY.sectionTitle, fontWeight: "800" },
  subheading: { color: COLORS.inkMuted, ...TYPOGRAPHY.body, marginTop: SPACING.extraSmall },
  header: { paddingBottom: SPACING.large, paddingTop: SPACING.extraLarge, gap: SPACING.medium },
});

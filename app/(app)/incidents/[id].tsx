import type { ReactElement } from "react";
import { useCallback } from "react";
import { ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import AppHeader from "@/src/components/ui/AppHeader";
import AsyncStateView from "@/src/components/ui/AsyncStateView";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import { useIncidentDetail } from "@/src/features/incidents/hooks/use-incident-detail";
import IncidentDetailView from "@/src/features/incidents/presentation/IncidentDetailView";

export default function IncidentDetailScreen(): ReactElement {
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
  const { viewState, reload } = useIncidentDetail(id);
  const handleBack = useCallback((): void => router.back(), []);
  const handleRetry = useCallback((): void => { void reload(); }, [reload]);
  return <ScreenContainer><AppHeader onBack={handleBack} title="Incident Details" />{viewState.status === "success" ? <ScrollView showsVerticalScrollIndicator={false}><IncidentDetailView incident={viewState.data} /></ScrollView> : <AsyncStateView emptyMessage="The requested incident is unavailable." message={viewState.status === "error" ? viewState.message : undefined} onRetry={handleRetry} status={viewState.status} variant="detail" />}</ScreenContainer>;
}

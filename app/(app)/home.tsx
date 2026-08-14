import type { ReactElement } from "react";
import { useCallback } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/src/features/auth/state/auth-store";
import { usePermittedModules } from "@/src/features/modules/hooks/use-permitted-modules";
import type { ModuleViewModel } from "@/src/features/modules/domain/module.types";
import ModuleListState from "@/src/features/modules/presentation/ModuleListState";
import ModuleRow from "@/src/features/modules/presentation/ModuleRow";
import { COLORS, MINIMUM_TOUCH_SIZE, SPACING } from "@/src/theme/tokens";

export default function HomeScreen(): ReactElement {
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const { viewState, reload } = usePermittedModules(session?.user.id ?? "");

  const openModule = useCallback((module: ModuleViewModel): void => {
    Alert.alert(
      module.title,
      "This module shell is ready for its backend contract and detailed workflow.",
    );
  }, []);

  const renderModule = useCallback(
    ({ item }: { item: ModuleViewModel }) => (
      <ModuleRow module={item} onPress={openModule} />
    ),
    [openModule],
  );

  const keyExtractor = useCallback(
    (item: ModuleViewModel): string => item.key,
    [],
  );

  const handleSignOut = useCallback(async (): Promise<void> => {
    await signOut();
    router.replace("/(auth)/sign-in");
  }, [signOut]);

  const openMpinSetup = useCallback((): void => {
    router.push("/(app)/mpin-setup");
  }, []);

  const renderHeader = useCallback(
    () => (
      <View style={styles.listHeader}>
        <Text style={styles.eyebrow}>YOUR WORKSPACE</Text>
        <Text style={styles.title}>Good to see you, {session?.user.displayName}.</Text>
        <Text style={styles.subtitle}>
          Only the tools assigned to your role appear below.
        </Text>
      </View>
    ),
    [session?.user.displayName],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.keyboardArea}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>FOM</Text>
            <Text style={styles.role}>{session?.user.roleName}</Text>
          </View>
          <View style={styles.accountActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Set up MPIN"
              onPress={openMpinSetup}
              style={styles.accountAction}
            >
              <Text style={styles.accountActionLabel}>Set MPIN</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              onPress={handleSignOut}
              style={styles.accountAction}
            >
              <Text style={styles.accountActionLabel}>Sign out</Text>
            </Pressable>
          </View>
        </View>

        {viewState.status === "success" ? (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={viewState.data}
            keyExtractor={keyExtractor}
            ListHeaderComponent={renderHeader}
            renderItem={renderModule}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.stateContent}>
            {renderHeader()}
            <ModuleListState
              onRetry={() => {
                void reload();
              }}
              viewState={viewState}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  keyboardArea: {
    flex: 1,
  },
  topBar: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.extraLarge,
    paddingVertical: SPACING.medium,
  },
  brand: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  role: {
    color: COLORS.inkMuted,
    fontSize: 12,
    marginTop: 2,
  },
  accountActions: {
    flexDirection: "row",
    gap: SPACING.small,
  },
  accountAction: {
    justifyContent: "center",
    minHeight: MINIMUM_TOUCH_SIZE,
    paddingHorizontal: SPACING.small,
  },
  accountActionLabel: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: SPACING.section,
    paddingHorizontal: SPACING.extraLarge,
  },
  stateContent: {
    flex: 1,
    paddingHorizontal: SPACING.extraLarge,
  },
  listHeader: {
    gap: SPACING.small,
    paddingBottom: SPACING.extraLarge,
    paddingTop: SPACING.section,
  },
  eyebrow: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    color: COLORS.ink,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  subtitle: {
    color: COLORS.inkMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});

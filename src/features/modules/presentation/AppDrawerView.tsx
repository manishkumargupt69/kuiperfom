import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import type { ListRenderItemInfo } from "react-native";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { DrawerItem } from "@react-navigation/drawer";

import type { ModuleViewModel } from "@/src/features/modules/domain/module.types";
import DrawerModuleRow from "@/src/features/modules/presentation/DrawerModuleRow";
import type { ViewState } from "@/src/types/view-state";
import { COLORS, MINIMUM_TOUCH_SIZE, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

const DRAWER_ICON_SIZE = 20;

interface DrawerModuleEntry {
  depth: number;
  module: ModuleViewModel;
}

interface AppDrawerViewProps {
  clientName: string;
  isLoggingOut: boolean;
  modulesState: ViewState<ModuleViewModel[]>;
  onClose: () => void;
  onDashboard: () => void;
  onLogout: () => void;
  onModulePress: (module: ModuleViewModel) => void;
  onProfile: () => void;
  onProjectMaster: () => void;
  onRetryModules: () => void;
  selectedRoute?: string;
  userEmail: string;
  userName: string;
}

const getVisibleModules = (modules: readonly ModuleViewModel[], expandedIds: ReadonlySet<string>, depth = 0): DrawerModuleEntry[] =>
  modules.flatMap((module) => [
    { depth, module },
    ...(expandedIds.has(module.id) ? getVisibleModules(module.children ?? [], expandedIds, depth + 1) : []),
  ]);

const getModuleKey = (entry: DrawerModuleEntry): string => entry.module.id;

export default function AppDrawerView({ clientName, isLoggingOut, modulesState, onClose, onDashboard, onLogout, onModulePress, onProfile, onProjectMaster, onRetryModules, selectedRoute, userEmail, userName }: AppDrawerViewProps): ReactElement {
  const [expandedModuleIds, setExpandedModuleIds] = useState<ReadonlySet<string>>(new Set());
  const visibleModules = useMemo(
    () => modulesState.status === "success" ? getVisibleModules(modulesState.data, expandedModuleIds) : [],
    [expandedModuleIds, modulesState],
  );
  const toggleNestedModule = useCallback((id: string): void => {
    setExpandedModuleIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const renderModule = useCallback(({ item }: ListRenderItemInfo<DrawerModuleEntry>): ReactElement => (
    <DrawerModuleRow
      depth={item.depth}
      isExpanded={expandedModuleIds.has(item.module.id)}
      isSelected={item.module.key === selectedRoute}
      module={item.module}
      onModulePress={onModulePress}
      onToggle={toggleNestedModule}
    />
  ), [expandedModuleIds, onModulePress, selectedRoute, toggleNestedModule]);

  return (
    <View style={styles.drawer}>
    <FlatList
      contentContainerStyle={styles.content}
      data={visibleModules}
      keyExtractor={getModuleKey}
      ListHeaderComponent={
        <>
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <Pressable accessibilityLabel={`Open profile for ${userName || "user"}`} accessibilityRole="button" onPress={onProfile} style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}>
                <Feather accessibilityElementsHidden color={COLORS.accent} name="user" size={26} />
              </Pressable>
              <Pressable accessibilityLabel="Close menu" accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.heroButtonPressed]}>
                <Feather accessibilityElementsHidden color={COLORS.white} name="menu" size={21} />
              </Pressable>
            </View>
            <Pressable accessibilityLabel={`Open profile for ${userName || "user"}`} accessibilityRole="button" onPress={onProfile} style={({ pressed }) => [styles.profile, pressed && styles.heroButtonPressed]}>
              <Text numberOfLines={1} style={styles.userName}>{userName}</Text>
              <Text numberOfLines={1} style={styles.userEmail}>{userEmail}</Text>
              {clientName ? <Text numberOfLines={1} style={styles.clientName}>{clientName}</Text> : null}
            </Pressable>
          </View>

          <View style={styles.menu}>
            <DrawerItem label="Dashboard" focused={selectedRoute === "dashboard"} onPress={onDashboard} icon={({ color }) => <Feather color={color} name="home" size={DRAWER_ICON_SIZE} />} style={styles.item} labelStyle={styles.itemLabel} activeTintColor={COLORS.accent} inactiveTintColor={COLORS.ink} activeBackgroundColor={COLORS.accentSoft} />
            <DrawerItem label="Project master" focused={selectedRoute === "project-master"} onPress={onProjectMaster} icon={({ color }) => <Feather color={color} name="briefcase" size={DRAWER_ICON_SIZE} />} style={styles.item} labelStyle={styles.itemLabel} activeTintColor={COLORS.accent} inactiveTintColor={COLORS.ink} activeBackgroundColor={COLORS.accentSoft} />
            {(modulesState.status === "idle" || modulesState.status === "loading") ? (
              <View accessibilityLabel="Loading modules" style={styles.moduleState}>
                <View style={styles.skeleton} />
                <View style={styles.skeleton} />
              </View>
            ) : null}
            {modulesState.status === "empty" ? <Text style={styles.stateText}>No mobile modules are assigned to your role.</Text> : null}
            {modulesState.status === "error" ? (
              <View style={styles.moduleState}>
                <Text style={styles.stateText}>{modulesState.message}</Text>
                <Pressable accessibilityRole="button" onPress={onRetryModules} style={styles.retryButton}><Text style={styles.retryText}>Try again</Text></Pressable>
              </View>
            ) : null}
          </View>
        </>
      }
      renderItem={renderModule}
      showsVerticalScrollIndicator={false}
      style={styles.list}
    />
      <View style={styles.footer}>
        <Pressable accessibilityLabel="Logout" accessibilityRole="button" accessibilityState={{ disabled: isLoggingOut }} disabled={isLoggingOut} onPress={onLogout} style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}>
          {isLoggingOut ? <ActivityIndicator color={COLORS.danger} size="small" /> : <Feather accessibilityElementsHidden color={COLORS.danger} name="log-out" size={DRAWER_ICON_SIZE} />}
          <Text style={styles.logoutLabel}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: { backgroundColor: COLORS.drawerSurface, borderBottomRightRadius: RADII.sheet, borderTopRightRadius: RADII.sheet, flex: 1, overflow: "hidden" },
  list: { flex: 1 },
  content: { flexGrow: 1 },
  hero: { backgroundColor: COLORS.drawerHeader, minHeight: 184, paddingBottom: SPACING.large, paddingHorizontal: SPACING.extraLarge, paddingTop: SPACING.medium },
  heroTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  closeButton: { alignItems: "center", borderRadius: RADII.medium, height: MINIMUM_TOUCH_SIZE, justifyContent: "center", width: MINIMUM_TOUCH_SIZE },
  heroButtonPressed: { backgroundColor: "rgba(255, 255, 255, 0.16)" },
  profile: { borderRadius: RADII.medium, marginTop: SPACING.medium, paddingVertical: SPACING.extraSmall },
  avatar: { alignItems: "center", backgroundColor: COLORS.white, borderRadius: RADII.pill, height: MINIMUM_TOUCH_SIZE, justifyContent: "center", width: MINIMUM_TOUCH_SIZE },
  avatarPressed: { backgroundColor: COLORS.accentSoft },
  userName: { color: COLORS.white, ...TYPOGRAPHY.control, fontWeight: "700" },
  userEmail: { color: COLORS.white, ...TYPOGRAPHY.caption, marginTop: SPACING.extraSmall, opacity: 0.95 },
  clientName: { color: COLORS.white, ...TYPOGRAPHY.caption, marginTop: SPACING.extraSmall, opacity: 0.8 },
  menu: { gap: SPACING.extraSmall, marginTop: SPACING.large, paddingBottom: SPACING.small, paddingHorizontal: SPACING.medium },
  item: { borderRadius: RADII.medium, marginHorizontal: 0, marginVertical: 0, minHeight: 52 },
  itemLabel: { ...TYPOGRAPHY.body, fontWeight: "600", marginLeft: -SPACING.extraSmall },
  moduleState: { gap: SPACING.small, paddingHorizontal: SPACING.medium, paddingVertical: SPACING.small },
  stateText: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, paddingHorizontal: SPACING.medium, paddingVertical: SPACING.small },
  skeleton: { backgroundColor: COLORS.surfaceMuted, borderRadius: RADII.small, height: MINIMUM_TOUCH_SIZE },
  retryButton: { alignSelf: "flex-start", minHeight: MINIMUM_TOUCH_SIZE, justifyContent: "center", paddingHorizontal: SPACING.medium },
  retryText: { color: COLORS.accent, ...TYPOGRAPHY.body, fontWeight: "700" },
  footer: { borderTopColor: COLORS.border, borderTopWidth: StyleSheet.hairlineWidth, marginHorizontal: SPACING.medium, paddingBottom: SPACING.small, paddingTop: SPACING.medium },
  logout: { alignItems: "center", borderRadius: RADII.medium, flexDirection: "row", gap: SPACING.medium, minHeight: 52, paddingHorizontal: SPACING.medium },
  logoutPressed: { backgroundColor: COLORS.dangerSoft },
  logoutLabel: { color: COLORS.danger, ...TYPOGRAPHY.body, fontWeight: "700" },
});

import type { ReactElement } from "react";
import { memo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type {
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";

import type { AuthenticatedUser } from "@/src/features/auth/domain/auth.types";
import ProfileDetailRow from "@/src/features/auth/presentation/ProfileDetailRow";
import {
  COLORS,
  CONTROL_HEIGHT,
  FLOATING_TAB_BAR_CONTENT_CLEARANCE,
  MINIMUM_TOUCH_SIZE,
  RADII,
  SCREEN_HORIZONTAL_PADDING,
  SPACING,
  TYPOGRAPHY,
} from "@/src/theme/tokens";
import { formatDateTime } from "@/src/utils/format-date-time";

const AVATAR_SIZE = 44;
const AVATAR_ICON_SIZE = 22;
const ACTION_ICON_SIZE = 18;
const TOP_CARD_SIGN_OUT_SIZE = MINIMUM_TOUCH_SIZE;

const getTopCardSignOutStyle = ({
  pressed,
}: PressableStateCallbackType): StyleProp<ViewStyle> => [
  styles.topCardSignOut,
  pressed && styles.topCardSignOutPressed,
];

const getCompanySummary = (user: AuthenticatedUser): string =>
  user.company.map((company) => company.name).join(", ");

interface UserProfileViewProps {
  user: AuthenticatedUser;
  onMpinPress: () => void;
  onChangePasswordPress: () => void;
  onSignOutPress: () => void;
}

function UserProfileView({
  user,
  onMpinPress,
  onChangePasswordPress,
  onSignOutPress,
}: UserProfileViewProps): ReactElement {
  const [isSecurityExpanded, setIsSecurityExpanded] = useState(false);
  const companySummary = getCompanySummary(user);
  const handleSecurityToggle = (): void => {
    setIsSecurityExpanded((isExpanded) => !isExpanded);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.identity}>
        <Pressable
          accessibilityHint="Signs out of the current account"
          accessibilityLabel="Sign out"
          accessibilityRole="button"
          onPress={onSignOutPress}
          style={getTopCardSignOutStyle}
        >
          <Feather color={COLORS.danger} name="log-out" size={ACTION_ICON_SIZE} />
          <Text style={styles.topCardSignOutLabel}>Sign out</Text>
        </Pressable>
        <View style={styles.avatarContainer}>
          <View accessibilityElementsHidden style={styles.avatar}>
            <Feather color={COLORS.accent} name="user" size={32} />
          </View>
        </View>
        <View style={styles.identityText}>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            numberOfLines={1}
            style={styles.name}
          >
            {user.name}
          </Text>
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            numberOfLines={1}
            style={styles.email}
          >
            {user.email}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account details</Text>
        <ProfileDetailRow
          iconName="briefcase"
          label="Employee code"
          value={user.employeeCode ?? "—"}
        />
        <ProfileDetailRow iconName="at-sign" label="Login ID" value={user.userId} />
        <ProfileDetailRow iconName="phone" label="Mobile" value={user.mobile} />
        <ProfileDetailRow iconName="clock" label="Last login" value={formatDateTime(user.lastLogin)} />
        <ProfileDetailRow iconName="map-pin" label="Branch ID" value={user.branchId ?? "—"} />
        <ProfileDetailRow iconName="home" label="Company" value={companySummary} />
        <ProfileDetailRow
          iconName="shield"
          label="MPIN"
          value={user.hasMpin ? "Configured" : "Not configured"}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityLabel={isSecurityExpanded ? "Collapse security options" : "Expand security options"}
          accessibilityRole="button"
          accessibilityState={{ expanded: isSecurityExpanded }}
          onPress={handleSecurityToggle}
          style={({ pressed }) => [styles.securityHeader, pressed && styles.rowPressed]}
        >
          <Feather color={COLORS.inkMuted} name="shield" size={ACTION_ICON_SIZE} />
          <Text style={styles.securityHeaderLabel}>Security</Text>
          <Feather
            color={COLORS.inkMuted}
            name={isSecurityExpanded ? "chevron-up" : "chevron-down"}
            size={ACTION_ICON_SIZE}
          />
        </Pressable>
        {isSecurityExpanded ? (
          <View style={styles.securityItems}>
            <Pressable
              accessibilityRole="button"
              onPress={onMpinPress}
              style={({ pressed }) => [styles.securityItem, pressed && styles.rowPressed]}
            >
              <Feather color={COLORS.accent} name="hash" size={ACTION_ICON_SIZE} />
              <Text style={styles.securityItemLabel}>
                {user.hasMpin ? "Change MPIN" : "Set MPIN"}
              </Text>
              <Feather color={COLORS.inkMuted} name="chevron-right" size={ACTION_ICON_SIZE} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onChangePasswordPress}
              style={({ pressed }) => [styles.securityItem, pressed && styles.rowPressed]}
            >
              <Feather color={COLORS.accent} name="key" size={ACTION_ICON_SIZE} />
              <Text style={styles.securityItemLabel}>Change password</Text>
              <Feather color={COLORS.inkMuted} name="chevron-right" size={ACTION_ICON_SIZE} />
            </Pressable>
          </View>
        ) : null}
      </View>

    </ScrollView>
  );
}

export default memo(UserProfileView);

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: FLOATING_TAB_BAR_CONTENT_CLEARANCE + SPACING.large,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingTop: SPACING.large,
  },
  identity: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.sheet,
    borderWidth: 1,
    padding: SPACING.extraLarge,
    marginBottom: SPACING.small,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  avatarContainer: {
    padding: SPACING.small,
    backgroundColor: COLORS.background,
    borderRadius: RADII.pill,
    marginBottom: SPACING.medium,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADII.pill,
    height: 80,
    justifyContent: "center",
    width: 80,
  },
  identityText: {
    alignItems: "center",
  },
  name: {
    color: COLORS.ink,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  email: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.body,
    marginTop: 4,
    fontWeight: "500",
  },
  section: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.sheet,
    borderWidth: 1,
    marginTop: SPACING.medium,
    overflow: "hidden",
    paddingHorizontal: SPACING.medium,
    paddingTop: SPACING.medium,
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    color: COLORS.ink,
    ...TYPOGRAPHY.control,
    fontWeight: "800",
    marginBottom: SPACING.extraSmall,
    letterSpacing: -0.2,
  },
  actions: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.sheet,
    borderWidth: 1,
    marginTop: SPACING.medium,
    overflow: "hidden",
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  securityHeader: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: MINIMUM_TOUCH_SIZE,
    paddingHorizontal: SPACING.medium,
  },
  securityHeaderLabel: {
    color: COLORS.ink,
    flex: 1,
    ...TYPOGRAPHY.control,
    fontWeight: "700",
    marginLeft: SPACING.medium,
  },
  securityItems: {
    backgroundColor: COLORS.surfaceMuted,
    paddingLeft: SPACING.extraLarge,
  },
  securityItem: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: MINIMUM_TOUCH_SIZE,
    paddingHorizontal: SPACING.medium,
  },
  securityItemLabel: {
    color: COLORS.ink,
    flex: 1,
    ...TYPOGRAPHY.body,
    fontWeight: "600",
    marginHorizontal: SPACING.medium,
  },
  topCardSignOut: {
    alignItems: "center",
    backgroundColor: COLORS.dangerSoft,
    borderRadius: RADII.pill,
    flexDirection: "row",
    gap: SPACING.extraSmall,
    justifyContent: "center",
    minHeight: TOP_CARD_SIGN_OUT_SIZE,
    paddingHorizontal: SPACING.medium,
    position: "absolute",
    right: SPACING.small,
    top: SPACING.small,
  },
  topCardSignOutLabel: {
    color: COLORS.danger,
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
  },
  topCardSignOutPressed: {
    backgroundColor: COLORS.surface,
    opacity: 0.72,
  },
  rowPressed: { backgroundColor: COLORS.surfaceMuted },
});




import type { ReactElement } from "react";
import { memo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import type { AuthenticatedUser } from "@/src/features/auth/domain/auth.types";
import ProfileDetailRow from "@/src/features/auth/presentation/ProfileDetailRow";
import {
  COLORS,
  MINIMUM_TOUCH_SIZE,
  RADII,
  SCREEN_HORIZONTAL_PADDING,
  SPACING,
  TYPOGRAPHY,
} from "@/src/theme/tokens";

const AVATAR_SIZE = 44;
const AVATAR_ICON_SIZE = 22;
const ACTION_ICON_SIZE = 18;

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
    <View style={styles.content}>
      <View style={styles.identity}>
        <View accessibilityElementsHidden style={styles.avatar}>
          <Feather color={COLORS.accent} name="user" size={AVATAR_ICON_SIZE} />
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
          label="Employee code"
          value={user.employeeCode ?? "—"}
        />
        <ProfileDetailRow label="Login ID" value={user.userId} />
        <ProfileDetailRow label="Mobile" value={user.mobile} />
        <ProfileDetailRow label="Last login" value={user.lastLogin} />
        <ProfileDetailRow label="Branch ID" value={user.branchId ?? "—"} />
        <ProfileDetailRow label="Company" value={companySummary} />
        <ProfileDetailRow
          label="MPIN"
          value={user.hasMpin ? "Configured" : "Not configured"}
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: isSecurityExpanded }}
          onPress={handleSecurityToggle}
          style={styles.securityHeader}
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
              style={styles.securityItem}
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
              style={styles.securityItem}
            >
              <Feather color={COLORS.accent} name="key" size={ACTION_ICON_SIZE} />
              <Text style={styles.securityItemLabel}>Change password</Text>
              <Feather color={COLORS.inkMuted} name="chevron-right" size={ACTION_ICON_SIZE} />
            </Pressable>
          </View>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onSignOutPress}
        style={styles.signOutButton}
      >
        <Feather color={COLORS.danger} name="log-out" size={ACTION_ICON_SIZE} />
        <Text style={styles.signOutLabel}>Sign out</Text>
      </Pressable>
    </View>
  );
}

export default memo(UserProfileView);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingVertical: SPACING.large,
  },
  identity: {
    alignItems: "center",
    flexDirection: "row",
    paddingBottom: SPACING.large,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADII.pill,
    height: AVATAR_SIZE,
    justifyContent: "center",
    width: AVATAR_SIZE,
  },
  identityText: {
    flex: 1,
    marginLeft: SPACING.large,
  },
  name: {
    color: COLORS.ink,
    ...TYPOGRAPHY.control,
    fontWeight: "700",
  },
  email: {
    color: COLORS.inkMuted,
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.extraSmall,
  },
  section: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingTop: SPACING.medium,
  },
  sectionTitle: {
    color: COLORS.ink,
    ...TYPOGRAPHY.control,
    fontWeight: "700",
    marginBottom: SPACING.small,
  },
  actions: {
    marginTop: SPACING.small,
  },
  securityHeader: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: MINIMUM_TOUCH_SIZE,
  },
  securityHeaderLabel: {
    color: COLORS.ink,
    flex: 1,
    ...TYPOGRAPHY.control,
    fontWeight: "700",
    marginLeft: SPACING.medium,
  },
  securityItems: {
    paddingLeft: SPACING.section,
  },
  securityItem: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: MINIMUM_TOUCH_SIZE,
  },
  securityItemLabel: {
    color: COLORS.ink,
    flex: 1,
    ...TYPOGRAPHY.body,
    fontWeight: "600",
    marginHorizontal: SPACING.medium,
  },
  signOutButton: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.small,
    minHeight: MINIMUM_TOUCH_SIZE,
  },
  signOutLabel: {
    color: COLORS.danger,
    ...TYPOGRAPHY.control,
    fontWeight: "600",
    marginLeft: SPACING.small,
  },
});

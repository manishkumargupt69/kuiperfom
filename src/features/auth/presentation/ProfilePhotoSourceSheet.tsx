import type { ReactElement } from "react";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PressableStateCallbackType, StyleProp, ViewStyle } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import BottomSheetModal from "@/src/components/ui/BottomSheetModal";
import { COLORS, MINIMUM_TOUCH_SIZE, RADII, SPACING, TYPOGRAPHY } from "@/src/theme/tokens";

interface ProfilePhotoSourceSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onDismiss: () => void;
  onChooseCamera: () => void;
  onChooseLibrary: () => void;
}

const getOptionStyle = ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => [
  styles.option,
  pressed && styles.optionPressed,
];

function ProfilePhotoSourceSheet({
  isVisible,
  onClose,
  onDismiss,
  onChooseCamera,
  onChooseLibrary,
}: ProfilePhotoSourceSheetProps): ReactElement {
  return (
    <BottomSheetModal
      accessibilityLabel="Close profile photo options"
      isVisible={isVisible}
      onClose={onClose}
      onDismiss={onDismiss}
      title="Update profile photo"
    >
      <View style={styles.content}>
        <Pressable
          accessibilityHint="Opens the camera to take a profile photo"
          accessibilityLabel="Take photo"
          accessibilityRole="button"
          onPress={onChooseCamera}
          style={getOptionStyle}
        >
          <View style={styles.iconContainer}>
            <Feather color={COLORS.accent} name="camera" size={22} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Take photo</Text>
            <Text style={styles.optionDescription}>Use your camera</Text>
          </View>
          <Feather color={COLORS.inkMuted} name="chevron-right" size={20} />
        </Pressable>
        <View style={styles.divider} />
        <Pressable
          accessibilityHint="Opens your photo library to choose a profile photo"
          accessibilityLabel="Choose from library"
          accessibilityRole="button"
          onPress={onChooseLibrary}
          style={getOptionStyle}
        >
          <View style={styles.iconContainer}>
            <Feather color={COLORS.accent} name="image" size={22} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Choose from library</Text>
            <Text style={styles.optionDescription}>Use an existing photo</Text>
          </View>
          <Feather color={COLORS.inkMuted} name="chevron-right" size={20} />
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}

export default memo(ProfilePhotoSourceSheet);

const styles = StyleSheet.create({
  content: {
    paddingBottom: SPACING.extraLarge,
    paddingHorizontal: SPACING.large,
    paddingTop: SPACING.medium,
  },
  option: {
    alignItems: "center",
    borderRadius: RADII.large,
    flexDirection: "row",
    gap: SPACING.medium,
    minHeight: MINIMUM_TOUCH_SIZE + SPACING.extraLarge,
    paddingHorizontal: SPACING.small,
  },
  optionPressed: { backgroundColor: COLORS.surfaceMuted },
  iconContainer: {
    alignItems: "center",
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADII.medium,
    height: MINIMUM_TOUCH_SIZE,
    justifyContent: "center",
    width: MINIMUM_TOUCH_SIZE,
  },
  optionText: { flex: 1 },
  optionTitle: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "700" },
  optionDescription: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption, marginTop: SPACING.extraSmall },
  divider: { backgroundColor: COLORS.border, height: 1, marginHorizontal: SPACING.small },
});

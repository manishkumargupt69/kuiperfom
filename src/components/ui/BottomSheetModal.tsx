import type { PropsWithChildren, ReactElement } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Feather from "@expo/vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  COLORS,
  MAX_CONTENT_WIDTH,
  MINIMUM_TOUCH_SIZE,
  RADII,
  SPACING,
  TYPOGRAPHY,
} from "@/src/theme/tokens";

interface BottomSheetModalProps extends PropsWithChildren {
  accessibilityLabel: string;
  isVisible: boolean;
  title: string;
  onClose: () => void;
}

const BOTTOM_SAFE_AREA_EDGES = ["bottom"] as const;

export default function BottomSheetModal({
  accessibilityLabel,
  children,
  isVisible,
  title,
  onClose,
}: BottomSheetModalProps): ReactElement {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={isVisible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <KeyboardAvoidingView
          behavior={Platform.select({ android: "height", ios: "padding" })}
          pointerEvents="box-none"
          style={styles.keyboardArea}
        >
          <SafeAreaView
            accessibilityViewIsModal
            edges={BOTTOM_SAFE_AREA_EDGES}
            style={styles.sheet}
          >
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text accessibilityRole="header" style={styles.title}>
                {title}
              </Text>
              <Pressable
                accessibilityLabel={`Close ${title}`}
                accessibilityRole="button"
                onPress={onClose}
                style={styles.closeButton}
              >
                <Feather color={COLORS.ink} name="x" size={22} />
              </Pressable>
            </View>
            {children}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(27, 29, 27, 0.42)",
    flex: 1,
  },
  keyboardArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    alignSelf: "center",
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADII.large,
    borderTopRightRadius: RADII.large,
    maxHeight: "92%",
    maxWidth: MAX_CONTENT_WIDTH,
    overflow: "hidden",
    width: "100%",
  },
  handle: {
    alignSelf: "center",
    backgroundColor: COLORS.border,
    borderRadius: RADII.pill,
    height: 4,
    marginTop: SPACING.small,
    width: 40,
  },
  header: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: MINIMUM_TOUCH_SIZE,
    paddingLeft: SPACING.extraLarge,
  },
  title: {
    color: COLORS.ink,
    flex: 1,
    ...TYPOGRAPHY.control,
    fontWeight: "700",
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: MINIMUM_TOUCH_SIZE,
    minWidth: MINIMUM_TOUCH_SIZE,
  },
});

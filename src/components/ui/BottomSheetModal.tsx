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
      animationType="slide"
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
          behavior="padding"
          enabled={Platform.OS === "ios"}
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
    backgroundColor: COLORS.overlay,
    flex: 1,
  },
  keyboardArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    alignSelf: "center",
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADII.sheet,
    borderTopRightRadius: RADII.sheet,
    maxHeight: "92%",
    maxWidth: MAX_CONTENT_WIDTH,
    overflow: "hidden",
    width: "100%",
  },
  handle: {
    alignSelf: "center",
    backgroundColor: COLORS.border,
    borderRadius: RADII.pill,
    height: 5,
    marginTop: SPACING.medium,
    width: 36,
  },
  header: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 60,
    paddingHorizontal: SPACING.medium,
  },
  title: {
    color: COLORS.ink,
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: MINIMUM_TOUCH_SIZE,
    minWidth: MINIMUM_TOUCH_SIZE,
    borderRadius: RADII.pill,
  },
});

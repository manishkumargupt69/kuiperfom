import type { ReactElement } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import UnsavedChangesDialog from "@/src/components/ui/UnsavedChangesDialog";
import AppDrawerContent from "@/src/features/modules/presentation/AppDrawerContent";
import { COLORS } from "@/src/theme/tokens";

interface AppNavigationOverlayProps {
  isMenuVisible: boolean;
  isWarningVisible: boolean;
  onCancel: () => void;
  onCloseMenu: () => void;
  onDiscard: () => void;
}

export default function AppNavigationOverlay({ isMenuVisible, isWarningVisible, onCancel, onCloseMenu, onDiscard }: AppNavigationOverlayProps): ReactElement {
  if (!isMenuVisible && !isWarningVisible) return <></>;

  return (
    <Modal
      animationType="fade"
      onRequestClose={isWarningVisible ? onCancel : onCloseMenu}
      statusBarTranslucent
      transparent
      visible={isMenuVisible || isWarningVisible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel={isWarningVisible ? "Keep editing" : "Close menu"}
          accessibilityRole="button"
          onPress={isWarningVisible ? onCancel : onCloseMenu}
          style={StyleSheet.absoluteFill}
        />
        {isWarningVisible ? (
          <UnsavedChangesDialog onDiscard={onDiscard} onKeepEditing={onCancel} />
        ) : (
          <SafeAreaView edges={["top", "bottom"]} style={styles.drawer}>
            <AppDrawerContent onClose={onCloseMenu} />
          </SafeAreaView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { backgroundColor: COLORS.overlay, flex: 1, justifyContent: "center" },
  drawer: { height: "100%", maxWidth: 340, width: "82%" },
});

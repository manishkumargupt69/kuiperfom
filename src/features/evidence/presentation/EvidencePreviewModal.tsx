import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useVideoPlayer, VideoView } from "expo-video";

import SecondaryButton from "@/src/components/ui/SecondaryButton";
import type { EvidenceAttachment } from "@/src/types/evidence";
import {
  COLORS,
  MAX_CONTENT_WIDTH,
  RADII,
  SPACING,
  TYPOGRAPHY,
} from "@/src/theme/tokens";

interface EvidencePreviewModalProps {
  attachment: EvidenceAttachment;
  onClose: () => void;
}

const formatSeconds = (seconds: number): string => {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(wholeSeconds / 60);
  return `${minutes}:${String(wholeSeconds % 60).padStart(2, "0")}`;
};

export default function EvidencePreviewModal({
  attachment,
  onClose,
}: EvidencePreviewModalProps): ReactElement {
  const audioPlayer = useAudioPlayer(
    attachment.kind === "audio" ? attachment.uri : null,
  );
  const audioStatus = useAudioPlayerStatus(audioPlayer);
  const videoPlayer = useVideoPlayer(
    attachment.kind === "video" ? attachment.uri : null,
  );
  const imageSource = useMemo(
    () => ({ uri: attachment.uri }),
    [attachment.uri],
  );

  const handleAudioToggle = async (): Promise<void> => {
    if (audioStatus.playing) {
      audioPlayer.pause();
      return;
    }
    if (audioStatus.didJustFinish) {
      await audioPlayer.seekTo(0);
    }
    audioPlayer.play();
  };

  const handleClose = (): void => {
    audioPlayer.pause();
    videoPlayer.pause();
    onClose();
  };

  let preview: ReactNode;
  if (attachment.kind === "photo") {
    preview = (
      <Image
        accessibilityLabel={attachment.name}
        resizeMode="contain"
        source={imageSource}
        style={styles.image}
      />
    );
  } else if (attachment.kind === "video") {
    preview = (
      <VideoView
        allowsFullscreen
        contentFit="contain"
        nativeControls
        player={videoPlayer}
        style={styles.video}
      />
    );
  } else if (attachment.kind === "audio") {
    preview = (
      <View style={styles.audio}>
        <Feather color={COLORS.accent} name="mic" size={32} />
        <Text style={styles.duration}>
          {formatSeconds(audioStatus.currentTime)} / {formatSeconds(audioStatus.duration)}
        </Text>
        <SecondaryButton
          label={audioStatus.playing ? "Pause Voice Note" : "Play Voice Note"}
          onPress={handleAudioToggle}
        />
      </View>
    );
  } else {
    preview = (
      <View style={styles.document}>
        <Feather color={COLORS.accent} name="file-text" size={40} />
        <Text style={styles.documentName}>{attachment.name}</Text>
        <Text style={styles.documentMeta}>{attachment.mimeType}</Text>
      </View>
    );
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
      transparent
      visible
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text numberOfLines={1} style={styles.title}>
              {attachment.name}
            </Text>
            <Pressable
              accessibilityLabel="Close evidence preview"
              accessibilityRole="button"
              onPress={handleClose}
              style={styles.close}
            >
              <Feather color={COLORS.ink} name="x" size={24} />
            </Pressable>
          </View>
          {preview}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.52)",
    flex: 1,
    justifyContent: "center",
    padding: SPACING.large,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.large,
    maxWidth: MAX_CONTENT_WIDTH,
    overflow: "hidden",
    width: "100%",
  },
  header: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingLeft: SPACING.large,
  },
  title: { color: COLORS.ink, flex: 1, ...TYPOGRAPHY.control, fontWeight: "700" },
  close: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    minWidth: 52,
  },
  image: { backgroundColor: COLORS.surfaceMuted, height: 360, width: "100%" },
  video: { backgroundColor: COLORS.ink, height: 280, width: "100%" },
  audio: { gap: SPACING.large, padding: SPACING.extraLarge },
  duration: { color: COLORS.inkMuted, ...TYPOGRAPHY.body, textAlign: "center" },
  document: {
    alignItems: "center",
    gap: SPACING.medium,
    padding: SPACING.section,
  },
  documentName: { color: COLORS.ink, ...TYPOGRAPHY.control, fontWeight: "600" },
  documentMeta: { color: COLORS.inkMuted, ...TYPOGRAPHY.caption },
});

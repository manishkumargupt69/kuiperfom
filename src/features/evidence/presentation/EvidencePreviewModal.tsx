import type { ReactElement, ReactNode } from "react";
import { useMemo, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useVideoPlayer, VideoView } from "expo-video";
import Pdf from "react-native-pdf";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SecondaryButton from "@/src/components/ui/SecondaryButton";
import { useFloatingNavigationVisibility } from "@/src/components/navigation/use-floating-navigation-visibility";
import type { EvidenceAttachment } from "@/src/types/evidence";
import {
  COLORS,
  DETAIL_ACTION_FOOTER_HEIGHT,
  DETAIL_HEADER_HEIGHT,
  FLOATING_TAB_BAR_CONTENT_CLEARANCE,
  MAX_CONTENT_WIDTH,
  RADII,
  SPACING,
  TYPOGRAPHY,
} from "@/src/theme/tokens";

interface EvidencePreviewModalProps {
  attachment: EvidenceAttachment;
  hasBottomAction: boolean;
  onClose: () => void;
}

const formatSeconds = (seconds: number): string => {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(wholeSeconds / 60);
  return `${minutes}:${String(wholeSeconds % 60).padStart(2, "0")}`;
};

const getDisplayName = (name: string): string => {
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
};

export default function EvidencePreviewModal({
  attachment,
  hasBottomAction,
  onClose,
}: EvidencePreviewModalProps): ReactElement {
  const hasFloatingNavigation = useFloatingNavigationVisibility();
  const safeAreaInsets = useSafeAreaInsets();
  const pdfBackdropInsets = {
    paddingTop: DETAIL_HEADER_HEIGHT + safeAreaInsets.top,
    paddingBottom: safeAreaInsets.bottom
      + (hasBottomAction ? DETAIL_ACTION_FOOTER_HEIGHT : 0)
      + (hasFloatingNavigation ? FLOATING_TAB_BAR_CONTENT_CLEARANCE : 0),
  };
  const isPdf = attachment.kind === "document" && (
    attachment.mimeType === "application/pdf" || attachment.name.split("?")[0]?.toLowerCase().endsWith(".pdf")
  );
  const displayName = getDisplayName(attachment.name);
  const [pdfStatus, setPdfStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pdfRetryCount, setPdfRetryCount] = useState(0);
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
  const pdfSource = useMemo(
    () => ({ uri: attachment.uri, cache: attachment.uri.startsWith("http") }),
    [attachment.uri],
  );

  const handlePdfRetry = (): void => {
    setPdfStatus("loading");
    setPdfRetryCount((count) => count + 1);
  };

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
  } else if (isPdf) {
    preview = pdfStatus === "error" ? (
      <View style={styles.pdfFeedback}>
        <Feather color={COLORS.inkMuted} name="file-text" size={36} />
        <Text style={styles.documentName}>PDF could not be opened</Text>
        <Text style={styles.documentMeta}>Check the file or connection and try again.</Text>
        <SecondaryButton label="Try Again" onPress={handlePdfRetry} />
      </View>
    ) : (
      <Pdf
        key={pdfRetryCount}
        onError={() => setPdfStatus("error")}
        onLoadComplete={() => setPdfStatus("ready")}
        renderActivityIndicator={() => (
          <View style={styles.pdfFeedback}>
            <ActivityIndicator color={COLORS.accent} />
            <Text style={styles.documentMeta}>Opening PDF…</Text>
          </View>
        )}
        source={pdfSource}
        style={styles.pdf}
        trustAllCerts={false}
      />
    );
  } else {
    preview = (
      <View style={styles.document}>
        <Feather color={COLORS.accent} name="file-text" size={40} />
        <Text style={styles.documentName}>{displayName}</Text>
        <Text style={styles.documentMeta}>{attachment.mimeType}</Text>
      </View>
    );
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={!isPdf}
      transparent
      visible
    >
      <View style={[
        styles.backdrop,
        isPdf && styles.pdfBackdrop,
        isPdf && pdfBackdropInsets,
      ]}>
        <View style={[styles.modal, isPdf && styles.pdfModal]}>
          <View style={styles.header}>
            <Text numberOfLines={1} style={styles.title}>
              {displayName}
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
  pdfBackdrop: { backgroundColor: "transparent" },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.large,
    maxWidth: MAX_CONTENT_WIDTH,
    overflow: "hidden",
    width: "100%",
  },
  pdfModal: { flex: 1 },
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
  pdf: { backgroundColor: COLORS.surfaceMuted, flex: 1, width: "100%" },
  pdfFeedback: { alignItems: "center", flex: 1, gap: SPACING.medium, justifyContent: "center", padding: SPACING.large },
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

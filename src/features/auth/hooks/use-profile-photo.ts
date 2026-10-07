import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authRepository } from "@/src/features/auth/data/auth.repository";
import type { AuthSession, ProfilePhotoFile } from "@/src/features/auth/domain/auth.types";
import type { ViewState } from "@/src/types/view-state";

const PROFILE_PHOTO_QUERY_KEY = "profile-photo";
type PhotoSource = "camera" | "library";

interface ProfilePhotoResult {
  viewState: ViewState<string>;
  isUploading: boolean;
  isSourceSheetVisible: boolean;
  choosePhoto: () => void;
  closeSourceSheet: () => void;
  chooseCamera: () => void;
  chooseLibrary: () => void;
  onSourceSheetDismiss: () => void;
  reload: () => Promise<void>;
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Please try again.";

const getProfilePhotoFile = (asset: ImagePicker.ImagePickerAsset): ProfilePhotoFile => ({
  uri: asset.uri,
  name: asset.fileName ?? `profile-photo-${Date.now()}.jpg`,
  mimeType: asset.mimeType ?? "image/jpeg",
});

export const useProfilePhoto = (session: AuthSession | null): ProfilePhotoResult => {
  const [isSourceSheetVisible, setSourceSheetVisible] = useState(false);
  const pendingSource = useRef<PhotoSource | null>(null);
  const queryClient = useQueryClient();
  const queryKey = [PROFILE_PHOTO_QUERY_KEY, session?.user.id];
  const query = useQuery({
    queryKey,
    queryFn: () => session ? authRepository.getProfilePhoto(session) : Promise.resolve(null),
    enabled: Boolean(session),
  });
  const upload = useMutation({
    mutationFn: (file: ProfilePhotoFile) => {
      if (!session) throw new Error("Sign in to update your photo.");
      return authRepository.uploadProfilePhoto(session, file);
    },
    onSuccess: async (photoUrl) => {
      queryClient.setQueryData(queryKey, photoUrl);
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const uploadSelectedPhoto = useCallback(async (asset: ImagePicker.ImagePickerAsset): Promise<void> => {
    try {
      await upload.mutateAsync(getProfilePhotoFile(asset));
    } catch (error: unknown) {
      Alert.alert("Unable to update photo", getErrorMessage(error));
    }
  }, [upload]);

  const takePhoto = useCallback(async (): Promise<void> => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Camera access needed", "Allow camera access to take a profile photo.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"] });
      if (!result.canceled) await uploadSelectedPhoto(result.assets[0]);
    } catch (error: unknown) {
      Alert.alert("Unable to open camera", getErrorMessage(error));
    }
  }, [uploadSelectedPhoto]);

  const selectPhoto = useCallback(async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"] });
      if (!result.canceled) await uploadSelectedPhoto(result.assets[0]);
    } catch (error: unknown) {
      Alert.alert("Unable to open photos", getErrorMessage(error));
    }
  }, [uploadSelectedPhoto]);

  const choosePhoto = useCallback((): void => setSourceSheetVisible(true), []);
  const closeSourceSheet = useCallback((): void => {
    pendingSource.current = null;
    setSourceSheetVisible(false);
  }, []);
  const launchSource = useCallback((source: PhotoSource): void => {
    if (source === "camera") {
      void takePhoto();
      return;
    }
    void selectPhoto();
  }, [selectPhoto, takePhoto]);
  const chooseSource = useCallback((source: PhotoSource): void => {
    pendingSource.current = source;
    setSourceSheetVisible(false);
    if (Platform.OS === "web") {
      pendingSource.current = null;
      launchSource(source);
    }
  }, [launchSource]);
  const chooseCamera = useCallback((): void => chooseSource("camera"), [chooseSource]);
  const chooseLibrary = useCallback((): void => chooseSource("library"), [chooseSource]);
  const onSourceSheetDismiss = useCallback((): void => {
    const source = pendingSource.current;
    pendingSource.current = null;
    if (source) launchSource(source);
  }, [launchSource]);

  useEffect(() => {
    if (Platform.OS === "android" && !isSourceSheetVisible) onSourceSheetDismiss();
  }, [isSourceSheetVisible, onSourceSheetDismiss]);

  const { refetch } = query;
  const reload = useCallback(async (): Promise<void> => {
    await refetch();
  }, [refetch]);

  let viewState: ViewState<string>;
  if (!session) viewState = { status: "idle" };
  else if (query.isPending) viewState = { status: "loading" };
  else if (query.isError) viewState = { status: "error", message: "Profile photo could not be loaded." };
  else if (!query.data) viewState = { status: "empty" };
  else viewState = { status: "success", data: query.data };

  return {
    viewState,
    isUploading: upload.isPending,
    isSourceSheetVisible,
    choosePhoto,
    closeSourceSheet,
    chooseCamera,
    chooseLibrary,
    onSourceSheetDismiss,
    reload,
  };
};

import type { ReactElement } from "react";
import { useCallback } from "react";
import { Redirect, router } from "expo-router";

import AppHeader from "@/src/components/ui/AppHeader";
import ScreenContainer from "@/src/components/ui/ScreenContainer";
import { useChangePassword } from "@/src/features/auth/hooks/use-change-password";
import { useChangeMpin } from "@/src/features/auth/hooks/use-change-mpin";
import { useSetMpin } from "@/src/features/auth/hooks/use-set-mpin";
import ChangeMpinModal from "@/src/features/auth/presentation/ChangeMpinModal";
import ChangePasswordModal from "@/src/features/auth/presentation/ChangePasswordModal";
import SetMpinModal from "@/src/features/auth/presentation/SetMpinModal";
import UserProfileView from "@/src/features/auth/presentation/UserProfileView";
import { useAuthStore } from "@/src/features/auth/state/auth-store";

export default function ProfileScreen(): ReactElement {
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const changePassword = useChangePassword(session);
  const changeMpin = useChangeMpin(session);
  const setMpin = useSetMpin(session);
  const { updateField: updateChangePasswordField } = changePassword;
  const {
    open: openChangeMpin,
    updateField: updateChangeMpinField,
  } = changeMpin;
  const { open: openSetMpin, updateField: updateSetMpinField } = setMpin;
  const handleBack = useCallback((): void => router.back(), []);
  const handleOldPasswordChange = useCallback(
    (value: string): void => updateChangePasswordField("oldPassword", value),
    [updateChangePasswordField],
  );
  const handleNewPasswordChange = useCallback(
    (value: string): void => updateChangePasswordField("newPassword", value),
    [updateChangePasswordField],
  );
  const handleConfirmationChange = useCallback(
    (value: string): void => updateChangePasswordField("confirmation", value),
    [updateChangePasswordField],
  );
  const handleMobileChange = useCallback(
    (value: string): void => updateSetMpinField("mobile", value),
    [updateSetMpinField],
  );
  const handleMpinChange = useCallback(
    (value: string): void => updateSetMpinField("mpin", value),
    [updateSetMpinField],
  );
  const handleMpinConfirmationChange = useCallback(
    (value: string): void => updateSetMpinField("confirmation", value),
    [updateSetMpinField],
  );
  const handleMpinPress = useCallback((): void => {
    if (session?.user.hasMpin) {
      openChangeMpin();
      return;
    }
    openSetMpin();
  }, [openChangeMpin, openSetMpin, session?.user.hasMpin]);
  const handleOldMpinChange = useCallback(
    (value: string): void => updateChangeMpinField("oldMpin", value),
    [updateChangeMpinField],
  );
  const handleNewMpinChange = useCallback(
    (value: string): void => updateChangeMpinField("newMpin", value),
    [updateChangeMpinField],
  );
  const handleNewMpinConfirmationChange = useCallback(
    (value: string): void => updateChangeMpinField("confirmation", value),
    [updateChangeMpinField],
  );
  const handleSignOut = useCallback(async (): Promise<void> => {
    await signOut();
    router.replace("/(auth)/sign-in");
  }, [signOut]);

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <>
      <ScreenContainer>
        <AppHeader onBack={handleBack} title="Profile" />
        <UserProfileView
          onChangePasswordPress={changePassword.open}
          onMpinPress={handleMpinPress}
          onSignOutPress={handleSignOut}
          user={session.user}
        />
      </ScreenContainer>
      <ChangePasswordModal
        confirmation={changePassword.fields.confirmation}
        confirmationError={changePassword.errors.confirmation}
        isSubmitting={changePassword.isSubmitting}
        isVisible={changePassword.isVisible}
        newPassword={changePassword.fields.newPassword}
        newPasswordError={changePassword.errors.newPassword}
        notice={changePassword.notice}
        oldPassword={changePassword.fields.oldPassword}
        oldPasswordError={changePassword.errors.oldPassword}
        onChangeConfirmation={handleConfirmationChange}
        onChangeNewPassword={handleNewPasswordChange}
        onChangeOldPassword={handleOldPasswordChange}
        onClose={changePassword.close}
        onSubmit={changePassword.submit}
      />
      <SetMpinModal
        confirmation={setMpin.fields.confirmation}
        confirmationError={setMpin.errors.confirmation}
        isSubmitting={setMpin.isSubmitting}
        isVisible={setMpin.isVisible}
        mobile={setMpin.fields.mobile}
        mobileError={setMpin.errors.mobile}
        mpin={setMpin.fields.mpin}
        mpinError={setMpin.errors.mpin}
        notice={setMpin.notice}
        onChangeConfirmation={handleMpinConfirmationChange}
        onChangeMobile={handleMobileChange}
        onChangeMpin={handleMpinChange}
        onClose={setMpin.close}
        onSubmit={setMpin.submit}
      />
      <ChangeMpinModal
        confirmation={changeMpin.fields.confirmation}
        confirmationError={changeMpin.errors.confirmation}
        isSubmitting={changeMpin.isSubmitting}
        isVisible={changeMpin.isVisible}
        newMpin={changeMpin.fields.newMpin}
        newMpinError={changeMpin.errors.newMpin}
        notice={changeMpin.notice}
        oldMpin={changeMpin.fields.oldMpin}
        oldMpinError={changeMpin.errors.oldMpin}
        onChangeConfirmation={handleNewMpinConfirmationChange}
        onChangeNewMpin={handleNewMpinChange}
        onChangeOldMpin={handleOldMpinChange}
        onClose={changeMpin.close}
        onSubmit={changeMpin.submit}
      />
    </>
  );
}

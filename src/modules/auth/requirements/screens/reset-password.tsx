import React from 'react';

import type { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import AlertCard from '~/framework/components/alert';
import { TerciaryButton } from '~/framework/components/button';
import { useAuthFlows } from '~/modules/auth/flows';
import { useAccountWithRequirement } from '~/modules/auth/store/accounts';
import ChangePasswordScreenTemplate from '~/modules/auth/templates/change-password';
import { I18n } from '~/util/i18n';

/**
 * Requirement: the user must change its password.
 * Once changed, the user is signed in again (see `changePasswordRequirement`) and the app shows the next step by itself.
 */
const RequirementResetPasswordScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  // This screen only shows while there is a connected account with a requirement.
  const platform = useAccountWithRequirement()!.platform.name;
  const { changePasswordRequirement, logout } = useAuthFlows();
  const onCancel = React.useCallback(() => {
    logout().catch(e => console.error('[Auth] Unable to log out:', e));
  }, [logout]);
  return (
    <ChangePasswordScreenTemplate
      FormHeaderComponent={<AlertCard type="warning" text={I18n.get('auth-changepassword-warning')} />}
      FormFooterComponent={
        <TerciaryButton
          text={I18n.get('user-revalidateterms-refuseanddisconnect')}
          onPress={onCancel}
          testID="requirement-reset-password-logout"
        />
      }
      onSubmit={changePasswordRequirement}
      platform={platform}
      prefillType="password"
    />
  );
});
RequirementResetPasswordScreen.displayName = 'RequirementResetPasswordScreen';

export default defineScreen({
  options: () => ({ animation: 'slide_from_bottom', title: I18n.get('user-page-editpassword') }),
  screen: RequirementResetPasswordScreen,
});

import React from 'react';
import { StyleSheet } from 'react-native';

import { defineScreen } from '~/app/navigation-new';
import AlertCard from '~/framework/components/alert';
import { TerciaryButton } from '~/framework/components/button';
import { UI_SIZES } from '~/framework/components/constants';
import { I18n } from '~/util/i18n';

import { changeRequiredPassword, logout } from '../../flows';
import type { IChangePasswordFormData } from '../../model';
import { useAccountWithRequirement } from '../../store/accounts';
import ChangePasswordScreenTemplate from '../../templates/change-password';

const styles = StyleSheet.create({
  alert: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  button: {
    alignSelf: 'center',
    marginTop: UI_SIZES.spacing.minor,
  },
});

const onSubmit = async (payload: IChangePasswordFormData) => {
  await changeRequiredPassword(payload);
};

/**
 * Requirement: the user must change its password.
 * Once changed, the user is signed in again (see `changeRequiredPassword`) and the app shows the next step by itself.
 */
const RequirementResetPasswordScreen = React.memo(function ({}) {
  // This screen only shows while there is a connected account with a requirement.
  const platform = useAccountWithRequirement()!.platform.name;
  const onCancel = React.useCallback(() => {
    logout().catch(e => console.error('[Auth] Unable to log out:', e));
  }, []);
  return (
    <ChangePasswordScreenTemplate
      FormHeaderComponent={<AlertCard style={styles.alert} type="warning" text={I18n.get('auth-changepassword-warning')} />}
      FormFooterComponent={
        <TerciaryButton
          style={styles.button}
          text={I18n.get('user-revalidateterms-refuseanddisconnect')}
          onPress={onCancel}
          testID="requirement-reset-password-logout"
        />
      }
      onSubmit={onSubmit}
      platform={platform}
      prefillType="password"
    />
  );
});
RequirementResetPasswordScreen.displayName = 'RequirementResetPasswordScreen';

export default defineScreen({
  options: { animation: 'slide_from_bottom', title: I18n.get('user-page-editpassword') },
  screen: RequirementResetPasswordScreen,
});

import * as React from 'react';
import { StyleSheet } from 'react-native';

import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { ModuleScreenProps } from '~/app/navigation/types';
import { screenOptions } from '~/app/navigation/util';
import AlertCard from '~/framework/components/alert';
import { PrimaryButton, SecondaryButton, TerciaryButton } from '~/framework/components/button';
import { UI_SIZES } from '~/framework/components/constants';
import ChangePasswordScreen from '~/framework/modules/auth/templates/change-password';
import {
  AuthChangePasswordScreenDispatchProps,
  AuthChangePasswordScreenProps,
  AuthChangePasswordScreenStoreProps,
} from '~/framework/modules/auth/templates/change-password/types';
import { changePasswordActionAddFirstAccount, logoutAction } from '~/framework/modules/auth/thunks';
import { withSession } from '~/framework/modules/auth/util';
import appConf from '~/framework/util/appConf';

export const AuthRequirementResetPasswordScreenOptions = screenOptions(() => ({
  title: I18n.get('user-page-editpassword'),
}));

interface AuthRequirementResetPasswordScreenProps
  extends
    Omit<
      AuthChangePasswordScreenProps,
      | 'onSubmit'
      | 'host'
      | 'prefill'
      | 'prefillType'
      | 'prefillLock'
      | keyof AuthChangePasswordScreenStoreProps
      | keyof AuthChangePasswordScreenDispatchProps
    >,
    ModuleScreenProps<'auth/requirement-reset-password'> {}

export const AuthRequirementResetPasswordScreen = withSession<AuthRequirementResetPasswordScreenProps>(
  function AuthRequirementResetPasswordScreen({ session }) {
    const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

    const onSubmit: AuthChangePasswordScreenProps['onSubmit'] = React.useCallback(
      async payload => {
        return dispatch(
          changePasswordActionAddFirstAccount(
            appConf.getHost(session.platform.name),
            {
              confirm: payload.confirm,
              login: session.user.login,
              newPassword: payload.newPassword,
              oldPassword: payload.oldPassword,
            },
            true,
            true,
          ),
        );
      },
      [dispatch, session.platform.name, session.user.login],
    );

    const onCancel = React.useCallback(() => {
      dispatch(logoutAction());
    }, [dispatch]);

    return (
      <ChangePasswordScreen
        FormHeaderComponent={<AlertCard style={styles.alert} type="warning" text={I18n.get('auth-changepassword-warning')} />}
        FormFooterComponent={
          <TerciaryButton style={styles.button} text={I18n.get('user-revalidateterms-refuseanddisconnect')} onPress={onCancel} />
        }
        onSubmit={onSubmit}
        host={session.platform.name}
        prefillType="password"
      />
    );
  },
);

const styles = StyleSheet.create({
  alert: {
    marginBottom: UI_SIZES.spacing.medium,
  },
  button: {
    alignSelf: 'center',
    marginTop: UI_SIZES.spacing.minor,
  },
});

import * as React from 'react';

import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { ModuleScreenProps } from '~/app/navigation/types';
import { screenOptions } from '~/app/navigation/util';
import ChangePasswordScreen from '~/framework/modules/auth/templates/change-password';
import {
  AuthChangePasswordScreenDispatchProps,
  AuthChangePasswordScreenProps,
  AuthChangePasswordScreenStoreProps,
} from '~/framework/modules/auth/templates/change-password/types';
import { changePasswordActionAddFirstAccount } from '~/framework/modules/auth/thunks';
import appConf from '~/framework/util/appConf';

export const AuthRenewPasswordScreenOptions = screenOptions(() => ({
  title: I18n.get('user-page-editpassword'),
}));

interface AuthRenewPasswordScreenProps
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
    ModuleScreenProps<'auth/renew-password'> {}

export function AuthRenewPasswordScreen({
  route: {
    params: { credentials, host },
  },
}: AuthRenewPasswordScreenProps) {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const onSubmit: AuthChangePasswordScreenProps['onSubmit'] = React.useCallback(
    async payload => {
      return dispatch(
        changePasswordActionAddFirstAccount(
          appConf.getHost(host),
          {
            confirm: payload.confirm,
            login: credentials.username,
            newPassword: payload.newPassword,
            resetCode: credentials.password,
          },
          false,
          true,
        ),
      );
    },
    [credentials.password, credentials.username, dispatch, host],
  );
  return <ChangePasswordScreen onSubmit={onSubmit} host={host} prefill={credentials.username} prefillType="login" prefillLock />;
}

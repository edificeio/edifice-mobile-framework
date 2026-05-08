import * as React from 'react';

import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { ModuleScreenProps } from '~/app/navigation/types';
import { modalScreenOptions } from '~/app/navigation/util';
import ChangePasswordScreen from '~/framework/modules/auth/templates/change-password';
import {
  AuthChangePasswordScreenDispatchProps,
  AuthChangePasswordScreenProps,
  AuthChangePasswordScreenStoreProps,
} from '~/framework/modules/auth/templates/change-password/types';
import { buildChangePasswordActionReplaceAccount } from '~/framework/modules/auth/thunks';
import { withSession } from '~/framework/modules/auth/util';
import appConf from '~/framework/util/appConf';

export const UserChangePasswordScreenOptions = modalScreenOptions('fullScreenModal', () => ({
  title: I18n.get('user-page-editpassword'),
}));

interface UserChangePasswordScreenProps
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
    ModuleScreenProps<'user/change-password'> {}

export const UserChangePasswordScreen = withSession<UserChangePasswordScreenProps>(function UserChangePasswordScreen({
  navigation,
  session,
}) {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const onSubmit: AuthChangePasswordScreenProps['onSubmit'] = React.useCallback(
    async payload => {
      await dispatch(
        buildChangePasswordActionReplaceAccount(session.user.id, session.addTimestamp)(
          appConf.getHost(session.platform.name),
          {
            confirm: payload.confirm,
            login: session.user.login,
            newPassword: payload.newPassword,
            oldPassword: payload.oldPassword,
          },
          false,
          true,
        ),
      );
      navigation.goBack();
    },
    [dispatch, navigation, session.addTimestamp, session.platform.name, session.user.id, session.user.login],
  );
  return <ChangePasswordScreen onSubmit={onSubmit} prefillType="password" host={session.platform.name} />;
});

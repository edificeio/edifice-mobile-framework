import * as React from 'react';

import { ModuleScreenProps } from '~/app/navigation/types';
import { modalScreenOptions } from '~/app/navigation/util';
import ChangePasswordScreen from '~/framework/modules/auth/templates/change-password';
import {
  AuthChangePasswordScreenDispatchProps,
  AuthChangePasswordScreenProps,
  AuthChangePasswordScreenStoreProps,
} from '~/framework/modules/auth/templates/change-password/types';
import { withSession } from '~/framework/modules/auth/util';
import { useAuthFlows } from '~/modules/auth/flows';
import { I18n } from '~/util/i18n';

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
  const { changePassword } = useAuthFlows();
  const onSubmit: AuthChangePasswordScreenProps['onSubmit'] = React.useCallback(
    async payload => {
      await changePassword({ confirm: payload.confirm, newPassword: payload.newPassword, oldPassword: payload.oldPassword });
      navigation.goBack();
    },
    [changePassword, navigation],
  );
  return <ChangePasswordScreen onSubmit={onSubmit} prefillType="password" host={session.platform.name} />;
});

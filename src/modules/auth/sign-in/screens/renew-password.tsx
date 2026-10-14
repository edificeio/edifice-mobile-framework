import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import type { Platform } from '~/framework/util/appConf';
import { I18n } from '~/util/i18n';

import { usePlatformAuthContext } from '../../hooks/use-platform-config';
import type { AuthCredentials } from '../../model';
import { useAccountsStore } from '../../store/accounts';
import ChangePasswordScreen, { type AuthChangePasswordScreenProps } from '../../templates/change-password';
import { useSignIn } from '../use-sign-in';

const SignInRenewPasswordScreen = React.memo(function ({
  route: {
    params: { accountId, credentials, platform },
  },
}: StaticScreenProps<{
  platform: Platform['name'];
  credentials: AuthCredentials;
  accountId?: string;
}>) {
  const accountToReplace = useAccountsStore(s => (accountId ? s.accounts[accountId] : undefined));
  const context = usePlatformAuthContext(platform);
  const { changePassword } = useSignIn();
  const onSubmit: AuthChangePasswordScreenProps['onSubmit'] = React.useCallback(
    payload =>
      changePassword(
        platform,
        {
          confirm: payload.confirm,
          login: credentials.username,
          newPassword: payload.newPassword,
          resetCode: credentials.password,
        },
        { accountToReplace, passwordRegex: context?.passwordRegex },
      ),
    [accountToReplace, changePassword, context?.passwordRegex, credentials.password, credentials.username, platform],
  );
  return (
    <ChangePasswordScreen onSubmit={onSubmit} platform={platform} prefill={credentials.username} prefillType="login" prefillLock />
  );
});
SignInRenewPasswordScreen.displayName = 'SignInRenewPasswordScreen';

export default defineScreen({ options: { title: I18n.get('user-page-editpassword') }, screen: SignInRenewPasswordScreen });

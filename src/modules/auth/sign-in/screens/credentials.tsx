import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { Platform } from '~/framework/util/appConf';
import SignInCredentialsScreenTemplate, {
  SignInCredentialsScreenTemplateProps,
} from '~/modules/auth/sign-in/templates/credentials';
import { useSignIn } from '~/modules/auth/sign-in/use-sign-in';
import { useAccountsStore } from '~/modules/auth/store/accounts';
import { I18n } from '~/util/i18n';

const SignInCredentialsScreen = React.memo(function ({
  route: {
    params: { accountId, loginUsed, platform },
  },
}: StaticScreenProps<{ platform: Platform['name']; accountId?: string; loginUsed?: string }>) {
  const account = useAccountsStore(s => (accountId ? s.accounts[accountId] : undefined));
  // With several accounts, the login of the targeted one can't be changed (so no account is replaced by another user).
  // With a single account the user must be able to change it: it is the only way out, as the accounts can't be managed then.
  const lockLogin = useAccountsStore(s => Object.keys(s.accounts).length > 1);
  const { withCredentials } = useSignIn();
  const handleSignIn = React.useCallback<SignInCredentialsScreenTemplateProps['handleSignIn']>(
    (credentials, key, accountToReplaceId) => withCredentials(platform, credentials, key, accountToReplaceId),
    [platform, withCredentials],
  );
  return (
    <SignInCredentialsScreenTemplate
      account={account}
      handleSignIn={handleSignIn}
      lockLogin={lockLogin}
      loginUsed={loginUsed}
      platform={platform}
    />
  );
});
SignInCredentialsScreen.displayName = 'SignInCredentialsScreen';

export default defineScreen({ options: () => ({ title: I18n.get('auth-login-title') }), screen: SignInCredentialsScreen });

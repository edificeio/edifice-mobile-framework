import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { Platform } from '~/framework/util/appConf';
import SignInCredentialsScreenTemplate, {
  SignInCredentialsScreenTemplateProps,
} from '~/modules/auth/sign-in/templates/credentials';
import { useSignIn } from '~/modules/auth/sign-in/use-sign-in';
import { I18n } from '~/util/i18n';

const SignInCredentialsScreen = React.memo(function ({
  route: {
    params: { accountId, lockLogin, loginUsed, platform },
  },
}: StaticScreenProps<{ platform: Platform['name']; accountId?: string; loginUsed?: string; lockLogin?: boolean }>) {
  const { withCredentials } = useSignIn();
  const handleSignIn = React.useCallback<SignInCredentialsScreenTemplateProps['handleSignIn']>(
    (credentials, key, accountToReplaceId) => withCredentials(platform, credentials, key, accountToReplaceId),
    [platform, withCredentials],
  );
  return (
    <SignInCredentialsScreenTemplate
      accountId={accountId}
      handleSignIn={handleSignIn}
      lockLogin={lockLogin}
      loginUsed={loginUsed}
      platform={platform}
    />
  );
});
SignInCredentialsScreen.displayName = 'SignInCredentialsScreen';

export default defineScreen({ options: () => ({ title: I18n.get('auth-login-title') }), screen: SignInCredentialsScreen });

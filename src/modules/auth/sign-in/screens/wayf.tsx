import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import type { Platform } from '~/framework/util/appConf';
import { I18n } from '~/util/i18n';

import { useSignInStore } from '../../store/sign-in';
import { useSignInNavigation } from '../navigation';
import SignInWayfScreenTemplate, { type SignInWayfScreenTemplateProps } from '../templates/wayf';
import { useSignIn } from '../use-sign-in';

const SignInWayfScreen = React.memo(function ({
  route: {
    params: { accountId, platform },
  },
}: StaticScreenProps<{ platform: Platform['name']; accountId?: string }>): React.JSX.Element {
  const navigation = useSignInNavigation();
  const error = useSignInStore(s => s.error);
  const consumeError = useSignInStore(s => s.consumeError);
  const { withFederation } = useSignIn();
  const tryLogin = React.useCallback<SignInWayfScreenTemplateProps['tryLogin']>(
    (credentials, key) => withFederation(platform, credentials, key, accountId),
    [accountId, platform, withFederation],
  );
  return (
    <SignInWayfScreenTemplate
      accountId={accountId}
      consumeError={consumeError}
      error={error}
      navigation={navigation}
      platform={platform}
      tryLogin={tryLogin}
    />
  );
});
SignInWayfScreen.displayName = 'SignInWayfScreen';

export default defineScreen({ options: { title: I18n.get('auth-wayf-main-title') }, screen: SignInWayfScreen });

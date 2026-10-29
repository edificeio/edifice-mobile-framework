import React from 'react';

import type { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import type { Platform } from '~/framework/util/appConf';
import type { AuthCredentials } from '~/modules/auth/model';
import SignInActivationScreenTemplate, {
  type SignInActivationScreenTemplateProps,
} from '~/modules/auth/sign-in/templates/activation';
import { useSignIn } from '~/modules/auth/sign-in/use-sign-in';
import { useOpenMedia } from '~/modules/media/hooks';
import { I18n } from '~/util/i18n';

const SignInActivationScreen = React.memo(function ({
  route: {
    params: { accountId, credentials, platform },
  },
}: StaticScreenProps<{
  platform: Platform['name'];
  credentials: AuthCredentials;
  accountId?: string;
}>) {
  // The sign-in navigator hands the actions it can't handle (the media modals) to the navigation of the app: see `AuthNavigationWrapper`.
  const { openPdf } = useOpenMedia();
  const onOpenLegalUrl = React.useCallback((title: string, url: string) => openPdf({ src: url, title }), [openPdf]);
  const { activate } = useSignIn();
  const trySubmit = React.useCallback<SignInActivationScreenTemplateProps['trySubmit']>(
    (activationPlatform, model) => activate(activationPlatform, model, accountId),
    [accountId, activate],
  );
  return (
    <SignInActivationScreenTemplate
      credentials={credentials}
      onOpenLegalUrl={onOpenLegalUrl}
      platform={platform}
      trySubmit={trySubmit}
    />
  );
});
SignInActivationScreen.displayName = 'SignInActivationScreen';

export default defineScreen({
  options: () => ({ title: I18n.get('auth-navigation-activation-title') }),
  screen: SignInActivationScreen,
});

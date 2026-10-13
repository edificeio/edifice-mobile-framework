import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import type { Platform } from '~/framework/util/appConf';
import { useSignInNavigation } from '~/modules/auth/sign-in/navigation';
import { useSignInStore } from '~/modules/auth/sign-in/store';
import SignInWayfIntroScreenTemplate from '~/modules/auth/sign-in/templates/wayf-intro';
import { I18n } from '~/util/i18n';

const SignInWayfIntroScreen = React.memo(function ({
  route: {
    params: { accountId, platform },
  },
}: StaticScreenProps<{ platform: Platform['name']; accountId?: string }>): React.JSX.Element {
  const navigation = useSignInNavigation();
  const error = useSignInStore(s => s.error);
  const consumeError = useSignInStore(s => s.consumeError);
  const handleContinue = React.useCallback(() => {
    navigation.navigate('sign-in/wayf', { accountId, platform });
  }, [accountId, navigation, platform]);
  return (
    <SignInWayfIntroScreenTemplate consumeError={consumeError} error={error} onContinue={handleContinue} platform={platform} />
  );
});
SignInWayfIntroScreen.displayName = 'SignInWayfIntroScreen';

export default defineScreen({ options: () => ({ title: I18n.get('auth-wayf-main-title') }), screen: SignInWayfIntroScreen });

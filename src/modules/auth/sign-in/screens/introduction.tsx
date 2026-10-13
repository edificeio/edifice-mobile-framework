import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { getRouteForOnboarding, useSignInNavigation } from '~/modules/auth/sign-in/navigation';
import SignInIntroductionScreenTemplate from '~/modules/auth/sign-in/templates/introduction';
import { I18n } from '~/util/i18n';

/**
 * Tells the user what having several accounts means. It is the first screen of the add-account modal, always: after it, the user goes
 * on to the platforms (or to the login of the only platform).
 * It is not the welcome screen (`welcome`), which presents the app at the very first launch.
 */
const SignInIntroductionScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const { navigate } = useSignInNavigation();
  const onContinue = React.useCallback(() => {
    const nextRoute = getRouteForOnboarding();
    if (nextRoute.name === 'sign-in/platforms') navigate(nextRoute.name);
    else navigate(nextRoute.name, nextRoute.params);
  }, [navigate]);
  return (
    <SignInIntroductionScreenTemplate
      buttonText={I18n.get('auth-accountonboarding-button')}
      description={I18n.get('auth-accountonboarding-description')}
      onContinue={onContinue}
      svgName="multi-account"
      title={I18n.get('auth-accountonboarding-heading')}
    />
  );
});
SignInIntroductionScreen.displayName = 'SignInIntroductionScreen';

export default defineScreen({
  options: () => ({
    title: I18n.get('auth-add-account-modal-title'),
  }),
  screen: SignInIntroductionScreen,
});

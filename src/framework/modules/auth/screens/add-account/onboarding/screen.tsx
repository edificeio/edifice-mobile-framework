import * as React from 'react';

import { I18n } from '~/app/i18n';
import { screenOptions } from '~/app/navigation/util';
import AuthIntroductionScreen from '~/framework/modules/auth/templates/introduction';

import type { AuthOnboardingAddAccountScreenPrivateProps } from './types';
import { getAddAccountRouteForOnboarding } from '../../../new-navigation';

export const computeNavBar = screenOptions(() => ({
  headerShown: false,
}));

export default function AuthOnboardingAddAccountScreen(props: AuthOnboardingAddAccountScreenPrivateProps) {
  return (
    <AuthIntroductionScreen
      {...props}
      nextScreenAction={getAddAccountRouteForOnboarding()}
      svgName="multi-account"
      title={I18n.get('auth-accountonboarding-heading')}
      description={I18n.get('auth-accountonboarding-description')}
      buttonText={I18n.get('auth-accountonboarding-button')}
    />
  );
}

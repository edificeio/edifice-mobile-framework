import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import OnboardingScreen from '~/framework/modules/auth/templates/onboarding';
import { navBarOptions } from '~/framework/navigation/navBar';

import { getOnboardingNextScreen } from '../../navigation/router-main-account';
import type { AuthOnboardingScreenProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.onboarding>): NativeStackNavigationOptions => ({
  headerShown: false,
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-onboarding-title'),
  }),
});

const onboardingPics = [
  require('ASSETS/images/onboarding/onboarding_0.png'),
  require('ASSETS/images/onboarding/onboarding_1.png'),
  require('ASSETS/images/onboarding/onboarding_2.png'),
  require('ASSETS/images/onboarding/onboarding_3.png'),
];

export default function AuthOnboardingScreen(props: AuthOnboardingScreenProps) {
  return (
    <OnboardingScreen
      {...props}
      pictures={onboardingPics}
      texts={I18n.getArray('user-onboarding-text')}
      nextScreenAction={getOnboardingNextScreen()}
    />
  );
}

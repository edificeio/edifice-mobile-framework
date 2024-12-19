import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthOnboardingScreenProps } from './types';

import { I18n } from '~/app/i18n';
import { StatusBar } from '~/framework/components/status-bar';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getNavActionForOnboarding } from '~/framework/modules/auth/navigation/main-account/router';
import OnboardingScreen from '~/framework/modules/auth/templates/onboarding';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.onboarding>): NativeStackNavigationOptions => ({
  headerShown: false,
  ...navBarOptions({
    navigation,
    route,
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
    <>
      <StatusBar type="light" />
      <OnboardingScreen
        {...props}
        pictures={onboardingPics}
        texts={I18n.getArray('user-onboarding-text')}
        nextScreenAction={getNavActionForOnboarding()}
      />
    </>
  );
}

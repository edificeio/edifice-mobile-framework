import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthOnboardingAddAccountScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { getAddAccountOnboardingNextScreen } from '~/framework/modules/auth/navigation/add-account/router';
import AuthIntroductionScreen from '~/framework/modules/auth/templates/introduction';
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

export default function AuthOnboardingAddAccountScreen(props: AuthOnboardingAddAccountScreenPrivateProps) {
  return (
    <AuthIntroductionScreen
      {...props}
      nextScreenAction={getAddAccountOnboardingNextScreen()}
      svgName="multi-account"
      title={I18n.get('auth-accountonboarding-heading')}
      description={I18n.get('auth-accountonboarding-description')}
      buttonText={I18n.get('auth-accountonboarding-button')}
    />
  );
}

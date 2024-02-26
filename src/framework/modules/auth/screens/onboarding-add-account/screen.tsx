import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';

import { I18n } from '~/app/i18n';
import { AuthNavigationParams, authRouteNames, getAddAccountOnboardingNextScreen } from '~/framework/modules/auth/navigation';
import AuthIntroductionScreen from '~/framework/modules/auth/templates/introduction';
import { navBarOptions } from '~/framework/navigation/navBar';

import type { AuthOnboardingAddAccountScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.addAccountOnboarding>): NativeStackNavigationOptions => ({
  headerShown: false,
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-onboarding-add-account-title'),
  }),
});

export default function AuthOnboardingAddAccountScreen(props: AuthOnboardingAddAccountScreenPrivateProps) {
  return (
    <AuthIntroductionScreen
      {...props}
      nextScreenAction={getAddAccountOnboardingNextScreen()}
      svgName="multi-account"
      title={I18n.get('user-accountonboarding-heading')}
      description={I18n.get('user-accountonboarding-description')}
      buttonText={I18n.get('user-accountonboarding-button')}
    />
  );
}

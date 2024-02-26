/**
 * Navigator for the auth section
 */
import * as React from 'react';

import { I18n } from '~/app/i18n';
import ActivationScreen from '~/framework/modules/auth/screens/ActivationScreen';
import ForgotScreen from '~/framework/modules/auth/screens/ForgotScreen';
import LoginWayfScreen from '~/framework/modules/auth/screens/LoginWayfScreen';
import PlatformSelectScreen from '~/framework/modules/auth/screens/PlatformSelectScreen';
import WayfScreen from '~/framework/modules/auth/screens/WayfScreen';
import LoginCredentialsScreen, {
  computeNavBar as authLoginCredentialsNavBar,
} from '~/framework/modules/auth/screens/login-credentials';
import AuthOnboardingScreen, { computeNavBar as onboardingNavBar } from '~/framework/modules/auth/screens/onboarding-add-account';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
import { getTypedRootStack } from '~/framework/navigation/navigators';

import { AuthNavigationParams, authRouteNames } from '.';

const Stack = getTypedRootStack<AuthNavigationParams>();

// Auth Stack used when user is logged in, adding another account.

export default function () {
  return (
    <Stack.Group screenOptions={navBarOptions}>
      <Stack.Screen name={authRouteNames.addAccountOnboarding} component={AuthOnboardingScreen} options={onboardingNavBar} />
      <Stack.Screen name={authRouteNames.addAccountPlatforms} component={PlatformSelectScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name={authRouteNames.addAccountLoginCredentials}
        component={LoginCredentialsScreen}
        options={authLoginCredentialsNavBar}
      />
      <Stack.Screen
        name={authRouteNames.addAccountLoginWayf}
        component={LoginWayfScreen}
        options={({ route }) => ({
          headerTitle: navBarTitle(route.params?.platform.displayName),
        })}
      />
      <Stack.Screen
        name={authRouteNames.addAccountWayf}
        component={WayfScreen}
        options={{
          headerTitle: navBarTitle(I18n.get('auth-wayf-main-title')),
        }}
      />
      <Stack.Screen
        name={authRouteNames.addAccountActivation}
        component={ActivationScreen}
        options={{
          headerTitle: navBarTitle(I18n.get('auth-navigation-activation-title')),
        }}
      />
      <Stack.Screen
        name={authRouteNames.addAccountForgot}
        component={ForgotScreen}
        options={({ route }) => ({
          headerTitle: navBarTitle(
            route.params.mode === 'id' ? I18n.get('auth-navigation-forgot-id') : I18n.get('auth-navigation-forgot-password'),
          ),
        })}
      />
    </Stack.Group>
  );
}

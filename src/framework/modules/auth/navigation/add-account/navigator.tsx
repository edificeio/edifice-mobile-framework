/**
 * Navigator for the auth section
 */
import * as React from 'react';

import { I18n } from '~/app/i18n';
import ActivationScreen from '~/framework/modules/auth/screens/ActivationScreen';
import LoginWayfScreen from '~/framework/modules/auth/screens/LoginWayfScreen';
import WayfScreen from '~/framework/modules/auth/screens/WayfScreen';
import AuthForgotAddAccountScreen from '~/framework/modules/auth/screens/add-account/forgot';
import AuthLoginCredentialsScreen, {
  computeNavBar as loginCredentialsNavBar,
} from '~/framework/modules/auth/screens/add-account/login-credentials';
import AuthOnboardingScreen, { computeNavBar as onboardingNavBar } from '~/framework/modules/auth/screens/add-account/onboarding';
import AuthPlatformsAddAccountScreen, {
  computeNavBar as platformsAddAccountNavBar,
} from '~/framework/modules/auth/screens/add-account/platforms';
import ChangePasswordScreen from '~/framework/modules/auth/screens/change-password';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
import { getTypedRootStack } from '~/framework/navigation/navigators';

import { AuthNavigationParams, authRouteNames } from '..';

const Stack = getTypedRootStack<AuthNavigationParams>();

// Auth Stack used when user is logged in, adding another account.

export default function () {
  return (
    <Stack.Group screenOptions={navBarOptions}>
      <Stack.Screen
        name={authRouteNames.addAccountOnboarding as typeof authRouteNames.onboarding}
        component={AuthOnboardingScreen}
        options={onboardingNavBar}
      />
      <Stack.Screen
        name={authRouteNames.addAccountPlatforms as typeof authRouteNames.platforms}
        component={AuthPlatformsAddAccountScreen}
        options={platformsAddAccountNavBar}
      />
      <Stack.Screen
        name={authRouteNames.addAccountLoginCredentials as typeof authRouteNames.loginCredentials}
        component={AuthLoginCredentialsScreen}
        options={loginCredentialsNavBar}
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
        name={authRouteNames.addAccountChangePassword}
        component={ChangePasswordScreen}
        options={{
          headerTitle: navBarTitle(I18n.get('user-page-editpassword')),
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
        component={AuthForgotAddAccountScreen}
        options={({ route }) => ({
          headerTitle: navBarTitle(
            route.params.mode === 'id' ? I18n.get('auth-navigation-forgot-id') : I18n.get('auth-navigation-forgot-password'),
          ),
        })}
      />
    </Stack.Group>
  );
}

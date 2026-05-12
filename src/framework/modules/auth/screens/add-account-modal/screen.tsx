import * as React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { modalScreenOptions } from '~/app/navigation/util';
import { getState } from '~/framework/modules/auth/redux/reducer';

import { getAuthReduxNavigationStateForNewAccount } from '../../new-navigation';
import AuthLoginCredentialsScreen, { computeNavBar as loginCredentialsNavBar } from '../add-account/login-credentials';
import AuthLoginRedirectAddAccountScreen, { computeNavBar as loginRedirectNavBar } from '../add-account/login-redirect';
import AuthLoginWayfAddAccountScreen, { computeNavBar as loginWayfNavBar } from '../add-account/login-wayf';
import AuthOnboardingAddAccountScreen, { computeNavBar as AuthOnboardingAddAccountScreenOptions } from '../add-account/onboarding';
import AuthPlatformsAddAccountScreen, { computeNavBar as platformsAddAccountNavBar } from '../add-account/platforms';
import AuthWayfAddAccountScreen, { computeNavBar as wayfNavBar } from '../add-account/wayf';

export const computeNavBar = modalScreenOptions('modal', () => ({ title: I18n.get('auth-add-account-modal-title') }));

const Stack = createNativeStackNavigator();

export default function AuthAddAccountModalScreen() {
  // const pending = useSelector(state => getState(state).pendingAddAccount);
  // const navigationState = React.useMemo(() => getAuthReduxNavigationStateForNewAccount({ pending }), [pending]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="auth/add-account/onboarding"
        component={AuthOnboardingAddAccountScreen}
        options={AuthOnboardingAddAccountScreenOptions}
      />
      <Stack.Screen
        name="auth/add-account/platforms"
        component={AuthPlatformsAddAccountScreen}
        options={platformsAddAccountNavBar}
      />
      <Stack.Screen
        name="auth/add-account/login/credentials"
        component={AuthLoginCredentialsScreen}
        options={loginCredentialsNavBar}
      />

      <Stack.Screen name="auth/add-account/login/wayf" component={AuthLoginWayfAddAccountScreen} options={loginWayfNavBar} />
      <Stack.Screen
        name="auth/add-account/login/redirect"
        component={AuthLoginRedirectAddAccountScreen}
        options={loginRedirectNavBar}
      />
      <Stack.Screen name="auth/add-account/wayf" component={AuthWayfAddAccountScreen} options={wayfNavBar} />

      {/*
      <Stack.Screen
        name={authRouteNames.addAccountChangePassword}
        component={AuthChangePasswordScreen}
        options={changePasswordNavBar}
      />
      <Stack.Screen
        name={authRouteNames.addAccountActivation}
        component={AuthActivationAddAccountScreen}
        options={authActivationAddAccountNavBar}
      />
      <Stack.Screen
        name={authRouteNames.addAccountForgot}
        component={AuthForgotAddAccountScreen}
        options={({ route }) => ({
          title: route.params.mode === 'id' ? I18n.get('auth-navigation-forgot-id') : I18n.get('auth-navigation-forgot-password'),
        })}
      />*/}
    </Stack.Navigator>
  );
}

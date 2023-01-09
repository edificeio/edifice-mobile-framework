/**
 * Navigator for the auth section
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';

import { navBarOptions } from '~/framework/navigation/navBar';
import { getTypedRootStack } from '~/framework/navigation/navigators';

import { AuthRouteNames, IAuthNavigationParams } from '.';
import ActivationScreen from '../screens/ActivationScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ForgotScreen from '../screens/ForgotScreen';
import LoginHomeScreen from '../screens/LoginHomeScreen';
import LoginWayfScreen from '../screens/LoginWayfScreen';
import PlatformSelectScreen from '../screens/PlatformSelectScreen';
import RevalidateTermsScreen from '../screens/RevalidateTermsScreen';
import WayfScreen from '../screens/WayfScreen';
import OnboardingScreen from '../screens/onboarding';

const Stack = getTypedRootStack<IAuthNavigationParams>();

export default function () {
  return (
    <Stack.Group screenOptions={navBarOptions}>
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen name={AuthRouteNames.onboarding} component={OnboardingScreen} />
        <Stack.Screen name={AuthRouteNames.platforms} component={PlatformSelectScreen} />
      </Stack.Group>
      <Stack.Screen
        name={AuthRouteNames.loginHome}
        component={LoginHomeScreen}
        options={({ route }) => ({
          title: route.params?.platform.displayName,
        })}
      />
      <Stack.Screen
        name={AuthRouteNames.loginWayf}
        component={LoginWayfScreen}
        options={({ route }) => ({
          title: route.params?.platform.displayName,
        })}
      />
      <Stack.Screen
        name={AuthRouteNames.wayf}
        component={WayfScreen}
        options={{
          title: I18n.t('login-wayf-main-title'),
        }}
      />
      <Stack.Screen
        name={AuthRouteNames.activation}
        component={ActivationScreen}
        options={{
          title: I18n.t('activation-title'),
        }}
      />
      <Stack.Screen
        name={AuthRouteNames.forgot}
        component={ForgotScreen}
        options={({ route }) => ({
          title: route.params.mode === 'id' ? I18n.t('forgot-id') : I18n.t('forgot-password'),
        })}
      />
      <Stack.Screen
        name={AuthRouteNames.revalidateTerms}
        component={RevalidateTermsScreen}
        options={({ route }) => ({
          title: I18n.t('user.revalidateTermsScreen.title'),
        })}
      />
      <Stack.Screen
        name={AuthRouteNames.changePassword}
        component={ChangePasswordScreen}
        options={({ route }) => ({
          title: I18n.t('PasswordChange'),
        })}
      />
    </Stack.Group>
  );
}

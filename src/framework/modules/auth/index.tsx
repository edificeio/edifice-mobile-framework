import React from 'react';

import { Action } from 'redux';

import { RootModule } from '~/app/module';
import type { Platform } from '~/framework/util/appConf';

import reducer from './redux/reducer';
import { type AuthState } from './redux/types';
import AuthDiscoveryClassScreen from './screens/discovery-class';
import AuthLoginCredentialsScreen, { AuthLoginCredentialsScreenOptions } from './screens/main-account/login-credentials';
import AuthLoginRedirectScreen from './screens/main-account/login-redirect';
import AuthLoginWayfScreen from './screens/main-account/login-wayf';
import AuthPlatformsScreen from './screens/main-account/platforms';
import { AuthWayfScreen, AuthWayfScreenOptions } from './screens/main-account/wayf';
import AuthOnboardingScreen from './screens/onboarding';
import { AuthStorageData, storage } from './storage';

export default new RootModule<
  'auth',
  {
    'auth/onboarding': undefined;
    'auth/platforms': undefined;
    'auth/discovery-class': undefined;
    'auth/login/credentials': {
      platform: Platform;
      accountId?: string;
      loginUsed?: string;
    };
    'auth/login/redirect': { platform: Platform };
    'auth/login/wayf': { platform: Platform; accountId?: string };
    'auth/wayf': { platform: Platform; accountId?: string };
  },
  AuthState,
  Action,
  AuthStorageData
>(
  {
    name: 'auth',
    redux: { reducer },
    scope: [
      'auth',
      'userbook',
      'directory',
      /* ToDo: put the following scopes anywhere else that not belongs to auth module */
      'infra', // seems to be tracking related
      'portal', // dont know if used somewhere
      'userinfo', // wtf is this thing ?
    ],
    storage: { device: storage, namespace: 'auth' },
  },
  Stack => (
    <>
      <Stack.Screen name="auth/onboarding" component={AuthOnboardingScreen} options={AuthOnboardingScreen.options} />
      <Stack.Screen name="auth/discovery-class" component={AuthDiscoveryClassScreen} options={AuthDiscoveryClassScreen.options} />
      <Stack.Screen name="auth/platforms" component={AuthPlatformsScreen} options={AuthPlatformsScreen.options} />
      <Stack.Screen
        name="auth/login/credentials"
        component={AuthLoginCredentialsScreen}
        options={AuthLoginCredentialsScreenOptions}
      />
      <Stack.Screen name="auth/login/redirect" component={AuthLoginRedirectScreen} options={AuthLoginRedirectScreen.options} />
      <Stack.Screen name="auth/login/wayf" component={AuthLoginWayfScreen} options={AuthLoginWayfScreen.options} />
      <Stack.Screen name="auth/wayf" component={AuthWayfScreen} options={AuthWayfScreenOptions} />
    </>
  ),
);

import React from 'react';

import reducer, { AuthState } from './reducer';
import AuthDiscoveryClassScreen from './screens/discovery-class';
import AuthLoginCredentialsScreen, { AuthLoginCredentialsScreenOptions } from './screens/main-account/login-credentials';
import AuthLoginRedirectScreen from './screens/main-account/login-redirect';
import AuthLoginWayfScreen, { AuthLoginWayfScreenOptions } from './screens/main-account/login-wayf';
import AuthPlatformsScreen from './screens/main-account/platforms';
import AuthOnboardingScreen from './screens/onboarding';
import { AuthStorageData, storage } from './storage';

import { Module } from '~/app/module';
import { Platform } from '~/framework/util/appConf';

export default new Module<
  'auth',
  {
    'auth/onboarding': undefined;
    'auth/platforms': undefined;
    'auth/discovery-class': undefined;
    'auth/login/redirect': { platform: Platform };
    'auth/login/wayf': { platform: Platform; accountId?: string };
    'auth/login/credentials': {
      platform: Platform;
      accountId?: string;
      loginUsed?: string;
    };
  },
  AuthState,
  AuthStorageData
>(
  {
    apiScope: [
      'auth',
      'userbook',
      'directory',
      /* ToDo: put the following scopes anywhere else that not belongs to auth module */
      'infra', // seems to be tracking related
      'portal', // dont know if used somewhere
      'userinfo', // wtf is this thing ?
    ],
    name: 'auth',
    storage,
    storageName: 'auth',
  },
  Stack => (
    <>
      <Stack.Screen name={'auth/onboarding'} component={AuthOnboardingScreen} options={AuthOnboardingScreen.options} />
      <Stack.Screen name={'auth/discovery-class'} component={AuthDiscoveryClassScreen} options={AuthDiscoveryClassScreen.options} />
      <Stack.Screen name={'auth/platforms'} component={AuthPlatformsScreen} options={AuthPlatformsScreen.options} />
      <Stack.Screen name={'auth/login/redirect'} component={AuthLoginRedirectScreen} options={AuthLoginRedirectScreen.options} />
      <Stack.Screen name={'auth/login/wayf'} component={AuthLoginWayfScreen} options={AuthLoginWayfScreen.options} />
      <Stack.Screen
        name={'auth/login/credentials'}
        component={AuthLoginCredentialsScreen}
        options={AuthLoginCredentialsScreenOptions}
      />
    </>
  ),
);

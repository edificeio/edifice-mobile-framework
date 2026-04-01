import React from 'react';

import reducer, { AuthState } from './reducer';
import AuthDiscoveryClassScreen from './screens/discovery-class';
import AuthPlatformsScreen from './screens/main-account/platforms';
import AuthOnboardingScreen from './screens/onboarding';
import { AuthStorageData, storage } from './storage';

import { Module } from '~/app/module';

export default new Module<
  'auth',
  { 'auth/onboarding': undefined; 'auth/platforms': undefined; 'auth/discovery-class': undefined },
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
    </>
  ),
);

import React from 'react';

import reducer, { AuthState } from './reducer';
import AuthOnboardingScreen from './screens/main-account/onboarding';
import { AuthStorageData, storage } from './storage';

import { Module } from '~/app/module';

export default new Module<{ 'auth/onboarding': { foo: 'bar' } }, AuthState, AuthStorageData>(
  {
    apiScope: [
      'auth',
      'userbook',
      'directory',
      /* ToDo: put the following scopes anywhere else that not belongs to auth module */
      'infra', // seems to be tracking related
      'portal', // dont knwo if used somewhere
      'userinfo', // wtf is this thing ?
    ],
    name: 'auth',
    storage,
    storageName: 'auth',
  },
  Stack => (
    <>
      <Stack.Screen name={'auth/onboarding'} component={AuthOnboardingScreen} options={AuthOnboardingScreen.options} />
    </>
  ),
);

import React from 'react';

import { Action } from 'redux';

import { RootModule } from '~/app/module';
import type { HostId, Platform } from '~/framework/util/appConf';

import { AuthCredentials } from './model';
import reducer from './redux/reducer';
import { type AuthState } from './redux/types';
import AuthChangeEmailScreen, {
  computeNavBar as authChangeEmailNavBar,
  AuthChangeEmailScreenNavParams,
} from './screens/change-email';
import AuthChangeMobileScreen, {
  computeNavBar as authChangeMobileNavBar,
  AuthChangeMobileScreenNavParams,
} from './screens/change-mobile';
import AuthDiscoveryClassScreen from './screens/discovery-class';
import { AuthActivationScreen, AuthActivationScreenOptions } from './screens/main-account/activation';
import AuthLoginCredentialsScreen, { AuthLoginCredentialsScreenOptions } from './screens/main-account/login-credentials';
import AuthLoginRedirectScreen from './screens/main-account/login-redirect';
import AuthLoginWayfScreen from './screens/main-account/login-wayf';
import AuthPlatformsScreen from './screens/main-account/platforms';
import { AuthRenewPasswordScreen, AuthRenewPasswordScreenOptions } from './screens/main-account/renew-password';
import {
  AuthRequirementResetPasswordScreen,
  AuthRequirementResetPasswordScreenOptions,
} from './screens/main-account/requirement-reset-password';
import { AuthWayfScreen, AuthWayfScreenOptions } from './screens/main-account/wayf';
import AuthMFAScreen, { AuthMFAScreenNavParams, computeNavBar as mfaNavBar } from './screens/mfa';
import AuthOnboardingScreen from './screens/onboarding';
import RequirementTermsScreen, { RequirementTermsScreenOptions } from './screens/requirement-terms';
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
    'auth/activation': { platform: Platform; credentials: AuthCredentials };
    'auth/renew-password': { host: HostId; credentials: AuthCredentials };
    'auth/requirement-reset-password': undefined;
    'auth/requirement-terms': undefined;
    'auth/requirement-verify-email': AuthChangeEmailScreenNavParams;
    'auth/requirement-verify-mobile': AuthChangeMobileScreenNavParams;
    'auth/mfa': AuthMFAScreenNavParams;
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
      <Stack.Screen name="auth/activation" component={AuthActivationScreen} options={AuthActivationScreenOptions} />
      <Stack.Screen name="auth/renew-password" component={AuthRenewPasswordScreen} options={AuthRenewPasswordScreenOptions} />
      <Stack.Screen
        name="auth/requirement-reset-password"
        component={AuthRequirementResetPasswordScreen}
        options={AuthRequirementResetPasswordScreenOptions}
      />
      <Stack.Screen name="auth/requirement-terms" component={RequirementTermsScreen} options={RequirementTermsScreenOptions} />
      <Stack.Screen name="auth/requirement-verify-email" component={AuthChangeEmailScreen} options={authChangeEmailNavBar} />
      <Stack.Screen name="auth/requirement-verify-mobile" component={AuthChangeMobileScreen} options={authChangeMobileNavBar} />
      <Stack.Screen name="auth/mfa" component={AuthMFAScreen} options={mfaNavBar} />
    </>
  ),
);

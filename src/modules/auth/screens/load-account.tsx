import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { useAuthFlows } from '~/modules/auth/flows';
import { AuthNavigationWrapper } from '~/modules/auth/navigation/navigation-container';
import { useLoadAccountNavigationState } from '~/modules/auth/navigation/sign-in-navigation-state';
import type { SignInResult } from '~/modules/auth/service/types';
import { useAccountsStore } from '~/modules/auth/store/accounts';

/**
 * Signing in from here (no account connected) sets the account as the connected one:
 * - if the sign-in is meant to replace a saved account (the user chose it), this one is replaced;
 * - else with no saved account, it is added;
 * - else with one saved account, it replaces it, even if the login screen did not know about it (platform chosen by hand).
 * (With several saved accounts, the sign-in screens are reached through the accounts selector, so one is always targeted.)
 */
const AuthLoadAccountScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const navigationState = useLoadAccountNavigationState();
  const { setActiveAccount } = useAuthFlows();
  const onSignedIn = React.useCallback(
    (result: SignInResult, accountToReplaceId?: string) => {
      const savedAccountIds = Object.keys(useAccountsStore.getState().accounts);
      return setActiveAccount(result, accountToReplaceId ?? (savedAccountIds.length === 1 ? savedAccountIds[0] : undefined));
    },
    [setActiveAccount],
  );
  return <AuthNavigationWrapper navigationState={navigationState} onSignedIn={onSignedIn} />;
});
AuthLoadAccountScreen.displayName = 'AuthLoadAccountScreen';
export default defineScreen({
  // The sign-in navigator it hosts tracks it (see `AuthNavigationWrapper`)
  delegatesTelemetry: true,
  options: () => ({ headerShown: false, title: 'Connexion' }),
  screen: AuthLoadAccountScreen,
});

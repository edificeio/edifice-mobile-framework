import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineScreen } from '~/app/navigation-new';
import { setAccount } from '~/modules/auth/flows';
import { AuthNavigationWrapper } from '~/modules/auth/navigation/navigation-container';
import type { SignInResult } from '~/modules/auth/service/types';
import { useLoadAccountNavigationState } from '~/modules/auth/sign-in/navigation';
import { useAccountsStore } from '~/modules/auth/store/accounts';

/**
 * Signing in from here (no account connected) sets the account as the connected one:
 * - if the sign-in is meant to replace a saved account (the user chose it), this one is replaced;
 * - else with no saved account, it is added;
 * - else with one saved account, it replaces it, even if the login screen did not know about it (platform chosen by hand).
 * (With several saved accounts, the sign-in screens are reached through the accounts selector, so one is always targeted.)
 */
const onSignedIn = (result: SignInResult, accountToReplaceId?: string) => {
  const savedAccountIds = Object.keys(useAccountsStore.getState().accounts);
  return setAccount(result, accountToReplaceId ?? (savedAccountIds.length === 1 ? savedAccountIds[0] : undefined));
};

const AuthLoadAccountScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const navigationState = useLoadAccountNavigationState();
  return <AuthNavigationWrapper navigationState={navigationState} onSignedIn={onSignedIn} />;
});
AuthLoadAccountScreen.displayName = 'AuthLoadAccountScreen';
export default defineScreen({
  options: { headerShown: false, title: 'Connexion' },
  screen: AuthLoadAccountScreen,
});

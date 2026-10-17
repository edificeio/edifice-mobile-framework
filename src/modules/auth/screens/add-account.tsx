import React from 'react';

import { StaticScreenProps } from '@react-navigation/native';

import { defineModal } from '~/app/navigation-new';
import { setAccount } from '~/modules/auth/flows';
import { AuthNavigationWrapper } from '~/modules/auth/navigation/navigation-container';
import { useAddAccountNavigationState } from '~/modules/auth/sign-in/navigation';

/**
 * Signing in from here adds the account to the saved ones, and makes it the connected one (the current one is put to sleep).
 * If the account is already saved, it is replaced by the new sign-in (the accounts are stored by id).
 * The modal has no header of its own: the sign-in screens show theirs.
 */
const AuthAddAccountScreen = React.memo(function ({}: StaticScreenProps<undefined>) {
  const navigationState = useAddAccountNavigationState();
  return <AuthNavigationWrapper navigationState={navigationState} onSignedIn={setAccount} />;
});
AuthAddAccountScreen.displayName = 'AuthAddAccountScreen';
export default defineModal({
  options: () => ({ headerShown: false }),
  screen: AuthAddAccountScreen,
});

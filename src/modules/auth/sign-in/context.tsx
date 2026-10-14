import React from 'react';

import type { SignInResult } from '../service/types';

export interface SignInContextValue {
  /**
   * Called when a sign-in succeeded.
   * The sign-in screens do not know what to do with the signed-in account (replace one, add one...),
   * it is up to the screen that holds the navigator (see `screens/load-account.tsx`).
   */
  onSignedIn: (result: SignInResult) => Promise<unknown> | unknown;
}

export const SignInContext = React.createContext<SignInContextValue | undefined>(undefined);

export const useSignInContext = () => {
  const context = React.useContext(SignInContext);
  if (!context) throw new global.Error('[SignIn] useSignInContext must be used inside a SignInContext.Provider');
  return context;
};

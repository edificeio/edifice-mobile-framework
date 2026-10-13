/**
 * The navigation state of the sign-in screens (the sign-in module's navigator): where it starts from when an account is loaded (no
 * account connected), and when an account is added.
 * It is the auth side that knows the saved accounts: it tells the sign-in (agnostic of them) the screens to go through.
 */

import React from 'react';

import type { NavigationState, PartialState } from '@react-navigation/native';

import type { AuthMixedAccountMap } from '~/modules/auth/model';
import { getSignInNavigationState, type SignInLoginTarget, useStableNavigationState } from '~/modules/auth/sign-in/navigation';
import { type SignInStatus, useSignInStore } from '~/modules/auth/sign-in/store';
import { useAccountsStore } from '~/modules/auth/store/accounts';

/**
 * Navigation state of the sign-in screens, from the saved accounts and the sign-in situation (status).
 * - Several accounts (counting the one just removed, if any): the user goes through the accounts selector.
 * - One account: its login screen (the login is locked as soon as there are several accounts, so no account is replaced by another
 *   user; with a single one the user must be able to change it, as the accounts can't be managed then).
 * - After an account deletion, the selector is shown instead of the login screen of the remaining account, unless there is a sign-in
 *   status (failed restore, password renew...): then the login screen must show up with the error.
 */
export const getLoadAccountNavigationState = ({
  accounts,
  lastDeletedAccount,
  showIntroduction,
  showWelcome,
  status,
}: {
  accounts: AuthMixedAccountMap;
  lastDeletedAccount?: string;
  showIntroduction?: boolean;
  showWelcome?: boolean;
  status?: SignInStatus;
}): PartialState<NavigationState> => {
  const accountIds = Object.keys(accounts);
  const nbAccounts = accountIds.length;
  const selector = nbAccounts > 0 && nbAccounts + (lastDeletedAccount ? 1 : 0) > 1;

  const accountId = nbAccounts === 1 ? accountIds[0] : status?.accountId;
  const account = accountId ? accounts[accountId] : undefined;
  const platform = account?.platform
    ? typeof account.platform === 'string'
      ? account.platform
      : account.platform.name
    : status?.platform;
  let login: SignInLoginTarget | undefined;
  if (platform && (!lastDeletedAccount || status)) {
    login = {
      accountId: account?.user.id,
      lockLogin: nbAccounts > 1,
      // The login of the account is the one to fill in, else the one of the status
      loginUsed: account ? (account.user as { loginUsed?: string }).loginUsed : status?.loginUsed,
      platform,
    };
  }

  return getSignInNavigationState({
    before: selector ? [{ name: 'auth/accounts' }] : [],
    login,
    showIntroduction,
    showWelcome,
    status,
  });
};

/**
 * Navigation state of the sign-in screens when an account is added to the existing ones: the saved accounts and the welcome
 * screen are ignored. The user starts from the introduction screen, always (whatever the accounts or `showWelcome` are), then goes on
 * to the platforms / login screen.
 * Only an activation / password renew code changes that: it leads to its own screen, without the introduction.
 */
export const getAddAccountNavigationState = (status?: SignInStatus) =>
  getSignInNavigationState({
    showIntroduction: true,
    status: status?.type === 'activation' || status?.type === 'passwordRenew' ? status : undefined,
  });

/**
 * Navigation state of the sign-in screens when an account is loaded (no account connected), from the saved accounts and the
 * sign-in status (what the user must be taken to now: the login screen of an account, with its error...).
 *
 * - **A status is applied once.** The navigation goes where it says, then it is out of date as soon as the accounts change the screens
 *   to show (an account was removed...): it is closed and the navigation follows the accounts alone. Otherwise a status that stays in
 *   memory would take the user back to the login screen of an account he left with "back", at the first change of the accounts.
 * - The state only changes if the screens to show actually change, so the navigation is not reset by unrelated store updates
 *   (token refresh...).
 */
export const useLoadAccountNavigationState = () => {
  const accounts = useAccountsStore(s => s.accounts);
  const lastDeletedAccount = useAccountsStore(s => s.lastDeletedAccount);
  const showWelcome = useAccountsStore(s => s.showWelcome);
  const applied = useSignInStore(s => s.applied);
  const attempt = useSignInStore(s => s.attempt);
  const status = useSignInStore(s => s.status);
  const markApplied = useSignInStore(s => s.markApplied);
  const reset = useSignInStore(s => s.reset);

  const base = { accounts, lastDeletedAccount, showWelcome };
  // The accounts that count (not their tokens, which change all the time): it tells when the situation changed since the status
  // was applied
  const situation = JSON.stringify([Object.keys(accounts), lastDeletedAccount, showWelcome]);
  const outOfDate = status !== undefined && applied !== undefined && applied !== situation;

  React.useEffect(() => {
    if (status === undefined) return;
    if (outOfDate) reset();
    else markApplied(situation);
  }, [status, outOfDate, situation, markApplied, reset]);

  return useStableNavigationState(getLoadAccountNavigationState({ ...base, status: outOfDate ? undefined : status }), attempt);
};

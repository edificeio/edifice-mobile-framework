import { MAX_ACCOUNTS } from '~/modules/auth/model/business';
import { AccountError, AccountErrorCode } from '~/modules/auth/model/error';
import type { SignInResult } from '~/modules/auth/service/types';
import { getSession, useAccountsStore } from '~/modules/auth/store/accounts';
import { usePlatformContextStore } from '~/modules/auth/store/platform-context';
import { usePlatformLegalUrlsStore } from '~/modules/auth/store/platform-legal-urls';
import { useSignInStore } from '~/modules/auth/store/sign-in';

import { notifyLegacyAccountSet } from './legacy-redux';
import { prepareSession, sleepCurrentSession, startSession } from './session-effects';

/**
 * Makes the signed-in account the active one, in place of the saved account of id `accountToReplaceId`.
 * Without `accountToReplaceId`, the account is added to the existing ones (first account, new account...).
 * If another account is active, its session is put to sleep.
 * Also used to replace the active account by a fresher version of itself (see `refreshRequirements`).
 * @throws a `TOO_MANY_ACCOUNTS` error if there would be more than `MAX_ACCOUNTS` accounts afterwards.
 */
export const setAccount = async ({ legalUrls, platformContext, session }: SignInResult, accountToReplaceId?: string) => {
  // 1. What may fail comes first, so a failure changes nothing
  const accountIdsAfter = new Set(Object.keys(useAccountsStore.getState().accounts));
  if (accountToReplaceId !== undefined) accountIdsAfter.delete(accountToReplaceId);
  accountIdsAfter.add(session.user.id);
  if (accountIdsAfter.size > MAX_ACCOUNTS) {
    throw new AccountError(AccountErrorCode.TOO_MANY_ACCOUNTS, `Maximum of ${MAX_ACCOUNTS} accounts reached`);
  }
  if (!session.requirement) await prepareSession(session);

  // 2. Platform config fetched during sign-in
  if (platformContext) usePlatformContextStore.getState().setContext(session.platform.name, platformContext);
  if (legalUrls) usePlatformLegalUrlsStore.getState().setLegalUrls(session.platform.name, legalUrls);

  // 3. Commit the account. If another one is active, it is put to sleep (not the same one: its session goes on with new tokens).
  if (getSession()?.user.id !== session.user.id) await sleepCurrentSession();
  useAccountsStore.getState().setAccount(session, accountToReplaceId);
  useSignInStore.getState().reset();

  // 4. Effects of the new session. With a requirement, the app can't be used yet: they'll run once it is fulfilled.
  if (!session.requirement) {
    notifyLegacyAccountSet(session, accountToReplaceId);
    await startSession(session);
  }
  return session;
};
